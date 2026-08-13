export type ProviderId = "openrouter" | "ollama";
export type ProbeState = "idle" | "testing" | "ok" | "error";

export type AiConnection = {
  provider: ProviderId;
  openrouterKey: string;
  openrouterModel: string;
  ollamaUrl: string;
  ollamaModel: string;
};

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string | ContentPart[];
};

export type ModelOption = {
  id: string;
  name: string;
  free: boolean;
  context: number | null;
  multimodal: boolean;
};

const STORAGE_KEY = "mq_ai_connection";

export const DEFAULT_CONNECTION: AiConnection = {
  provider: "openrouter",
  openrouterKey: "",
  openrouterModel: "google/gemma-3-27b-it:free",
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "",
};

export function loadConnection(): AiConnection {
  if (typeof window === "undefined") return DEFAULT_CONNECTION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONNECTION;
    return { ...DEFAULT_CONNECTION, ...(JSON.parse(raw) as Partial<AiConnection>) };
  } catch {
    return DEFAULT_CONNECTION;
  }
}

export function saveConnection(conn: AiConnection) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conn));
  window.dispatchEvent(new CustomEvent("mq-ai-connection-change"));
}

export function connectionLabel(conn: AiConnection): string {
  if (conn.provider === "openrouter") {
    const short = conn.openrouterModel.split("/").pop() ?? conn.openrouterModel;
    return `OPENROUTER · ${short.replace(":free", " FREE").toUpperCase()}`;
  }
  return `OLLAMA · ${(conn.ollamaModel || "NO MODEL").toUpperCase()}`;
}

export function isConfigured(conn: AiConnection): boolean {
  if (conn.provider === "openrouter") return !!conn.openrouterKey && !!conn.openrouterModel;
  return !!conn.ollamaUrl && !!conn.ollamaModel;
}

function cleanUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

function errText(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

/* ------------------------- OpenRouter (browser-side) ------------------------ */

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
let modelCache: ModelOption[] | null = null;

export async function listOpenRouterModels(force = false): Promise<ModelOption[]> {
  if (modelCache && !force) return modelCache;
  const res = await fetch(`${OPENROUTER_BASE}/models`);
  if (!res.ok) throw new Error(`OpenRouter model list failed (HTTP ${res.status})`);
  const json = (await res.json()) as { data?: Array<Record<string, any>> };
  const models: ModelOption[] = (json.data ?? []).map((m) => {
    const prompt = Number(m.pricing?.prompt ?? 0);
    const completion = Number(m.pricing?.completion ?? 0);
    const modalities: string[] = m.architecture?.input_modalities ?? [];
    return {
      id: String(m.id),
      name: String(m.name ?? m.id),
      free: (prompt === 0 && completion === 0) || String(m.id).endsWith(":free"),
      context: typeof m.context_length === "number" ? m.context_length : null,
      multimodal: modalities.includes("image"),
    };
  });
  models.sort((a, b) => a.name.localeCompare(b.name));
  modelCache = models;
  return models;
}

export async function testOpenRouter(key: string, model: string): Promise<void> {
  if (!key.trim()) throw new Error("Paste your OpenRouter key first.");
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key.trim()}`,
      "X-Title": "merQato AI Tools",
    },
    body: JSON.stringify({ model, max_tokens: 8, messages: [{ role: "user", content: "ping" }] }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let detail = body.slice(0, 200);
    try { detail = JSON.parse(body)?.error?.message ?? detail; } catch { /* keep raw */ }
    if (res.status === 401) throw new Error("Key rejected (401). Check the key is active on openrouter.ai.");
    if (res.status === 402) throw new Error("This model needs credits on your OpenRouter account. Pick a free model.");
    if (res.status === 429) throw new Error("Rate limited by OpenRouter. Wait a moment and test again.");
    throw new Error(`OpenRouter HTTP ${res.status}: ${detail}`);
  }
}

async function chatOpenRouter(conn: AiConnection, messages: ChatMessage[], systemPrompt: string) {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${conn.openrouterKey.trim()}`,
      "X-Title": "merQato AI Tools",
    },
    body: JSON.stringify({
      model: conn.openrouterModel,
      max_tokens: 800,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let detail = body.slice(0, 300);
    try { detail = JSON.parse(body)?.error?.message ?? detail; } catch { /* keep raw */ }
    throw new Error(`OpenRouter HTTP ${res.status}: ${detail}`);
  }
  const json = await res.json();
  return String(json.choices?.[0]?.message?.content ?? "");
}

/* ---------------------------- Ollama (browser-side) --------------------------- */

export const OLLAMA_CORS_HINT =
  typeof window === "undefined"
    ? 'OLLAMA_ORIGINS="*" ollama serve'
    : `OLLAMA_ORIGINS="${window.location.origin}" ollama serve`;

function ollamaError(e: unknown): Error {
  const msg = errText(e, "Could not reach Ollama.");
  if (/failed to fetch|load failed|networkerror/i.test(msg)) {
    return new Error(
      "Your browser could not reach Ollama. Make sure it is running and allows this site (see the command below).",
    );
  }
  return new Error(msg);
}

export async function listOllamaModels(url: string): Promise<string[]> {
  try {
    const res = await fetch(`${cleanUrl(url)}/api/tags`);
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const json = (await res.json()) as { models?: Array<{ name: string }> };
    const names = (json.models ?? []).map((m) => m.name);
    if (names.length === 0) throw new Error("Ollama is running but has no models. Try `ollama pull llama3.2`.");
    return names;
  } catch (e) {
    throw ollamaError(e);
  }
}

export async function testOllama(url: string, model: string): Promise<void> {
  if (!model) throw new Error("Detect and pick a model first.");
  try {
    const res = await fetch(`${cleanUrl(url)}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, stream: false, messages: [{ role: "user", content: "ping" }] }),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    await res.json();
  } catch (e) {
    throw ollamaError(e);
  }
}

function toOllamaMessages(messages: ChatMessage[]) {
  return messages.map((m) => {
    if (typeof m.content === "string") return { role: m.role, content: m.content };
    const text = m.content.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join("\n");
    const images = m.content
      .filter((p) => p.type === "image_url")
      .map((p) => (p as { image_url: { url: string } }).image_url.url.replace(/^data:[^;]+;base64,/, ""));
    return images.length ? { role: m.role, content: text, images } : { role: m.role, content: text };
  });
}

async function chatOllama(conn: AiConnection, messages: ChatMessage[], systemPrompt: string) {
  try {
    const res = await fetch(`${cleanUrl(conn.ollamaUrl)}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: conn.ollamaModel,
        stream: false,
        messages: [{ role: "system", content: systemPrompt }, ...toOllamaMessages(messages)],
      }),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const json = await res.json();
    return String(json.message?.content ?? "");
  } catch (e) {
    throw ollamaError(e);
  }
}

/* --------------------------------- router --------------------------------- */

export const OPERATOR_PROMPT = `You are a Palawan AI Operator — an intelligent assistant for micro-resorts and small businesses in Palawan, Philippines.
Be friendly, warm and practical. Keep answers under 200 words unless asked for detail. Never invent pricing or availability.`;

export type ChatResult = { content: string; provider: ProviderId };

export async function sendChat(
  conn: AiConnection,
  messages: ChatMessage[],
  systemPrompt = OPERATOR_PROMPT,
): Promise<ChatResult> {
  if (conn.provider === "openrouter") {
    if (!conn.openrouterKey) throw new Error("Add your OpenRouter key in AI Connection.");
    return { content: await chatOpenRouter(conn, messages, systemPrompt), provider: "openrouter" };
  }
  if (!conn.ollamaModel) throw new Error("Pick an Ollama model in AI Connection.");
  return { content: await chatOllama(conn, messages, systemPrompt), provider: "ollama" };
}
