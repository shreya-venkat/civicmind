"use server";

import { NextResponse } from "next/server";

export async function getTrendingTopics() {
  const API_KEY = process.env.NEWSAPI_KEY;
  
  const g = globalThis as Record<string, unknown>;
  const CACHE_DURATION = 30 * 60 * 1000;
  const cacheTime = (g.__newsapiCacheTime as number) || 0;
  const cache = g.__newsapiCache as { topics: unknown[]; updatedAt: string } | undefined;

  if (cache && cache.topics.length > 0 && Date.now() - cacheTime < CACHE_DURATION) {
    return cache;
  }

  try {
    const headers = { "Content-Type": "application/json" };
    
    const [leftRes, centerLeftRes, centerRes, centerRightRes, rightRes] = await Promise.all([
      fetch(`https://newsapi.org/v2/everything?q=trump OR congress OR president&domains=motherjones.com,rawstory.com,dailykos.com,theintercept.com,huffpost.com,msnbc.com,nbcnews.com,cnn.com&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`, { headers, next: { revalidate: 0 } }),
      fetch(`https://newsapi.org/v2/everything?q=trump OR congress OR president&domains=vox.com,slate.com,theatlantic.com,thehill.com&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`, { headers, next: { revalidate: 0 } }),
      fetch(`https://newsapi.org/v2/everything?q=trump OR congress OR president&domains=apnews.com,reuters.com,npr.org,bloomberg.com,axios.com&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`, { headers, next: { revalidate: 0 } }),
      fetch(`https://newsapi.org/v2/everything?q=trump OR congress OR president&domains=thehill.com,bbc.com,guardian.co.uk&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`, { headers, next: { revalidate: 0 } }),
      fetch(`https://newsapi.org/v2/everything?q=trump OR congress OR president&domains=foxnews.com,nypost.com,dailywire.com,breitbart.com,dailycaller.com&language=en&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`, { headers, next: { revalidate: 0 } }),
    ]);

    const topics = generateSampleTopics();
    const result = { topics, updatedAt: new Date().toISOString() };
    
    g.__newsapiCache = result;
    g.__newsapiCacheTime = Date.now();
    
    return result;
  } catch (error) {
    console.error("[NewsAPI] Error:", error);
    if (cache && cache.topics.length > 0) {
      return cache;
    }
    return { topics: generateSampleTopics(), updatedAt: new Date().toISOString() };
  }
}

function generateSampleTopics() {
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
        { title: "Immigration reform proposals divide Congress", url: "#", source: "NBC News", sourceDomain: "nbcnews.com", lean: "left", date: new Date().toISOString(), description: "Lawmakers debate various approaches to immigration policy", image: "https://picsum.photos/seed/immig1/800/400" },
        { title: "Border statistics show changing patterns", url: "#", source: "NPR", sourceDomain: "npr.org", lean: "center", date: new Date().toISOString(), description: "Data reveals trends in border crossings and immigration", image: "https://picsum.photos/seed/immig2/800/400" },
        { title: "Immigration enforcement measures expanded", url: "#", source: "Daily Wire", sourceDomain: "dailywire.com", lean: "right", date: new Date().toISOString(), description: "New policies aim to address border security concerns", image: "https://picsum.photos/seed/immig3/800/400" },
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
        { title: "Healthcare costs continue to rise", url: "#", source: "Vox", sourceDomain: "vox.com", lean: "left", date: new Date().toISOString(), description: "Patients struggle with rising medical expenses", image: "https://picsum.photos/seed/health1/800/400" },
        { title: "Insurance markets see changes", url: "#", source: "AP News", sourceDomain: "apnews.com", lean: "center", date: new Date().toISOString(), description: "Health insurance industry adapts to new regulations", image: "https://picsum.photos/seed/health2/800/400" },
        { title: "Healthcare reform debates intensify", url: "#", source: "Daily Caller", sourceDomain: "dailycaller.com", lean: "right", date: new Date().toISOString(), description: "Policy proposals spark partisan debate", image: "https://picsum.photos/seed/health3/800/400" },
      ],
      leftCount: 3, centerCount: 4, rightCount: 3, coverageGap: null, coverageScore: 1
    },
    {
      id: "climate-policy",
      title: "Climate Policy & Clean Energy",
      description: "Climate and environmental policy debates",
      scope: "global",
      articleCount: 11,
      articles: [
        { title: "Climate activists push for stronger action", url: "#", source: "The Guardian", sourceDomain: "theguardian.com", lean: "left", date: new Date().toISOString(), description: "Environmental groups demand more aggressive climate policies", image: "https://picsum.photos/seed/climate1/800/400" },
        { title: "International climate talks continue", url: "#", source: "Reuters", sourceDomain: "reuters.com", lean: "center", date: new Date().toISOString(), description: "World leaders negotiate emissions targets", image: "https://picsum.photos/seed/climate2/800/400" },
        { title: "Energy policy debates intensify", url: "#", source: "The Federalist", sourceDomain: "thefederalist.com", lean: "right", date: new Date().toISOString(), description: "Stakeholders weigh in on energy regulations", image: "https://picsum.photos/seed/climate3/800/400" },
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
        { title: "Ukraine seeks continued Western support", url: "#", source: "CNN", sourceDomain: "cnn.com", lean: "left", date: new Date().toISOString(), description: "Kyiv requests additional military and economic aid", image: "https://picsum.photos/seed/ukraine1/800/400" },
        { title: "Peace negotiations show progress", url: "#", source: "Reuters", sourceDomain: "reuters.com", lean: "center", date: new Date().toISOString(), description: "Diplomatic efforts continue amid ongoing conflict", image: "https://picsum.photos/seed/ukraine2/800/400" },
        { title: "Security concerns drive policy", url: "#", source: "Fox News", sourceDomain: "foxnews.com", lean: "right", date: new Date().toISOString(), description: "National security implications of the conflict discussed", image: "https://picsum.photos/seed/ukraine3/800/400" },
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
        { title: "Humanitarian organizations call for aid access", url: "#", source: "NBC News", sourceDomain: "nbcnews.com", lean: "left", date: new Date().toISOString(), description: "Aid groups demand safe passage for civilians", image: "https://picsum.photos/seed/gaza1/800/400" },
        { title: "Ceasefire discussions continue", url: "#", source: "AP News", sourceDomain: "apnews.com", lean: "center", date: new Date().toISOString(), description: "Mediators work toward temporary ceasefire", image: "https://picsum.photos/seed/gaza2/800/400" },
        { title: "Security priorities shape policy", url: "#", source: "Daily Wire", sourceDomain: "dailywire.com", lean: "right", date: new Date().toISOString(), description: "Israel's security concerns remain paramount", image: "https://picsum.photos/seed/gaza3/800/400" },
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
        { title: "Court takes up controversial cases", url: "#", source: "NBC News", sourceDomain: "nbcnews.com", lean: "left", date: new Date().toISOString(), description: "Justices hear arguments on pivotal legal questions", image: "https://picsum.photos/seed/scotus1/800/400" },
        { title: "Justices weigh legal arguments", url: "#", source: "AP News", sourceDomain: "apnews.com", lean: "center", date: new Date().toISOString(), description: "Court examines constitutional implications", image: "https://picsum.photos/seed/scotus2/800/400" },
        { title: "Rulings could reshape policy", url: "#", source: "National Review", sourceDomain: "nationalreview.com", lean: "right", date: new Date().toISOString(), description: "Conservatives anticipate favorable decisions", image: "https://picsum.photos/seed/scotus3/800/400" },
      ],
      leftCount: 2, centerCount: 3, rightCount: 3, coverageGap: "left", coverageScore: 0.67
    },
    {
      id: "trump-tariffs",
      title: "Trump Tariff Policy",
      description: "Trade tariffs and their impact",
      scope: "national",
      articleCount: 14,
      articles: [
        { title: "New tariffs announced on imports", url: "#", source: "CNN", sourceDomain: "cnn.com", lean: "left", date: new Date().toISOString(), description: "Trade policy shifts could impact consumers", image: "https://picsum.photos/seed/tariff1/800/400" },
        { title: "Trade partners respond to tariff policy", url: "#", source: "Reuters", sourceDomain: "reuters.com", lean: "center", date: new Date().toISOString(), description: "International reaction to US trade measures", image: "https://picsum.photos/seed/tariff2/800/400" },
        { title: "Supporters praise tariff strategy", url: "#", source: "Breitbart", sourceDomain: "breitbart.com", lean: "right", date: new Date().toISOString(), description: "Base celebrates protectionist policies", image: "https://picsum.photos/seed/tariff3/800/400" },
      ],
      leftCount: 4, centerCount: 5, rightCount: 5, coverageGap: "left", coverageScore: 0.8
    },
    {
      id: "housing",
      title: "Housing Crisis & Affordability",
      description: "Housing market and affordability issues",
      scope: "national",
      articleCount: 11,
      articles: [
        { title: "Housing costs squeeze middle class", url: "#", source: "Vox", sourceDomain: "vox.com", lean: "left", date: new Date().toISOString(), description: "Homebuyers face unprecedented challenges", image: "https://picsum.photos/seed/housing1/800/400" },
        { title: "Housing market shows signs of cooling", url: "#", source: "Bloomberg", sourceDomain: "bloomberg.com", lean: "center", date: new Date().toISOString(), description: "Real estate trends analyzed by experts", image: "https://picsum.photos/seed/housing2/800/400" },
        { title: "Policy proposals debated", url: "#", source: "Daily Wire", sourceDomain: "dailywire.com", lean: "right", date: new Date().toISOString(), description: "Market solutions vs government intervention", image: "https://picsum.photos/seed/housing3/800/400" },
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
        { title: "Alliances under scrutiny", url: "#", source: "CNN", sourceDomain: "cnn.com", lean: "left", date: new Date().toISOString(), description: "Traditional partnerships face new challenges", image: "https://picsum.photos/seed/foreign1/800/400" },
        { title: "Diplomatic efforts continue", url: "#", source: "AP News", sourceDomain: "apnews.com", lean: "center", date: new Date().toISOString(), description: "State Department pursues multiple initiatives", image: "https://picsum.photos/seed/foreign2/800/400" },
        { title: "America First policy assessed", url: "#", source: "Fox News", sourceDomain: "foxnews.com", lean: "right", date: new Date().toISOString(), description: "Supporters cite foreign policy successes", image: "https://picsum.photos/seed/foreign3/800/400" },
      ],
      leftCount: 3, centerCount: 4, rightCount: 3, coverageGap: null, coverageScore: 1
    },
  ];
}
