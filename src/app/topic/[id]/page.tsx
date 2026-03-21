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
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type Tab = "overview" | "perspectives" | "articles";

// ── Mock content generator (will be replaced by AI) ────────
function getMockOverview(title: string): string {
  const overviews: Record<string, string> = {
    "Iran": "The United States and Iran are engaged in an escalating military conflict following months of rising tensions over Iran's nuclear program and regional influence. The situation involves complex geopolitical dynamics including oil supply concerns, regional alliances, and questions about diplomatic vs. military approaches.",
    "Trump Administration": "The current administration continues to drive significant policy changes across immigration, trade, government spending, and foreign affairs. These actions have generated intense debate about executive authority, government efficiency, and the direction of domestic and foreign policy.",
    "Israel-Palestine Conflict": "The ongoing conflict between Israel and Palestinian groups continues with significant humanitarian, diplomatic, and security implications. International actors are divided on approaches to resolution, with debates centering on sovereignty, security, human rights, and historical claims.",
    "Immigration & Border": "Immigration policy remains one of the most divisive issues in American politics, touching on border security, deportation, asylum processes, and the economic and cultural impacts of immigration. Recent policy changes have intensified the debate.",
    "Congress & Legislation": "Congress is navigating a complex legislative agenda with competing priorities around government funding, policy reforms, and oversight responsibilities. Bipartisan cooperation and partisan gridlock continue to shape what moves forward.",
    "Policing & Criminal Justice": "Criminal justice reform debates span policing practices, incarceration rates, sentencing guidelines, and rehabilitation programs. The US has the highest incarceration rate globally, and questions about public safety vs. reform approaches remain central.",
  };
  return overviews[title] || `${title} is a major topic generating significant coverage across the political spectrum. Multiple perspectives exist on the key issues, policy implications, and potential paths forward. Explore the perspectives below to understand what different sides are arguing.`;
}

function getMockPerspectives(title: string): { left: string; center: string; right: string } {
  const perspectives: Record<string, { left: string; center: string; right: string }> = {
    "Iran": {
      left: "Military action was premature and risks a prolonged, costly conflict. Diplomatic channels were not exhausted, and the human cost — both for Iranians and American service members — must be the primary consideration. The focus should shift to de-escalation and international coalition-building.",
      center: "Iran's nuclear ambitions posed a genuine security threat, but questions remain about whether military force was the most effective response. The situation demands clear strategic objectives, transparent communication with the public, and an exit strategy. Both diplomatic and military tools have roles to play.",
      right: "Iran has been the world's leading state sponsor of terrorism for decades. After years of failed diplomacy and the collapse of the nuclear deal, decisive action was necessary to prevent a nuclear-armed Iran. American strength and resolve are essential to protecting national security and our allies in the region.",
    },
    "Trump Administration": {
      left: "The administration's policies are dismantling critical institutions, rolling back environmental protections, and concentrating executive power in ways that undermine democratic norms. The impacts fall disproportionately on vulnerable communities.",
      center: "The administration is pursuing an aggressive agenda that has achieved some policy goals while generating significant controversy. Evaluating its impact requires separating policy substance from political rhetoric and assessing long-term consequences.",
      right: "The administration is delivering on promises to reduce government overreach, secure borders, and restore American economic competitiveness. Bold action was needed after years of bureaucratic inertia, and results speak for themselves.",
    },
    "Policing & Criminal Justice": {
      left: "The US incarcerates more people than any other country, disproportionately people of color. We need to address root causes of crime through investment in communities, mental health services, and education — not just more policing. Private prisons create perverse profit incentives.",
      center: "Effective criminal justice policy requires balancing public safety with fairness and rehabilitation. Data-driven approaches to policing, evidence-based sentencing reform, and investment in reentry programs can reduce both crime and unnecessary incarceration.",
      right: "Public safety must be the top priority. Soft-on-crime policies have led to rising crime rates in many cities. Law enforcement officers deserve support, not defunding. Accountability for criminal behavior — through consistent enforcement and appropriate sentencing — is what keeps communities safe.",
    },
  };
  return perspectives[title] || {
    left: `Progressive voices argue for systemic reforms and greater government intervention to address the root causes of issues related to ${title}. They emphasize equity, social justice, and the need to protect vulnerable populations.`,
    center: `Moderate analysis suggests a balanced approach to ${title} that weighs competing interests and relies on evidence-based policy. Pragmatic solutions that draw from both sides of the aisle are most likely to achieve sustainable results.`,
    right: `Conservative perspectives on ${title} emphasize individual liberty, limited government, free market solutions, and traditional values. They argue that overregulation and government overreach often create more problems than they solve.`,
  };
}

function getMockFacts(title: string): string[] {
  const facts: Record<string, string[]> = {
    "Iran": [
      "Iran's population is approximately 88 million people",
      "Iran has the 4th largest proven oil reserves globally",
      "The US withdrew from the JCPOA (Iran nuclear deal) in 2018",
      "Iran's nuclear enrichment has increased significantly since 2019",
      "The Strait of Hormuz handles roughly 20% of global oil transit",
    ],
    "Policing & Criminal Justice": [
      "The US has ~2 million people incarcerated — the highest rate globally",
      "Black Americans are incarcerated at roughly 5x the rate of white Americans",
      "The US spends approximately $80 billion annually on incarceration",
      "Recidivism rates hover around 44% within the first year of release",
      "Private prisons hold approximately 8% of the total prison population",
      "Violent crime rates have generally declined since the 1990s",
    ],
    "Immigration & Border": [
      "Approximately 11 million undocumented immigrants live in the US",
      "Immigration courts have a backlog of over 3 million cases",
      "Immigrants make up about 14% of the US population",
      "Border apprehensions have fluctuated significantly over the past decade",
      "The US admits roughly 1 million legal permanent residents per year",
    ],
    "Trump Administration": [
      "Executive orders issued in the first 100 days exceeded recent predecessors",
      "The DOGE initiative targets federal spending reduction",
      "Multiple policies face ongoing legal challenges in federal courts",
      "Trade tariffs have been expanded to additional countries and sectors",
    ],
  };
  return facts[title] || [
    "This topic is generating significant media coverage across the political spectrum",
    "Multiple policy proposals are being debated at federal and state levels",
    "Public opinion polls show the country is divided on this issue",
  ];
}

// ── Component ──────────────────────────────────────────────
export default function TopicPage() {
  const params = useParams();
  const [topic, setTopic] = useState<TrendingTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
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

  const handleSend = () => {
    if (!input.trim() || !topic) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Mock AI responses — will be replaced with real AI
    setTimeout(() => {
      const responses = [
        `That's an interesting perspective on ${topic.title}. Let me push back a bit — have you considered the strongest argument from the other side? For instance, someone who disagrees might say the real issue isn't what you've described, but rather the underlying structural factors that created this situation.`,
        `I can see where you're coming from. But here's what I'd challenge you on: look at how the ${topic.leftCount} left-leaning sources frame this vs. the ${topic.rightCount} right-leaning ones. They're often looking at the same facts but emphasizing completely different things. What facts might be missing from your current view?`,
        `Good point. But let me play devil's advocate — what if the opposite were true? Can you articulate the best version of the argument you disagree with? Understanding it doesn't mean agreeing with it, but it does make your own position stronger.`,
        `That's a common take, and there's merit to it. But consider this: both sides of the debate have valid concerns here. The left worries about fairness and systemic impact. The right worries about unintended consequences and individual rights. Where do you think the real tension lies?`,
        `Interesting. Let me ask you something harder — what evidence would actually change your mind on this? If you can't identify anything, that might tell you something about how you're approaching the topic.`,
      ];
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responses[Math.floor(Math.random() * responses.length)] },
      ]);
    }, 1000);
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

  const overview = getMockOverview(topic.title);
  const perspectives = getMockPerspectives(topic.title);
  const facts = getMockFacts(topic.title);
  const articlesByLean = {
    left: topic.articles.filter((a) => a.lean === "left"),
    center: topic.articles.filter((a) => a.lean === "center"),
    right: topic.articles.filter((a) => a.lean === "right"),
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 via-gray-500 to-red-500 rounded-lg" />
              <span className="text-lg font-bold text-gray-900">Perspectives</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 text-sm">{topic.title}</span>
          </div>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              chatOpen
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {chatOpen ? "Close Chat" : "Challenge My View"}
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${chatOpen ? "mr-[400px]" : ""}`}>
          {/* Topic header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {topic.scope === "national" ? "US National" : "Global"}
                </span>
                <span className="text-xs text-gray-400">
                  {topic.articleCount} articles from {topic.articles.length > 0 ? new Set(topic.articles.map(a => a.source)).size : 0} sources
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{topic.title}</h1>

              {/* Coverage bar */}
              <div className="max-w-sm">
                <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100 mb-2">
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
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Left ({topic.leftCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400" /> Center ({topic.centerCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Right ({topic.rightCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex gap-0 border-b-0">
                {([
                  { key: "overview", label: "Overview" },
                  { key: "perspectives", label: "All Perspectives" },
                  { key: "articles", label: "Source Articles" },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                      tab === key
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* ── Overview Tab ── */}
            {tab === "overview" && (
              <div className="space-y-8">
                {/* Neutral summary */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">What&apos;s Happening</h2>
                  <p className="text-gray-700 leading-relaxed">{overview}</p>
                  <p className="text-xs text-gray-400 mt-2 italic">
                    This summary aims to be neutral and fact-based. AI-generated content will replace this in a future update.
                  </p>
                </div>

                {/* Key facts */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Facts</h2>
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <ul className="space-y-3">
                      {facts.map((fact, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Quick perspectives preview */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">The Debate at a Glance</h2>
                    <button
                      onClick={() => setTab("perspectives")}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      See full perspectives →
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {([
                      { lean: "left" as const, color: "blue", label: "Left View" },
                      { lean: "center" as const, color: "gray", label: "Center View" },
                      { lean: "right" as const, color: "red", label: "Right View" },
                    ]).map(({ lean, color, label }) => (
                      <div key={lean} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2.5 h-2.5 rounded-full bg-${color === "gray" ? "gray-400" : `${color}-500`}`} />
                          <span className="text-sm font-semibold text-gray-900">{label}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {perspectives[lean]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Perspectives Tab ── */}
            {tab === "perspectives" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  These represent the main arguments from each part of the political spectrum.
                  Understanding all sides makes your own position stronger.
                </p>

                <div className="grid grid-cols-3 gap-4 items-start">
                  {([
                    { lean: "left" as const, label: "Left / Progressive", border: "border-blue-200", bg: "bg-blue-50", dot: "bg-blue-500", header: "bg-blue-600" },
                    { lean: "center" as const, label: "Center / Moderate", border: "border-gray-200", bg: "bg-gray-50", dot: "bg-gray-400", header: "bg-gray-600" },
                    { lean: "right" as const, label: "Right / Conservative", border: "border-red-200", bg: "bg-red-50", dot: "bg-red-500", header: "bg-red-600" },
                  ]).map(({ lean, label, border, bg, dot, header }) => (
                    <div key={lean} className={`${bg} border ${border} rounded-xl overflow-hidden`}>
                      <div className={`${header} text-white px-4 py-2.5 text-sm font-semibold`}>
                        {label}
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                          {perspectives[lean]}
                        </p>

                        {articlesByLean[lean].length > 0 && (
                          <div>
                            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                              Supporting Articles ({articlesByLean[lean].length})
                            </p>
                            <div className="space-y-1">
                              {articlesByLean[lean].slice(0, 5).map((article, i) => (
                                <a
                                  key={i}
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-gray-600 hover:text-gray-900 transition line-clamp-1"
                                >
                                  <span className="text-gray-300 mr-1">→</span>
                                  {article.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <strong>Note:</strong> These perspective summaries are placeholder content.
                  AI-generated summaries from the actual articles will replace them in a future update.
                </div>
              </div>
            )}

            {/* ── Articles Tab ── */}
            {tab === "articles" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Real articles from major outlets, grouped by editorial lean. Sorted by relevance.
                </p>

                <div className="grid grid-cols-3 gap-4 items-start">
                  {(["left", "center", "right"] as const).map((lean) => {
                    const config = {
                      left: { bg: "bg-blue-50", border: "border-blue-200", header: "bg-blue-600", label: "Left-Leaning", tag: "bg-blue-100 text-blue-700" },
                      center: { bg: "bg-gray-50", border: "border-gray-200", header: "bg-gray-600", label: "Center", tag: "bg-gray-100 text-gray-700" },
                      right: { bg: "bg-red-50", border: "border-red-200", header: "bg-red-600", label: "Right-Leaning", tag: "bg-red-100 text-red-700" },
                    }[lean];
                    const articles = [...articlesByLean[lean]].sort((a, b) => {
                      const aHasDesc = a.description && a.description.length > 20 ? 1 : 0;
                      const bHasDesc = b.description && b.description.length > 20 ? 1 : 0;
                      if (bHasDesc !== aHasDesc) return bHasDesc - aHasDesc;
                      return b.date.localeCompare(a.date);
                    });

                    return (
                      <div key={lean} className={`${config.bg} border ${config.border} rounded-xl overflow-hidden`}>
                        <div className={`${config.header} text-white px-4 py-2.5 text-sm font-semibold flex justify-between`}>
                          <span>{config.label}</span>
                          <span className="opacity-75">{articles.length}</span>
                        </div>
                        <div className="p-2.5 space-y-2.5 max-h-[75vh] overflow-y-auto">
                          {articles.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">
                              No articles from {lean} sources
                            </p>
                          ) : (
                            articles.map((article, i) => (
                              <a
                                key={i}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-white rounded-lg overflow-hidden hover:shadow-md transition border border-transparent hover:border-gray-200"
                              >
                                {article.image && (
                                  <img
                                    src={article.image}
                                    alt=""
                                    className="w-full h-32 object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                )}
                                <div className="p-3">
                                  <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {article.title}
                                  </p>
                                  {article.description && (
                                    <p className="text-xs text-gray-500 mb-2 line-clamp-3 leading-relaxed">
                                      {article.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.tag}`}>
                                      {article.source}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(article.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </a>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── Chat sidebar ── */}
        {chatOpen && (
          <aside className="w-[400px] border-l border-gray-200 bg-white flex flex-col fixed right-0 top-[49px] bottom-0 z-20">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Challenge My Thinking</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Share your opinion on {topic.title}. I&apos;ll help you see blind spots and think deeper.
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
                    Share your take, and I&apos;ll push back with counterarguments,
                    ask you to consider other angles, or help you explore the topic deeper.
                  </p>
                  <div className="mt-6 space-y-2">
                    <p className="text-xs font-medium text-gray-500">Try something like:</p>
                    {[
                      `I think the ${topic.title.toLowerCase()} situation is being handled wrong`,
                      "I don't know much about this — explain it to me",
                      "What's the strongest argument from each side?",
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(suggestion);
                        }}
                        className="block w-full text-left text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-2 rounded-lg transition"
                      >
                        &ldquo;{suggestion}&rdquo;
                      </button>
                    ))}
                  </div>
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
                    <p className="text-xs font-medium text-gray-500 mb-1">Perspectives AI</p>
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
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Responses are placeholder — real AI coming soon
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
