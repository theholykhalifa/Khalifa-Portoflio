// supabase/functions/ban-user/index.ts
// Real ban enforcement: verifies a deploy-time admin secret, then
// bans/unbans via the Auth Admin API (service_role, server-side only).
// Deploy: supabase functions deploy ban-user  (see SUPABASE_SETUP.md)
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") {
    return Response.json({ error: "POST only" }, { status: 405, headers: CORS });
  }
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== Deno.env.get("ADMIN_SECRET")) {
    return Response.json({ error: "denied" }, { status: 401, headers: CORS });
  }
  let body: { action?: string; user_id?: string; hours?: number; reason?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad JSON" }, { status: 400, headers: CORS });
  }
  if (!body.user_id) {
    return Response.json({ error: "user_id required" }, { status: 400, headers: CORS });
  }
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  if (body.action === "unban") {
    const { error } = await admin.auth.admin.updateUserById(body.user_id, {
      ban_duration: "none",
    });
    if (error) return Response.json({ error: error.message }, { status: 500, headers: CORS });
    await admin.from("bans").delete().eq("user_id", body.user_id);
    return Response.json({ result: "unbanned " + body.user_id }, { headers: CORS });
  }
  // moderation: delete one score row / wipe one operative's scores
  if (body.action === "delete_score") {
    const { error } = await admin.from("scores").delete().eq("id", Number(body.score_id));
    if (error) return Response.json({ error: error.message }, { status: 500, headers: CORS });
    return Response.json({ result: "deleted score #" + body.score_id }, { headers: CORS });
  }
  if (body.action === "wipe_scores") {
    if (!body.user_id) return Response.json({ error: "user_id required" }, { status: 400, headers: CORS });
    const { error, count } = await admin.from("scores").delete({ count: "exact" }).eq("user_id", body.user_id);
    if (error) return Response.json({ error: error.message }, { status: 500, headers: CORS });
    return Response.json({ result: `wiped ${count ?? "?"} score(s)` }, { headers: CORS });
  }
  // default: ban
  const hours = Number(body.hours) || 0;
  const duration = hours > 0 ? `${hours}h` : "87600h"; // 0 = ~10 years (permanent)
  const { error } = await admin.auth.admin.updateUserById(body.user_id, {
    ban_duration: duration,
  });
  if (error) return Response.json({ error: error.message }, { status: 500, headers: CORS });
  await admin.from("bans").upsert({
    user_id: body.user_id,
    reason: body.reason || "",
    until: hours > 0 ? new Date(Date.now() + hours * 36e5).toISOString() : null,
  });
  return Response.json(
    { result: `banned ${body.user_id} for ${hours > 0 ? hours + "h" : "permanent"}` },
    { headers: CORS },
  );
});
