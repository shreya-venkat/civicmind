"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

function BiasBar({ topic }: { topic: TrendingTopic }) {
  const leftPct = Math.round((topic.leftCount / topic.articleCount) * 100) || 33;
  const centerPct = Math.round((topic.centerCount / topic.articleCount) * 100) || 34;
  const rightPct = Math.round((topic.rightCount / topic.articleCount) * 100) || 33;
  
  return (
    <div className="flex h-12 rounded-xl overflow-hidden mt-4 mb-2">
      <div className="flex-1 bg-blue-600/80 flex flex-col items-center justify-center rounded-l-xl">
        <span className="text-xs font-semibold text-white/80">L</span>
        <span className="text-sm font-bold text-white">{leftPct}%</span>
      </div>
      <div className="w-px bg-zinc-800" />
      <div className="flex-1 bg-zinc-700 flex flex-col items-center justify-center">
        <span className="text-xs font-semibold text-white/80">C</span>
        <span className="text-sm font-bold text-white">{centerPct}%</span>
      </div>
      <div className="w-px bg-zinc-800" />
      <div className="flex-1 bg-red-600/80 flex flex-col items-center justify-center rounded-r-xl">
        <span className="text-xs font-semibold text-white/80">R</span>
        <span className="text-sm font-bold text-white">{rightPct}%</span>
      </div>
    </div>
  );
}

function TopicTile({ topic }: { topic: TrendingTopic }) {
  const featuredArticle = topic.articles.find(a => a.image) || topic.articles[0];
  const mainArticle = topic.articles[0];
  
  return (
    <Link href={`/topic/${topic.id}`} className="group">
      <div className="overflow-hidden rounded-xl">
        {featuredArticle?.image && (
          <div className="aspect-video bg-zinc-900 overflow-hidden">
            <img 
              src={featuredArticle.image} 
              alt="" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>
      <div className="pt-3">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
            {topic.title}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded ${topic.scope === 'national' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
            {topic.scope === 'national' ? '🇺🇸' : '🌍'}
          </span>
        </div>
        <p className="text-sm text-zinc-400 line-clamp-1">
          {mainArticle?.title || topic.description}
        </p>
        <BiasBar topic={topic} />
      </div>
    </Link>
  );
}

export default function Home() {
  const router = useRouter();
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [scopeFilter, setScopeFilter] = useState<"all" | "national" | "global">("all");

  useEffect(() => {
    fetch("/api/trending")
      .then(res => res.json())
      .then((data: TrendingData) => {
        setTopics(data.topics || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/topic/${encodeURIComponent(input.trim().toLowerCase().replace(/\s+/g, '-'))}`);
    }
  };

  const filteredQuestions = input.length > 0
    ? TRENDING_QUESTIONS.filter(q => 
        q.question.toLowerCase().includes(input.toLowerCase()) || 
        q.topic.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5)
    : TRENDING_QUESTIONS.slice(0, 5);

  const filteredTopics = scopeFilter === "all" 
    ? topics 
    : topics.filter(t => t.scope === scopeFilter);

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">inFormed</span>
            </a>
            
            <a 
              href="/quiz" 
              className="px-4 py-2 text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              Take the Quiz
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Understand politics. Form informed opinions.
          </h1>
          <p className="text-zinc-500 text-lg mb-8">
            Get context. See every angle. Ask anything.
          </p>
          
          {/* Search with Autocomplete */}
          <div className="max-w-2xl mx-auto relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="What do you want to understand?"
                className="w-full px-6 py-4 pr-12 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                autoComplete="off"
              />
              <button 
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </form>
            
            {/* Trending Questions Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                        <polyline points="16 7 22 7 22 13"/>
                      </svg>
                      Trending Questions
                    </span>
                  </div>
                  <div className="space-y-1">
                    {filteredQuestions.map((q, i) => (
                      <Link
                        key={i}
                        href={`/topic/${q.topic}`}
                        onClick={() => setShowDropdown(false)}
                        className="group flex items-center gap-3 py-2 px-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <span className="text-sm text-zinc-600 w-5">{i + 1}</span>
                        <span className="flex-1 text-sm text-zinc-300 group-hover:text-white">{q.question}</span>
                        <span className="text-xs text-zinc-600">{q.searches}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View Trending Topics Link */}
          <div className="mt-4">
            <Link 
              href="/trending"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-400 transition-colors"
            >
              View trending topics
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
        )}

        {/* Topics */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Topics</h2>
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1">
              <button
                onClick={() => setScopeFilter("national")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  scopeFilter === "national" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                🇺🇸 National
              </button>
              <button
                onClick={() => setScopeFilter("global")}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  scopeFilter === "global" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                🌍 Global
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-video bg-zinc-900 animate-pulse rounded-xl mb-3" />
                  <div className="h-5 bg-zinc-900 animate-pulse w-3/4 mb-2" />
                  <div className="h-4 bg-zinc-900 animate-pulse w-full mb-2" />
                  <div className="h-3 bg-zinc-900 animate-pulse w-1/2" />
                </div>
              ))
            ) : (
              filteredTopics.map(topic => (
                <TopicTile key={topic.id} topic={topic} />
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 mt-24">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-indigo-600 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </div>
              <span>See every side.</span>
            </div>
            <a href="/quiz" className="hover:text-white transition-colors">Take the Quiz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
