import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface RequestBody {
  type: "summarize" | "perspectives" | "chat" | "deepdive";
  topic?: string;
  topicTitle?: string;
  articles?: Array<{
    title: string;
    description: string | null;
    source: string;
    lean: "left" | "center" | "right";
    date?: string;
  }>;
  message?: string;
  chatHistory?: Array<{ role: string; content: string }>;
}

const DEEPDIVE_PROMPT = `You are a political analyst summarizing news coverage. Based on the articles provided, give a comprehensive analysis of what this perspective is saying.

Return your response as a JSON object with these keys:
- "summary": A 2-3 sentence overview of what this side is focused on
- "takeaways": Array of 3-4 key takeaways (each 1 sentence)
- "facts": Array of 3-4 specific facts or data points mentioned in the articles (each 1 sentence)
- "narrative": The overall narrative/frame this side is using (1 sentence)

Rules:
- Focus only on this lean's perspective
- Be specific, cite actual claims from the articles
- If articles lack detail, say "Limited coverage"
- Output ONLY valid JSON, no markdown`;

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
        max_tokens: 800
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

    if (type === "deepdive") {
      if (!articles || articles.length === 0) {
        return NextResponse.json({ error: "No articles provided" }, { status: 400 });
      }

      const articleContext = articles
        .map((a) => `[${a.lean.toUpperCase()}] ${a.source}: ${a.title}${a.description ? `. ${a.description}` : ""}`)
        .join("\n\n");

      const prompt = `${DEEPDIVE_PROMPT}

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
          summary: "Could not generate analysis",
          takeaways: [],
          facts: [],
          narrative: ""
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
