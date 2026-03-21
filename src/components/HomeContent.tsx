"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";

interface TrendingArticle {
  title: string;
  url: string;
  source: string;
  sourceDomain?: string;
  lean: "left" | "center" | "right";
  date: string;
  image: string | null;
  description: string | null;
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

interface TrendingData {
  topics: TrendingTopic[];
  updatedAt: string;
}

function BiasBar({ topic }: { topic: TrendingTopic }) {
  const leftPct = Math.round((topic.leftCount / topic.articleCount) * 100);
  const centerPct = Math.round((topic.centerCount / topic.articleCount) * 100);
  const rightPct = Math.round((topic.rightCount / topic.articleCount) * 100);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-blue-400 w-8">L {leftPct}%</span>
      <div className="flex gap-0.5 h-1 flex-1">
        {topic.leftCount > 0 && <div className="bg-blue-500" style={{ width: `${leftPct}%` }} />}
        {topic.centerCount > 0 && <div className="bg-zinc-600" style={{ width: `${centerPct}%` }} />}
        {topic.rightCount > 0 && <div className="bg-red-500" style={{ width: `${rightPct}%` }} />}
      </div>
      <span className="text-[10px] text-zinc-500 w-8 text-right">C {centerPct}%</span>
      <span className="text-[10px] text-red-400 w-8 text-right">R {rightPct}%</span>
    </div>
  );
}

function TopicTile({ topic }: { topic: TrendingTopic }) {
  const featuredArticle = topic.articles.find(a => a.image) || topic.articles[0];
  const mainArticle = topic.articles[0];
  
  return (
    <Link href={`/topic/${topic.id}`} className="group">
      <div className="overflow-hidden rounded-xl">
        {featuredArticle?.image && (
          <div className="aspect-video bg-zinc-900 overflow-hidden">
            <img 
              src={featuredArticle.image} 
              alt="" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>
      <div className="pt-3">
        <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2">
          {topic.title}
        </h3>
        <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
          {mainArticle?.title || topic.description}
        </p>
        <div className="mb-2">
          <BiasBar topic={topic} />
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{mainArticle?.source}</span>
          <span>·</span>
          <span>{topic.articleCount} articles</span>
          <span>·</span>
          <span>{topic.scope === "national" ? "🇺🇸" : "🌍"}</span>
          {topic.coverageGap && (
            <>
              <span>·</span>
              <span className="text-amber-500">⚠️ gap</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomeContent({ initialData }: { initialData?: TrendingData }) {
  const [topics, setTopics] = useState<TrendingTopic[]>(initialData?.topics || []);
  const [loading] = useState(!initialData?.topics);

  useEffect(() => {
    if (initialData?.topics && initialData.topics.length > 0) return;
    fetch("/api/trending")
      .then(res => res.json())
      .then(data => data.topics && setTopics(data.topics))
      .catch(console.error);
  }, [initialData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {loading ? (
        [...Array(6)].map((_, i) => (
          <div key={i}>
            <div className="aspect-video bg-zinc-900 animate-pulse rounded-xl mb-3" />
            <div className="h-5 bg-zinc-900 animate-pulse w-3/4 mb-2" />
            <div className="h-4 bg-zinc-900 animate-pulse w-full mb-2" />
            <div className="h-3 bg-zinc-900 animate-pulse w-1/2" />
          </div>
        ))
      ) : topics.length === 0 ? (
        <div className="col-span-full text-center py-20 text-zinc-500">
          No topics found.
        </div>
      ) : (
        topics.map(topic => (
          <TopicTile key={topic.id} topic={topic} />
        ))
      )}
    </div>
  );
}
