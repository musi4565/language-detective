import { env } from "../../config/env.js";
import { ApiError } from "../../utils/apiError.js";

export function extractJson(text) {
  if (!text) return null;
  const cleaned = text.trim();
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : cleaned;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function assertConfigured() {
  if (!env.geminiApiKey && !env.openaiApiKey) {
    throw new ApiError(
      503,
      "AI is not configured. Add GEMINI_API_KEY or OPENAI_API_KEY to the server .env file."
    );
  }
}

async function callGemini(systemPrompt, messages, { temperature = 0.4, jsonMode = true } = {}) {
  const model = env.geminiModel || "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.geminiApiKey}`;
  const contents = [{ role: "user", parts: [{ text: systemPrompt }] }];
  for (const m of messages) {
    const role = String(m.role || "user").toLowerCase();
    contents.push({
      role: role === "assistant" || role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    });
  }
  const body = {
    contents,
    generationConfig: {
      temperature,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new ApiError(502, `AI provider error (Gemini): ${res.status} ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return jsonMode ? extractJson(text) : text;
}

async function callOpenAI(systemPrompt, messages, { temperature = 0.4, jsonMode = true } = {}) {
  const url = `${env.openaiBaseUrl || "https://api.openai.com/v1"}/chat/completions`;
  const body = {
    model: env.openaiModel || "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }, ...messages.map((m) => ({ role: String(m.role || "user").toLowerCase() === "assistant" ? "assistant" : "user", content: m.content }))],
    temperature,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new ApiError(502, `AI provider error (OpenAI): ${res.status} ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return jsonMode ? extractJson(text) : text;
}

/**
 * Unified AI gateway. Provider chosen via env:
 * - GEMINI_API_KEY set -> Gemini
 * - otherwise OPENAI_API_KEY set -> OpenAI
 *
 * @param {string} systemPrompt - system instructions
 * @param {Array<{role:string, content:string}>} messages - conversation history (may be empty)
 * @param {{temperature?:number, jsonMode?:boolean}} opts
 */
export async function aiComplete(systemPrompt, messages = [], opts = {}) {
  assertConfigured();
  if (env.geminiApiKey) return callGemini(systemPrompt, messages, opts);
  return callOpenAI(systemPrompt, messages, opts);
}

/**
 * Chat completion that always returns { reply, corrections } for the AI chat feature.
 */
export async function aiChat(systemPrompt, messages, opts = {}) {
  const result = await aiComplete(systemPrompt, messages, { temperature: 0.7, jsonMode: true, ...opts });
  if (result && typeof result.reply === "string") {
    return { reply: result.reply, corrections: Array.isArray(result.corrections) ? result.corrections : [] };
  }
  return { reply: String(result || ""), corrections: [] };
}