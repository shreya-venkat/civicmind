"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

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
  lean?: string;
}

interface AIDeepDive {
  summary: string;
  takeaways: string[];
  facts: string[];
  narrative: string;
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
    <aside className="w-72 border-l border-zinc-800 bg-zinc-950/50 hidden lg:block">
      <div className="p-5 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Coverage</h3>
          <div className="space-y-3">
            <div className="p-3 border border-zinc-800 rounded-xl">
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
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                <p className="text-lg font-bold text-white">{topic.articleCount}</p>
                <p className="text-xs text-zinc-500">Articles</p>
              </div>
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                <p className="text-lg font-bold text-white">{new Set(topic.articles.map(a => a.source)).size}</p>
                <p className="text-xs text-zinc-500">Sources</p>
              </div>
            </div>
          </div>
        </div>

        {topic.coverageGap && (
          <div className="p-3 border border-amber-900 bg-amber-950/50 rounded-xl">
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

function FloatingChat({ 
  isOpen, 
  onToggle, 
  messages, 
  onSend, 
  input, 
  setInput,
  currentLean,
  topicTitle
}: {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSend: () => void;
  input: string;
  setInput: (v: string) => void;
  currentLean: Lean | null;
  topicTitle: string;
}) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = [
    "What facts am I missing?",
    "What's the strongest argument for the other side?",
    "How has this issue evolved?",
    "What would change my mind?",
  ];

  const leanLabel = currentLean ? { left: "Progressive", center: "Moderate", right: "Conservative" }[currentLean] : "All perspectives";

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-105"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-h-[500px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Ask inFormed</h3>
                <p className="text-xs text-zinc-500">
                  {currentLean ? `${leanLabel} view` : 'All perspectives'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 py-8">
                <p className="text-sm font-medium mb-1">Ask about {topicTitle}</p>
                <p className="text-xs">Get context from {leanLabel} sources</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm rounded-lg px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white ml-8"
                    : "bg-zinc-800 text-zinc-200 mr-4"
                }`}
              >
                {msg.role === "assistant" && msg.lean && (
                  <p className="text-xs text-indigo-400 mb-1">{msg.lean}</p>
                )}
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 0 && showSuggestions && (
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); setShowSuggestions(false); }}
                    className="text-xs px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
                placeholder="Ask a question..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={onSend}
                disabled={!input.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function TopicPage() {
  const params = useParams();
  const [topic, setTopic] = useState<TrendingTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLean, setSelectedLean] = useState<Lean | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareLeft, setCompareLeft] = useState<Lean>("left");
  const [compareRight, setCompareRight] = useState<Lean>("right");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIDeepDive | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [compareAnalysis, setCompareAnalysis] = useState<{ left: AIDeepDive | null; right: AIDeepDive | null }>({ left: null, right: null });

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

  const fetchAnalysis = useCallback(async (lean: Lean, articles: TrendingArticle[]) => {
    if (articles.length === 0) return null;

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "deepdive",
          topicTitle: topic?.title || "",
          articles: articles.slice(0, 10).map((a) => ({
            title: a.title,
            description: a.description,
            source: a.source,
            lean: a.lean,
            date: a.date,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.summary ? data : null;
      }
    } catch {
      // Silently fail
    } finally {
      setAiLoading(false);
    }
    return null;
  }, [topic?.title]);

  useEffect(() => {
    if (compareMode) {
      if (topic) {
        fetchAnalysis(compareLeft, topic.articles.filter(a => a.lean === compareLeft))
          .then(result => setCompareAnalysis(prev => ({ ...prev, left: result })));
        fetchAnalysis(compareRight, topic.articles.filter(a => a.lean === compareRight))
          .then(result => setCompareAnalysis(prev => ({ ...prev, right: result })));
      }
    } else if (selectedLean && topic) {
      const articles = topic.articles.filter((a) => a.lean === selectedLean);
      fetchAnalysis(selectedLean, articles).then(setAiAnalysis);
    } else {
      setAiAnalysis(null);
      setCompareAnalysis({ left: null, right: null });
    }
  }, [selectedLean, compareMode, compareLeft, compareRight, topic, fetchAnalysis]);

  const handleSend = async () => {
    if (!input.trim() || !topic) return;
    const leanLabel = selectedLean ? { left: "Progressive", center: "Moderate", right: "Conservative" }[selectedLean] : "All perspectives";
    
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const assistantMsg: ChatMessage = { role: "assistant", content: "Thinking...", lean: leanLabel };
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
          updated[updated.length - 1] = { role: "assistant", content: data.response || "I'm having trouble responding right now.", lean: leanLabel };
          return updated;
        });
        return;
      }
    } catch {
      // Fall through
    }

    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: "assistant", content: "I'm having trouble responding right now.", lean: leanLabel };
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

  const selectedArticles = selectedLean ? articlesByLean[selectedLean] : [];

  const leanConfig = {
    left: { label: 'Progressive', dot: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5', accent: '#3b82f6' },
    center: { label: 'Moderate', dot: 'bg-zinc-500', text: 'text-zinc-400', border: 'border-zinc-600', bg: 'bg-zinc-800/20', accent: '#71717a' },
    right: { label: 'Conservative', dot: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/5', accent: '#ef4444' },
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

          {/* Mode Toggle + Lean tabs */}
          <div className="border-b border-zinc-800">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center justify-between py-4">
                {/* Lean tabs */}
                <div className="flex gap-2">
                  {(["left", "center", "right"] as const).map((lean) => {
                    const config = leanConfig[lean];
                    const count = articlesByLean[lean].length;
                    const isSelected = selectedLean === lean;

                    return (
                      <button
                        key={lean}
                        onClick={() => { setSelectedLean(isSelected ? null : lean); setCompareMode(false); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all ${
                          isSelected && !compareMode
                            ? `${config.border} ${config.bg}`
                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                        <span className={`text-sm font-medium ${isSelected && !compareMode ? config.text : 'text-zinc-400'}`}>
                          {config.label}
                        </span>
                        <span className="text-xs text-zinc-600">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Compare toggle */}
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    compareMode
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                >
                  {compareMode ? 'Exit Compare' : 'Compare Views'}
                </button>
              </div>

              {/* Compare dropdowns */}
              {compareMode && (
                <div className="flex items-center gap-3 pb-4">
                  <select
                    value={compareLeft}
                    onChange={(e) => setCompareLeft(e.target.value as Lean)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="left">Progressive</option>
                    <option value="center">Moderate</option>
                    <option value="right">Conservative</option>
                  </select>
                  <span className="text-zinc-500 text-sm">vs</span>
                  <select
                    value={compareRight}
                    onChange={(e) => setCompareRight(e.target.value as Lean)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="left">Progressive</option>
                    <option value="center">Moderate</option>
                    <option value="right">Conservative</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Content area */}
          {compareMode ? (
            /* Compare Mode */
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Perspective */}
                <div className={`border border-zinc-800 rounded-2xl p-6 ${leanConfig[compareLeft].bg}`}>
                  <div className="flex items-center gap-2 mb-6">
                    <span className={`w-3 h-3 rounded-full ${leanConfig[compareLeft].dot}`} />
                    <h2 className={`text-lg font-semibold ${leanConfig[compareLeft].text}`}>
                      {leanConfig[compareLeft].label}
                    </h2>
                  </div>
                  {aiLoading ? (
                    <div className="flex items-center gap-3 py-8">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-zinc-500">Analyzing...</span>
                    </div>
                  ) : compareAnalysis.left ? (
                    <div className="space-y-6">
                      {compareAnalysis.left.narrative && (
                        <p className="text-zinc-200 italic">&ldquo;{compareAnalysis.left.narrative}&rdquo;</p>
                      )}
                      {compareAnalysis.left.summary && (
                        <div>
                          <h3 className="text-xs text-zinc-500 uppercase mb-2">Overview</h3>
                          <p className="text-zinc-200 text-sm">{compareAnalysis.left.summary}</p>
                        </div>
                      )}
                      {compareAnalysis.left.takeaways?.length > 0 && (
                        <div>
                          <h3 className="text-xs text-zinc-500 uppercase mb-2">Key Takeaways</h3>
                          <ul className="space-y-2">
                            {compareAnalysis.left.takeaways.map((t, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                <span className={`w-1.5 h-1.5 rounded-full ${leanConfig[compareLeft].dot} mt-1.5`} />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">No analysis available</p>
                  )}
                </div>

                {/* Right Perspective */}
                <div className={`border border-zinc-800 rounded-2xl p-6 ${leanConfig[compareRight].bg}`}>
                  <div className="flex items-center gap-2 mb-6">
                    <span className={`w-3 h-3 rounded-full ${leanConfig[compareRight].dot}`} />
                    <h2 className={`text-lg font-semibold ${leanConfig[compareRight].text}`}>
                      {leanConfig[compareRight].label}
                    </h2>
                  </div>
                  {aiLoading ? (
                    <div className="flex items-center gap-3 py-8">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-zinc-500">Analyzing...</span>
                    </div>
                  ) : compareAnalysis.right ? (
                    <div className="space-y-6">
                      {compareAnalysis.right.narrative && (
                        <p className="text-zinc-200 italic">&ldquo;{compareAnalysis.right.narrative}&rdquo;</p>
                      )}
                      {compareAnalysis.right.summary && (
                        <div>
                          <h3 className="text-xs text-zinc-500 uppercase mb-2">Overview</h3>
                          <p className="text-zinc-200 text-sm">{compareAnalysis.right.summary}</p>
                        </div>
                      )}
                      {compareAnalysis.right.takeaways?.length > 0 && (
                        <div>
                          <h3 className="text-xs text-zinc-500 uppercase mb-2">Key Takeaways</h3>
                          <ul className="space-y-2">
                            {compareAnalysis.right.takeaways.map((t, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                <span className={`w-1.5 h-1.5 rounded-full ${leanConfig[compareRight].dot} mt-1.5`} />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">No analysis available</p>
                  )}
                </div>
              </div>
            </div>
          ) : selectedLean ? (
            /* Single Lean View */
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* AI Analysis Card */}
              <div className={`border border-zinc-800 rounded-2xl p-8 mb-8 ${leanConfig[selectedLean].bg}`}>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`w-3 h-3 rounded-full ${leanConfig[selectedLean].dot}`} />
                  <h2 className={`text-xl font-semibold ${leanConfig[selectedLean].text}`}>
                    What {leanConfig[selectedLean].label}s Are Saying
                  </h2>
                </div>

                {aiLoading ? (
                  <div className="flex items-center gap-3 py-8">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-zinc-500">Analyzing articles...</span>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-8">
                    {aiAnalysis.narrative && (
                      <p className="text-zinc-200 leading-relaxed text-lg italic">
                        &ldquo;{aiAnalysis.narrative}&rdquo;
                      </p>
                    )}

                    {aiAnalysis.summary && (
                      <div>
                        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Overview</h3>
                        <p className="text-zinc-200 leading-relaxed">{aiAnalysis.summary}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                      {aiAnalysis.takeaways && aiAnalysis.takeaways.length > 0 && (
                        <div>
                          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Key Takeaways</h3>
                          <ul className="space-y-3">
                            {aiAnalysis.takeaways.map((takeaway, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <span className={`w-1.5 h-1.5 rounded-full ${leanConfig[selectedLean].dot} mt-2 flex-shrink-0`} />
                                <span className="text-zinc-300 text-sm leading-relaxed">{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiAnalysis.facts && aiAnalysis.facts.length > 0 && (
                        <div>
                          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Key Facts</h3>
                          <ul className="space-y-3">
                            {aiAnalysis.facts.map((fact, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <span className="text-zinc-500 mt-0.5">•</span>
                                <span className="text-zinc-300 text-sm leading-relaxed">{fact}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <p>Limited AI analysis available</p>
                  </div>
                )}
              </div>

              {/* Articles */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Sources ({selectedArticles.length})
                </h3>
                <div className="space-y-3">
                  {selectedArticles.map((article, i) => (
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
                          <span className={`w-1.5 h-1.5 rounded-full ${leanConfig[selectedLean].dot}`} />
                          <span className="text-xs text-zinc-500">{article.source}</span>
                          <span className="text-zinc-700">·</span>
                          <span className="text-xs text-zinc-600">{new Date(article.date).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-medium text-zinc-200 group-hover:text-white transition-colors leading-snug line-clamp-2 mb-1.5">
                          {article.title}
                        </h4>
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
            </div>
          ) : (
            /* No lean selected */
            <div className="max-w-4xl mx-auto px-6 py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Choose a perspective</h2>
              <p className="text-zinc-500 max-w-md mx-auto">
                Select Progressive, Moderate, or Conservative above to see what each side is saying about {topic.title}.
              </p>
            </div>
          )}
        </main>

        {/* Coverage sidebar */}
        <CoverageSidebar topic={topic} />
      </div>

      {/* Floating Chat */}
      <FloatingChat
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        messages={messages}
        onSend={handleSend}
        input={input}
        setInput={setInput}
        currentLean={selectedLean}
        topicTitle={topic.title}
      />
    </div>
  );
}
