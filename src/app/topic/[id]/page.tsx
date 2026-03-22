"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface TrendingArticle {
  title: string;
  url: string;
  source: string;
  sourceDomain?: string;
  lean: "left" | "center" | "right";
  date: string;
  description: string | null;
  image: string | null;
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

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIPerspectives {
  left: string;
  center: string;
  right: string;
}

type Lean = "left" | "center" | "right";

function BiasBar({ topic }: { topic: TrendingTopic }) {
  const leftPct = Math.round((topic.leftCount / topic.articleCount) * 100);
  const centerPct = Math.round((topic.centerCount / topic.articleCount) * 100);
  const rightPct = Math.round((topic.rightCount / topic.articleCount) * 100);
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5 h-1.5 flex-1 rounded-full overflow-hidden bg-zinc-800">
        {topic.leftCount > 0 && <div className="bg-blue-500" style={{ width: `${leftPct}%` }} />}
        {topic.centerCount > 0 && <div className="bg-zinc-500" style={{ width: `${centerPct}%` }} />}
        {topic.rightCount > 0 && <div className="bg-red-500" style={{ width: `${rightPct}%` }} />}
      </div>
      <div className="flex gap-4 text-xs">
        <span className="text-blue-400">L {leftPct}%</span>
        <span className="text-zinc-500">C {centerPct}%</span>
        <span className="text-red-400">R {rightPct}%</span>
      </div>
    </div>
  );
}

function CoverageSidebar({ topic }: { topic: TrendingTopic }) {
  const leftPct = Math.round((topic.leftCount / topic.articleCount) * 100);
  const centerPct = Math.round((topic.centerCount / topic.articleCount) * 100);
  const rightPct = Math.round((topic.rightCount / topic.articleCount) * 100);

  return (
    <aside className="w-72 border-l border-zinc-800 bg-zinc-950 hidden lg:block">
      <div className="p-5 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Coverage</h3>
          <div className="space-y-3">
            <div className="p-3 border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-2">Bias Distribution</p>
              <div className="flex h-3 rounded-full overflow-hidden bg-zinc-800 mb-2">
                {topic.leftCount > 0 && <div className="bg-blue-500" style={{ width: `${leftPct}%` }} />}
                {topic.centerCount > 0 && <div className="bg-zinc-500" style={{ width: `${centerPct}%` }} />}
                {topic.rightCount > 0 && <div className="bg-red-500" style={{ width: `${rightPct}%` }} />}
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-400">L {leftPct}%</span>
                <span className="text-zinc-500">C {centerPct}%</span>
                <span className="text-red-400">R {rightPct}%</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-zinc-900 border border-zinc-800">
                <p className="text-lg font-bold text-white">{topic.articleCount}</p>
                <p className="text-xs text-zinc-500">Articles</p>
              </div>
              <div className="p-2 bg-zinc-900 border border-zinc-800">
                <p className="text-lg font-bold text-white">{new Set(topic.articles.map(a => a.source)).size}</p>
                <p className="text-xs text-zinc-500">Sources</p>
              </div>
              <div className="p-2 bg-zinc-900 border border-zinc-800">
                <p className="text-lg font-bold text-white">{topic.leftCount + topic.centerCount + topic.rightCount}</p>
                <p className="text-xs text-zinc-500">By Lean</p>
              </div>
            </div>
          </div>
        </div>

        {topic.coverageGap && (
          <div className="p-3 border border-amber-900 bg-amber-950/50">
            <p className="text-xs font-medium text-amber-400 mb-1">⚠️ Coverage Gap</p>
            <p className="text-xs text-zinc-400">
              {topic.coverageGap.charAt(0).toUpperCase() + topic.coverageGap.slice(1)}-lean sources underrepresented
            </p>
          </div>
        )}

        <div>
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Top Sources</h4>
          <div className="space-y-2">
            {topic.articles.slice(0, 8).map((article, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full ${article.lean === 'left' ? 'bg-blue-500' : article.lean === 'center' ? 'bg-zinc-500' : 'bg-red-500'}`} />
                <span className="flex-1 text-zinc-400 truncate">{article.source}</span>
                <span className="text-zinc-600">{new Date(article.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function LeanSection({ 
  lean, 
  summary, 
  notes, 
  articles,
  onClose 
}: { 
  lean: Lean; 
  summary: string;
  notes: string[];
  articles: TrendingArticle[];
  onClose: () => void;
}) {
  const colors = {
    left: { bg: "bg-blue-500/5", border: "border-blue-500/30", header: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500", label: "Progressive" },
    center: { bg: "bg-zinc-800/30", border: "border-zinc-700", header: "bg-zinc-700/50", text: "text-zinc-400", dot: "bg-zinc-500", label: "Moderate" },
    right: { bg: "bg-red-500/5", border: "border-red-500/30", header: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500", label: "Conservative" },
  };
  const c = colors[lean];

  return (
    <div className={`border-b border-zinc-800 ${c.bg}`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${c.dot}`} />
            <h2 className={`text-xl font-semibold ${c.text}`}>{c.label} View</h2>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500 text-sm">{articles.length} sources</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Summary</h3>
              <p className="text-zinc-200 leading-relaxed">{summary}</p>
            </div>

            {/* Notes */}
            {notes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Key Points</h3>
                <ul className="space-y-2">
                  {notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-2 flex-shrink-0`} />
                      <span className="text-zinc-300 text-sm leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sources */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Sources</h3>
            <div className="space-y-2">
              {articles.slice(0, 5).map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <p className="text-sm text-zinc-200 leading-snug line-clamp-2 mb-1">{article.title}</p>
                  <p className="text-xs text-zinc-500">{article.source}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TopicPage() {
  const params = useParams();
  const [topic, setTopic] = useState<TrendingTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLean, setSelectedLean] = useState<Lean | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [aiPerspectives, setAiPerspectives] = useState<AIPerspectives | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/trending")
      .then((res) => res.json())
      .then((data) => {
        if (data.topics) {
          const found = data.topics.find((t: TrendingTopic) => t.id === params.id);
          setTopic(found || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!topic || topic.articles.length === 0) return;
    
    setAiLoading(true);
    fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "perspectives",
        topicTitle: topic.title,
        articles: topic.articles.slice(0, 10).map((a) => ({
          title: a.title,
          description: a.description,
          source: a.source,
          lean: a.lean,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.left && data.center && data.right) {
          setAiPerspectives(data);
        }
      })
      .catch(() => {})
      .finally(() => setAiLoading(false));
  }, [topic]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !topic) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const assistantMsg: ChatMessage = { role: "assistant", content: "Thinking..." };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          topicTitle: topic.title,
          message: input,
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: data.response || "I'm having trouble responding right now." };
          return updated;
        });
        return;
      }
    } catch {
      // Fall through
    }

    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: "assistant", content: "I'm having trouble responding right now." };
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Topic not found</h1>
          <Link href="/" className="text-indigo-400 hover:underline text-sm">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const articlesByLean = {
    left: topic.articles.filter((a) => a.lean === "left"),
    center: topic.articles.filter((a) => a.lean === "center"),
    right: topic.articles.filter((a) => a.lean === "right"),
  };

  const selectedSummary = selectedLean && aiPerspectives ? aiPerspectives[selectedLean] : "";

  const generateNotes = (articles: TrendingArticle[]): string[] => {
    const notes: string[] = [];
    const titles = articles.slice(0, 5).map(a => a.title);
    
    if (titles.length > 0) {
      notes.push(`Covered by ${articles.length} ${selectedLean === 'left' ? 'progressive' : selectedLean === 'right' ? 'conservative' : 'centrist'} sources`);
    }
    
    const recentCount = articles.filter(a => {
      const date = new Date(a.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date > weekAgo;
    }).length;
    
    if (recentCount > 0) {
      notes.push(`${recentCount} articles published this week`);
    }

    const commonWords = ['immigration', 'border', 'economy', 'healthcare', 'climate', 'taxes', 'trade', 'china', 'russia', 'iran', 'ukraine', 'israel'];
    titles.forEach(title => {
      const lower = title.toLowerCase();
      commonWords.forEach(word => {
        if (lower.includes(word) && notes.length < 4) {
          const note = `Recent focus on ${word}`;
          if (!notes.includes(note)) {
            notes.push(note);
          }
        }
      });
    });

    return notes.slice(0, 4);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-800 sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-xl shadow-lg" />
                <span className="text-lg font-semibold">inFormed</span>
              </Link>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-400 text-sm">{topic.title}</span>
            </div>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                chatOpen
                  ? "bg-zinc-800 text-white"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {chatOpen ? "Close" : "Challenge My View"}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Main content */}
        <main className="flex-1">
          {/* Topic header */}
          <div className="border-b border-zinc-800">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {topic.scope === "national" ? "🇺🇸 National" : "🌍 Global"}
                </span>
                <span className="text-xs text-zinc-600">
                  {topic.articleCount} articles
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-6">{topic.title}</h1>
              <BiasBar topic={topic} />
            </div>
          </div>

          {/* Quick Take Section - Always visible */}
          <div className="border-b border-zinc-800">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-md" />
                <h2 className="text-lg font-semibold text-white">Quick Take</h2>
                <span className="text-zinc-500 text-sm">What each side is saying</span>
              </div>
              
              {aiLoading ? (
                <div className="flex items-center gap-3 py-8">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-zinc-500">Generating perspectives from articles...</span>
                </div>
              ) : aiPerspectives ? (
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSelectedLean(selectedLean === 'left' ? null : 'left')}
                    className={`text-left p-5 rounded-xl border transition-all ${
                      selectedLean === 'left' 
                        ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/30' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-blue-500/30 hover:bg-blue-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium text-blue-400">Progressive</span>
                      <span className="text-zinc-600 text-xs">({articlesByLean.left.length})</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-4">{aiPerspectives.left}</p>
                  </button>

                  <button
                    onClick={() => setSelectedLean(selectedLean === 'center' ? null : 'center')}
                    className={`text-left p-5 rounded-xl border transition-all ${
                      selectedLean === 'center' 
                        ? 'bg-zinc-800 border-zinc-500 ring-2 ring-zinc-500/30' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                      <span className="text-sm font-medium text-zinc-400">Moderate</span>
                      <span className="text-zinc-600 text-xs">({articlesByLean.center.length})</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-4">{aiPerspectives.center}</p>
                  </button>

                  <button
                    onClick={() => setSelectedLean(selectedLean === 'right' ? null : 'right')}
                    className={`text-left p-5 rounded-xl border transition-all ${
                      selectedLean === 'right' 
                        ? 'bg-red-500/10 border-red-500 ring-2 ring-red-500/30' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-red-400">Conservative</span>
                      <span className="text-zinc-600 text-xs">({articlesByLean.right.length})</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed line-clamp-4">{aiPerspectives.right}</p>
                  </button>
                </div>
              ) : (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-zinc-500 text-sm">AI summaries coming soon</p>
                </div>
              )}

              <p className="mt-4 text-xs text-zinc-500">
                Click a card to see full summary, key points, and sources
              </p>
            </div>
          </div>

          {/* Expanded Lean Section */}
          {selectedLean && selectedSummary && (
            <LeanSection
              lean={selectedLean}
              summary={selectedSummary}
              notes={generateNotes(articlesByLean[selectedLean])}
              articles={articlesByLean[selectedLean]}
              onClose={() => setSelectedLean(null)}
            />
          )}

          {/* All Articles Section */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">All Sources</h3>
              <span className="text-sm text-zinc-500">{topic.articles.length} articles</span>
            </div>

            {/* Lean tabs */}
            <div className="flex items-center gap-2 mb-6">
              {(["left", "center", "right"] as const).map((lean) => {
                const colors = {
                  left: { dot: "bg-blue-500", text: "text-blue-400", count: articlesByLean[lean].length },
                  center: { dot: "bg-zinc-500", text: "text-zinc-400", count: articlesByLean[lean].length },
                  right: { dot: "bg-red-500", text: "text-red-400", count: articlesByLean[lean].length },
                };
                const c = colors[lean];
                const isSelected = selectedLean === lean;

                return (
                  <button
                    key={lean}
                    onClick={() => setSelectedLean(isSelected ? null : lean)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      isSelected
                        ? `${c.text} bg-zinc-800 border-zinc-700`
                        : 'text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <span className="text-sm font-medium capitalize">{lean}</span>
                    <span className="text-xs opacity-60">{c.count}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {(selectedLean ? articlesByLean[selectedLean] : topic.articles).map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 p-4 bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors rounded-xl"
                >
                  {article.image && (
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <img 
                        src={article.image} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        article.lean === 'left' ? 'bg-blue-500' : 
                        article.lean === 'center' ? 'bg-zinc-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-zinc-500">{article.source}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-xs text-zinc-600">{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-medium text-zinc-200 group-hover:text-white transition-colors leading-snug line-clamp-2 mb-1.5">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-sm text-zinc-500 line-clamp-2">
                        {article.description}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </main>

        {/* Coverage sidebar */}
        <CoverageSidebar topic={topic} />
      </div>

      {/* Chat sidebar */}
      {chatOpen && (
        <aside className="fixed right-0 top-0 bottom-0 w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col z-40">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="font-semibold text-white">Challenge My Thinking</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Share your opinion. I&apos;ll help you see other perspectives.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 text-sm mt-12 px-4">
                <p className="font-medium mb-1">What do you think about {topic.title}?</p>
                <p className="text-xs">Share your take, and I&apos;ll help you explore different perspectives.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white ml-8"
                    : "bg-zinc-800 text-zinc-200 mr-4"
                }`}
              >
                {msg.role === "assistant" && (
                  <p className="text-xs font-medium text-indigo-400 mb-1">inFormed AI</p>
                )}
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-950">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Share your opinion..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
