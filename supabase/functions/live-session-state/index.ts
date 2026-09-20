import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-greywake-code, x-greywake-character",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
};

const CODES: Record<string,string> = { marek:"MAREK", velmira:"VELMIRA", odie:"ODIE", gm:"GREYWAKE" };
const validCharacters = new Set(["marek","velmira","odie"]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type":"application/json" } });
}
function identity(req: Request) {
  const character = String(req.headers.get("x-greywake-character") ?? "").trim().toLowerCase();
  const code = String(req.headers.get("x-greywake-code") ?? "").trim().toUpperCase();
  const ok = character === "gm" ? code === CODES.gm : validCharacters.has(character) && code === CODES[character];
  return { character, ok };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const auth = identity(req);
  if (!auth.ok) return json({ error:"Invalid Greywake access code." }, 403);
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return json({ error:"Server configuration missing." }, 500);
  const db = createClient(url, key, { auth:{ persistSession:false, autoRefreshToken:false } });
  try {
    if (req.method === "GET") {
      const { data, error } = await db.from("campaign_live_state").select("fear,updated_at").eq("state_key","greywake-main").single();
      if (error) throw error;
      return json({ fear:data.fear, max_fear:12, updated_at:data.updated_at });
    }
    if (req.method === "PATCH") {
      if (auth.character !== "gm") return json({ error:"Only the GM can change Fear." }, 403);
      const body = await req.json();
      const fear = Number(body.fear);
      if (!Number.isInteger(fear) || fear < 0 || fear > 12) return json({ error:"Fear must be a whole number from 0 to 12." }, 400);
      const { data, error } = await db.from("campaign_live_state").update({ fear, updated_at:new Date().toISOString() }).eq("state_key","greywake-main").select("fear,updated_at").single();
      if (error) throw error;
      return json({ fear:data.fear, max_fear:12, updated_at:data.updated_at });
    }
    return json({ error:"Method not allowed." }, 405);
  } catch (error) {
    console.error(error);
    return json({ error:error instanceof Error ? error.message : "Unexpected error." }, 500);
  }
});