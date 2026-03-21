import { NextResponse } from "next/server";
import { getSourceLean, simplifyLean } from "../../data/source-bias";

const API_KEY = process.env.NEWSAPI_KEY;

const ALL_DOMAINS = [
  "motherjones.com", "rawstory.com", "dailykos.com", "thenation.com", "theintercept.com",
  "msnbc.com", "huffpost.com", "vox.com", "slate.com", "cnn.com", "nbcnews.com",
  "cbsnews.com", "abcnews.go.com", "latimes.com", "washingtonpost.com", "theatlantic.com",
  "apnews.com", "reuters.com", "npr.org", "thehill.com", "axios.com", "bloomberg.com",
  "foxnews.com", "nypost.com", "dailywire.com", "breitbart.com", "dailycaller.com",
  "newsmax.com", "thefederalist.com", "townhall.com", "washingtonexaminer.com",
].join(",");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") || "";

  if (!topic) {
    return NextResponse.json({ error: "Topic required" }, { status: 400 });
  }

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&domains=${ALL_DOMAINS}&qInTitle=${encodeURIComponent(topic)}&language=en&sortBy=relevancy&pageSize=100&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "NewsAPI error" }, { status: 500 });
    }

    const data = await res.json();
    const articles = data.articles || [];

    const byLean = { left: [] as string[], center: [] as string[], right: [] as string[] };
    const sources = new Set<string>();

    for (const art of articles) {
      if (!art.title || art.title === "[Removed]") continue;

      const domain = art.url ? new URL(art.url).hostname.replace(/^www\./, "") : "";
      const lean = simplifyLean(getSourceLean(domain));

      byLean[lean].push(art.source?.name || domain);
      sources.add(art.source?.name || domain);
    }

    const total = articles.filter((a: { title: string }) => a.title !== "[Removed]").length;
    const leftCount = byLean.left.length;
    const centerCount = byLean.center.length;
    const rightCount = byLean.right.length;

    const blindSpots: string[] = [];
    if (leftCount < total * 0.15 && total > 10) {
      blindSpots.push("Limited coverage from left-leaning sources");
    }
    if (centerCount < total * 0.15 && total > 10) {
      blindSpots.push("Limited coverage from center sources");
    }
    if (rightCount < total * 0.15 && total > 10) {
      blindSpots.push("Limited coverage from right-leaning sources");
    }

    const coverageScore = total > 0 ? Math.min(leftCount, centerCount, rightCount) / Math.max(leftCount, centerCount, rightCount) : 0;

    const gapDescription = coverageScore < 0.5
      ? `Significant coverage imbalance detected. One perspective dominates while others are underrepresented.`
      : coverageScore < 0.8
      ? `Moderate coverage imbalance. Some perspectives receive more attention than others.`
      : `Relatively balanced coverage across perspectives.`;

    return NextResponse.json({
      topic,
      total,
      sources: Array.from(sources),
      byLean: {
        left: { count: leftCount, sources: Array.from(new Set(byLean.left)).slice(0, 5) },
        center: { count: centerCount, sources: Array.from(new Set(byLean.center)).slice(0, 5) },
        right: { count: rightCount, sources: Array.from(new Set(byLean.right)).slice(0, 5) },
      },
      analysis: {
        coverageScore,
        gapDescription,
        blindSpots,
        balance: leftCount > 0 && centerCount > 0 && rightCount > 0 ? "balanced" : "imbalanced",
      },
    });
  } catch (error) {
    console.error("[Coverage Analysis] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
