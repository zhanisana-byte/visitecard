import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Configuration Supabase admin manquante.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function allowed() {
  const c = await cookies();
  return verifyAdminSession(c.get(ADMIN_COOKIE)?.value);
}

function addDuration(start: Date, value: number, unit: string) {
  const d = new Date(start);
  if (unit === "day") d.setDate(d.getDate() + value);
  else if (unit === "year") d.setFullYear(d.getFullYear() + value);
  else d.setMonth(d.getMonth() + value);
  return d;
}

export async function GET() {
  try {
    if (!(await allowed())) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    const s = db();
    const [{ data: requests, error: requestsError }, { data: items, error: itemsError }, { data: cards, error: cardsError }, { data: offers, error: offersError }, { data: agents, error: agentsError }] = await Promise.all([
      s.from("vc_payment_requests").select("*").order("created_at", { ascending: false }),
      s.from("vc_payment_request_items").select("*"),
      s.from("cards").select("id,user_id,full_name,company,email,entity_type,slug,vc_reference"),
      s.from("vc_offers").select("*"),
      s.from("vc_payment_agents").select("id,name,commercial_code,country_name,region,city"),
    ]);
    if (requestsError) throw requestsError;
    if (itemsError) throw itemsError;
    if (cardsError) throw cardsError;
    if (offersError) throw offersError;
    if (agentsError) throw agentsError;
    const cardMap = new Map((cards || []).map((x: any) => [x.id, x]));
    const offerMap = new Map((offers || []).map((x: any) => [x.id, x]));
    const agentMap = new Map((agents || []).map((x: any) => [x.id, x]));
    const rows = (requests || []).map((r: any) => ({ ...r, agent: r.agent_id ? agentMap.get(r.agent_id) || null : null, items: (items || []).filter((i: any) => (i.payment_request_id || i.request_id) === r.id).map((i: any) => ({ ...i, card: cardMap.get(i.card_id) || null, offer: offerMap.get(i.offer_id) || null })) }));
    return NextResponse.json({ payments: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await allowed())) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "Demande manquante." }, { status: 400 });
    const action = body.action === "reject" ? "reject" : "confirm";
    const s = db();
    const { data: payment, error: paymentError } = await s.from("vc_payment_requests").select("*").eq("id", body.id).single();
    if (paymentError) throw paymentError;
    if (action === "reject") {
      const { data, error } = await s.from("vc_payment_requests").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", body.id).select().single();
      if (error) throw error;
      return NextResponse.json({ payment: data });
    }
    const { data: allItems, error: itemsError } = await s.from("vc_payment_request_items").select("*");
    if (itemsError) throw itemsError;
    const items = (allItems || []).filter((item: any) => (item.payment_request_id || item.request_id) === body.id);
    const now = new Date();
    for (const item of items || []) {
      const { data: card, error: cardError } = await s.from("cards").select("id,user_id,entity_type,vc_reference").eq("id", item.card_id).single();
      if (cardError) throw cardError;
      const { data: offer, error: offerError } = await s.from("vc_offers").select("*").eq("id", item.offer_id).single();
      if (offerError) throw offerError;
      const end = addDuration(now, Math.max(1, Number(offer.duration_value || 1)), offer.duration_unit || "year");
      const { data: existing, error: existingError } = await s.from("subscriptions").select("id").eq("card_id", card.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (existingError) throw existingError;
      const subscriptionPayload: any = {
        user_id: card.user_id,
        card_id: card.id,
        account_type: card.entity_type === "profile" ? "profile" : "company",
        status: "active",
        plan_code: offer.code || "PRO",
        currency: payment.currency,
        price_ht: Number(item.price_snapshot ?? item.total_price ?? item.unit_price ?? 0),
        tax_rate: 0,
        start_date: now.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
        startup_months: 0,
        auto_renew: false,
        payment_method: payment.payment_method,
        payment_reference: payment.payment_reference || payment.vc_reference,
        vc_reference: card.vc_reference,
        offer_id: offer.id,
        last_payment_request_id: payment.id,
        updated_at: now.toISOString(),
      };
      if (existing?.id) {
        const { error } = await s.from("subscriptions").update(subscriptionPayload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await s.from("subscriptions").insert(subscriptionPayload);
        if (error) throw error;
      }
    }
    const historyPayload: any = {
      user_id: payment.user_id,
      payment_request_id: payment.id,
      payment_reference: payment.payment_reference || payment.vc_reference,
      vc_reference: payment.vc_reference || payment.payment_reference,
      amount: Number(payment.amount ?? payment.total_amount ?? 0),
      currency: payment.currency,
      payment_method: payment.payment_method,
      status: "paid",
      paid_at: now.toISOString(),
      created_at: now.toISOString(),
    };
    const { error: historyError } = await s.from("vc_payment_history").insert(historyPayload);
    if (historyError) throw historyError;
    const { data: updated, error: updateError } = await s.from("vc_payment_requests").update({ status: "paid", paid_at: now.toISOString(), updated_at: now.toISOString() }).eq("id", body.id).select().single();
    if (updateError) throw updateError;
    return NextResponse.json({ payment: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Validation impossible." }, { status: 500 });
  }
}
