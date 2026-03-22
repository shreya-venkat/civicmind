import { NextResponse } from "next/server";
import { getSourceLean, simplifyLean } from "../../data/source-bias";

const API_KEY = process.env.NEWSAPI_KEY;

// ── Types ──────────────────────────────────────────────────
export interface TrendingArticle {
  title: string;
  url: string;
  source: string;
  sourceDomain?: string;
  lean: "left" | "center" | "right";
  date: string;
  image?: string | null;
  description?: string | null;
}

export interface TrendingTopic {
  id: string;
  title: string;
  description: string;
  scope: "national" | "global";
  articleCount: number;
  articles: TrendingArticle[];
  leftCount: number;
  centerCount: number;
  rightCount: number;
  coverageGap?: "left" | "center" | "right" | null;
  coverageScore?: number;
}

export interface CoverageAnalysis {
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
  coverageGap: "left" | "center" | "right" | null;
  gapDescription: string;
  blindSpots: string[];
  coverageScore: number;
}

// ── Topic keyword definitions ──────────────────────────────
// "strong" = multi-word phrases that are high-confidence matches on their own
// "weak" = single words or short terms that need corroboration (2+ must match)
interface TopicDef {
  id: string;
  title: string;
  strong: string[]; // One match in title OR description = include
  weak: string[];   // Need 2+ matches, or 1 in the title only
  scope: "national" | "global";
}

const topicDefs: TopicDef[] = [
  // ── Global ──
  { id: "iran-war", title: "US-Iran Military Conflict",
    strong: ["iran war", "iran strike", "iran bomb", "iran attack", "tehran strike", "iran military", "iran conflict", "strait of hormuz", "iran airstrikes", "iran invasion", "bombing iran", "iran ceasefire"],
    weak: ["iran", "iranian", "tehran", "persian gulf"],
    scope: "global" },
  { id: "iran-nuclear", title: "Iran Nuclear Program",
    strong: ["iran nuclear", "iranian nuclear", "uranium enrichment", "jcpoa", "nuclear deal iran", "iran centrifuge"],
    weak: ["nuclear", "enrichment"],
    scope: "global" },
  { id: "iran-oil", title: "Iran Conflict & Oil Prices",
    strong: ["iran oil", "oil price iran", "oil spike", "energy crisis iran", "gas price war", "oil barrel", "oil surge", "crude oil war", "brent crude iran"],
    weak: ["oil price", "crude oil", "brent crude"],
    scope: "global" },
  { id: "russia-ukraine", title: "Russia-Ukraine War",
    strong: ["ukraine war", "russian invasion", "ukraine offensive", "zelensky", "ukraine ceasefire", "donbas", "crimea annexation"],
    weak: ["ukraine", "kyiv", "kremlin"],
    scope: "global" },
  { id: "gaza-war", title: "Gaza War & Humanitarian Crisis",
    strong: ["gaza war", "gaza ceasefire", "gaza humanitarian", "gaza invasion", "hamas attack", "gaza death toll", "rafah operation", "gaza famine"],
    weak: ["gaza", "hamas", "palestinian"],
    scope: "global" },
  { id: "israel-policy", title: "US-Israel Relations",
    strong: ["us israel relations", "israel lobby", "aipac", "israel aid", "netanyahu congress", "israel policy", "netanyahu trump", "israel arms"],
    weak: ["netanyahu", "israel"],
    scope: "global" },
  { id: "china-trade", title: "US-China Trade War",
    strong: ["china tariff", "china trade war", "us china trade", "china sanctions", "decoupling china", "china export ban"],
    weak: ["china trade", "beijing"],
    scope: "global" },
  { id: "taiwan", title: "Taiwan & China Tensions",
    strong: ["taiwan strait", "taiwan invasion", "taiwan defense", "taiwan military", "china taiwan", "south china sea"],
    weak: ["taiwan"],
    scope: "global" },
  { id: "nato-europe", title: "NATO & European Security",
    strong: ["nato alliance", "nato defense", "nato spending", "european defense", "eu security", "nato expansion", "nato troops"],
    weak: ["nato"],
    scope: "global" },
  { id: "climate-policy", title: "Climate Policy & Clean Energy",
    strong: ["climate change policy", "paris agreement", "clean energy", "carbon emissions", "renewable energy", "fossil fuel ban", "climate legislation", "green new deal", "climate summit"],
    weak: ["climate", "emissions", "carbon"],
    scope: "global" },
  { id: "ai-regulation", title: "AI Regulation & Safety",
    strong: ["ai regulation", "ai safety", "artificial intelligence regulation", "ai policy", "deepfake law", "ai act", "regulate ai", "ai oversight"],
    weak: [],
    scope: "global" },
  { id: "ai-industry", title: "AI Industry & Big Tech",
    strong: ["openai", "chatgpt", "google ai", "ai company", "ai startup", "ai chip", "nvidia ai", "artificial intelligence industry"],
    weak: [],
    scope: "global" },
  { id: "north-korea", title: "North Korea",
    strong: ["north korea", "pyongyang", "kim jong"],
    weak: [],
    scope: "global" },

  // ── National: Immigration ──
  { id: "border-security", title: "Border Security & Enforcement",
    strong: ["border wall", "border patrol", "border security", "border crisis", "border crossing illegal", "southern border"],
    weak: ["border", "immigration", "immigrant"],
    scope: "national" },
  { id: "deportation", title: "Deportation & ICE Enforcement",
    strong: ["deportation", "ice raid", "ice arrest", "mass deportation", "ice enforcement", "ice detain"],
    weak: ["deportation", "undocumented", "illegal immigrant", "immigration"],
    scope: "national" },
  { id: "asylum-refugees", title: "Asylum & Refugee Policy",
    strong: ["asylum seeker", "refugee policy", "migrant shelter", "immigration court", "remain in mexico", "asylum claim"],
    weak: ["asylum", "refugee", "immigrant", "migrant"],
    scope: "national" },

  // ── National: Trump-specific policies ──
  { id: "trump-administration", title: "Trump Administration",
    strong: ["trump administration", "trump white house", "president trump", "trump white house"],
    weak: ["trump"],
    scope: "national" },
  { id: "doge-spending", title: "DOGE & Federal Spending Cuts",
    strong: ["doge", "government efficiency", "federal spending cut", "elon musk government", "government waste", "musk doge"],
    weak: [],
    scope: "national" },
  { id: "trump-tariffs", title: "Trump Tariff Policy",
    strong: ["trump tariff", "tariff war", "tariff hike", "import tariff", "trump trade war", "tariff policy"],
    weak: ["tariff", "trade war", "trade policy"],
    scope: "national" },
  { id: "trump-executive", title: "Executive Power & Orders",
    strong: ["executive order", "executive power", "presidential authority", "executive action", "trump executive order"],
    weak: [],
    scope: "national" },
  { id: "trump-legal", title: "Trump Legal Battles",
    strong: ["trump trial", "trump indictment", "trump lawsuit", "trump conviction", "trump verdict", "trump sentencing"],
    weak: [],
    scope: "national" },
  { id: "trump-cabinet", title: "Trump Cabinet & Appointments",
    strong: ["trump cabinet", "trump nominee", "confirmation hearing", "senate confirmation", "trump secretary"],
    weak: [],
    scope: "national" },

  // ── National: Congress ──
  { id: "government-funding", title: "Government Funding & Shutdown",
    strong: ["government shutdown", "government funding", "spending bill", "continuing resolution", "debt ceiling", "federal budget"],
    weak: ["appropriations"],
    scope: "national" },
  { id: "congressional-oversight", title: "Congressional Investigations",
    strong: ["congressional hearing", "congressional investigation", "congressional subpoena", "oversight committee", "congressional inquiry", "house hearing", "senate hearing"],
    weak: [],
    scope: "national" },

  // ── National: Social issues ──
  { id: "abortion", title: "Abortion & Reproductive Rights",
    strong: ["abortion ban", "abortion pill", "reproductive rights", "roe v wade", "pro-life", "pro-choice", "abortion access", "abortion law"],
    weak: ["abortion"],
    scope: "national" },
  { id: "gun-violence", title: "Gun Violence & Mass Shootings",
    strong: ["mass shooting", "gun violence", "school shooting", "shooting victim", "gun death", "shooting spree"],
    weak: [],
    scope: "national" },
  { id: "gun-control", title: "Gun Control & 2nd Amendment",
    strong: ["gun control", "gun law", "second amendment", "gun reform", "firearm regulation", "assault weapon ban", "background check gun"],
    weak: [],
    scope: "national" },
  { id: "police-reform", title: "Police Reform & Accountability",
    strong: ["police reform", "police brutality", "police shooting unarmed", "body camera", "qualified immunity", "defund police", "police misconduct", "police accountability"],
    weak: [],
    scope: "national" },
  { id: "prison-reform", title: "Prison Reform & Mass Incarceration",
    strong: ["prison reform", "mass incarceration", "prison condition", "criminal justice reform", "sentencing reform", "private prison", "recidivism", "incarceration rate"],
    weak: [],
    scope: "national" },
  { id: "lgbtq-rights", title: "LGBTQ+ Rights & Trans Policy",
    strong: ["transgender ban", "trans athlete", "gender affirming care", "lgbtq rights", "don't say gay", "trans military", "drag ban", "transgender policy"],
    weak: ["transgender", "lgbtq"],
    scope: "national" },
  { id: "dei", title: "DEI & Affirmative Action",
    strong: ["diversity equity inclusion", "affirmative action", "anti-dei", "dei program", "critical race theory", "dei policy"],
    weak: [],
    scope: "national" },

  // ── National: Economy ──
  { id: "inflation", title: "Inflation & Cost of Living",
    strong: ["inflation rate", "cost of living", "consumer price index", "grocery price", "price inflation", "cpi report"],
    weak: ["inflation"],
    scope: "national" },
  { id: "federal-reserve", title: "Federal Reserve & Interest Rates",
    strong: ["federal reserve", "interest rate cut", "interest rate hike", "fed rate", "jerome powell", "monetary policy", "fed meeting"],
    weak: [],
    scope: "national" },
  { id: "jobs-economy", title: "Jobs & Employment",
    strong: ["jobs report", "unemployment rate", "job market", "labor market", "wage growth", "mass layoff", "employment data"],
    weak: ["unemployment", "layoff"],
    scope: "national" },
  { id: "housing", title: "Housing Crisis & Affordability",
    strong: ["housing crisis", "housing afford", "mortgage rate", "rent crisis", "homelessness crisis", "housing market crash", "housing policy", "affordable housing", "housing shortage"],
    weak: ["housing market", "mortgage"],
    scope: "national" },

  // ── National: Healthcare & Education ──
  { id: "healthcare-costs", title: "Healthcare Costs & Insurance",
    strong: ["healthcare cost", "health insurance", "drug price", "medicaid cut", "medicare cut", "obamacare repeal", "prescription drug", "healthcare reform"],
    weak: ["medicaid", "medicare"],
    scope: "national" },
  { id: "student-loans", title: "Student Loans & College Costs",
    strong: ["student loan", "student debt", "college tuition", "loan forgiveness", "fafsa", "student loan payment"],
    weak: [],
    scope: "national" },
  { id: "school-choice", title: "School Choice & Education Policy",
    strong: ["school choice", "school voucher", "charter school", "book ban school", "education secretary", "public school funding"],
    weak: [],
    scope: "national" },

  // ── National: Courts ──
  { id: "supreme-court", title: "Supreme Court Rulings",
    strong: ["supreme court", "scotus ruling", "scotus decision", "justice alito", "justice thomas", "supreme court case"],
    weak: ["scotus"],
    scope: "national" },

  // ── National: Elections ──
  { id: "voting-rights", title: "Voting Rights & Election Law",
    strong: ["voting rights", "voter suppression", "voter id law", "gerrymandering", "election integrity", "ballot access"],
    weak: [],
    scope: "national" },
  { id: "2026-elections", title: "2026 Midterm Elections",
    strong: ["midterm election", "2026 election", "senate race 2026", "house race 2026", "primary election 2026", "campaign 2026"],
    weak: ["midterm"],
    scope: "national" },

  // ── Broad national topics ──
  { id: "economy", title: "US Economy & Markets",
    strong: ["stock market", "recession", "economic growth", "gdp", "wall street", "economy", "economic"],
    weak: ["economy", "economic"],
    scope: "national" },
  { id: "tax-policy", title: "Tax Policy & IRS",
    strong: ["tax cut", "tax hike", "tax reform", "irs", "tax code", "tax policy", "tax bill"],
    weak: ["tax", "taxes"],
    scope: "national" },
  { id: "energy-oil", title: "Energy & Oil Prices",
    strong: ["oil price", "energy prices", "gas price", "opec", "energy policy", "renewable energy", "fossil fuel"],
    weak: ["oil", "energy", "gas prices"],
    scope: "national" },
  { id: "foreign-policy", title: "US Foreign Policy",
    strong: ["foreign policy", "diplomacy", "diplomatic", "state department", "ambassador", "sanctions"],
    weak: ["foreign policy", "diplomacy"],
    scope: "national" },
  { id: "democrats", title: "Democratic Party",
    strong: ["democratic party", "democrats", "democratic congress", "pelosi", "schumer"],
    weak: ["democrat", "democratic"],
    scope: "national" },
  { id: "republicans", title: "Republican Party",
    strong: ["republican party", "republicans", "gop", "maga", "conservative congress"],
    weak: ["republican", "gop"],
    scope: "national" },
  { id: "white-house", title: "White House & Administration",
    strong: ["white house", "oval office", "west wing", "presidential"],
    weak: ["white house"],
    scope: "national" },
  { id: "healthcare-general", title: "Healthcare Policy",
    strong: ["healthcare", "health insurance", "obamacare", "medicare", "medicaid", "hospital"],
    weak: ["healthcare", "health care", "medical"],
    scope: "national" },
  { id: "environment", title: "Environmental Policy",
    strong: ["environment", "environmental regulation", "epa", "pollution", "conservation"],
    weak: ["environment", "environmental"],
    scope: "national" },
  { id: "technology-antitrust", title: "Tech Regulation & Antitrust",
    strong: ["antitrust", "big tech regulation", "tech antitrust", "tech monopoly", "apple google meta microsoft"],
    weak: ["tech", "technology", "antitrust"],
    scope: "national" },
  { id: "social-security", title: "Social Security & Medicare",
    strong: ["social security", "social security reform", "medicare funding", "entitlement"],
    weak: ["social security", "entitlements"],
    scope: "national" },
  { id: "trade-policy", title: "Trade Policy & International Trade",
    strong: ["trade deal", "trade agreement", "nafta", "usmca", "free trade", "trade deficit"],
    weak: ["trade", "trading"],
    scope: "national" },
  { id: "immigration-general", title: "Immigration Debate",
    strong: ["immigration", "immigrant", "migrant", "illegal immigration", "immigration policy", "immigration reform"],
    weak: ["immigration", "immigrant", "migrant"],
    scope: "national" },
  { id: "defense-military", title: "Defense & Military",
    strong: ["military spending", "pentagon", "defense budget", "armed forces", "veterans", "defense policy"],
    weak: ["military", "defense", "pentagon"],
    scope: "national" },
  { id: "drug-policy", title: "Drug Policy & Opioid Crisis",
    strong: ["opioid crisis", "fentanyl", "drug policy", "addiction", "war on drugs"],
    weak: ["drug", "opioid", "fentanyl"],
    scope: "national" },
];

// ── In-memory cache ────────────────────────────────────────
const g = globalThis as Record<string, unknown>;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// ── NewsAPI ────────────────────────────────────────────────
// Balanced domain lists based on Ad Fontes Media ratings
const LEFT_DOMAINS = [
  "motherjones.com", "rawstory.com", "dailykos.com", "thenation.com",
  "theintercept.com", "truthout.org", "newrepublic.com", "prospect.org",
].join(",");

const CENTER_LEFT_DOMAINS = [
  "msnbc.com", "huffpost.com", "vox.com", "slate.com", "salon.com",
  "cnn.com", "nbcnews.com", "cbsnews.com", "abcnews.go.com",
  "latimes.com", "washingtonpost.com", "theatlantic.com", "newyorker.com",
  "politico.com", "bbc.co.uk", "usatoday.com", "thedailybeast.com",
  "businessinsider.com", "sfchronicle.com",
].join(",");

const CENTER_DOMAINS = [
  "apnews.com", "reuters.com", "npr.org", "thehill.com", "axios.com",
  "bloomberg.com", "propublica.org", "aljazeera.com", "dw.com",
  "newsweek.com", "forbes.com",
].join(",");

const CENTER_RIGHT_DOMAINS = [
  "foxnews.com", "nypost.com", "washingtonexaminer.com", "freebeacon.com",
  "reason.com",
].join(",");

const RIGHT_DOMAINS = [
  "dailywire.com", "breitbart.com", "dailycaller.com", "newsmax.com",
  "thefederalist.com", "townhall.com", "thegatewaypundit.com",
  "dailysignal.com", "westernjournal.com", "redstate.com",
  "theepochtimes.com", "outkick.com", "pjmedia.com",
].join(",");

// Broad political filter to exclude sports, entertainment, lifestyle
const POLITICAL_QUERY = encodeURIComponent(
  "trump OR congress OR president OR government OR policy OR election OR senate OR house OR political OR political OR washington OR capitol OR federal OR white house OR republican OR democrat OR democratic OR gop OR legislation OR law OR vote OR senator OR representative"
);

interface NewsAPIArticle {
  title: string;
  url: string;
  description: string | null;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function fetchFromDomains(domains: string, label: string): Promise<NewsAPIArticle[]> {
  // Filter to political content only, sorted by most recent
  const url = `https://newsapi.org/v2/everything?domains=${domains}&q=${POLITICAL_QUERY}&language=en&sortBy=publishedAt&pageSize=100&apiKey=${API_KEY}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[NewsAPI/${label}] Error ${res.status}: ${text.slice(0, 300)}`);
    return [];
  }

  const data = await res.json();
  console.log(`[NewsAPI/${label}] Got ${data.totalResults} total, returned ${(data.articles || []).length}`);
  return data.articles || [];
}

async function fetchNewsAPIArticles(): Promise<NewsAPIArticle[]> {
  const [left, centerLeft, center, centerRight, right] = await Promise.all([
    fetchFromDomains(LEFT_DOMAINS, "left"),
    fetchFromDomains(CENTER_LEFT_DOMAINS, "center-left"),
    fetchFromDomains(CENTER_DOMAINS, "center"),
    fetchFromDomains(CENTER_RIGHT_DOMAINS, "center-right"),
    fetchFromDomains(RIGHT_DOMAINS, "right"),
  ]);

  const total = left.length + centerLeft.length + center.length + centerRight.length + right.length;
  console.log(`[NewsAPI] Total: ${left.length} left + ${centerLeft.length} center-left + ${center.length} center + ${centerRight.length} center-right + ${right.length} right = ${total}`);
  return [...left, ...centerLeft, ...center, ...centerRight, ...right];
}

// ── Topic matching (broad) ────────────────────────────────
function matchArticleToTopics(title: string, description: string | null): string[] {
  const titleLower = title.toLowerCase();
  const descLower = (description || "").toLowerCase();
  const fullText = `${titleLower} ${descLower}`;
  const matches: string[] = [];

  for (const def of topicDefs) {
    let matched = false;

    // Check strong keywords — one match anywhere = include
    for (const kw of def.strong) {
      if (fullText.includes(kw.toLowerCase())) {
        matched = true;
        break;
      }
    }

    // Check weak keywords — need 1+ in title, or 1+ in full text (lowered from 2)
    if (!matched && def.weak.length > 0) {
      // Title match = strong signal
      for (const kw of def.weak) {
        if (titleLower.includes(kw.toLowerCase())) {
          matched = true;
          break;
        }
      }

      // Full text needs 1+ weak match (more inclusive)
      if (!matched) {
        for (const kw of def.weak) {
          if (fullText.includes(kw.toLowerCase())) {
            matched = true;
            break;
          }
        }
      }
    }

    if (matched) matches.push(def.id);
  }

  return matches;
}

function analyzeCoverage(arts: TrendingArticle[]): { coverageGap: "left" | "center" | "right" | null; coverageScore: number } {
  const total = arts.length;
  if (total === 0) return { coverageGap: null, coverageScore: 0 };

  const left = arts.filter((a) => a.lean === "left").length;
  const center = arts.filter((a) => a.lean === "center").length;
  const right = arts.filter((a) => a.lean === "right").length;

  const leftPct = left / total;
  const centerPct = center / total;
  const rightPct = right / total;

  const maxPct = Math.max(leftPct, centerPct, rightPct);
  const minPct = Math.min(leftPct, centerPct, rightPct);

  const coverageScore = minPct * 3;

  let coverageGap: "left" | "center" | "right" | null = null;
  
  if (total >= 4) {
    const ratio = maxPct / (minPct || 0.01);
    if (ratio >= 3 || minPct < 0.08) {
      if (leftPct === minPct && (leftPct < 0.12 || ratio >= 4)) coverageGap = "left";
      else if (centerPct === minPct && (centerPct < 0.12 || ratio >= 4)) coverageGap = "center";
      else if (rightPct === minPct && (rightPct < 0.12 || ratio >= 4)) coverageGap = "right";
    }
  }

  return { coverageGap, coverageScore };
}

function buildTrendingTopics(articles: NewsAPIArticle[]): TrendingTopic[] {
  const topicArticles: Record<string, TrendingArticle[]> = {};

  for (const art of articles) {
    if (!art.title || art.title === "[Removed]") continue;

    const domain = extractDomain(art.url);
    const lean = simplifyLean(getSourceLean(domain));
    const topicIds = matchArticleToTopics(art.title, art.description);

    const trendingArt: TrendingArticle = {
      title: art.title,
      url: art.url,
      source: art.source?.name || domain,
      sourceDomain: domain,
      lean,
      date: art.publishedAt,
      image: art.urlToImage,
      description: art.description,
    };

    for (const topicId of topicIds) {
      if (!topicArticles[topicId]) topicArticles[topicId] = [];
      if (!topicArticles[topicId].some((a) => a.title === trendingArt.title)) {
        topicArticles[topicId].push(trendingArt);
      }
    }
  }

  const topics: TrendingTopic[] = [];
  for (const def of topicDefs) {
    const arts = topicArticles[def.id] || [];
    if (arts.length < 1) continue;

    const { coverageGap, coverageScore } = analyzeCoverage(arts);

    topics.push({
      id: def.id,
      title: def.title,
      description: `${arts.length} articles from major sources`,
      scope: def.scope,
      articleCount: arts.length,
      articles: arts.sort((a, b) => b.date.localeCompare(a.date)),
      leftCount: arts.filter((a) => a.lean === "left").length,
      centerCount: arts.filter((a) => a.lean === "center").length,
      rightCount: arts.filter((a) => a.lean === "right").length,
      coverageGap,
      coverageScore,
    });
  }

  topics.sort((a, b) => b.articleCount - a.articleCount);
  return topics;
}

// ── Route handler ──────────────────────────────────────────
export async function GET() {
  const now = Date.now();
  const cache = g.__newsapiCache as { topics: TrendingTopic[]; updatedAt: string } | undefined;
  const cacheTime = (g.__newsapiCacheTime as number) || 0;

  if (cache && cache.topics.length > 0 && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json(cache);
  }

  try {
    const articles = await fetchNewsAPIArticles();
    const topics = buildTrendingTopics(articles);
    console.log(`[NewsAPI] Matched into ${topics.length} topics`);

    const result = { topics, updatedAt: new Date().toISOString() };

    if (topics.length > 0) {
      g.__newsapiCache = result;
      g.__newsapiCacheTime = now;
    }

    if (topics.length === 0) {
      console.log("[Trending API] No topics built, returning sample topics");
      const sampleTopics = getSampleTopics();
      console.log(`[NewsAPI] No topics from API, using ${sampleTopics.length} sample topics`);
      return NextResponse.json({ topics: sampleTopics, updatedAt: new Date().toISOString() });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(`[NewsAPI] Error:`, err);
    if (cache && cache.topics.length > 0) {
      return NextResponse.json(cache);
    }
    console.log("[Trending API] Returning sample topics");
    return NextResponse.json({ topics: getSampleTopics(), updatedAt: new Date().toISOString() });
  }
}

function getSampleTopics(): TrendingTopic[] {
  return [
    {
      id: "trump-administration",
      title: "Trump Administration",
      description: "Latest news from the Trump administration",
      scope: "national",
      articleCount: 12,
      articles: [
        { title: "Trump Signs Executive Order on Federal workforce", url: "#", source: "CNN", sourceDomain: "cnn.com", lean: "left", date: new Date().toISOString(), description: "The Trump administration continues its push to reshape the federal government workforce", image: "https://picsum.photos/seed/trump1/800/400" },
        { title: "White House announces new policy initiatives", url: "#", source: "Reuters", sourceDomain: "reuters.com", lean: "center", date: new Date().toISOString(), description: "A look at the latest policy announcements from the administration", image: "https://picsum.photos/seed/trump2/800/400" },
        { title: "President Trump's agenda faces congressional scrutiny", url: "#", source: "Fox News", sourceDomain: "foxnews.com", lean: "right", date: new Date().toISOString(), description: "Supporters say the president's agenda is delivering on campaign promises", image: "https://picsum.photos/seed/trump3/800/400" },
      ],
      leftCount: 4, centerCount: 4, rightCount: 4, coverageGap: null, coverageScore: 1
    },
    {
      id: "economy",
      title: "US Economy & Markets",
      description: "Economic news and market updates",
      scope: "national",
      articleCount: 15,
      articles: [
        { title: "Stock market reaches new highs amid economic optimism", url: "#", source: "CNN", sourceDomain: "cnn.com", lean: "left", date: new Date().toISOString(), description: "Markets rally on strong corporate earnings and economic data", image: "https://picsum.photos/seed/econ1/800/400" },
        { title: "Fed signals potential rate changes", url: "#", source: "AP News", sourceDomain: "apnews.com", lean: "center", date: new Date().toISOString(), description: "Federal Reserve officials hint at upcoming policy adjustments", image: "https://picsum.photos/seed/econ2/800/400" },
        { title: "Economic indicators show mixed signals", url: "#", source: "Fox News", sourceDomain: "foxnews.com", lean: "right", date: new Date().toISOString(), description: "Analysts divided on economic outlook despite market gains", image: "https://picsum.photos/seed/econ3/800/400" },
      ],
      leftCount: 5, centerCount: 5, rightCount: 5, coverageGap: null, coverageScore: 1
    },
    {
      id: "immigration-general",
      title: "Immigration Debate",
      description: "Comprehensive coverage of immigration issues",
      scope: "national",
      articleCount: 18,
      articles: [
        { title: "Immigration reform proposals divide Congress", url: "#", source: "NBC News", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/immig1/800/400" },
        { title: "Border statistics show changing patterns", url: "#", source: "NPR", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/immig2/800/400" },
        { title: "Immigration enforcement measures expanded", url: "#", source: "Daily Wire", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/immig3/800/400" },
      ],
      leftCount: 6, centerCount: 5, rightCount: 7, coverageGap: "center", coverageScore: 0.83
    },
    {
      id: "healthcare-general",
      title: "Healthcare Policy",
      description: "Healthcare and medical policy news",
      scope: "national",
      articleCount: 10,
      articles: [
        { title: "Healthcare costs continue to rise", url: "#", source: "Vox", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/health1/800/400" },
        { title: "Insurance markets see changes", url: "#", source: "AP News", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/health2/800/400" },
        { title: "Healthcare reform debates intensify", url: "#", source: "Daily Caller", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/health3/800/400" },
      ],
      leftCount: 3, centerCount: 4, rightCount: 3, coverageGap: null, coverageScore: 1
    },
    {
      id: "trump-tariffs",
      title: "Trump Tariff Policy",
      description: "Trade tariffs and their impact",
      scope: "national",
      articleCount: 14,
      articles: [
        { title: "New tariffs announced on imports", url: "#", source: "CNN", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/tariff1/800/400" },
        { title: "Trade partners respond to tariff policy", url: "#", source: "Reuters", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/tariff2/800/400" },
        { title: "Supporters praise tariff strategy", url: "#", source: "Breitbart", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/tariff3/800/400" },
      ],
      leftCount: 4, centerCount: 5, rightCount: 5, coverageGap: "left", coverageScore: 0.8
    },
    {
      id: "climate-policy",
      title: "Climate Policy & Clean Energy",
      description: "Climate and environmental policy debates",
      scope: "global",
      articleCount: 11,
      articles: [
        { title: "Climate activists push for stronger action", url: "#", source: "The Guardian", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/climate1/800/400" },
        { title: "International climate talks continue", url: "#", source: "BBC", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/climate2/800/400" },
        { title: "Energy policy debates intensify", url: "#", source: "The Federalist", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/climate3/800/400" },
      ],
      leftCount: 4, centerCount: 3, rightCount: 4, coverageGap: "center", coverageScore: 0.75
    },
    {
      id: "russia-ukraine",
      title: "Russia-Ukraine War",
      description: "Latest developments in the conflict",
      scope: "global",
      articleCount: 20,
      articles: [
        { title: "Ukraine seeks continued Western support", url: "#", source: "CNN", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/ukraine1/800/400" },
        { title: "Peace negotiations show progress", url: "#", source: "Reuters", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/ukraine2/800/400" },
        { title: "Security concerns drive policy", url: "#", source: "Fox News", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/ukraine3/800/400" },
      ],
      leftCount: 7, centerCount: 6, rightCount: 7, coverageGap: null, coverageScore: 1
    },
    {
      id: "gaza-war",
      title: "Gaza War & Humanitarian Crisis",
      description: "Conflict and humanitarian developments",
      scope: "global",
      articleCount: 16,
      articles: [
        { title: "Humanitarian organizations call for aid access", url: "#", source: "NBC News", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/gaza1/800/400" },
        { title: "Ceasefire discussions continue", url: "#", source: "AP News", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/gaza2/800/400" },
        { title: "Security priorities shape policy", url: "#", source: "Daily Wire", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/gaza3/800/400" },
      ],
      leftCount: 6, centerCount: 4, rightCount: 6, coverageGap: "center", coverageScore: 0.75
    },
    {
      id: "supreme-court",
      title: "Supreme Court Rulings",
      description: "Major cases and decisions",
      scope: "national",
      articleCount: 8,
      articles: [
        { title: "Court takes up controversial cases", url: "#", source: "NBC News", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/scotus1/800/400" },
        { title: "Justices weigh legal arguments", url: "#", source: "AP News", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/scotus2/800/400" },
        { title: "Rulings could reshape policy", url: "#", source: "National Review", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/scotus3/800/400" },
      ],
      leftCount: 2, centerCount: 3, rightCount: 3, coverageGap: "left", coverageScore: 0.67
    },
    {
      id: "defense-military",
      title: "Defense & Military",
      description: "Military and defense policy",
      scope: "national",
      articleCount: 9,
      articles: [
        { title: "Military budget debates in Congress", url: "#", source: "CNN", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/military1/800/400" },
        { title: "Defense strategy updates", url: "#", source: "Reuters", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/military2/800/400" },
        { title: "Veterans affairs policy changes", url: "#", source: "Fox News", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/military3/800/400" },
      ],
      leftCount: 3, centerCount: 3, rightCount: 3, coverageGap: null, coverageScore: 1
    },
    {
      id: "housing",
      title: "Housing Crisis & Affordability",
      description: "Housing market and affordability issues",
      scope: "national",
      articleCount: 11,
      articles: [
        { title: "Housing costs squeeze middle class", url: "#", source: "Vox", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/housing1/800/400" },
        { title: "Housing market shows signs of cooling", url: "#", source: "Bloomberg", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/housing2/800/400" },
        { title: "Policy proposals debated", url: "#", source: "Daily Wire", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/housing3/800/400" },
      ],
      leftCount: 4, centerCount: 4, rightCount: 3, coverageGap: "right", coverageScore: 0.82
    },
    {
      id: "foreign-policy",
      title: "US Foreign Policy",
      description: "Diplomacy and international relations",
      scope: "national",
      articleCount: 10,
      articles: [
        { title: "Alliances under scrutiny", url: "#", source: "CNN", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/foreign1/800/400" },
        { title: "Diplomatic efforts continue", url: "#", source: "AP News", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/foreign2/800/400" },
        { title: "America First policy assessed", url: "#", source: "Fox News", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/foreign3/800/400" },
      ],
      leftCount: 3, centerCount: 4, rightCount: 3, coverageGap: null, coverageScore: 1
    },
    {
      id: "tax-policy",
      title: "Tax Policy & IRS",
      description: "Tax legislation and enforcement",
      scope: "national",
      articleCount: 7,
      articles: [
        { title: "Tax reform proposals unveiled", url: "#", source: "NBC News", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/tax1/800/400" },
        { title: "IRS enforcement priorities set", url: "#", source: "AP News", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/tax2/800/400" },
        { title: "Tax cuts praised by supporters", url: "#", source: "National Review", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/tax3/800/400" },
      ],
      leftCount: 2, centerCount: 3, rightCount: 2, coverageGap: null, coverageScore: 0.86
    },
    {
      id: "white-house",
      title: "White House & Administration",
      description: "Administration activities and policies",
      scope: "national",
      articleCount: 13,
      articles: [
        { title: "White House announces new initiatives", url: "#", source: "CNN", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/whitehouse1/800/400" },
        { title: "Policy coordination continues", url: "#", source: "Reuters", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/whitehouse2/800/400" },
        { title: "Presidential agenda advances", url: "#", source: "Fox News", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/whitehouse3/800/400" },
      ],
      leftCount: 4, centerCount: 4, rightCount: 5, coverageGap: null, coverageScore: 1
    },
    {
      id: "republicans",
      title: "Republican Party",
      description: "GOP news and positions",
      scope: "national",
      articleCount: 9,
      articles: [
        { title: "Republicans face internal debates", url: "#", source: "NBC News", lean: "left", date: new Date().toISOString(), image: "https://picsum.photos/seed/gop1/800/400" },
        { title: "Party positioning on key issues", url: "#", source: "The Hill", lean: "center", date: new Date().toISOString(), image: "https://picsum.photos/seed/gop2/800/400" },
        { title: "GOP rallies around agenda", url: "#", source: "Daily Wire", lean: "right", date: new Date().toISOString(), image: "https://picsum.photos/seed/gop3/800/400" },
      ],
      leftCount: 2, centerCount: 3, rightCount: 4, coverageGap: "left", coverageScore: 0.67
    },
  ];
}
