import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ error: "Server is not configured" }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const body = await req.json().catch(() => null);
  const battleId = body?.battleId as string | undefined;
  if (!battleId) return Response.json({ error: "battleId is required" }, { status: 400 });

  const { data: battle, error: battleError } = await admin
    .from("battles")
    .select("id, phone_a_id, phone_b_id, status")
    .eq("id", battleId)
    .single();
  if (battleError || !battle) return Response.json({ error: "Battle not found" }, { status: 404 });
  if (battle.status === "finished") return Response.json({ error: "Battle already finished" }, { status: 409 });

  const { data: defs, error: defsError } = await admin
    .from("specification_definitions")
    .select("id,key,name,category,comparison_direction,default_weight,model_version");
  if (defsError) return Response.json({ error: defsError.message }, { status: 500 });

  const { data: specs, error: specsError } = await admin
    .from("phone_specifications")
    .select("phone_id,specification_id,numeric_value,confidence")
    .in("phone_id", [battle.phone_a_id, battle.phone_b_id]);
  if (specsError) return Response.json({ error: specsError.message }, { status: 500 });

  const byPhone = new Map<string, Map<string, { value: number; confidence: number }>>();
  for (const row of specs ?? []) {
    if (row.numeric_value == null) continue;
    if (!byPhone.has(row.phone_id)) byPhone.set(row.phone_id, new Map());
    byPhone.get(row.phone_id)!.set(row.specification_id, {
      value: Number(row.numeric_value),
      confidence: row.confidence == null ? 1 : Number(row.confidence),
    });
  }

  const a = byPhone.get(battle.phone_a_id) ?? new Map();
  const b = byPhone.get(battle.phone_b_id) ?? new Map();
  const categoryBuckets = new Map<string, { a: number; b: number; weight: number }[]>();
  let comparable = 0;
  let unknown = 0;
  let confidenceSum = 0;

  for (const def of defs ?? []) {
    const av = a.get(def.id);
    const bv = b.get(def.id);
    if (!av || !bv) {
      unknown++;
      continue;
    }
    const min = Math.min(av.value, bv.value);
    const max = Math.max(av.value, bv.value);
    let sa = 0.5;
    let sb = 0.5;
    if (max !== min) {
      const higher = def.comparison_direction === "higher";
      sa = higher ? (av.value - min) / (max - min) : (max - av.value) / (max - min);
      sb = higher ? (bv.value - min) / (max - min) : (max - bv.value) / (max - min);
    }
    const weight = Number(def.default_weight ?? 1);
    const bucket = categoryBuckets.get(def.category) ?? [];
    bucket.push({ a: sa, b: sb, weight });
    categoryBuckets.set(def.category, bucket);
    comparable++;
    confidenceSum += (av.confidence + bv.confidence) / 2;
  }

  const categories: Record<string, { scoreA: number; scoreB: number; winner: string }> = {};
  for (const [category, items] of categoryBuckets) {
    const total = items.reduce((sum, x) => sum + x.weight, 0) || 1;
    const scoreA = items.reduce((sum, x) => sum + x.a * x.weight, 0) / total;
    const scoreB = items.reduce((sum, x) => sum + x.b * x.weight, 0) / total;
    categories[category] = {
      scoreA,
      scoreB,
      winner: scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "DRAW",
    };
  }

  const categoryValues = Object.values(categories);
  const overallA = categoryValues.length ? categoryValues.reduce((s, x) => s + x.scoreA, 0) / categoryValues.length : 0;
  const overallB = categoryValues.length ? categoryValues.reduce((s, x) => s + x.scoreB, 0) / categoryValues.length : 0;
  const winner = overallA > overallB ? "A" : overallB > overallA ? "B" : "DRAW";
  const confidence = comparable ? confidenceSum / comparable : 0;

  const { error: updateError } = await admin.from("battles").update({
    status: "finished",
    winner,
    overall_score_a: overallA,
    overall_score_b: overallB,
    confidence,
    finished_at: new Date().toISOString(),
  }).eq("id", battleId);
  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

  const { error: resultError } = await admin.from("battle_results").upsert({
    battle_id: battleId,
    comparable_count: comparable,
    unknown_count: unknown,
    category_results: categories,
    explanation: { winner, overallA, overallB, confidence },
  });
  if (resultError) return Response.json({ error: resultError.message }, { status: 500 });

  return Response.json({ battleId, winner, overallA, overallB, confidence, comparable, unknown, categories });
});
