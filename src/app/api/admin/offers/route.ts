import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Configuration Supabase admin manquante.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function allowed() {
  const c = await cookies();
  return verifyAdminSession(c.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  try {
    if (!(await allowed())) {
      return NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 }
      );
    }

    const s = db();

    const [
      { data: offers, error: offersError },
      { data: settings, error: settingsError },
    ] = await Promise.all([
      s
        .from("vc_offers")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),

      s
        .from("vc_billing_settings")
        .select("*")
        .limit(1)
        .maybeSingle(),
    ]);

    if (offersError) throw offersError;
    if (settingsError) throw settingsError;

    return NextResponse.json({
      offers: offers || [],
      settings: settings || null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!(await allowed())) {
      return NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const s = db();

    if (body.action === "create_offer") {
      const name = String(body.name || "").trim();
      const code = String(body.code || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_]+/g, "_");

      if (!name) {
        return NextResponse.json(
          { error: "Nom de l'offre obligatoire." },
          { status: 400 }
        );
      }

      if (!code) {
        return NextResponse.json(
          { error: "Code de l'offre obligatoire." },
          { status: 400 }
        );
      }

      const entityType = ["profile", "company", "bundle"].includes(
        body.entity_type
      )
        ? body.entity_type
        : "profile";

      const durationUnit = ["day", "month", "year"].includes(
        body.duration_unit
      )
        ? body.duration_unit
        : "year";

      const payload = {
        name,
        code,
        entity_type: entityType,
        profile_count:
          entityType === "profile"
            ? 1
            : entityType === "bundle"
            ? Math.max(0, Number(body.profile_count || 0))
            : 0,
        company_count:
          entityType === "company"
            ? 1
            : entityType === "bundle"
            ? Math.max(0, Number(body.company_count || 0))
            : 0,
        duration_value: Math.max(
          1,
          Number(body.duration_value || 1)
        ),
        duration_unit: durationUnit,
        price_tnd:
          body.price_tnd === "" ||
          body.price_tnd === null ||
          body.price_tnd === undefined
            ? null
            : Number(body.price_tnd),
        price_eur:
          body.price_eur === "" ||
          body.price_eur === null ||
          body.price_eur === undefined
            ? null
            : Number(body.price_eur),
        promo_enabled: Boolean(body.promo_enabled),
        promo_price_tnd:
          body.promo_price_tnd === "" ||
          body.promo_price_tnd === null ||
          body.promo_price_tnd === undefined
            ? null
            : Number(body.promo_price_tnd),
        promo_price_eur:
          body.promo_price_eur === "" ||
          body.promo_price_eur === null ||
          body.promo_price_eur === undefined
            ? null
            : Number(body.promo_price_eur),
        promo_start_at: body.promo_start_at || null,
        promo_end_at: body.promo_end_at || null,
        is_active:
          typeof body.is_active === "boolean"
            ? body.is_active
            : true,
        sort_order: Number(body.sort_order || 0),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await s
        .from("vc_offers")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json(
        { offer: data },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Action invalide." },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await allowed())) {
      return NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const s = db();

    if (body.type === "settings") {
      const { data: current, error: currentError } = await s
        .from("vc_billing_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (currentError) throw currentError;

      const payload = {
        startup_offer_enabled: Boolean(
          body.startup_offer_enabled
        ),
        startup_duration_value: Math.max(
          1,
          Number(body.startup_duration_value || 1)
        ),
        startup_duration_unit:
          body.startup_duration_unit === "day"
            ? "day"
            : "month",
        payment_agent_enabled: Boolean(
          body.payment_agent_enabled
        ),
        payment_bank_enabled: Boolean(
          body.payment_bank_enabled
        ),
        payment_online_enabled: Boolean(
          body.payment_online_enabled
        ),
        updated_at: new Date().toISOString(),
      };

      if (current?.id) {
        const { data, error } = await s
          .from("vc_billing_settings")
          .update(payload)
          .eq("id", current.id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          settings: data,
        });
      }

      const { data, error } = await s
        .from("vc_billing_settings")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        settings: data,
      });
    }

    if (body.type === "offer") {
      if (!body.id) {
        return NextResponse.json(
          { error: "ID de l'offre manquant." },
          { status: 400 }
        );
      }

      const entityType = ["profile", "company", "bundle"].includes(
        body.entity_type
      )
        ? body.entity_type
        : "profile";

      const durationUnit = ["day", "month", "year"].includes(
        body.duration_unit
      )
        ? body.duration_unit
        : "year";

      const patch = {
        name: String(body.name || "").trim(),
        entity_type: entityType,
        profile_count:
          entityType === "profile"
            ? 1
            : entityType === "bundle"
            ? Math.max(0, Number(body.profile_count || 0))
            : 0,
        company_count:
          entityType === "company"
            ? 1
            : entityType === "bundle"
            ? Math.max(0, Number(body.company_count || 0))
            : 0,
        duration_value: Math.max(
          1,
          Number(body.duration_value || 1)
        ),
        duration_unit: durationUnit,
        price_tnd:
          body.price_tnd === "" ||
          body.price_tnd === null ||
          body.price_tnd === undefined
            ? null
            : Number(body.price_tnd),
        price_eur:
          body.price_eur === "" ||
          body.price_eur === null ||
          body.price_eur === undefined
            ? null
            : Number(body.price_eur),
        promo_enabled: Boolean(body.promo_enabled),
        promo_price_tnd:
          body.promo_price_tnd === "" ||
          body.promo_price_tnd === null ||
          body.promo_price_tnd === undefined
            ? null
            : Number(body.promo_price_tnd),
        promo_price_eur:
          body.promo_price_eur === "" ||
          body.promo_price_eur === null ||
          body.promo_price_eur === undefined
            ? null
            : Number(body.promo_price_eur),
        promo_start_at: body.promo_start_at || null,
        promo_end_at: body.promo_end_at || null,
        is_active: Boolean(body.is_active),
        sort_order: Number(body.sort_order || 0),
        updated_at: new Date().toISOString(),
      };

      if (!patch.name) {
        return NextResponse.json(
          { error: "Nom de l'offre obligatoire." },
          { status: 400 }
        );
      }

      const { data, error } = await s
        .from("vc_offers")
        .update(patch)
        .eq("id", body.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        offer: data,
      });
    }

    return NextResponse.json(
      { error: "Type de modification invalide." },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur" },
      { status: 500 }
    );
  }
}
