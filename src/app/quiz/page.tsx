"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

interface QuizQuestion {
  id: number;
  question: string;
  category: "economics" | "society" | "world" | "government";
  left: string;
  center: string;
  right: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "When you hear 'government spending,' what comes to mind?",
    category: "economics",
    left: "Investment in people and infrastructure",
    center: "A tool that should be used carefully and wisely",
    right: "Someone else's money being wasted",
  },
  {
    id: 2,
    question: "A company pollutes a river. Who should fix it?",
    category: "government",
    left: "The government should regulate and fine them",
    center: "Regulations with reasonable compliance timelines",
    right: "The free market will penalize them naturally",
  },
  {
    id: 3,
    question: "Your neighbor can't afford healthcare. How do you feel?",
    category: "society",
    left: "We should have a system that covers everyone",
    center: "We should help but through multiple pathways",
    right: "That's their problem, not mine",
  },
  {
    id: 4,
    question: "The US should primarily see itself as:",
    category: "world",
    left: "A partner among nations, building cooperation",
    center: "A global leader with both allies and adversaries",
    right: "An independent nation focused on its own interests",
  },
  {
    id: 5,
    question: "On climate change, the best approach is:",
    category: "economics",
    left: "Aggressive government action now, whatever the cost",
    center: "Balance environmental goals with economic reality",
    right: "Let innovation and markets solve it naturally",
  },
  {
    id: 6,
    question: "When you disagree with someone politically, you usually think:",
    category: "society",
    left: "They haven't been exposed to the right information",
    center: "We see different trade-offs in the same issues",
    right: "They haven't thought it through carefully enough",
  },
  {
    id: 7,
    question: "Immigration primarily:",
    category: "government",
    left: "Enriches our culture and economy",
    center: "Has both benefits and challenges to manage",
    right: "Poses risks to security and jobs",
  },
  {
    id: 8,
    question: "Taxes are essentially:",
    category: "economics",
    left: "How we pool resources for collective good",
    center: "Necessary but should be efficient and fair",
    right: "Theft from hard workers",
  },
  {
    id: 9,
    question: "Which statement feels most true to you?",
    category: "society",
    left: "Society has obligations to help the less fortunate",
    center: "People should have freedom to succeed or fail",
    right: "People should pull themselves up by their bootstraps",
  },
  {
    id: 10,
    question: "The best decisions are made:",
    category: "government",
    left: "By experts with data and evidence",
    center: "Through democratic debate and compromise",
    right: "At the local level, closest to the people",
  },
];

type Lean = "left" | "center-left" | "center" | "center-right" | "right";

function getResult(scores: Record<string, number>): { lean: Lean; label: string; description: string; color: string } {
  const left = scores.left || 0;
  const center = scores.center || 0;
  const right = scores.right || 0;
  const total = left + center + right;

  if (total === 0) return { lean: "center", label: "Center", description: "", color: "zinc" };

  const leftPct = (left / total) * 100;
  const rightPct = (right / total) * 100;

  if (leftPct >= 70) return { 
    lean: "left", 
    label: "Progressive", 
    description: "You tend to believe government and collective action can address social problems. You're likely supportive of regulation, social safety nets, and international cooperation.",
    color: "blue"
  };
  
  if (rightPct >= 70) return { 
    lean: "right", 
    label: "Conservative", 
    description: "You tend to believe in limited government and individual initiative. You're likely supportive of free markets, traditional values, and national sovereignty.",
    color: "red"
  };
  
  if (leftPct >= 55) return { 
    lean: "center-left", 
    label: "Center-Left", 
    description: "You lean progressive on many issues, valuing social justice while remaining open to pragmatic solutions.",
    color: "blue"
  };
  
  if (rightPct >= 55) return { 
    lean: "center-right", 
    label: "Center-Right", 
    description: "You lean conservative on many issues, favoring markets and tradition while remaining open to reasonable compromise.",
    color: "red"
  };
  
  return { 
    lean: "center", 
    label: "Moderate", 
    description: "You weigh multiple perspectives carefully. You likely agree with different sides on different issues, avoiding ideological extremes.",
    color: "zinc"
  };
}

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ left: 0, center: 0, right: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 });
    }
  }, [current]);

  const handleAnswer = (answer: "left" | "center" | "right") => {
    if (selected) return;
    
    setSelected(answer);
    setScores(prev => ({ ...prev, [answer]: prev[answer] + 1 }));

    setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        setCurrent(prev => prev + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 600);
  };

  const restart = () => {
    setCurrent(0);
    setScores({ left: 0, center: 0, right: 0 });
    setSelected(null);
    setShowResult(false);
  };

  const result = getResult(scores);
  const question = QUESTIONS[current];
  const progress = ((current + 1) / QUESTIONS.length) * 100;

  if (showResult) {
    const total = scores.left + scores.center + scores.right;
    const leftPct = Math.round((scores.left / total) * 100);
    const centerPct = Math.round((scores.center / total) * 100);
    const rightPct = Math.round((scores.right / total) * 100);

    return (
      <div className="min-h-screen bg-zinc-950">
        <nav className="border-b border-zinc-800 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-xl shadow-lg" />
              <span className="text-lg font-semibold tracking-tight">inFormed</span>
            </Link>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-6 py-12">
          <div ref={cardRef} className="text-center mb-10">
            <div className={`w-24 h-24 rounded-full bg-zinc-900 border-4 ${
              result.lean === "left" || result.lean === "center-left" ? "border-blue-500" :
              result.lean === "right" || result.lean === "center-right" ? "border-red-500" : "border-zinc-600"
            } flex items-center justify-center mx-auto mb-6`}>
              <span className="text-4xl font-bold text-white">{result.label.charAt(0)}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">You&apos;re {result.label}</h1>
            <p className="text-zinc-400 max-w-lg mx-auto leading-relaxed">{result.description}</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-medium text-zinc-500 mb-4 text-center">Your Political Spectrum</h2>
            <div className="flex h-16 rounded-xl overflow-hidden">
              <div className={`flex-1 ${result.lean === "left" || result.lean === "center-left" ? "bg-blue-500" : "bg-zinc-700"} flex flex-col items-center justify-center rounded-l-xl`}>
                <span className="text-xs font-medium text-white/80">L</span>
                <span className="text-lg font-bold text-white">{leftPct}%</span>
              </div>
              <div className={`w-20 ${result.lean === "center" ? "bg-zinc-500" : "bg-zinc-700"} flex flex-col items-center justify-center`}>
                <span className="text-xs font-medium text-white/80">C</span>
                <span className="text-lg font-bold text-white">{centerPct}%</span>
              </div>
              <div className={`flex-1 ${result.lean === "right" || result.lean === "center-right" ? "bg-red-500" : "bg-zinc-700"} flex flex-col items-center justify-center rounded-r-xl`}>
                <span className="text-xs font-medium text-white/80">R</span>
                <span className="text-lg font-bold text-white">{rightPct}%</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 text-sm">💡</span>
              </div>
              <div>
                <h3 className="font-medium text-amber-400 mb-1">Why knowing this matters</h3>
                <p className="text-amber-200/80 text-sm leading-relaxed">
                  We all have blind spots. Recognizing your lean helps you deliberately seek out perspectives you might naturally avoid. The goal isn&apos;t to change your views—it&apos;s to understand them better.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-2">Explore All Sides</h2>
            <p className="text-zinc-500 text-sm mb-4">Use inFormed to understand issues from multiple perspectives.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { lean: "left", title: "Progressive View", topic: "progressive-perspective" },
                { lean: "center", title: "Center View", topic: "moderate-perspective" },
                { lean: "right", title: "Conservative View", topic: "conservative-perspective" },
              ].map((t) => (
                <Link
                  key={t.lean}
                  href={`/topic/${t.topic}`}
                  className={`p-4 rounded-xl border text-center transition-all hover:-translate-y-1 ${
                    t.lean === "left" ? "bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50" :
                    t.lean === "right" ? "bg-red-500/10 border-red-500/30 hover:border-red-500/50" :
                    "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <span className={`text-xs font-medium ${
                    t.lean === "left" ? "text-blue-400" : t.lean === "right" ? "text-red-400" : "text-zinc-400"
                  }`}>{t.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={restart}
              className="flex-1 py-4 px-6 border border-zinc-700 rounded-xl font-medium text-zinc-300 hover:bg-zinc-900 hover:border-zinc-600 transition-all"
            >
              Retake Quiz
            </button>
            <Link
              href="/"
              className="flex-1 py-4 px-6 bg-indigo-600 text-white rounded-xl font-medium text-center hover:bg-indigo-700 transition-all"
            >
              Explore Topics
            </Link>
          </div>
        </main>

        <footer className="border-t border-zinc-800 mt-16">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-md shadow-sm" />
              <span className="text-zinc-500 text-sm">See every side.</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-xl shadow-lg" />
            <span className="text-lg font-semibold tracking-tight">inFormed</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div ref={cardRef} className="mb-8">
          <div className="flex justify-between text-sm text-zinc-500 mb-2">
            <span>Question {current + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {question.category}
          </span>
          <h2 className="text-xl font-semibold text-white mt-2 mb-8 leading-snug">
            {question.question}
          </h2>

          <div className="space-y-3">
            {(["left", "center", "right"] as const).map((option) => {
              const isSelected = selected === option;
              const bgColors = {
                left: "hover:bg-blue-500/10 hover:border-blue-500/40",
                center: "hover:bg-zinc-800 hover:border-zinc-600",
                right: "hover:bg-red-500/10 hover:border-red-500/40",
              };
              const labelColors = {
                left: "text-blue-400 bg-blue-500/20",
                center: "text-zinc-400 bg-zinc-700",
                right: "text-red-400 bg-red-500/20",
              };

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={selected !== null}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                    isSelected 
                      ? option === "left" ? "bg-blue-500/20 border-blue-500" 
                        : option === "right" ? "bg-red-500/20 border-red-500"
                        : "bg-zinc-800 border-zinc-500"
                      : `border-zinc-800 ${bgColors[option]}`
                  } ${selected && !isSelected ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${labelColors[option]}`}>
                      {option === "left" ? "Left" : option === "center" ? "Center" : "Right"}
                    </span>
                    <span className="text-zinc-300 leading-relaxed flex-1">{question[option]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-6 text-xs text-zinc-600">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Left
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-500" /> Center
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Right
          </span>
        </div>
      </main>

      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-md shadow-sm" />
            <span className="text-zinc-500 text-sm">See every side.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
