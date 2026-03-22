import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

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

const PERSPECTIVES_PROMPT = `You are a neutral political analyst. Based on the articles provided, summarize what each perspective is saying about this topic.

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

async function callGroq(prompt: string): Promise<string> {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function POST(request: Request) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "AI not configured. Add GROQ_API_KEY to .env" },
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

      const result = await callGroq(prompt);
      
      try {
        const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
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

      const result = await callGroq(prompt);
      return NextResponse.json({ response: result });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
