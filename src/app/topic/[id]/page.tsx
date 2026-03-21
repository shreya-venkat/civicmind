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
type ViewTab = "coverage" | "articles";

const SOURCE_INFO: Record<string, { bias: number; factuality: number; ownership: string }> = {
  "cnn": { bias: -8, factuality: 65, ownership: "Warner Bros Discovery" },
  "nbc news": { bias: -7, factuality: 70, ownership: "Comcast" },
  "abc news": { bias: -6, factuality: 72, ownership: "Disney" },
  " CBS News": { bias: -5, factuality: 73, ownership: "Paramount" },
  "nytimes": { bias: -7, factuality: 68, ownership: "New York Times Company" },
  "washington post": { bias: -8, factuality: 69, ownership: "Amazon (Jeff Bezos)" },
  "the atlantic": { bias: -9, factuality: 74, ownership: "Atlantic Media" },
  "huffpost": { bias: -12, factuality: 58, ownership: "BuzzFeed" },
  "vox": { bias: -10, factuality: 66, ownership: "Vox Media" },
  "slate": { bias: -11, factuality: 62, ownership: "Graham Holdings" },
  "mother jones": { bias: -14, factuality: 64, ownership: "Foundation for National Progress" },
  "the nation": { bias: -15, factuality: 60, ownership: "The Nation Institute" },
  "reuters": { bias: 0, factuality: 85, ownership: "Thomson Reuters" },
  "ap news": { bias: 0, factuality: 88, ownership: "Associated Press" },
  "npr": { bias: -2, factuality: 82, ownership: "NPR (Nonprofit)" },
  "the hill": { bias: 1, factuality: 70, ownership: "Nexus Media" },
  "bloomberg": { bias: 2, factuality: 78, ownership: "Bloomberg L.P." },
  "axios": { bias: 1, factuality: 76, ownership: "Cox Enterprises" },
  "fox news": { bias: 12, factuality: 58, ownership: "Fox Corporation" },
  "daily wire": { bias: 14, factuality: 52, ownership: "The Daily Wire" },
  "breitbart": { bias: 16, factuality: 42, ownership: "Fox Corp (indirect)" },
  "the federalist": { bias: 15, factuality: 48, ownership: "Binding sites" },
  "national review": { bias: 13, factuality: 62, ownership: "National Review Institute" },
  "townhall": { bias: 14, factuality: 55, ownership: " Salem Media Group" },
};

function getSourceDetails(domain: string) {
  const info = SOURCE_INFO[domain.toLowerCase()] || SOURCE_INFO[domain.split('.')[0]] || { bias: 0, factuality: 70, ownership: "Unknown" };
  return info;
}

function CoverageSidebar({ topic }: { topic: TrendingTopic }) {
  const leftPct = Math.round((topic.leftCount / topic.articleCount) * 100);
  const centerPct = Math.round((topic.centerCount / topic.articleCount) * 100);
  const rightPct = Math.round((topic.rightCount / topic.articleCount) * 100);

  return (
    <aside className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Coverage Summary */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Coverage Details</h3>
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Articles</span>
                <span className="font-medium">{topic.articleCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sources</span>
                <span className="font-medium">{new Set(topic.articles.map(a => a.source)).size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Left Sources</span>
                <span className="font-medium text-blue-600">{topic.leftCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Center Sources</span>
                <span className="font-medium text-gray-600">{topic.centerCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Right Sources</span>
                <span className="font-medium text-red-600">{topic.rightCount}</span>
              </div>
            </div>
            
            {/* Coverage Bar */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Bias Distribution</p>
              <div className="flex h-8 rounded-lg overflow-hidden">
                {topic.leftCount > 0 && (
                  <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${leftPct}%` }}>
                    {leftPct > 10 && `${leftPct}%`}
                  </div>
                )}
                {topic.centerCount > 0 && (
                  <div className="bg-gray-400 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${centerPct}%` }}>
                    {centerPct > 10 && `${centerPct}%`}
                  </div>
                )}
                {topic.rightCount > 0 && (
                  <div className="bg-red-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${rightPct}%` }}>
                    {rightPct > 10 && `${rightPct}%`}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>← Left</span>
                <span>Right →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Score */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Coverage Balance</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Balance Score</span>
              <span className={`font-bold ${topic.coverageScore && topic.coverageScore > 0.7 ? 'text-green-600' : topic.coverageScore && topic.coverageScore > 0.4 ? 'text-amber-600' : 'text-red-600'}`}>
                {topic.coverageScore ? Math.round(topic.coverageScore * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${topic.coverageScore && topic.coverageScore > 0.7 ? 'bg-green-500' : topic.coverageScore && topic.coverageScore > 0.4 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${topic.coverageScore ? topic.coverageScore * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {topic.coverageGap 
                ? `Underrepresented: ${topic.coverageGap.charAt(0).toUpperCase() + topic.coverageGap.slice(1)}`
                : "All perspectives well represented"}
            </p>
          </div>
        </div>

        {/* Sources by Lean */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Top Sources</h3>
          <div className="space-y-2">
            {topic.articles.slice(0, 8).map((article, i) => {
              const details = getSourceDetails(article.sourceDomain || article.source);
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${article.lean === 'left' ? 'bg-blue-500' : article.lean === 'center' ? 'bg-gray-400' : 'bg-red-500'}`} />
                  <span className="flex-1 truncate text-gray-700">{article.source}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${details.factuality > 65 ? 'bg-green-100 text-green-700' : details.factuality > 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {details.factuality}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blind Spot Alert */}
        {topic.coverageGap && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-amber-500">⚠️</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Coverage Blind Spot</p>
                <p className="text-xs text-amber-700 mt-1">
                  {topic.coverageGap.charAt(0).toUpperCase() + topic.coverageGap.slice(1)}-lean sources are underrepresented. 
                  You may be missing important perspectives.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function TopicPage() {
  const params = useParams();
  const [topic, setTopic] = useState<TrendingTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLean, setSelectedLean] = useState<Lean>("left");
  const [viewTab, setViewTab] = useState<ViewTab>("coverage");
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

    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
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
      // Fall through to mock responses
    }

    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: "assistant", content: "I'm having trouble responding right now." };
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Topic not found</h1>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            Back to topics
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

  const leanConfig = {
    left: { label: "Left", bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200", light: "bg-blue-50" },
    center: { label: "Center", bg: "bg-gray-500", text: "text-gray-600", border: "border-gray-200", light: "bg-gray-50" },
    right: { label: "Right", bg: "bg-red-500", text: "text-red-600", border: "border-red-200", light: "bg-red-50" },
  };

  const currentArticles = articlesByLean[selectedLean];
  const leanInfo = leanConfig[selectedLean];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 via-gray-500 to-red-500 rounded-lg" />
                <span className="text-lg font-bold text-gray-900">CivicMind</span>
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600 text-sm">{topic.title}</span>
            </div>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                chatOpen
                  ? "bg-gray-200 text-gray-700"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {chatOpen ? "Close" : "Challenge My View"}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Topic header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {topic.scope === "national" ? "🇺🇸 US National" : "🌍 Global"}
                </span>
                <span className="text-xs text-gray-400">
                  {topic.articleCount} articles
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{topic.title}</h1>
              
              {/* Coverage bar */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 max-w-md">
                  <div className="flex h-3 rounded-full overflow-hidden">
                    {topic.leftCount > 0 && (
                      <div className="bg-blue-500" style={{ width: `${(topic.leftCount / topic.articleCount) * 100}%` }} />
                    )}
                    {topic.centerCount > 0 && (
                      <div className="bg-gray-400" style={{ width: `${(topic.centerCount / topic.articleCount) * 100}%` }} />
                    )}
                    {topic.rightCount > 0 && (
                      <div className="bg-red-500" style={{ width: `${(topic.rightCount / topic.articleCount) * 100}%` }} />
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Left {Math.round((topic.leftCount / topic.articleCount) * 100)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    Center {Math.round((topic.centerCount / topic.articleCount) * 100)}%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Right {Math.round((topic.rightCount / topic.articleCount) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lean selector tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex items-center gap-1">
                {(["left", "center", "right"] as const).map((lean) => (
                  <button
                    key={lean}
                    onClick={() => setSelectedLean(lean)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                      selectedLean === lean
                        ? lean === "left"
                          ? "border-blue-500 text-blue-600"
                          : lean === "center"
                          ? "border-gray-500 text-gray-600"
                          : "border-red-500 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      lean === "left" ? "bg-blue-500" : lean === "center" ? "bg-gray-400" : "bg-red-500"
                    }`} />
                    {leanConfig[lean].label}
                    <span className="ml-2 text-xs opacity-60">
                      ({articlesByLean[lean].length})
                    </span>
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setViewTab("coverage")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      viewTab === "coverage"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Coverage
                  </button>
                  <button
                    onClick={() => setViewTab("articles")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                      viewTab === "articles"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Articles
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-6 py-6">
            {viewTab === "coverage" ? (
              <div className="space-y-6">
                {/* Summary */}
                <div className={`${leanInfo.light} border ${leanInfo.border} rounded-xl p-6`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`w-3 h-3 rounded-full ${leanInfo.bg}`} />
                    <h2 className={`text-lg font-semibold ${leanInfo.text}`}>                    {leanInfo.label} Perspective</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {selectedLean === "left" 
                      ? "Progressive voices typically emphasize systemic approaches, social justice, and government intervention to address root causes. They often prioritize equity, environmental protection, and individual rights, arguing that collective action is necessary to solve major challenges."
                      : selectedLean === "center"
                      ? "Center perspectives tend to focus on practical, evidence-based approaches that weigh tradeoffs. They often seek bipartisan solutions and acknowledge complexity, emphasizing data and moderate reforms over ideological extremes."
                      : "Conservative perspectives often prioritize traditional values, individual responsibility, and limited government. They emphasize free markets, personal liberty, and maintaining social order, arguing that grassroots solutions and private initiative are more effective than top-down approaches."
                    }
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{articlesByLean[selectedLean].length} articles in this view</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">{Array.from(new Set(articlesByLean[selectedLean].map(a => a.source))).length} sources</span>
                  </div>
                </div>

                {/* Key arguments from this lean */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Common Arguments</h3>
                  <div className="space-y-3">
                    {selectedLean === "left" ? (
                      <>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                          <p className="text-sm text-gray-700">Government intervention is necessary to address systemic inequalities and market failures</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                          <p className="text-sm text-gray-700">Environmental protection requires strong regulations and investment in clean energy</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                          <p className="text-sm text-gray-700">Social safety nets and universal programs benefit society as a whole</p>
                        </div>
                      </>
                    ) : selectedLean === "center" ? (
                      <>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                          <p className="text-sm text-gray-700">Policy should be based on evidence and practical outcomes rather than ideology</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                          <p className="text-sm text-gray-700">Bipartisan compromise is often necessary for sustainable solutions</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                          <p className="text-sm text-gray-700">Economic and social tradeoffs must be carefully weighed</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                          <p className="text-sm text-gray-700">Individual liberty and personal responsibility are fundamental values</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                          <p className="text-sm text-gray-700">Free markets and competition drive innovation and prosperity</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                          <p className="text-sm text-gray-700">Traditional institutions and values provide social stability</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Articles from this lean */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Articles from {leanInfo.label}-Leaning Sources</h3>
                  <div className="space-y-3">
                    {currentArticles.slice(0, 5).map((article, i) => (
                      <a
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex gap-4">
                          {article.image && (
                            <img
                              src={article.image}
                              alt=""
                              className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-1 line-clamp-2">{article.title}</p>
                            {article.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mb-2">{article.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className={`${leanInfo.text} font-medium`}>{article.source}</span>
                              <span>•</span>
                              <span>{new Date(article.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">
                    {leanInfo.label} Articles ({currentArticles.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {currentArticles.map((article, i) => (
                    <a
                      key={i}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition group"
                    >
                      {article.image && (
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          <img
                            src={article.image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className={`absolute top-3 left-3 px-2 py-1 ${leanInfo.light} ${leanInfo.text} text-xs font-medium rounded`}>
                            {article.source}
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                          {article.title}
                        </h3>
                        {article.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {article.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{article.source}</span>
                          <span>{new Date(article.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                {currentArticles.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p>No articles from {leanInfo.label.toLowerCase()}-leaning sources</p>
                    {topic.coverageGap === selectedLean && (
                      <p className="text-sm mt-2 text-amber-600">This is a coverage blind spot</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Coverage sidebar */}
        <CoverageSidebar topic={topic} />
      </div>

      {/* Chat sidebar */}
      {chatOpen && (
        <aside className="w-[400px] border-l border-gray-200 bg-white flex flex-col fixed right-0 top-[57px] bottom-0 z-20">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Challenge My Thinking</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Share your opinion. I&apos;ll help you see other perspectives.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm mt-12 px-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-xl">
                  ?
                </div>
                <p className="font-medium text-gray-600 mb-1">What do you think about {topic.title}?</p>
                <p className="text-xs leading-relaxed">
                  Share your take, and I&apos;ll help you explore different perspectives.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gray-900 text-white ml-8"
                    : "bg-gray-100 text-gray-800 mr-4"
                }`}
              >
                {msg.role === "assistant" && (
                  <p className="text-xs font-medium text-gray-500 mb-1">CivicMind AI</p>
                )}
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Share your opinion..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40"
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
