/**
 * Demo / hackathon: full HUMI analysis for one agent.
 * Auth: Authorization Bearer must match env GSA_HUMI_DEMO_SECRET (no credits).
 * Public path (via CF Worker): GET /v1/agents/humi?canonical_slug=&lang=eng|esp
 */
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractBearer(req: Request): string | null {
  const auth = req.headers.get("Authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function secretsEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function cleanWarnings(warnings: unknown): unknown[] {
  if (!warnings || !Array.isArray(warnings)) return [];
  return warnings.map((warning) => {
    if (!warning || typeof warning !== "object") return warning;
    const { score_impact: _scoreImpact, ...rest } = warning as Record<
      string,
      unknown
    >;
    return rest;
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const expected = Deno.env.get("GSA_HUMI_DEMO_SECRET")?.trim() || "";
    const provided = extractBearer(req);

    if (!expected) {
      return jsonResponse(
        {
          success: false,
          error: "Server misconfigured: GSA_HUMI_DEMO_SECRET is not set",
        },
        500,
      );
    }

    if (!provided || !secretsEqual(provided, expected)) {
      return jsonResponse(
        {
          success: false,
          error: "Unauthorized. Valid Bearer token required.",
          error_code: "UNAUTHORIZED",
        },
        401,
      );
    }

    const url = new URL(req.url);
    const canonical_slug = url.searchParams.get("canonical_slug")?.trim();
    const lang = (url.searchParams.get("lang") || "eng").toLowerCase();

    if (!canonical_slug) {
      return jsonResponse(
        { success: false, error: "canonical_slug is required" },
        400,
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: agent, error: agentError } = await supabase
      .schema("web_dashboard")
      .from("agents")
      .select(`
        id,
        canonical_slug:on_chain_id,
        name,
        description,
        agent_warnings,
        ai_category_primary,
        ai_category_purpose,
        ai_category_confidence,
        metadata_richness_score,
        metadata_richness_category,
        realness_status,
        realness_score
      `)
      .eq("on_chain_id", canonical_slug)
      .single();

    if (agentError || !agent) {
      return jsonResponse(
        { success: false, error: "Agent not found" },
        400,
      );
    }

    const { data: humi, error: humiError } = await supabase
      .schema("web_dashboard")
      .from("index_humi")
      .select(`
        humi_score,
        madurity_level,
        current_humi_score_calculated_at,
        pillar_history_score,
        pillar_history_summary,
        pillar_information_score,
        pillar_information_summary,
        pillar_measure_score,
        pillar_measure_summary,
        pillar_usage_score,
        pillar_usage_summary
      `)
      .eq("agent_id", agent.id)
      .maybeSingle();

    if (humiError) {
      return jsonResponse(
        {
          success: false,
          error: "Error fetching HUMI index",
          details: humiError.message,
        },
        500,
      );
    }

    if (!humi) {
      return jsonResponse(
        { success: false, error: "Index HUMI not found" },
        400,
      );
    }

    const { data: maturityDetails } = await supabase
      .schema("web_dashboard")
      .from("index_madurity_details")
      .select("*")
      .eq("index", "humi")
      .eq("madurity_level", humi.madurity_level)
      .maybeSingle();

    const useEng = lang !== "esp";
    const summary = maturityDetails
      ? {
          user_description: useEng
            ? maturityDetails.user_description_eng
            : maturityDetails.user_description_esp,
          confidence_level: useEng
            ? maturityDetails.confidence_level_eng
            : maturityDetails.confidence_level_esp,
          risk: useEng ? maturityDetails.risk_eng : maturityDetails.risk_esp,
        }
      : {
          user_description: null,
          confidence_level: null,
          risk: null,
        };

    return jsonResponse({
      success: true,
      data: {
        agent: {
          canonical_slug: agent.canonical_slug,
          name: agent.name,
          description: agent.description,
          agent_warnings: cleanWarnings(agent.agent_warnings),
          ai_category_primary: agent.ai_category_primary,
          ai_category_purpose: agent.ai_category_purpose,
          ai_category_confidence: agent.ai_category_confidence,
          metadata_richness_score: agent.metadata_richness_score,
          metadata_richness_category: agent.metadata_richness_category,
          realness_status: agent.realness_status,
          realness_score: agent.realness_score,
        },
        humi: {
          score: humi.humi_score,
          madurity_level: humi.madurity_level,
          calculated_at: humi.current_humi_score_calculated_at,
          summary,
          pillars: {
            history: {
              score: humi.pillar_history_score,
              summary: humi.pillar_history_summary,
            },
            information: {
              score: humi.pillar_information_score,
              summary: humi.pillar_information_summary,
            },
            measure: {
              score: humi.pillar_measure_score,
              summary: humi.pillar_measure_summary,
            },
            usage: {
              score: humi.pillar_usage_score,
              summary: humi.pillar_usage_summary,
            },
          },
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ success: false, error: message }, 400);
  }
});
