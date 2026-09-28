import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type EntityType = "profile" | "company";

function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Configuration Supabase manquante.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function addDuration(start: Date, value: number, unit: "day" | "month" | "year") {
  const result = new Date(start);

  if (unit === "day") {
    result.setUTCDate(result.getUTCDate() + value);
  } else if (unit === "year") {
    result.setUTCFullYear(result.getUTCFullYear() + value);
  } else {
    result.setUTCMonth(result.getUTCMonth() + value);
  }

  return result;
}

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const token = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim();

    if (!token) {
      return NextResponse.json({ error: "Session manquante." }, { status: 401 });
    }

    const body = await request.json();
    const cardId = String(body.card_id || "").trim();

    if (!cardId) {
      return NextResponse.json({ error: "Carte manquante." }, { status: 400 });
    }

    const s = adminDb();
    const { data: authData, error: authError } = await s.auth.getUser(token);

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }

    const { data: card, error: cardError } = await s
      .from("cards")
      .select("id,user_id,entity_type")
      .eq("id", cardId)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (cardError) throw cardError;

    if (!card) {
      return NextResponse.json({ error: "Carte introuvable." }, { status: 404 });
    }

    const entityType: EntityType = card.entity_type === "profile" ? "profile" : "company";

    const { data: existing, error: existingError } = await s
      .from("subscriptions")
      .select("id,status,end_date")
      .eq("card_id", card.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return NextResponse.json({ subscription: existing, created: false });
    }

    const { data: settings, error: settingsError } = await s
      .from("vc_billing_settings")
      .select("startup_offer_enabled,startup_duration_value,startup_duration_unit,startup_apply_to_profiles,startup_apply_to_companies")
      .limit(1)
      .maybeSingle();

    if (settingsError) throw settingsError;

    const startupEnabled = settings?.startup_offer_enabled === true;
    const applies =
      entityType === "profile"
        ? settings?.startup_apply_to_profiles !== false
        : settings?.startup_apply_to_companies !== false;

    if (!startupEnabled || !applies) {
      return NextResponse.json({ applied: false, reason: "startup_offer_disabled" });
    }

    const durationValue = Math.max(1, Number(settings?.startup_duration_value || 1));
    const durationUnit: "day" | "month" | "year" =
      settings?.startup_duration_unit === "day"
        ? "day"
        : settings?.startup_duration_unit === "year"
          ? "year"
          : "month";

    const start = new Date();
    const end = addDuration(start, durationValue, durationUnit);

    const payload = {
      user_id: authData.user.id,
      card_id: card.id,
      account_type: entityType,
      status: "startup",
      plan_code: "STARTUP",
      currency: "TND",
      price_ht: 0,
      tax_rate: 0,
      start_date: toDateOnly(start),
      end_date: toDateOnly(end),
      startup_months: durationUnit === "month" ? durationValue : 0,
      auto_renew: false,
      notes: `Offre de démarrage automatique : ${durationValue} ${durationUnit}`,
    };

    const { data: subscription, error: insertError } = await s
      .from("subscriptions")
      .insert(payload)
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ applied: true, created: true, subscription }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Impossible d'activer l'offre de démarrage." },
      { status: 500 }
    );
  }
}
