import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface RequestBody {
  type: "summarize" | "perspectives" | "chat";
  topic?: string;
  topicTitle?: string;
  articles?: Array<{
    title: string;
    description: string | null;
    source: string;
    lean: "left" | "center" | "right";
  }>;
  message?: string;
  chatHistory?: Array<{ role: string; content: string }>;
}

const PERSPECTIVES_PROMPT = `You are a neutral political analyst. For the given topic and news articles, provide the strongest, most charitable arguments from three perspectives.

Return your response as a JSON object with exactly these keys: "left", "center", "right"

Rules:
- Left: Explain the progressive/liberal argument, citing specific policy concerns and values (2-3 sentences max)
- Center: Present evidence-based analysis that acknowledges complexity and tradeoffs (2-3 sentences max)  
- Right: Explain the conservative/libertarian argument with its underlying values and logic (2-3 sentences max)
- Do NOT judge which side is correct
- Use neutral language, avoid "alarming", "shameful", "radical", "extreme"
- If insufficient info, say "Insufficient coverage to determine perspective"
- Output ONLY valid JSON, no markdown, no explanation`;

const CHAT_PROMPT = `You are a Socratic debate partner helping users identify blind spots in their thinking.

Rules:
- NEVER tell them they're wrong - ask questions instead
- Challenge them to articulate the strongest opposing argument
- Point out what facts they might be missing (without specifying which outlet)
- Ask what evidence would change their mind
- Be direct but respectful
- Keep responses to 2-3 sentences
- Do not be preachy`;

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "AI not configured. Add GEMINI_API_KEY to .env" },
      { status: 503 }
    );
  }

  try {
    const body: RequestBody = await request.json();
    const { type, topicTitle, articles, message, chatHistory } = body;

    if (type === "perspectives") {
      if (!articles || articles.length === 0) {
        return NextResponse.json({ error: "No articles provided" }, { status: 400 });
      }

      const articleContext = articles
        .map((a) => `[${a.lean.toUpperCase()}] ${a.source}: ${a.title}${a.description ? `. ${a.description}` : ""}`)
        .join("\n\n");

      const prompt = `${PERSPECTIVES_PROMPT}

Topic: ${topicTitle}

Articles:
${articleContext}`;

      const result = await callGemini(prompt);
      
      try {
        const parsed = JSON.parse(result);
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json({ 
          left: "Could not generate left perspective", 
          center: "Could not generate center perspective", 
          right: "Could not generate right perspective" 
        });
      }
    }

    if (type === "chat") {
      if (!message) {
        return NextResponse.json({ error: "No message provided" }, { status: 400 });
      }

      const historyText = (chatHistory || [])
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const prompt = `${CHAT_PROMPT}

Conversation history:
${historyText}

User: ${message}`;

      const result = await callGemini(prompt);
      return NextResponse.json({ response: result });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("[AI] Error:", error);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
