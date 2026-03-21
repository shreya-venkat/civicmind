import Link from "next/link";
import { getTrendingTopics } from "../api/trending/actions";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const data = await getTrendingTopics();

  const allTopics = data.topics;
  
  const matchedTopic = allTopics.find(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.description.toLowerCase().includes(query.toLowerCase())
  );

  const relatedTopics = allTopics.filter(t => 
    t.id !== matchedTopic?.id &&
    (t.title.toLowerCase().includes(query.toLowerCase()) ||
     t.description.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 3);

  const leftArticles = matchedTopic?.articles.filter(a => a.lean === "left").slice(0, 2) || [];
  const centerArticles = matchedTopic?.articles.filter(a => a.lean === "center").slice(0, 2) || [];
  const rightArticles = matchedTopic?.articles.filter(a => a.lean === "right").slice(0, 2) || [];

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
            
            <form action="/search" method="GET" className="flex-1 max-w-md mx-4">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search..."
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">"{query}"</h1>
          <p className="text-zinc-500">Understanding this topic from every angle</p>
        </div>

        {matchedTopic ? (
          <>
            {/* Topic Card */}
            <Link 
              href={`/topic/${matchedTopic.id}`}
              className="block mb-10 group"
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
              <div className="flex items-center gap-4 text-sm">
                <span className="text-zinc-500">{matchedTopic.articleCount} articles</span>
                <span>·</span>
                <span>{matchedTopic.scope === "national" ? "🇺🇸 National" : "🌍 Global"}</span>
              </div>
            </Link>

            {/* Quick Perspectives */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Quick Look</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Left */}
                <div className="bg-zinc-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-xs font-semibold text-blue-400 uppercase">Left</span>
                  </div>
                  <div className="space-y-3">
                    {leftArticles.map((article, i) => (
                      <a 
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-zinc-300 hover:text-white transition-colors line-clamp-2"
                      >
                        {article.title}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Center */}
                <div className="bg-zinc-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-zinc-500 rounded-full" />
                    <span className="text-xs font-semibold text-zinc-400 uppercase">Center</span>
                  </div>
                  <div className="space-y-3">
                    {centerArticles.map((article, i) => (
                      <a 
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-zinc-300 hover:text-white transition-colors line-clamp-2"
                      >
                        {article.title}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Right */}
                <div className="bg-zinc-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs font-semibold text-red-400 uppercase">Right</span>
                  </div>
                  <div className="space-y-3">
                    {rightArticles.map((article, i) => (
                      <a 
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-zinc-300 hover:text-white transition-colors line-clamp-2"
                      >
                        {article.title}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <Link 
                href={`/topic/${matchedTopic.id}`}
                className="block mt-4 text-center py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Explore full topic →
              </Link>
            </div>

            {/* Related Topics */}
            {relatedTopics.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Related Topics</h3>
                <div className="grid grid-cols-3 gap-4">
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
          </>
        ) : (
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
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Browse topics
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
