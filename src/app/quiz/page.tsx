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
    question: "Healthcare should be:",
    category: "economic",
    options: {
      left: "A universal right provided by the government",
      center: "A mix of public options and private insurance",
      right: "Completely privatized with minimal regulation",
    },
  },
  {
    id: 5,
    question: "Taxes should be:",
    category: "economic",
    options: {
      left: "Significantly higher on wealthy individuals and corporations",
      center: "Progressive but competitive to attract business",
      right: "As low as possible across all income levels",
    },
  },
  {
    id: 6,
    question: "On social issues like abortion and LGBTQ+ rights:",
    category: "social",
    options: {
      left: "Strong protections for individual rights and equality",
      center: "Balance between rights and religious freedom",
      right: "States should decide, traditional values matter most",
    },
  },
  {
    id: 7,
    question: "The US should handle foreign conflicts by:",
    category: "foreign",
    options: {
      left: "Avoiding military intervention, focusing on diplomacy",
      center: "Strategic involvement when vital interests are at stake",
      right: "Using American strength to protect allies and deter adversaries",
    },
  },
  {
    id: 8,
    question: "On gun control:",
    category: "governance",
    options: {
      left: "Stronger regulations, background checks, and bans on assault weapons",
      center: "Reasonable measures that balance safety and rights",
      right: "Protect the Second Amendment, minimal new restrictions",
    },
  },
  {
    id: 9,
    question: "The best way to address inequality is:",
    category: "economic",
    options: {
      left: "Government programs to redistribute wealth and opportunity",
      center: "Education and job training with some safety net",
      right: "Economic growth will help everyone; focus on opportunity, not outcomes",
    },
  },
  {
    id: 10,
    question: "Law enforcement should be:",
    category: "social",
    options: {
      left: "Reformed with increased accountability and community oversight",
      center: "Well-funded with improved training and accountability",
      right: "Fully supported with more resources and less interference",
    },
  },
];

function calculateResult(answers: (keyof QuizQuestion["options"])[]): {
  lean: "left" | "center-left" | "center" | "center-right" | "right";
  label: string;
  description: string;
  topics: { lean: "left" | "center" | "right"; title: string }[];
  biasAwareness: string;
} {
  const scores = { left: 0, center: 0, right: 0 };
  const categoryScores = { economic: { left: 0, right: 0 }, social: { left: 0, right: 0 }, foreign: { left: 0, right: 0 }, governance: { left: 0, right: 0 } };

  answers.forEach((answer, i) => {
    const q = QUESTIONS[i];
    if (answer === "left") {
      scores.left += 2;
      categoryScores[q.category].left += 1;
    } else if (answer === "right") {
      scores.right += 2;
      categoryScores[q.category].right += 1;
    } else {
      scores.center += 1;
    }
  });

  const total = scores.left + scores.center + scores.right;
  const leftPct = scores.left / total;
  const rightPct = scores.right / total;

  const strongestCategory = Object.entries(categoryScores)
    .map(([cat, s]) => ({ category: cat, diff: Math.abs(s.left - s.right) }))
    .sort((a, b) => b.diff - a.diff)[0];

  let lean: "left" | "center-left" | "center" | "center-right" | "right";
  let label: string;
  let description: string;

  if (leftPct > 0.6) {
    lean = "left";
    label = "Progressive";
    description = "You lean toward solutions that emphasize collective responsibility, government intervention, and social equality. You likely believe systemic problems require systemic solutions.";
  } else if (leftPct > 0.4) {
    lean = "center-left";
    label = "Center-Left";
    description = "You hold progressive values but appreciate practical considerations. You support reform but want it to work in the real world.";
  } else if (rightPct > 0.6) {
    lean = "right";
    label = "Conservative";
    description = "You lean toward traditional values, limited government, and individual responsibility. You likely believe the best solutions come from local communities and free markets.";
  } else if (rightPct > 0.4) {
    lean = "center-right";
    label = "Center-Right";
    description = "You lean conservative but value pragmatic solutions. You support some government action while emphasizing individual liberty and market freedom.";
  } else {
    lean = "center";
    label = "Centrist";
    description = "You take a balanced approach, weighing multiple perspectives. You might agree with different sides on different issues, which is actually quite common.";
  }

  const biasAwareness = `Your strongest opinions are in ${strongestCategory.category} policy. This might mean you're more susceptible to bias on topics that align with your priors — which is exactly why inFormed shows you all sides.`;

  const topics: { lean: "left" | "center" | "right"; title: string }[] = [];
  if (lean === "left" || lean === "center-left") {
    topics.push({ lean: "center", title: "Border Security" });
    topics.push({ lean: "right", title: "Immigration Debate" });
  } else if (lean === "right" || lean === "center-right") {
    topics.push({ lean: "left", title: "Healthcare Reform" });
    topics.push({ lean: "center", title: "Climate Policy" });
  } else {
    topics.push({ lean: "left", title: "Economic Inequality" });
    topics.push({ lean: "right", title: "Government Spending" });
  }

  return { lean, label, description, topics, biasAwareness };
}

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(keyof QuizQuestion["options"])[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateResult> | null>(null);
  const [selected, setSelected] = useState<keyof QuizQuestion["options"] | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [current]);

  const handleAnswer = (answer: keyof QuizQuestion["options"]) => {
    const newAnswers = [...answers, answer];
    setSelected(answer);

    if (current < QUESTIONS.length - 1) {
      setTimeout(() => {
        setAnswers(newAnswers);
        setCurrent(current + 1);
        setSelected(null);
      }, 300);
    } else {
      setTimeout(() => {
        setAnswers(newAnswers);
        setResult(calculateResult(newAnswers));
      }, 300);
    }
  };

  const restart = () => {
    gsap.to(cardRef.current, {
      y: -30,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setCurrent(0);
        setAnswers([]);
        setResult(null);
        setSelected(null);
        gsap.from(cardRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      },
    });
  };

  if (result) {
    const leanColors = {
      left: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", bar: "bg-blue-500" },
      "center-left": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", bar: "bg-blue-400" },
      center: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", bar: "bg-gray-500" },
      "center-right": { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", bar: "bg-red-400" },
      right: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", bar: "bg-red-500" },
    };
    const colors = leanColors[result.lean];

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-xl shadow-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">inFormed</span>
            </Link>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
          <div ref={cardRef} className={`${colors.bg} border ${colors.border} rounded-3xl p-10 text-center shadow-soft`}>
            <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center mx-auto mb-6 shadow-medium">
              <span className="text-4xl font-bold text-gray-900">{result.lean === "left" ? "L" : result.lean === "right" ? "R" : result.lean.includes("left") ? "L+" : result.lean.includes("right") ? "R+" : "C"}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Political Lean: {result.label}</h1>
            <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">{result.description}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bias Awareness Check</h2>
            <p className="text-gray-600 leading-relaxed">{result.biasAwareness}</p>
            <p className="text-gray-500 text-sm mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <strong className="text-amber-700">Why this matters:</strong> We all have blind spots. Knowing your lean helps you deliberately seek out perspectives you might naturally avoid.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Suggested Topics to Explore</h2>
            <p className="text-gray-500 text-sm mb-5">Based on your results, here are perspectives you might not be seeing enough:</p>
            <div className="grid md:grid-cols-3 gap-4">
              {result.topics.map((t, i) => (
                <Link
                  key={i}
                  href={`/topic/${t.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`p-5 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg ${
                    t.lean === "left" ? "bg-blue-50 border-blue-100 hover:border-blue-200" : t.lean === "right" ? "bg-red-50 border-red-100 hover:border-red-200" : "bg-gray-50 border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <span className={`text-xs font-semibold ${
                    t.lean === "left" ? "text-blue-600" : t.lean === "right" ? "text-red-600" : "text-gray-600"
                  }`}>
                    {t.lean.charAt(0).toUpperCase() + t.lean.slice(1)} Perspective
                  </span>
                  <p className="font-semibold text-gray-900 mt-2">{t.title}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={restart}
              className="flex-1 py-4 px-6 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Retake Quiz
            </button>
            <Link
              href="/"
              className="flex-1 py-4 px-6 bg-gray-900 text-white rounded-xl font-medium text-center hover:bg-gray-800 transition-all hover:shadow-lg"
            >
              Explore Topics
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const question = QUESTIONS[current];
  const progress = ((current + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-red-500 rounded-xl shadow-lg" />
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">inFormed</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div ref={cardRef} className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {current + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div ref={cardRef} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-soft">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {question.category}
          </span>
          <h2 className="text-xl font-semibold text-gray-900 mt-2 mb-8 leading-snug">
            {question.question}
          </h2>

          <div className="space-y-3">
            {(["left", "center", "right"] as const).map((option) => {
              const isSelected = selected === option;
              const colors = {
                left: "border-blue-200 hover:border-blue-400 hover:bg-blue-50/30",
                center: "border-gray-200 hover:border-gray-400 hover:bg-gray-50/50",
                right: "border-red-200 hover:border-red-400 hover:bg-red-50/30",
              };
              const labelColors = {
                left: "text-blue-600 bg-blue-100",
                center: "text-gray-600 bg-gray-100",
                right: "text-red-600 bg-red-100",
              };

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                    isSelected ? colors[option] + " bg-opacity-50" : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${labelColors[option]}`}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{question.options[option]}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 mt-8 text-center">
            We don&apos;t store your answers. This quiz is for self-reflection, not data collection.
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-8 text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> Left
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400" /> Center
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" /> Right
          </span>
        </div>
      </main>
    </div>
  );
}
