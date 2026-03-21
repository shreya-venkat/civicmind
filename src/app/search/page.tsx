"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

interface Perspectives {
  left: string;
  center: string;
  right: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [perspectives, setPerspectives] = useState<Perspectives | null>(null);
  const [aiError, setAiError] = useState(false);

  useEffect(() => {
    fetch("/api/trending")
      .then(res => res.json())
      .then(data => {
        setTopics(data.topics || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query || topics.length === 0) return;

    const matchedTopic = topics.find(t => 
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
    );

    if (!matchedTopic) return;

    setAiLoading(true);
    setAiError(false);

    fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "perspectives",
        topicTitle: matchedTopic.title,
        articles: matchedTopic.articles.slice(0, 10).map(a => ({
          title: a.title,
          description: a.description,
          source: a.source,
          lean: a.lean,
        })),
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.left && data.center && data.right) {
          setPerspectives(data);
        } else {
          setAiError(true);
        }
      })
      .catch(() => setAiError(true))
      .finally(() => setAiLoading(false));
  }, [query, topics]);

  const matchedTopic = topics.find(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  const relatedTopics = topics.filter(t => 
    t.id !== matchedTopic?.id
  ).slice(0, 3);

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">"{query}"</h1>
        <p className="text-zinc-500">Understanding this topic from every angle</p>
      </div>

      {/* AI Perspectives */}
      {aiLoading && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-zinc-500 text-sm">Generating perspectives...</span>
          </div>
        </div>
      )}

      {perspectives && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
            What each side is saying
          </h2>
          
          <div className="space-y-4">
            <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm font-semibold text-blue-400">Left Perspective</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{perspectives.left}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-zinc-500 rounded-full" />
                <span className="text-sm font-semibold text-zinc-400">Center Perspective</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{perspectives.center}</p>
            </div>

            <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-semibold text-red-400">Right Perspective</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{perspectives.right}</p>
            </div>
          </div>
        </div>
      )}

      {aiError && (
        <div className="mb-10 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 text-sm">
          Could not generate perspectives. Showing topic details below.
        </div>
      )}

      {/* Topic Card */}
      {matchedTopic && (
        <div className="mb-10">
          <Link 
            href={`/topic/${matchedTopic.id}`}
            className="block group"
          >
            <div className="aspect-video bg-zinc-900 rounded-xl overflow-hidden mb-4">
              {matchedTopic.articles[0]?.image ? (
                <img 
                  src={matchedTopic.articles[0].image} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
              {matchedTopic.title}
            </h2>
            <p className="text-zinc-400 mb-3">
              {matchedTopic.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span>{matchedTopic.articleCount} articles</span>
              <span>·</span>
              <span>{matchedTopic.scope === "national" ? "🇺🇸 National" : "🌍 Global"}</span>
            </div>
          </Link>

          <Link 
            href={`/topic/${matchedTopic.id}`}
            className="block mt-4 text-center py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Explore full topic →
          </Link>
        </div>
      )}

      {/* Related Topics */}
      {relatedTopics.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Related Topics</h3>
          <div className="grid grid-cols-3 gap-3">
            {relatedTopics.map(topic => (
              <Link 
                key={topic.id}
                href={`/search?q=${encodeURIComponent(topic.title)}`}
                className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-colors"
              >
                <h4 className="font-medium text-white text-sm mb-1">{topic.title}</h4>
                <p className="text-xs text-zinc-500">{topic.articleCount} articles</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No match */}
      {!matchedTopic && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No topics found</h2>
          <p className="text-zinc-500 mb-6">Try searching for something else</p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Browse topics
          </Link>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">CivicMind</span>
            </a>
            
            <form action="/search" method="GET" className="flex-1 max-w-md mx-4">
              <input
                type="text"
                name="q"
                defaultValue=""
                placeholder="Search..."
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </form>
          </div>
        </div>
      </nav>

      <Suspense fallback={
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-900 rounded w-1/2" />
            <div className="h-4 bg-zinc-900 rounded w-1/3" />
            <div className="h-40 bg-zinc-900 rounded mt-8" />
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}
