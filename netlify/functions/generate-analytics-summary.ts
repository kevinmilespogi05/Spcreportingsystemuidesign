import type { Handler } from "@netlify/functions";
import {
  badRequest,
  callGeminiJson,
  corsHeaders,
  methodNotAllowed,
  optionsResponse,
  parseJsonBody,
  serverError,
} from "./_gemini";

type Trend = "up" | "flat" | "down";

interface AnalyticsSummaryRequest {
  dateRange?: string;
  stats?: Record<string, unknown>;
}

interface AnalyticsSummaryResponse {
  executiveSummary: string;
  keyFindings: string[];
  topConcerns: string[];
  recommendations: string[];
  trend: Trend;
}

const normalizeTrend = (value: unknown): Trend => {
  const trend = String(value || "").toLowerCase();
  if (trend === "up") return "up";
  if (trend === "down") return "down";
  return "flat";
};

const buildPrompt = (dateRange: string, stats: Record<string, unknown>) => `You are an analytics assistant for a local government complaint dashboard.
Generate concise executive insights based on complaint stats.
Return JSON only.

Date range: ${dateRange}
Stats:
${JSON.stringify(stats, null, 2)}

Rules:
- Keep executiveSummary to 2-4 sentences.
- keyFindings should have 3-5 bullets.
- topConcerns should be ordered highest priority first.
- recommendations should be practical and action-oriented.
- trend must be one of: up, flat, down.

Return exact JSON:
{
  "executiveSummary": "string",
  "keyFindings": ["string"],
  "topConcerns": ["string"],
  "recommendations": ["string"],
  "trend": "up|flat|down"
}`;

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse;
  if (event.httpMethod !== "POST") return methodNotAllowed;

  const body = parseJsonBody<AnalyticsSummaryRequest>(event);
  if (!body) return badRequest("Invalid JSON body");

  const dateRange = body.dateRange?.trim() || "Last 30 days";
  const stats = body.stats || {};

  const fallback: AnalyticsSummaryResponse = {
    executiveSummary:
      "Complaint activity is stable with opportunities to reduce pending backlogs through targeted interventions.",
    keyFindings: [
      "Most reports are concentrated in a small number of recurring categories.",
      "Pending complaints indicate capacity pressure in peak reporting periods.",
      "Resolution performance improves when triage is completed within 24 hours.",
    ],
    topConcerns: ["Backlog growth in high-volume categories", "Delayed first-response times"],
    recommendations: [
      "Assign rotating rapid-response teams for top recurring categories.",
      "Automate routing and prioritization for high-severity complaints.",
      "Review unresolved cases older than 7 days in weekly operations meetings.",
    ],
    trend: "flat",
  };

  try {
    const apiKey = process.env.NETLIFY_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const ai = await callGeminiJson<Partial<AnalyticsSummaryResponse>>(
      buildPrompt(dateRange, stats),
      fallback,
      apiKey
    );

    const payload: AnalyticsSummaryResponse = {
      executiveSummary: (ai.executiveSummary || fallback.executiveSummary).toString().slice(0, 900),
      keyFindings: Array.isArray(ai.keyFindings)
        ? ai.keyFindings.map((x) => String(x)).filter(Boolean).slice(0, 6)
        : fallback.keyFindings,
      topConcerns: Array.isArray(ai.topConcerns)
        ? ai.topConcerns.map((x) => String(x)).filter(Boolean).slice(0, 6)
        : fallback.topConcerns,
      recommendations: Array.isArray(ai.recommendations)
        ? ai.recommendations.map((x) => String(x)).filter(Boolean).slice(0, 8)
        : fallback.recommendations,
      trend: normalizeTrend(ai.trend),
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(payload),
    };
  } catch (error) {
    console.error("[generate-analytics-summary] Error:", error);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(fallback),
    };
  }
};
