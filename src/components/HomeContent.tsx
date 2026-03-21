"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

interface TrendingArticle {
  title: string;
  url: string;
  source: string;
  sourceDomain?: string;
  lean: "left" | "center" | "right";
  date: string;
  image: string | null;
  description: string | null;
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
  coverageGap?: "left" | "center" | "right" | null;
  coverageScore?: number;
}

interface TrendingData {
  topics: TrendingTopic[];
  updatedAt: string;
}

type ScopeFilter = "all" | "national" | "global";

function GroundNewsStyleBar({ topic }: { topic: TrendingTopic }) {
  const leftPct = (topic.leftCount / topic.articleCount) * 100;
  const centerPct = (topic.centerCount / topic.articleCount) * 100;
  const rightPct = (topic.rightCount / topic.articleCount) * 100;
  
  return (
    <div className="flex items-stretch gap-0.5 h-4 rounded-sm overflow-hidden">
      {topic.leftCount > 0 && (
        <div className="bg-blue-500" style={{ width: `${leftPct}%`, minWidth: leftPct > 0 ? '3px' : '0' }} />
      )}
      {topic.centerCount > 0 && (
        <div className="bg-gray-400" style={{ width: `${centerPct}%`, minWidth: centerPct > 0 ? '3px' : '0' }} />
      )}
      {topic.rightCount > 0 && (
        <div className="bg-red-500" style={{ width: `${rightPct}%`, minWidth: rightPct > 0 ? '3px' : '0' }} />
      )}
    </div>
  );
}

function TopicBarItem({ topic, active, onClick }: { topic: TrendingTopic; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        active ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{topic.title}</span>
        <div className={`w-12 ${active ? 'opacity-80' : 'opacity-50'}`}>
          <GroundNewsStyleBar topic={topic} />
        </div>
      </div>
    </button>
  );
}

function HeadlineCard({ article, topic }: { article: TrendingArticle; topic: TrendingTopic }) {
  const leanColors = {
    left: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
    center: { bg: "bg-gray-500", text: "text-gray-600", light: "bg-gray-50" },
    right: { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50" },
  };
  const colors = leanColors[article.lean];
  
  return (
    <Link
      href={`/topic/${topic.id}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
    >
      {article.image && (
        <div className="relative h-32 overflow-hidden bg-gray-100">
          <img
            src={article.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 ${colors.light} ${colors.text} text-xs font-medium rounded shadow`}>
              {article.lean.charAt(0).toUpperCase() + article.lean.slice(1)}
            </span>
          </div>
        </div>
      )}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <span className={`${colors.text} font-medium`}>{article.source}</span>
          <span>•</span>
          <span>{new Date(article.date).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}

function TopicCard({ topic }: { topic: TrendingTopic }) {
  const featuredArticle = topic.articles.find(a => a.image) || topic.articles[0];
  const leftPct = Math.round((topic.leftCount / topic.articleCount) * 100);
  const centerPct = Math.round((topic.centerCount / topic.articleCount) * 100);
  const rightPct = Math.round((topic.rightCount / topic.articleCount) * 100);
  
  return (
    <Link
      href={`/topic/${topic.id}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
    >
      {featuredArticle?.image && (
        <div className="relative h-36 overflow-hidden bg-gray-100">
          <img
            src={featuredArticle.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-white/90 backdrop-blur text-gray-700 text-xs font-medium rounded shadow">
              {topic.scope === "national" ? "🇺🇸 National" : "🌍 Global"}
            </span>
          </div>
          {topic.coverageGap && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded shadow">
              ⚠️ {topic.coverageGap}
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {topic.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {featuredArticle?.title || topic.description}
        </p>
        <div className="space-y-2">
          <GroundNewsStyleBar topic={topic} />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span className="text-blue-600">L {leftPct}%</span>
            <span className="text-gray-500">C {centerPct}%</span>
            <span className="text-red-600">R {rightPct}%</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
          <span>{topic.articleCount} articles</span>
          <span>→ View</span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedHeadline({ article, topic }: { article: TrendingArticle; topic: TrendingTopic }) {
  const leanColors = {
    left: { bg: "bg-blue-600", text: "text-blue-600" },
    center: { bg: "bg-gray-600", text: "text-gray-600" },
    right: { bg: "bg-red-600", text: "text-red-600" },
  };
  const colors = leanColors[article.lean];
  const leftPct = Math.round((topic.leftCount / topic.articleCount) * 100);
  const centerPct = Math.round((topic.centerCount / topic.articleCount) * 100);
  const rightPct = Math.round((topic.rightCount / topic.articleCount) * 100);
  
  return (
    <Link
      href={`/topic/${topic.id}`}
      className="group block relative rounded-xl overflow-hidden h-full min-h-[300px]"
    >
      {article.image ? (
        <img
          src={article.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-gray-600 to-red-600" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 ${colors.bg} text-white text-xs font-medium rounded`}>
            {article.lean.charAt(0).toUpperCase() + article.lean.slice(1)}
          </span>
          <span className="px-2 py-1 bg-white/20 backdrop-blur text-white text-xs font-medium rounded">
            {topic.scope === "national" ? "🇺🇸 National" : "🌍 Global"}
          </span>
          {topic.coverageGap && (
            <span className="px-2 py-1 bg-amber-500/90 text-white text-xs font-medium rounded">
              ⚠️ {topic.coverageGap}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors">
          {topic.title}
        </h2>
        <p className="text-white/80 text-sm mb-4 line-clamp-2">
          {article.title}
        </p>
        <div className="flex items-center gap-4 text-white/90 text-sm">
          <span className="text-white/60">{article.source}</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>L {leftPct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span>C {centerPct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>R {rightPct}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomeContent({ initialData }: { initialData?: TrendingData }) {
  const [topics, setTopics] = useState<TrendingTopic[]>(initialData?.topics || []);
  const [loading, setLoading] = useState(!initialData?.topics);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(initialData?.topics?.[0]?.id || null);

  useEffect(() => {
    if (initialData?.topics && initialData.topics.length > 0) {
      return;
    }
    fetch("/api/trending")
      .then((res) => res.json())
      .then((data) => {
        if (data.topics) {
          setTopics(data.topics);
          if (data.topics.length > 0) {
            setSelectedTopicId(data.topics[0].id);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [initialData]);

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

  const allArticles = useMemo(() => {
    return topics.flatMap((t) => t.articles).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [topics]);

  const featuredTopic = filtered[0];
  const featuredArticle = featuredTopic?.articles.find(a => a.image) || featuredTopic?.articles[0];
  
  const headlinesByLean = {
    left: allArticles.filter(a => a.lean === "left").slice(0, 3),
    center: allArticles.filter(a => a.lean === "center").slice(0, 3),
    right: allArticles.filter(a => a.lean === "right").slice(0, 3),
  };

  const topicsWithGaps = filtered.filter(t => t.coverageGap);

  const getTopicForArticle = (article: TrendingArticle): TrendingTopic | undefined => {
    return topics.find(t => t.articles.some(a => a.title === article.title));
  };

  return (
    <>
      {/* Topic Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[57px] z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-xs font-medium text-gray-500 flex-shrink-0">TOPICS:</span>
            {loading ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              filtered.slice(0, 12).map((topic) => (
                <TopicBarItem
                  key={topic.id}
                  topic={topic}
                  active={selectedTopicId === topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Featured Story */}
        {featuredTopic && !search.trim() && (
          <section className="mb-8">
            <FeaturedHeadline article={featuredArticle!} topic={featuredTopic} />
          </section>
        )}

        {/* Latest Headlines */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Latest Headlines</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-gray-600">Left</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gray-400" />
                <span className="text-gray-600">Center</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-500" />
                <span className="text-gray-600">Right</span>
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Headlines */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-sm bg-blue-500" />
                <h3 className="font-semibold text-blue-600">Left</h3>
              </div>
              <div className="space-y-3">
                {loading ? (
                  [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />)
                ) : headlinesByLean.left.length > 0 ? (
                  headlinesByLean.left.map((article, i) => {
                    const topic = getTopicForArticle(article);
                    return topic ? <HeadlineCard key={i} article={article} topic={topic} /> : null;
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No left-leaning articles</p>
                )}
              </div>
            </div>

            {/* Center Headlines */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-sm bg-gray-400" />
                <h3 className="font-semibold text-gray-600">Center</h3>
              </div>
              <div className="space-y-3">
                {loading ? (
                  [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />)
                ) : headlinesByLean.center.length > 0 ? (
                  headlinesByLean.center.map((article, i) => {
                    const topic = getTopicForArticle(article);
                    return topic ? <HeadlineCard key={i} article={article} topic={topic} /> : null;
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No center articles</p>
                )}
              </div>
            </div>

            {/* Right Headlines */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-sm bg-red-500" />
                <h3 className="font-semibold text-red-600">Right</h3>
              </div>
              <div className="space-y-3">
                {loading ? (
                  [...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />)
                ) : headlinesByLean.right.length > 0 ? (
                  headlinesByLean.right.map((article, i) => {
                    const topic = getTopicForArticle(article);
                    return topic ? <HeadlineCard key={i} article={article} topic={topic} /> : null;
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No right-leaning articles</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Gaps */}
        {topicsWithGaps.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⚠️</span>
              <h2 className="text-xl font-bold text-gray-900">Coverage Gaps</h2>
              <span className="text-sm text-gray-500">One perspective dominates</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topicsWithGaps.slice(0, 4).map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </section>
        )}

        {/* All Topics */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {search.trim() ? "Search Results" : "All Topics"}
            </h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["all", "national", "global"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    scope === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {s === "all" ? "All" : s === "national" ? "🇺🇸" : "🌍"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                No topics found. Try a different search.
              </div>
            ) : (
              filtered.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
