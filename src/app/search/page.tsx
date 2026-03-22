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
          </div>
        </div>
      </nav>

      {!query ? (
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-2xl font-bold mb-2">Search</h1>
            <p className="text-zinc-500">Ask anything about politics</p>
          </div>

          <form onSubmit={handleSearch} className="mb-12">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What do you want to understand?"
                className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
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
                  className="group flex items-center gap-4 py-3 border-b border-zinc-800/50 hover:border-zinc-700 transition-colors"
                >
                  <span className="text-sm text-zinc-600 w-5">{i + 1}</span>
                  <span className="flex-1 text-white group-hover:text-indigo-300 transition-colors text-sm">
                    {item.question}
                  </span>
                  <span className="text-xs text-zinc-600">{item.searches}</span>
                </Link>
              ))}
            </div>
          </div>
        </main>
      ) : (
        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">&ldquo;{query}&rdquo;</h1>
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
