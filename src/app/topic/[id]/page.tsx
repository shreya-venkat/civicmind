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

function extractThemes(articles: TrendingArticle[]): string[] {
  const themes: string[] = [];
  const titleText = articles.map(a => a.title.toLowerCase()).join(' ');
  
  const themeKeywords: [string, string[]][] = [
    ['Executive power', ['trump administration', 'executive', 'white house', 'president']],
    ['Border security', ['border', 'immigration', 'deportation', 'asylum']],
    ['Economic policy', ['economy', 'tariffs', 'jobs', 'inflation', 'tax']],
    ['Foreign relations', ['china', 'russia', 'ukraine', 'nato', 'iran', 'israel', 'trade']],
    ['Civil rights', ['rights', 'abortion', 'lgbtq', 'voting', 'civil liberties']],
    ['Healthcare', ['healthcare', 'medicare', 'medicaid', 'insurance']],
    ['Climate', ['climate', 'energy', 'environment', 'oil', 'green']],
    ['Social programs', ['social security', 'welfare', 'medicaid', 'housing']],
    ['Defense', ['military', 'defense', 'pentagon', 'veterans']],
    ['Education', ['education', 'school', 'student', 'college', 'university']],
  ];
  
  themeKeywords.forEach(([theme, keywords]) => {
    if (keywords.some(kw => titleText.includes(kw))) {
      themes.push(theme);
    }
  });
  
  return themes.slice(0, 4);
}

function generateSummary(articles: TrendingArticle[], lean: Lean): string {
  if (articles.length === 0) return 'No coverage from this perspective.';
  
  const labels = {
    left: 'progressive',
    center: 'moderate',
    right: 'conservative'
  };
  
  const count = articles.length;
  const sources = new Set(articles.map(a => a.source)).size;
  
  const recentCount = articles.filter(a => {
    const date = new Date(a.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date > weekAgo;
  }).length;
  
  const themes = extractThemes(articles);
  
  let intro = '';
  if (lean === 'left') {
    intro = `${labels[lean].charAt(0).toUpperCase() + labels[lean].slice(1)} analysts and outlets are highlighting `;
  } else if (lean === 'right') {
    intro = `${labels[lean].charAt(0).toUpperCase() + labels[lean].slice(1)} voices are emphasizing `;
  } else {
    intro = `Centrist observers are examining `;
  }
  
  const themeStr = themes.length > 0 
    ? `focusing on ${themes.slice(0, 2).join(' and ').toLowerCase()}` 
    : 'covering recent developments';
  
  return `${intro}${themeStr}. ${count} articles from ${sources} sources, with ${recentCount} published this week.`;
}

export default function TopicPage() {
  const params = useParams();
  const [topic, setTopic] = useState<TrendingTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLean, setSelectedLean] = useState<Lean | null>(null);
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

  const selectedArticles = selectedLean ? articlesByLean[selectedLean] : [];
  const selectedThemes = selectedLean ? extractThemes(articlesByLean[selectedLean]) : [];
  const selectedSummary = selectedLean ? generateSummary(articlesByLean[selectedLean], selectedLean) : '';

  const leanConfig = {
    left: { label: 'Progressive', dot: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
    center: { label: 'Moderate', dot: 'bg-zinc-500', text: 'text-zinc-400', border: 'border-zinc-600', bg: 'bg-zinc-800/20' },
    right: { label: 'Conservative', dot: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/5' },
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-800 sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
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

      {/* Topic header - always visible */}
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

      {/* Lean tabs */}
      <div className="border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-2 py-4">
            {(["left", "center", "right"] as const).map((lean) => {
              const config = leanConfig[lean];
              const count = articlesByLean[lean].length;
              const isSelected = selectedLean === lean;

              return (
                <button
                  key={lean}
                  onClick={() => setSelectedLean(isSelected ? null : lean)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? `${config.border} ${config.bg} ${config.dot.replace('bg-', 'ring-2 ring-')}`
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                  <span className={`text-sm font-medium ${isSelected ? config.text : 'text-zinc-400'}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-zinc-600">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content area */}
      {selectedLean ? (
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Quick Take */}
          <div className={`border border-zinc-800 rounded-2xl p-8 mb-8 ${leanConfig[selectedLean].bg}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className={`w-3 h-3 rounded-full ${leanConfig[selectedLean].dot}`} />
              <h2 className={`text-xl font-semibold ${leanConfig[selectedLean].text}`}>
                What {leanConfig[selectedLean].label}s Are Saying
              </h2>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Summary</h3>
              <p className="text-zinc-200 leading-relaxed">{selectedSummary}</p>
            </div>

            {selectedThemes.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Key Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedThemes.map((theme, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-full text-sm border ${leanConfig[selectedLean].border} ${leanConfig[selectedLean].text.replace('text-', 'text-opacity-80 bg-opacity-10 bg-')}`}
                      style={{ backgroundColor: selectedLean === 'left' ? 'rgba(59, 130, 246, 0.1)' : selectedLean === 'right' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(161, 161, 170, 0.1)' }}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Featured headline */}
            {selectedArticles.length > 0 && (
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Featured</p>
                <a
                  href={selectedArticles[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h4 className="text-lg font-medium text-zinc-200 group-hover:text-white transition-colors leading-snug mb-1">
                    {selectedArticles[0].title}
                  </h4>
                  <p className="text-sm text-zinc-500">{selectedArticles[0].source}</p>
                </a>
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
        /* No lean selected - show prompt */
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
