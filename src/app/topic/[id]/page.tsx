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
    <aside className="w-72 border-l border-zinc-800 bg-zinc-950">
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

export default function TopicPage() {
  const params = useParams();
  const [topic, setTopic] = useState<TrendingTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLean, setSelectedLean] = useState<Lean>("left");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
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

  const currentArticles = articlesByLean[selectedLean];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-800 sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-7 h-7 bg-indigo-600 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <span className="text-lg font-semibold">CivicMind</span>
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
            <div className="max-w-3xl mx-auto px-6 py-8">
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

          {/* Lean selector */}
          <div className="border-b border-zinc-800">
            <div className="max-w-3xl mx-auto px-6">
              <div className="flex items-center gap-1">
                {(["left", "center", "right"] as const).map((lean) => {
                  const colors = {
                    left: { dot: "bg-blue-500", text: "text-blue-400", active: "border-blue-500" },
                    center: { dot: "bg-zinc-500", text: "text-zinc-400", active: "border-zinc-500" },
                    right: { dot: "bg-red-500", text: "text-red-400", active: "border-red-500" },
                  };
                  const c = colors[lean];
                  const isActive = selectedLean === lean;
                  
                  return (
                    <button
                      key={lean}
                      onClick={() => setSelectedLean(lean)}
                      className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                        isActive
                          ? `${c.active} ${c.text}`
                          : "border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${c.dot}`} />
                      {lean.charAt(0).toUpperCase() + lean.slice(1)}
                      <span className="ml-2 text-xs opacity-60">
                        ({articlesByLean[lean].length})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="space-y-3">
              {currentArticles.map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 p-4 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30 transition-colors"
                >
                  {article.image && (
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-200 group-hover:text-white transition-colors leading-snug line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-sm text-zinc-500 line-clamp-2 mb-2">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <span>{article.source}</span>
                      <span>·</span>
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </a>
              ))}
              {currentArticles.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                  No articles from {selectedLean}-leaning sources
                </div>
              )}
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
                  <p className="text-xs font-medium text-indigo-400 mb-1">CivicMind AI</p>
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
