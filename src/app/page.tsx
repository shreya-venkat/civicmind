import { getTrendingTopics } from "./api/trending/actions";
import HomeContent from "@/components/HomeContent";

export default async function Home() {
  const data = await getTrendingTopics();
  
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
              <span className="text-lg font-semibold tracking-tight">CivicMind</span>
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
            Understand politics. Form your own opinion.
          </h1>
          <p className="text-zinc-500 text-lg mb-8">
            Get context. See every angle. Ask anything.
          </p>
          
          {/* Search */}
          <form action="/search" method="GET" className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="What do you want to understand?"
                className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors text-center"
              />
              <button 
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Popular Topics */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Trending Topics</h2>
          </div>
          <HomeContent initialData={data} />
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
