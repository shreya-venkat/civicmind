import { NextResponse } from "next/server";
import { getSourceLean, simplifyLean } from "../../data/source-bias";

const API_KEY = process.env.NEWSAPI_KEY;

// ── Types ──────────────────────────────────────────────────
export interface TrendingArticle {
  title: string;
  url: string;
  source: string;
  sourceDomain: string;
  lean: "left" | "center" | "right";
  date: string;
  image: string | null;
  description: string | null;
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
    weak: ["border"],
    scope: "national" },
  { id: "deportation", title: "Deportation & ICE Enforcement",
    strong: ["deportation", "ice raid", "ice arrest", "mass deportation", "ice enforcement", "ice detain"],
    weak: ["undocumented", "illegal immigrant"],
    scope: "national" },
  { id: "asylum-refugees", title: "Asylum & Refugee Policy",
    strong: ["asylum seeker", "refugee policy", "migrant shelter", "immigration court", "remain in mexico", "asylum claim"],
    weak: ["asylum", "refugee"],
    scope: "national" },

  // ── National: Trump-specific policies ──
  { id: "doge-spending", title: "DOGE & Federal Spending Cuts",
    strong: ["doge", "government efficiency", "federal spending cut", "elon musk government", "government waste", "musk doge"],
    weak: [],
    scope: "national" },
  { id: "trump-tariffs", title: "Trump Tariff Policy",
    strong: ["trump tariff", "tariff war", "tariff hike", "import tariff", "trump trade war", "tariff policy"],
    weak: ["tariff"],
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
  "politics OR policy OR government OR congress OR president OR federal OR military OR war OR court OR election OR legislation OR tariff OR immigration OR border OR abortion OR gun OR climate OR healthcare OR housing OR prison OR police"
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

// ── Topic matching (strict) ────────────────────────────────
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

    // Check weak keywords — need 2+ in full text, or 1 in title
    if (!matched && def.weak.length > 0) {
      // Title match = strong signal
      for (const kw of def.weak) {
        if (titleLower.includes(kw.toLowerCase())) {
          matched = true;
          break;
        }
      }

      // Full text needs 2+ weak matches
      if (!matched) {
        let weakHits = 0;
        for (const kw of def.weak) {
          if (fullText.includes(kw.toLowerCase())) weakHits++;
        }
        if (weakHits >= 2) matched = true;
      }
    }

    if (matched) matches.push(def.id);
  }

  return matches;
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
    // Minimum 2 articles to be considered "trending"
    if (arts.length < 2) continue;

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

    return NextResponse.json(result);
  } catch (err) {
    console.error(`[NewsAPI] Error:`, err);
    if (cache && cache.topics.length > 0) {
      return NextResponse.json(cache);
    }
    return NextResponse.json({ topics: [], updatedAt: new Date().toISOString() });
  }
}
