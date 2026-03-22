import Link from "next/link";
import { TRENDING_QUESTIONS } from "@/lib/trending-questions";

export default function TrendingPage() {
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
              <span className="text-lg font-semibold tracking-tight">inFormed</span>
            </a>
            
            <Link 
              href="/"
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Back
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
            <h1 className="text-3xl font-bold tracking-tight">Trending Questions</h1>
          </div>
          <p className="text-zinc-500">What people are searching to understand right now</p>
        </div>

        <div className="space-y-1">
          {TRENDING_QUESTIONS.map((item, i) => (
            <Link
              key={i}
              href={`/topic/${item.topic}`}
              className="group flex items-center gap-4 py-4 border-b border-zinc-800/50 hover:border-zinc-700 transition-colors"
            >
              <span className="text-sm text-zinc-600 w-6">{i + 1}</span>
              
              <div className="flex-1">
                <p className="text-white group-hover:text-indigo-300 transition-colors font-medium">
                  {item.question}
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    item.trend === "rising" ? "bg-green-500" : 
                    item.trend === "falling" ? "bg-red-500" : "bg-zinc-600"
                  }`} />
                  <span className="text-zinc-500">
                    {item.trend === "rising" ? "↑" : item.trend === "falling" ? "↓" : "→"}
                  </span>
                </div>
                <span className="text-zinc-600">{item.searches} searches</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-500 text-center">
            Questions based on Google search trends. Updated weekly.
          </p>
        </div>
      </main>
    </div>
  );
}
