import { createServerFn } from "@tanstack/react-start";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type Message = {
  role: "user" | "assistant" | "system";
  content: string | ContentPart[];
};

const WORKSPACE_SYSTEM_PROMPT = `You are Hermes — an AI agent living in the merQato Agent Workspace at /workspace.

Your identity:
- You ARE the Hermes Agent running on this website
- You write code, push to GitHub, manage content, and build things
- You have access to file tools, terminal, and the site's content store
- You are practical, direct, and focused on building

Your capabilities:
- Code: React 19, TypeScript, Tailwind CSS, Node.js, TanStack Start
- Git: Push to GitHub, manage branches, deploy via Lovable
- Content: Read/write site content, blog posts, portfolio items via CMS
- Search: Web search, file browsing, API calls

Rules:
- Keep responses under 300 words unless building something
- Be direct and helpful — show your work
- When asked about your current status, describe what you're actually doing
- If you can't do something, say so clearly
- Sound like a capable AI that's happy to be put to work`;

const AGENTS_SYSTEM_PROMPT = `You are a Palawan AI Operator — an intelligent assistant for micro-resorts and small businesses in Palawan, Philippines.

Your role:
- Help resort owners with bookings, guest communications, operations, and marketing
- Be friendly, warm, and practical — Palawan hospitality
- Give concise, actionable answers (2-3 paragraphs max)
- Sound like a knowledgeable local who knows hospitality inside out

Rules:
- Keep responses under 200 words unless asked for detail
- Don't make up specific pricing or availability — direct users to contact merQato.digital
- Be encouraging — Palawan small business owners are your people
- Use simple, clear English`;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callLovable(messages: Message[], systemPrompt: string, key: string) {
  if (!key) return null;

  const response = await fetch(LOVABLE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (response.status === 429) throw new Error("rate_limited");
    if (response.status === 402) throw new Error("credits_exhausted");
    throw new Error(`Lovable AI HTTP ${response.status}: ${detail.slice(0, 200)}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || "";
}

async function callOpenRouter(messages: Message[], systemPrompt: string, key: string, model: string) {
  if (!key) return null;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://merqato.digital",
      "X-Title": "Hermes Agent Workspace",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`OpenRouter HTTP ${response.status}: ${errText}`);
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content || "";
}

async function callOllama(messages: Message[], systemPrompt: string, ollamaUrl: string, model: string) {
  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);

  const json = await response.json();
  return json.message?.content || "";
}

export const chatWithAgent = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: Message[] }) => {
    if (!input?.messages?.length) throw new Error("Messages required");
    return input;
  })
  .handler(async ({ data }) => {
    const recentMessages = data.messages.slice(-10);
    const isWorkspace = recentMessages.some((m) => {
      const text = typeof m.content === "string"
        ? m.content
        : m.content.map((p) => (p.type === "text" ? p.text : "")).join(" ");
      return text.includes("/workspace") || text.includes("Hermes");
    });
    const systemPrompt = isWorkspace ? WORKSPACE_SYSTEM_PROMPT : AGENTS_SYSTEM_PROMPT;
    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.openrouter_api_key || "";
    const openRouterModel = process.env.OPENROUTER_MODEL || "google/gemma-2-2b-it:free";
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    const ollamaModel = process.env.AI_MODEL || "llama3.2:3b";

    // Primary: Lovable AI (Site AI)
    try {
      const content = await callLovable(recentMessages, systemPrompt, process.env.LOVABLE_API_KEY || "");
      if (content) return { content, ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "rate_limited")
        return { content: "⚠️ Site AI is rate limited right now. Wait a moment, or switch to your own key in AI Connection.", ok: false };
      if (msg === "credits_exhausted")
        return { content: "⚠️ Site AI credits are used up. Use your own OpenRouter key or local Ollama in AI Connection.", ok: false };
      console.error("Lovable AI error:", err);
    }

    // Fallback: OpenRouter (server key)
    try {
      const content = await callOpenRouter(recentMessages, systemPrompt, openRouterKey, openRouterModel);
      if (content) return { content, ok: true };
    } catch (err) {
      console.error("OpenRouter error:", err);
    }

    // Fallback: Ollama
    try {
      const content = await callOllama(recentMessages, systemPrompt, ollamaUrl, ollamaModel);
      if (content) return { content, ok: true };
    } catch (err) {
      console.error("Ollama error:", err);
    }

    return {
      content:
        "⚠️ Site AI is unreachable right now. Open AI Connection and use your own OpenRouter key or your local Ollama models.",
      ok: false,
    };
  });
