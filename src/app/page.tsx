"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

interface TrendingArticle {
  title: string;
  url: string;
  source: string;
  lean: "left" | "center" | "right";
  date: string;
}

interface TrendingTopic {
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

type ScopeFilter = "all" | "national" | "global";

export default function Home() {
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending")
      .then((res) => res.json())
      .then((data) => {
        if (data.topics) setTopics(data.topics);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = topics;

    if (scope !== "all") {
      result = result.filter((t) => t.scope === scope);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [topics, search, scope]);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-gray-500 to-red-500 rounded-lg" />
            <span className="text-xl font-bold text-gray-900">Perspectives</span>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/" className="text-gray-900 font-medium">
              Topics
            </Link>
            <button className="text-gray-500 hover:text-gray-700">
              Profile (coming soon)
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            See every side. Decide for yourself.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Real news topics, right now. See what left, center, and right
            sources are actually saying — powered by real-time news
            from major outlets across the political spectrum.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter topics — Iran, immigration, climate..."
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Topic Grid */}
      <section id="topics" className="max-w-6xl mx-auto px-6 py-12">
        {/* Header + scope filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {search.trim() ? "Search Results" : "Trending Now"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {loading
                ? "Scanning global news coverage..."
                : `${topics.length} trending topics from the last 24 hours`}
            </p>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["all", "national", "global"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                  scope === s
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s === "all" ? "All" : s === "national" ? "🇺🇸 National" : "🌍 Global"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-20 bg-gray-200 rounded-full" />
                  <div className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-100 rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-4 w-12 bg-blue-50 rounded" />
                  <div className="h-4 w-12 bg-gray-50 rounded" />
                  <div className="h-4 w-12 bg-red-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">No topics found</p>
            <p className="text-gray-400 text-sm">
              Try a different search or filter.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((topic) => (
              <Link
                key={topic.id}
                href={`/topic/${topic.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-gray-300 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {topic.scope === "national" ? "🇺🇸" : "🌍"}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {topic.articleCount} articles
                    </span>
                  </div>
                  <span className="text-gray-400 group-hover:text-gray-600 transition">
                    →
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {topic.title}
                </h3>
                {/* Perspective bar — shows proportion of left/center/right coverage */}
                <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 mb-3">
                  {topic.leftCount > 0 && (
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${(topic.leftCount / topic.articleCount) * 100}%`,
                      }}
                    />
                  )}
                  {topic.centerCount > 0 && (
                    <div
                      className="bg-gray-400"
                      style={{
                        width: `${(topic.centerCount / topic.articleCount) * 100}%`,
                      }}
                    />
                  )}
                  {topic.rightCount > 0 && (
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${(topic.rightCount / topic.articleCount) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Left ({topic.leftCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    Center ({topic.centerCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Right ({topic.rightCount})
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
