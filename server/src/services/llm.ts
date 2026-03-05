import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  messages: Message[],
  options?: { temperature?: number; maxTokens?: number; jsonMode?: boolean }
): Promise<string> {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
    ...(options?.jsonMode ? { response_format: { type: "json_object" } } : {}),
  });

  return response.choices[0]?.message?.content || "";
}

export async function streamCompletion(
  messages: Message[],
  onChunk: (chunk: string) => void,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
    stream: true,
  });

  let full = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || "";
    if (delta) {
      full += delta;
      onChunk(delta);
    }
  }
  return full;
}
