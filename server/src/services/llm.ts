// LLM Provider Abstraction
// Priority: OpenClaw Gateway → FLock Direct → OpenAI (fallback)
// All providers use OpenAI-compatible API format

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}

function getProviderConfig(): ProviderConfig {
  // 1. OpenClaw Gateway (hackathon requirement — routes through FLock plugin)
  if (process.env.OPENCLAW_GATEWAY_URL) {
    return {
      name: "openclaw",
      baseUrl: process.env.OPENCLAW_GATEWAY_URL,
      apiKey: process.env.OPENCLAW_HOOKS_TOKEN || "",
      model: process.env.OPENCLAW_MODEL || "openclaw-analyst",
    };
  }

  // 2. FLock API direct (fallback)
  if (process.env.FLOCK_API_KEY) {
    return {
      name: "flock",
      baseUrl: process.env.FLOCK_API_URL || "https://api.flock.io",
      apiKey: process.env.FLOCK_API_KEY,
      model: "gemini-3-flash-preview",
    };
  }

  // 3. OpenAI (last resort)
  return {
    name: "openai",
    baseUrl: "https://api.openai.com",
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  };
}

export async function chatCompletion(
  messages: Message[],
  options?: { temperature?: number; maxTokens?: number; jsonMode?: boolean }
): Promise<string> {
  const provider = getProviderConfig();
  console.log(`[llm] Using provider: ${provider.name} (model: ${provider.model})`);

  const response = await fetch(`${provider.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
      ...(options?.jsonMode
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    console.error(`[llm] ${provider.name} error ${response.status}: ${errorText}`);
    throw new Error(`${provider.name} API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function streamCompletion(
  messages: Message[],
  onChunk: (chunk: string) => void,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const provider = getProviderConfig();
  console.log(`[llm] Streaming via provider: ${provider.name}`);

  const response = await fetch(`${provider.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`${provider.name} stream error: ${response.status}`);
  }

  let full = "";
  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    for (const line of text.split("\n")) {
      if (line.startsWith("data: ") && line !== "data: [DONE]") {
        try {
          const json = JSON.parse(line.slice(6));
          const delta = json.choices?.[0]?.delta?.content || "";
          if (delta) {
            full += delta;
            onChunk(delta);
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  }

  return full;
}
