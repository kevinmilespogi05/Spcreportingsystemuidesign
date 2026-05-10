import type { Handler } from "@netlify/functions";
import {
  badRequest,
  callGeminiJson,
  corsHeaders,
  methodNotAllowed,
  normalizeConfidence,
  optionsResponse,
  parseJsonBody,
  serverError,
} from "./_gemini";

type Severity = "low" | "medium" | "high" | "critical";
type Urgency = "low" | "medium" | "high" | "immediate";

interface CategorizeRequest {
  title?: string;
  description?: string;
}

interface CategorizeResponse {
  suggestedCategory: string;
  confidence: number;
  severity: Severity;
  urgency: Urgency;
}

const ALLOWED_CATEGORIES = [
  "Road & Infrastructure",
  "Waste Management",
  "Public Safety",
  "Noise Complaint",
  "Street Lighting",
  "Water & Drainage",
  "Public Health",
  "Other",
];

const normalizeSeverity = (value: unknown): Severity => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "critical") return "critical";
  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";
  return "low";
};

const normalizeUrgency = (value: unknown): Urgency => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "immediate") return "immediate";
  if (normalized === "high") return "high";
  if (normalized === "medium") return "medium";
  return "low";
};

const normalizeCategory = (value: unknown): string => {
  const text = String(value || "").trim();
  const exact = ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === text.toLowerCase());
  return exact || "Other";
};

const buildPrompt = (title: string, description: string) => `You are assisting a local community complaint system.
Classify the complaint and return valid JSON only.

Allowed categories: ${ALLOWED_CATEGORIES.join(", ")}.
Allowed severity: low|medium|high|critical.
Allowed urgency: low|medium|high|immediate.
Confidence must be from 0 to 1.

Complaint title: ${title}
Complaint description: ${description}

Return this JSON shape exactly:
{
  "suggestedCategory": "string",
  "confidence": 0.0,
  "severity": "low|medium|high|critical",
  "urgency": "low|medium|high|immediate"
}`;

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse;
  if (event.httpMethod !== "POST") return methodNotAllowed;

  const body = parseJsonBody<CategorizeRequest>(event);
  if (!body) return badRequest("Invalid JSON body");

  const title = body.title?.trim() || "";
  const description = body.description?.trim() || "";

  if (!title || !description) {
    return badRequest("title and description are required");
  }

  // Build a smart fallback using simple keyword matching so the UI is useful
  const combined = `${title} ${description}`.toLowerCase();
  let fallbackCategory = "Other";
  let fallbackSeverity: Severity = description.length > 180 ? "high" : "medium";
  let fallbackUrgency: Urgency = combined.includes("danger") ? "high" : "medium";

  if (combined.includes("road") || combined.includes("pothole") || combined.includes("pavement") || combined.includes("street")) {
    fallbackCategory = "Road & Infrastructure";
    fallbackSeverity = "high";
  } else if (combined.includes("trash") || combined.includes("garbage") || combined.includes("waste")) {
    fallbackCategory = "Waste Management";
  } else if (combined.includes("crime") || combined.includes("theft") || combined.includes("unsafe") || combined.includes("unsafe")) {
    fallbackCategory = "Public Safety";
    fallbackSeverity = "high";
    fallbackUrgency = "high";
  } else if (combined.includes("noise") || combined.includes("loud") || combined.includes("sound")) {
    fallbackCategory = "Noise Complaint";
  } else if (combined.includes("light") || combined.includes("lamp") || combined.includes("lamppost") || combined.includes("streetlight") || combined.includes("street light")) {
    fallbackCategory = "Street Lighting";
  } else if (combined.includes("water") || combined.includes("drain") || combined.includes("flood")) {
    fallbackCategory = "Water & Drainage";
    fallbackSeverity = "high";
  } else if (combined.includes("health") || combined.includes("disease") || combined.includes("pest") || combined.includes("sick")) {
    fallbackCategory = "Public Health";
    fallbackSeverity = "high";
  }

  const fallback: CategorizeResponse = {
    suggestedCategory: fallbackCategory,
    confidence: 0.72,
    severity: fallbackSeverity,
    urgency: fallbackUrgency,
  };

  try {
    const apiKey = process.env.NETLIFY_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const ai = await callGeminiJson<Partial<CategorizeResponse>>(
      buildPrompt(title, description),
      fallback,
      apiKey
    );

    const payload: CategorizeResponse = {
      suggestedCategory: normalizeCategory(ai.suggestedCategory),
      confidence: normalizeConfidence(ai.confidence, fallback.confidence),
      severity: normalizeSeverity(ai.severity),
      urgency: normalizeUrgency(ai.urgency),
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(payload),
    };
  } catch (error) {
    // If the Gemini API call fails (rate limit, quota, etc.), return the safe fallback
    console.warn("[categorize-complaint] Gemini API error, returning fallback:", error);
    const payload: CategorizeResponse = {
      suggestedCategory: normalizeCategory(fallback.suggestedCategory),
      confidence: normalizeConfidence(fallback.confidence, fallback.confidence),
      severity: normalizeSeverity(fallback.severity),
      urgency: normalizeUrgency(fallback.urgency),
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(payload),
    };
  }
};
