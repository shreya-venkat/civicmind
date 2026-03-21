import { NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

const SYSTEM_PROMPTS = {
  summarize: `You are a neutral news analyst creating balanced summaries of political topics. 
Follow these rules STRICTLY:
1. State ONLY verifiable facts from the articles provided
2. Present multiple perspectives WITHOUT editorializing
3. Use neutral language - avoid words like "alarming", "shameful", "brave", "radical", "extreme"
4. Do NOT take sides or imply one perspective is correct
5. Acknowledge uncertainty where it exists
6. Format with short paragraphs, max 200 words
7. Start directly with the topic - no preamble`,

  perspectives: `You are a neutral political analyst. For each political lean, present the STRONGEST, MOST CHARITABLE interpretation of that viewpoint.

Rules:
1. Left: Explain the progressive/liberal argument, citing specific policy concerns and values
2. Center: Present evidence-based analysis that acknowledges complexity and tradeoffs  
3. Right: Explain the conservative/libertarian argument with its underlying values and logic
4. Each perspective should be 2-3 sentences max
5. Use "Left argues that..." / "Center notes that..." / "Right contends that..." format
6. Do NOT judge which side is correct
7. If an article doesn't give enough info for a perspective, say "Insufficient coverage to determine perspective"
8. Format as JSON: {left: string, center: string, right: string}`,

  chat: `You are a Socratic debate partner helping users identify blind spots in their thinking.

Rules:
1. NEVER tell them they're wrong - ask questions instead
2. Challenge them to articulate the strongest opposing argument
3. Point out what facts they might be missing (without specifying which outlet)
4. Ask what evidence would change their mind
5. Be direct but respectful - this is about critical thinking, not feelings
6. Keep responses to 2-3 sentences
7. If they seem genuinely curious, provide more depth
8. Occasionally suggest they might be overconfident about something
9. Do not be preachy or use phrases like "it's important to consider"`
};

export async function POST(request: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI not configured. Add OPENAI_API_KEY to .env" },
      { status: 503 }
    );
  }

  try {
    const body: RequestBody = await request.json();
    const { type, topicTitle, articles, message, chatHistory } = body;

    if (type === "summarize" || type === "perspectives") {
      if (!articles || articles.length === 0) {
        return NextResponse.json({ error: "No articles provided" }, { status: 400 });
      }

      const articleContext = articles
        .map((a) => `[${a.lean.toUpperCase()}] ${a.source}: ${a.title}${a.description ? `. ${a.description}` : ""}`)
        .join("\n\n");

      const systemPrompt = SYSTEM_PROMPTS[type];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Topic: ${topicTitle}\n\nArticles:\n${articleContext}\n\n${
                type === "summarize"
                  ? "Create a neutral summary of what's happening based on these articles."
                  : "What are the strongest arguments from the left, center, and right on this topic?"
              }`,
            },
          ],
          max_tokens: type === "perspectives" ? 500 : 800,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[AI/summarize] OpenAI error:", error);
        return NextResponse.json({ error: "AI request failed" }, { status: 500 });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      if (type === "perspectives") {
        try {
          const parsed = JSON.parse(content);
          return NextResponse.json(parsed);
        } catch {
          return NextResponse.json({ left: content, center: content, right: content });
        }
      }

      return NextResponse.json({ summary: content });
    }

    if (type === "chat") {
      if (!message) {
        return NextResponse.json({ error: "No message provided" }, { status: 400 });
      }

      const systemPrompt = SYSTEM_PROMPTS.chat;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...(chatHistory || []).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: message },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[AI/chat] OpenAI error:", error);
        return NextResponse.json({ error: "AI request failed" }, { status: 500 });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "I'm having trouble responding right now.";
      return NextResponse.json({ response: content });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("[AI] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
