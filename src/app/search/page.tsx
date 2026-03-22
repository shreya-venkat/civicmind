"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

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

const TRENDING_QUESTIONS = [
  { question: "Why are tariffs controversial?", topic: "tariffs", searches: "500K+" },
  { question: "What is DEI and why is it being debated?", topic: "dei", searches: "200K+" },
  { question: "How does immigration affect the economy?", topic: "immigration", searches: "150K+" },
  { question: "What is happening in Ukraine?", topic: "ukraine", searches: "120K+" },
  { question: "Why is housing so expensive?", topic: "housing", searches: "100K+" },
  { question: "What are the arguments for and against abortion?", topic: "abortion", searches: "95K+" },
  { question: "How do tariffs actually work?", topic: "tariffs", searches: "80K+" },
  { question: "What is the national debt and why does it matter?", topic: "debt", searches: "75K+" },
  { question: "Why is there a border crisis?", topic: "immigration", searches: "70K+" },
  { question: "What is climate change policy?", topic: "climate", searches: "65K+" },
  { question: "How does healthcare work in other countries?", topic: "healthcare", searches: "60K+" },
  { question: "What is happening with Trump's legal cases?", topic: "trump-administration", searches: "55K+" },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  
  const [input, setInput] = useState(query);
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [perspectives, setPerspectives] = useState<Perspectives | null>(null);
  const [aiError, setAiError] = useState(false);
  const [trendingQuestions, setTrendingQuestions] = useState(TRENDING_QUESTIONS);

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
        articles: matchedTopic.articles.slice(0, 10).map((a: TrendingArticle) => ({
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  const shuffleQuestions = () => {
    setTrendingQuestions(shuffleArray(TRENDING_QUESTIONS));
  };

  const matchedTopic = topics.find(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  const relatedTopics = topics.filter(t => 
    t.id !== matchedTopic?.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800/50 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <a href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-xl shadow-lg" />
                <span className="text-lg font-semibold text-white">inFormed</span>
              </a>
              <div className="flex items-center gap-1">
                <a href="/" className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg">
                  Home
                </a>
                <a href="/#topics" className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg">
                  Topics
                </a>
              </div>
            </div>
            <a 
              href="/quiz" 
              className="px-4 py-2 text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-colors rounded-lg"
            >
              Take the Quiz
            </a>
          </div>
        </div>
      </nav>

      {!query ? (
        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Search
            </h1>
            <p className="text-zinc-500 text-lg mb-8">Ask anything about politics</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="mb-12 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What do you want to understand?"
                className="w-full px-6 py-4.5 pr-14 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all backdrop-blur-sm"
                autoFocus
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </form>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                    <polyline points="16 7 22 7 22 13"/>
                  </svg>
                  Trending Questions
                </h2>
                <button 
                  onClick={shuffleQuestions}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  shuffle ↻
                </button>
              </div>

              <div className="space-y-1">
                {trendingQuestions.map((item, i) => (
                  <Link
                    key={i}
                    href={`/search?q=${encodeURIComponent(item.topic)}`}
                    className="group flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-zinc-900/50 transition-colors"
                  >
                    <span className="text-sm text-zinc-600 w-5">{i + 1}</span>
                    <span className="flex-1 text-white group-hover:text-indigo-300 transition-colors text-sm">
                      {item.question}
                    </span>
                    <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded">{item.searches}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">&ldquo;{query}&rdquo;</h1>
            <p className="text-zinc-500">Understanding this topic from every angle</p>
          </div>

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

          {matchedTopic && (
            <div className="mb-10">
              <Link 
                href={`/topic/${matchedTopic.id}`}
                className="block group"
              >
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                      matchedTopic.scope === 'national' 
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {matchedTopic.scope === "national" ? "🇺🇸 National" : "🌍 Global"}
                    </span>
                    <span className="text-xs text-zinc-500">{matchedTopic.articleCount} articles</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-xs text-zinc-500">{new Set(matchedTopic.articles.map(a => a.source)).size} sources</span>
                  </div>
                  
                  {matchedTopic.articles[0]?.image && (
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-zinc-800">
                      <img 
                        src={matchedTopic.articles[0].image} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  
                  <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                    {matchedTopic.title}
                  </h2>
                  <p className="text-zinc-400 mb-4">
                    {matchedTopic.description}
                  </p>
                  
                  {/* Mini bias bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 rounded-full overflow-hidden bg-zinc-800">
                      {matchedTopic.leftCount > 0 && <div className="bg-blue-500 h-full" style={{ width: `${Math.round((matchedTopic.leftCount / matchedTopic.articleCount) * 100)}%` }} />}
                      {matchedTopic.centerCount > 0 && <div className="bg-zinc-500 h-full" style={{ width: `${Math.round((matchedTopic.centerCount / matchedTopic.articleCount) * 100)}%` }} />}
                      {matchedTopic.rightCount > 0 && <div className="bg-red-500 h-full" style={{ width: `${Math.round((matchedTopic.rightCount / matchedTopic.articleCount) * 100)}%` }} />}
                    </div>
                  </div>
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

          {relatedTopics.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Related Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedTopics.map(topic => (
                  <Link 
                    key={topic.id}
                    href={`/search?q=${encodeURIComponent(topic.title)}`}
                    className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50 hover:border-zinc-700/50 transition-all"
                  >
                    <h4 className="font-medium text-white text-sm mb-1">{topic.title}</h4>
                    <p className="text-xs text-zinc-500">{topic.articleCount} articles</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
                href="/search"
                className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Browse trending questions
              </Link>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
