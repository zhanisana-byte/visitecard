import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function db() {
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

async function allowed() {
  const c = await cookies();
  return verifyAdminSession(c.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  try {
    if (!(await allowed())) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const s = db();

    const [
      { data: banks, error: banksError },
      { data: agents, error: agentsError },
    ] = await Promise.all([
      s
        .from("vc_bank_accounts")
        .select("*")
        .order("currency", { ascending: true })
        .order("created_at", { ascending: true }),

      s
        .from("vc_payment_agents")
        .select("*")
        .order("country_name", { ascending: true })
        .order("region", { ascending: true })
        .order("name", { ascending: true }),
    ]);

    if (banksError) throw banksError;
    if (agentsError) throw agentsError;

    return NextResponse.json({
      banks: banks || [],
      agents: agents || [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!(await allowed())) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const body = await req.json();
    const s = db();

    if (body.type === "bank") {
      const currency = body.currency === "EUR" ? "EUR" : "TND";

      const payload = {
        label: String(body.label || "").trim() || null,
        beneficiary_name:
          String(body.beneficiary_name || "").trim() || "Sana Zhani",
        bank_name: String(body.bank_name || "").trim(),
        currency,
        rib: String(body.rib || "").trim() || null,
        iban: String(body.iban || "").trim() || null,
        bic_swift: String(body.bic_swift || "").trim() || null,
        instructions_fr: String(body.instructions_fr || "").trim() || null,
        instructions_en: String(body.instructions_en || "").trim() || null,
        is_active:
          typeof body.is_active === "boolean" ? body.is_active : true,
        updated_at: new Date().toISOString(),
      };

      if (!payload.bank_name) {
        return NextResponse.json(
          { error: "Nom de la banque obligatoire." },
          { status: 400 }
        );
      }

      const { data, error } = await s
        .from("vc_bank_accounts")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ bank: data }, { status: 201 });
    }

    if (body.type === "agent") {
      const payload = {
        name: String(body.name || "").trim(),
        commercial_code:
          String(body.commercial_code || "").trim().toUpperCase() || null,
        country_code:
          String(body.country_code || "").trim().toUpperCase(),
        country_name: String(body.country_name || "").trim(),
        region: String(body.region || "").trim() || null,
        city: String(body.city || "").trim() || null,
        whatsapp: String(body.whatsapp || "").trim() || null,
        phone: String(body.phone || "").trim() || null,
        is_active:
          typeof body.is_active === "boolean" ? body.is_active : true,
        updated_at: new Date().toISOString(),
      };

      if (!payload.name || !payload.country_code || !payload.country_name) {
        return NextResponse.json(
          { error: "Nom et pays obligatoires." },
          { status: 400 }
        );
      }

      const { data, error } = await s
        .from("vc_payment_agents")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ agent: data }, { status: 201 });
    }

    return NextResponse.json(
      { error: "Type invalide." },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await allowed())) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const body = await req.json();
    const s = db();

    if (!body.id) {
      return NextResponse.json(
        { error: "Identifiant manquant." },
        { status: 400 }
      );
    }

    if (body.type === "bank") {
      const payload = {
        label: String(body.label || "").trim() || null,
        beneficiary_name:
          String(body.beneficiary_name || "").trim() || "Sana Zhani",
        bank_name: String(body.bank_name || "").trim(),
        currency: body.currency === "EUR" ? "EUR" : "TND",
        rib: String(body.rib || "").trim() || null,
        iban: String(body.iban || "").trim() || null,
        bic_swift: String(body.bic_swift || "").trim() || null,
        instructions_fr: String(body.instructions_fr || "").trim() || null,
        instructions_en: String(body.instructions_en || "").trim() || null,
        is_active: Boolean(body.is_active),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await s
        .from("vc_bank_accounts")
        .update(payload)
        .eq("id", body.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ bank: data });
    }

    if (body.type === "agent") {
      const payload = {
        name: String(body.name || "").trim(),
        commercial_code:
          String(body.commercial_code || "").trim().toUpperCase() || null,
        country_code:
          String(body.country_code || "").trim().toUpperCase(),
        country_name: String(body.country_name || "").trim(),
        region: String(body.region || "").trim() || null,
        city: String(body.city || "").trim() || null,
        whatsapp: String(body.whatsapp || "").trim() || null,
        phone: String(body.phone || "").trim() || null,
        is_active: Boolean(body.is_active),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await s
        .from("vc_payment_agents")
        .update(payload)
        .eq("id", body.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ agent: data });
    }

    return NextResponse.json(
      { error: "Type invalide." },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await allowed())) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Identifiant manquant." },
        { status: 400 }
      );
    }

    const s = db();

    if (body.type === "bank") {
      const { error } = await s
        .from("vc_bank_accounts")
        .delete()
        .eq("id", body.id);

      if (error) throw error;

      return NextResponse.json({ ok: true });
    }

    if (body.type === "agent") {
      const { error } = await s
        .from("vc_payment_agents")
        .delete()
        .eq("id", body.id);

      if (error) throw error;

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Type invalide." },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur." },
      { status: 500 }
    );
  }
}
