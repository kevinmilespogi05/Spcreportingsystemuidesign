import type { HandlerEvent } from "@netlify/functions";

export interface ApiErrorBody {
  error: string;
}

export const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const optionsResponse = {
  statusCode: 200,
  headers: corsHeaders,
  body: JSON.stringify({ ok: true }),
};

export const methodNotAllowed = {
  statusCode: 405,
  headers: corsHeaders,
  body: JSON.stringify({ error: "Method not allowed" } satisfies ApiErrorBody),
};

export const badRequest = (message: string) => ({
  statusCode: 400,
  headers: corsHeaders,
  body: JSON.stringify({ error: message } satisfies ApiErrorBody),
});

export const serverError = (message: string) => ({
  statusCode: 500,
  headers: corsHeaders,
  body: JSON.stringify({ error: message } satisfies ApiErrorBody),
});

export const parseJsonBody = <T,>(event: HandlerEvent): T | null => {
  if (!event.body) return null;

  try {
    return JSON.parse(event.body) as T;
  } catch {
    return null;
  }
};

const GEMINI_MODEL = "gemini-3.1-flash-lite";

const extractJsonString = (raw: string): string => {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }

  return raw.trim();
};

const clampConfidence = (value: unknown, fallback: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return Number(value.toFixed(2));
};

export const normalizeConfidence = clampConfidence;

export const callGeminiJson = async <T,>(
  prompt: string,
  fallback: T,
  apiKey: string | undefined
): Promise<T> => {
  if (!apiKey) {
    return fallback;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const raw = await response.json();
  const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  const jsonText = extractJsonString(text);
  const parsed = JSON.parse(jsonText) as T;
  return parsed;
};
