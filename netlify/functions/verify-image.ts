import type { Handler } from "@netlify/functions";
import {
  badRequest,
  corsHeaders,
  methodNotAllowed,
  normalizeConfidence,
  optionsResponse,
  parseJsonBody,
} from "./_gemini";

type VerificationStatus = "valid" | "needs_review" | "rejected";

interface VerifyImageRequest {
  imageUrl?: string;
  category?: string;
  description?: string;
}

interface VerifyImageResponse {
  status: VerificationStatus;
  confidence: number;
  explanation: string;
}

const GEMINI_MODEL = "gemini-3.1-flash-lite";

const normalizeStatus = (value: unknown): VerificationStatus => {
  const status = String(value || "").toLowerCase();
  if (status === "valid") return "valid";
  if (status === "rejected") return "rejected";
  return "needs_review";
};

const buildPrompt = (imageUrl: string, category: string, description: string) => `You are validating evidence images for a community complaint system.
Analyze relevance to complaint, image clarity, and appropriateness.
Return JSON only.

Complaint category: ${category}
Complaint description: ${description}
Image URL: ${imageUrl}

Rules:
- status must be one of valid, needs_review, rejected
- confidence must be between 0 and 1
- explanation should be concise (max 2 sentences)
- If the image clearly shows a different issue than described, use rejected.
- If the image is unclear/ambiguous, use needs_review.
- Example: complaint is broken streetlight but image shows garbage piles => rejected.

Return this exact shape:
{
  "status": "valid|needs_review|rejected",
  "confidence": 0.0,
  "explanation": "string"
}`;

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

const getMimeTypeFromUrl = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
};

const fetchImageInlineData = async (imageUrl: string): Promise<{ mimeType: string; data: string }> => {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get("content-type") || getMimeTypeFromUrl(imageUrl);

  return {
    mimeType,
    data: buffer.toString("base64"),
  };
};

const callGeminiImageVerification = async (
  prompt: string,
  image: { mimeType: string; data: string },
  apiKey: string
): Promise<Partial<VerifyImageResponse>> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: image.mimeType,
                data: image.data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed with status ${response.status}: ${errorText}`);
  }

  const raw = await response.json();
  const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = JSON.parse(extractJsonString(text)) as Partial<VerifyImageResponse>;
  return parsed;
};

const getFallback = (imageUrl: string, description: string): VerifyImageResponse => {
  if (!imageUrl.startsWith("http")) {
    return {
      status: "rejected",
      confidence: 0.95,
      explanation: "Image URL is invalid or inaccessible.",
    };
  }

  if (description.length < 30) {
    return {
      status: "needs_review",
      confidence: 0.52,
      explanation: "Complaint context is too limited for confident automatic verification.",
    };
  }

  return {
    status: "needs_review",
    confidence: 0.5,
    explanation: "Automatic image verification is temporarily unavailable. This attachment will be reviewed by staff.",
  };
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse;
  if (event.httpMethod !== "POST") return methodNotAllowed;

  const body = parseJsonBody<VerifyImageRequest>(event);
  if (!body) return badRequest("Invalid JSON body");

  const imageUrl = body.imageUrl?.trim() || "";
  const category = body.category?.trim() || "Other";
  const description = body.description?.trim() || "";

  if (!imageUrl || !description) {
    return badRequest("imageUrl and description are required");
  }

  const fallback = getFallback(imageUrl, description);

  try {
    const apiKey = process.env.NETLIFY_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(fallback),
      };
    }

    const inlineImage = await fetchImageInlineData(imageUrl);
    const ai = await callGeminiImageVerification(buildPrompt(imageUrl, category, description), inlineImage, apiKey);

    const payload: VerifyImageResponse = {
      status: normalizeStatus(ai.status),
      confidence: normalizeConfidence(ai.confidence, fallback.confidence),
      explanation: (ai.explanation || fallback.explanation).toString().slice(0, 300),
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(payload),
    };
  } catch (error) {
    console.warn("[verify-image] Gemini API error, returning fallback:", error);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(fallback),
    };
  }
};
