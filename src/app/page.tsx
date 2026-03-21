import { getTrendingTopics } from "./api/trending/actions";
import HomeContent from "@/components/HomeContent";

export default async function Home() {
  const data = await getTrendingTopics();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-gray-500 to-red-500 rounded-lg" />
              <span className="text-xl font-bold text-gray-900">CivicMind</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <button className="text-gray-600 hover:text-gray-900">Subscribe</button>
              <a href="/quiz" className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition">
                Take Quiz
              </a>
            </div>
          </div>
        </div>
      </nav>

      <HomeContent initialData={data} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 via-gray-500 to-red-500 rounded" />
              <span>CivicMind — See every side. Decide for yourself.</span>
            </div>
            <a href="/quiz" className="hover:text-gray-700">
              Take the Political Quiz →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
