import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
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

interface DuplicateRequest {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
}

interface DuplicateResponse {
  isDuplicate: boolean;
  matchCount: number;
  similarIds: string[];
  confidence: number;
}

interface RecentComplaintRow {
  id: string;
  category: string;
  description: string;
  location?: string | null;
  created_at: string;
}

const buildPrompt = (incoming: DuplicateRequest, candidates: RecentComplaintRow[]) => {
  const serializedCandidates = JSON.stringify(candidates, null, 2);

  return `You are checking complaint duplicates for a municipal system.
Decide if the new complaint is likely a duplicate of any recent complaints.
Return JSON only.

New complaint:
${JSON.stringify(incoming, null, 2)}

Recent complaints:
${serializedCandidates}

Rules:
- A duplicate means substantially same issue and location/time context.
- confidence is 0..1
- similarIds must contain only IDs present in recent complaints.

Return exact JSON:
{
  "isDuplicate": true,
  "similarIds": ["id1", "id2"],
  "confidence": 0.0
}`;
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse;
  if (event.httpMethod !== "POST") return methodNotAllowed;

  const body = parseJsonBody<DuplicateRequest>(event);
  if (!body) return badRequest("Invalid JSON body");

  const description = body.description?.trim() || "";
  if (!description) return badRequest("description is required");

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        isDuplicate: false,
        matchCount: 0,
        similarIds: [],
        confidence: 0.35,
      } satisfies DuplicateResponse),
    };
  }

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const since = new Date();
    since.setDate(since.getDate() - 90);

    const { data, error } = await supabase
      .from("complaints")
      .select("id, category, description, location, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(40);

    if (error) {
      throw new Error(error.message);
    }

    const candidates = (data || []) as RecentComplaintRow[];

    if (candidates.length === 0) {
      const noMatch: DuplicateResponse = {
        isDuplicate: false,
        matchCount: 0,
        similarIds: [],
        confidence: 0.92,
      };

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(noMatch),
      };
    }

    const fallback: DuplicateResponse = {
      isDuplicate: false,
      matchCount: 0,
      similarIds: [],
      confidence: 0.5,
    };

    const apiKey = process.env.NETLIFY_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const ai = await callGeminiJson<Partial<DuplicateResponse>>(
      buildPrompt(body, candidates),
      fallback,
      apiKey
    );

    const validIds = new Set(candidates.map((c) => c.id));
    const similarIds = Array.isArray(ai.similarIds)
      ? ai.similarIds.filter((id): id is string => typeof id === "string" && validIds.has(id))
      : [];

    const payload: DuplicateResponse = {
      isDuplicate: Boolean(ai.isDuplicate) && similarIds.length > 0,
      matchCount: similarIds.length,
      similarIds,
      confidence: normalizeConfidence(ai.confidence, fallback.confidence),
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(payload),
    };
  } catch (error) {
    console.error("[detect-duplicates] Error:", error);
    return serverError("Failed to detect duplicates");
  }
};
