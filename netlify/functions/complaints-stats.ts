import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/complaints/stats
 *
 * Serverless backend endpoint for the landing page complaint stats.
 * - Uses SUPABASE_SERVICE_ROLE_KEY (server-side secret, never sent to browser)
 * - Bypasses RLS safely (aggregated counts only, no raw row data)
 * - Keeps all RLS policies intact
 *
 * Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in:
 *   Netlify Dashboard → Site Configuration → Environment Variables
 */
export const handler: Handler = async () => {
  // VITE_SUPABASE_URL is already set in Netlify dashboard — reuse it here
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("[complaints-stats] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server configuration error" }),
    };
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const [totalRes, inProgressRes, resolvedRes] = await Promise.all([
      admin.from("complaints").select("*", { count: "exact", head: true }),
      admin
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("status", "In Progress"),
      admin
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("status", "Resolved"),
    ]);

    if (totalRes.error) throw new Error(totalRes.error.message);
    if (inProgressRes.error) throw new Error(inProgressRes.error.message);
    if (resolvedRes.error) throw new Error(resolvedRes.error.message);

    const payload = {
      total: totalRes.count ?? 0,
      in_progress: inProgressRes.count ?? 0,
      resolved: resolvedRes.count ?? 0,
    };

    console.log("[complaints-stats] OK", payload);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(payload),
    };
  } catch (err) {
    console.error("[complaints-stats] Error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to fetch complaint stats" }),
    };
  }
};
