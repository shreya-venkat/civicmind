"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

interface QuizQuestion {
  id: number;
  question: string;
  category: "economic" | "social" | "foreign" | "governance";
  options: {
    left: string;
    center: string;
    right: string;
  };
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "The federal government should play a major role in:",
    category: "economic",
    options: {
      left: "Providing healthcare, education, and safety nets for all citizens",
      center: "Ensuring basic services while encouraging private sector innovation",
      right: "Limited to protecting property rights and national defense only",
    },
  },
  {
    id: 2,
    question: "On immigration, the best approach is:",
    category: "governance",
    options: {
      left: "Pathways to citizenship and protections for undocumented immigrants",
      center: "Secure borders with balanced immigration reform",
      right: "Strict border enforcement and reduced legal immigration",
    },
  },
  {
    id: 3,
    question: "Climate change requires:",
    category: "economic",
    options: {
      left: "Aggressive government action and green energy investment",
      center: "Market-based solutions with some regulation",
      right: "Minimal government intervention, let markets adapt",
    },
  },
  {
    id: 4,
    question: "The best way to reduce inequality is through:",
    category: "economic",
    options: {
      left: "Progressive taxation and social welfare programs",
      center: "Education access and job training programs",
      right: "Economic growth and reduced regulation",
    },
  },
  {
    id: 5,
    question: "On foreign policy, the US should:",
    category: "foreign",
    options: {
      left: "Lead through diplomacy and international cooperation",
      center: "Maintain strong alliances while protecting interests",
      right: "Prioritize national interests over global commitments",
    },
  },
  {
    id: 6,
    question: "Healthcare should be:",
    category: "economic",
    options: {
      left: "A universal public right like education",
      center: "A mix of public and private options",
      right: "Primarily handled by the private market",
    },
  },
  {
    id: 7,
    question: "On social issues, government should:",
    category: "social",
    options: {
      left: "Actively promote equality and protect minority rights",
      center: "Balance individual freedoms with social stability",
      right: "Limit social engineering and protect traditional values",
    },
  },
  {
    id: 8,
    question: "The best economic policy during a recession is:",
    category: "economic",
    options: {
      left: "Increased government spending to stimulate demand",
      center: "Targeted support combined with monetary policy",
      right: "Tax cuts and reduced government intervention",
    },
  },
  {
    id: 9,
    question: "Trade policy should prioritize:",
    category: "economic",
    options: {
      left: "Fair trade with labor and environmental standards",
      center: "Open markets with balanced protections",
      right: "Protecting domestic jobs above all else",
    },
  },
  {
    id: 10,
    question: "The role of taxes is primarily to:",
    category: "governance",
    options: {
      left: "Redistribute wealth and fund social programs",
      center: "Fund essential government services efficiently",
      right: "Minimize burden to encourage economic growth",
    },
  },
];

function getResult(scores: Record<string, number>) {
  const left = scores.left || 0;
  const center = scores.center || 0;
  const right = scores.right || 0;
  const total = left + center + right;

  if (total === 0) return null;

  const leftPct = (left / total) * 100;
  const rightPct = (right / total) * 100;

  if (leftPct > 60) return { lean: "left", label: "Left", description: "You tend to favor government intervention to address social and economic inequality. You likely support policies like universal healthcare, progressive taxation, and international cooperation." };
  if (rightPct > 60) return { lean: "right", label: "Right", description: "You tend to favor limited government and individual initiative. You likely support free market policies, traditional values, and a strong national defense." };
  if (leftPct > 40) return { lean: "center-left", label: "Center-Left", description: "You lean progressive on many issues, valuing social justice and government support for those in need, while remaining open to pragmatic solutions." };
  if (rightPct > 40) return { lean: "center-right", label: "Center-Right", description: "You lean conservative on many issues, favoring market solutions and traditional approaches, while remaining open to reasonable compromises." };
  return { lean: "center", label: "Center", description: "You take a balanced approach, weighing multiple perspectives. You might agree with different sides on different issues, which is actually quite common." };
}

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
    }
  }, [current]);

  const handleAnswer = (option: string) => {
    setSelected(option);
    setScores((prev) => ({ ...prev, [option]: (prev[option] || 0) + 1 }));

    setTimeout(() => {
      if (current < QUESTIONS.length - 1) {
        setCurrent((prev) => prev + 1);
        setSelected(null);
      }
    }, 400);
  };

  const restart = () => {
    setCurrent(0);
    setScores({});
    setSelected(null);
  };

  const result = getResult(scores);

  const biasAwareness = result 
    ? `Your strongest opinions are in ${
        result.lean === "left" || result.lean === "center-left" ? "left-leaning" :
        result.lean === "right" || result.lean === "center-right" ? "right-leaning" : "center"
      } areas. This might mean you're more susceptible to bias on topics that align with your priors — which is exactly why inFormed shows you all sides.`
    : "";

  if (result) {
    const leanColors: Record<string, { bg: string; border: string; text: string; bar: string }> = {
      left: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", bar: "bg-blue-500" },
      "center-left": { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", bar: "bg-blue-400" },
      center: { bg: "bg-zinc-500/10", border: "border-zinc-500/30", text: "text-zinc-400", bar: "bg-zinc-500" },
      "center-right": { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", bar: "bg-red-400" },
      right: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", bar: "bg-red-500" },
    };
    const colors = leanColors[result.lean];

    return (
      <div className="min-h-screen bg-zinc-950">
        <nav className="border-b border-zinc-800 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-xl shadow-lg" />
                <span className="text-lg font-semibold tracking-tight">inFormed</span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-6 py-12">
          <div ref={cardRef} className={`${colors.bg} border ${colors.border} rounded-3xl p-10 text-center mb-8`}>
            <div className={`w-20 h-20 rounded-full bg-zinc-900 border-4 ${result.lean === "left" || result.lean.includes("left") ? "border-blue-500" : result.lean === "right" || result.lean.includes("right") ? "border-red-500" : "border-zinc-500"} flex items-center justify-center mx-auto mb-6`}>
              <span className="text-4xl font-bold text-white">{result.lean === "left" ? "L" : result.lean === "right" ? "R" : result.lean.includes("left") ? "L+" : result.lean.includes("right") ? "R+" : "C"}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Your Political Lean: {result.label}</h1>
            <p className="text-zinc-400 max-w-lg mx-auto leading-relaxed">{result.description}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Bias Awareness Check</h2>
            <p className="text-zinc-400 leading-relaxed">{biasAwareness}</p>
            <p className="text-zinc-500 text-sm mt-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <strong className="text-amber-400">Why this matters:</strong> We all have blind spots. Knowing your lean helps you deliberately seek out perspectives you might naturally avoid.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-2">Suggested Topics to Explore</h2>
            <p className="text-zinc-500 text-sm mb-5">Based on your results, here are perspectives you might not be seeing enough:</p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { lean: "left" as const, title: "Universal Healthcare", topic: "healthcare" },
                { lean: "center" as const, title: "Border Policy", topic: "immigration" },
                { lean: "right" as const, title: "Tax Reform", topic: "taxes" },
              ].map((t, i) => (
                <Link
                  key={i}
                  href={`/topic/${t.topic}`}
                  className={`p-5 rounded-xl border transition-all hover:-translate-y-1 ${
                    t.lean === "left" ? "bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50" : t.lean === "right" ? "bg-red-500/10 border-red-500/30 hover:border-red-500/50" : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <span className={`text-xs font-semibold ${
                    t.lean === "left" ? "text-blue-400" : t.lean === "right" ? "text-red-400" : "text-zinc-400"
                  }`}>
                    {t.lean.charAt(0).toUpperCase() + t.lean.slice(1)} Perspective
                  </span>
                  <p className="font-semibold text-white mt-2">{t.title}</p>
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
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between text-sm text-zinc-500">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-md shadow-sm" />
                <span>See every side.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  const question = QUESTIONS[current];
  const progress = ((current + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-xl shadow-lg" />
              <span className="text-lg font-semibold tracking-tight">inFormed</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div ref={cardRef} className="mb-8">
          <div className="flex justify-between text-sm text-zinc-500 mb-2">
            <span>Question {current + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {question.category}
          </span>
          <h2 className="text-xl font-semibold text-white mt-2 mb-8 leading-snug">
            {question.question}
          </h2>

          <div className="space-y-3">
            {(["left", "center", "right"] as const).map((option) => {
              const isSelected = selected === option;
              const colors = {
                left: "border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/10",
                center: "border-zinc-600 hover:border-zinc-500 hover:bg-zinc-800",
                right: "border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10",
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
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                    isSelected ? colors[option] : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${labelColors[option]}`}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                    <span className="text-zinc-300 leading-relaxed">{question.options[option]}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-zinc-600 mt-8 text-center">
            We don&apos;t store your answers. This quiz is for self-reflection, not data collection.
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-8 text-sm text-zinc-500">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> Left
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-zinc-500" /> Center
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" /> Right
          </span>
        </div>
      </main>

      <footer className="border-t border-zinc-800 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-zinc-500">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-md shadow-sm" />
              <span>See every side.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
