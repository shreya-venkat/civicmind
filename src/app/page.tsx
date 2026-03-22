"use client";

import { useState, useEffect, useRef } from "react";
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
];

function BiasBarMini({ topic }: { topic: TrendingTopic }) {
  const leftPct = Math.round((topic.leftCount / topic.articleCount) * 100) || 33;
  const centerPct = Math.round((topic.centerCount / topic.articleCount) * 100) || 34;
  const rightPct = Math.round((topic.rightCount / topic.articleCount) * 100) || 33;
  
  return (
    <div className="flex h-1 rounded-full overflow-hidden bg-zinc-800">
      {topic.leftCount > 0 && <div className="bg-blue-500" style={{ width: `${leftPct}%` }} />}
      {topic.centerCount > 0 && <div className="bg-zinc-500" style={{ width: `${centerPct}%` }} />}
      {topic.rightCount > 0 && <div className="bg-red-500" style={{ width: `${rightPct}%` }} />}
    </div>
  );
}

function TopicCard({ topic }: { topic: TrendingTopic }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const featuredArticle = topic.articles.find(a => a.image) || topic.articles[0];
  const previewArticles = topic.articles.slice(0, 3);
  
  const leftPct = Math.round((topic.leftCount / topic.articleCount) * 100) || 33;
  const centerPct = Math.round((topic.centerCount / topic.articleCount) * 100) || 34;
  const rightPct = Math.round((topic.rightCount / topic.articleCount) * 100) || 33;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !spotlightRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlightRef.current.style.setProperty('--mouse-x', `${x}px`);
      spotlightRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <Link href={`/topic/${topic.id}`} className="block">
      <div 
        ref={cardRef}
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Spotlight effect container */}
        <div 
          ref={spotlightRef}
          className={`absolute -inset-px rounded-2xl transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(99, 102, 241, 0.15), transparent 40%)`,
          }}
        />
        
        {/* Gradient border on hover */}
        <div 
          className={`absolute -inset-px rounded-2xl transition-all duration-500 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.3), rgba(239, 68, 68, 0.5))',
            padding: '1px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
          }}
        />
        
        {/* Card content */}
        <div className="relative bg-zinc-900/50 rounded-2xl p-5 backdrop-blur-sm border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
          {/* Image */}
          {featuredArticle?.image && (
            <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-zinc-800">
              <img 
                src={featuredArticle.image} 
                alt="" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              topic.scope === 'national' 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {topic.scope === 'national' ? '🇺🇸 National' : '🌍 Global'}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
            {topic.title}
          </h3>
          
          {/* Preview articles (spotlight content) */}
          <div className={`space-y-1.5 mb-4 transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            {previewArticles.map((article, i) => (
              <p key={i} className="text-xs text-zinc-500 truncate flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full flex-shrink-0 ${
                  article.lean === 'left' ? 'bg-blue-500' : article.lean === 'center' ? 'bg-zinc-500' : 'bg-red-500'
                }`} />
                {article.title}
              </p>
            ))}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{topic.articleCount} articles</span>
              <span className="text-zinc-700">·</span>
              <span className="text-xs text-zinc-500">{new Set(topic.articles.map(a => a.source)).size} sources</span>
            </div>
          </div>
          
          {/* Bias bar */}
          <div className="mt-3">
            <BiasBarMini topic={topic} />
            <div className="flex justify-between mt-1 text-[10px]">
              <span className="text-blue-500/70">L {leftPct}%</span>
              <span className="text-zinc-500/70">C {centerPct}%</span>
              <span className="text-red-500/70">R {rightPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function NavBar() {
  const [activeTab, setActiveTab] = useState<"home" | "topics">("home");
  
  return (
    <nav className="border-b border-zinc-800/50 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" onClick={() => setActiveTab("home")}>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-xl shadow-lg" />
            <span className="text-lg font-semibold tracking-tight text-white">inFormed</span>
          </Link>
          
          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <Link 
              href="/" 
              className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                activeTab === "home" ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("home")}
            >
              Home
              {activeTab === "home" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </Link>
            <Link 
              href="/#topics" 
              className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                activeTab === "topics" ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("topics")}
            >
              Topics
              {activeTab === "topics" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </Link>
          </div>
          
          {/* CTA */}
          <Link 
            href="/quiz" 
            className="px-4 py-2 text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-colors rounded-lg"
          >
            Take the Quiz
          </Link>
        </div>
      </div>
    </nav>
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
      <NavBar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
            Understand politics. Form informed opinions.
          </h1>
          <p className="text-zinc-500 text-lg mb-10">
            Get context. See every angle. Ask anything.
          </p>
          
          {/* Search */}
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
                className="w-full px-6 py-4.5 pr-14 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all backdrop-blur-sm"
                autoComplete="off"
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
            
            {/* Trending Questions Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-3 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-50">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                      <polyline points="16 7 22 7 22 13"/>
                    </svg>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Trending Questions</span>
                  </div>
                  <div className="space-y-1">
                    {filteredQuestions.map((q, i) => (
                      <Link
                        key={i}
                        href={`/topic/${q.topic}`}
                        onClick={() => setShowDropdown(false)}
                        className="group flex items-center gap-4 py-2.5 px-3 hover:bg-zinc-800/50 rounded-xl transition-colors"
                      >
                        <span className="text-sm text-zinc-600 w-5">{i + 1}</span>
                        <span className="flex-1 text-sm text-zinc-300 group-hover:text-white">{q.question}</span>
                        <span className="text-xs text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded">{q.searches}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
        )}

        {/* Topics Section */}
        <section id="topics">
          {/* Section header with tabs */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-white">Topics</h2>
            
            {/* Scope Tabs */}
            <div className="flex items-center bg-zinc-900/50 rounded-xl p-1 border border-zinc-800/50">
              <button
                onClick={() => setScopeFilter("all")}
                className={`relative px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                  scopeFilter === "all" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All
                {scopeFilter === "all" && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setScopeFilter("national")}
                className={`relative px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                  scopeFilter === "national" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                🇺🇸 National
                {scopeFilter === "national" && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setScopeFilter("global")}
                className={`relative px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                  scopeFilter === "global" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                🌍 Global
                {scopeFilter === "global" && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
          
          {/* Topic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-zinc-900/30 rounded-2xl p-5 animate-pulse">
                  <div className="aspect-video bg-zinc-800 rounded-xl mb-4" />
                  <div className="h-5 bg-zinc-800 w-3/4 mb-3" />
                  <div className="h-4 bg-zinc-800 w-full mb-2" />
                  <div className="h-1 bg-zinc-800 rounded-full mt-4" />
                </div>
              ))
            ) : (
              filteredTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800/50 mt-24">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-md shadow-sm" />
              <span>See every side.</span>
            </div>
            <a href="/quiz" className="hover:text-white transition-colors">Take the Quiz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
