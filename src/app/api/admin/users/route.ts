import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquante.");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function isAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

function makeSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "card";
}

async function getUniqueSlug(supabase: ReturnType<typeof getSupabaseAdmin>, value: string) {
  const base = makeSlug(value);
  let candidate = base;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("cards")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) throw error;
    if (!data) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function GET() {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Accès administrateur refusé." }, { status: 403 });
    const supabase = getSupabaseAdmin();
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) throw usersError;

    const { data: cards, error: cardsError } = await supabase
      .from("cards")
      .select("id,user_id,slug,full_name,job_title,company,email,photo_url,entity_type,is_public,created_at")
      .order("created_at", { ascending: false });
    if (cardsError) throw cardsError;

    const { data: links, error: linksError } = await supabase
      .from("profile_company_links")
      .select("id,profile_card_id,company_card_id,position_title,created_at");
    if (linksError) console.error("profile_company_links:", linksError);

    const cardByUser = new Map((cards || []).map((card: any) => [card.user_id, card]));
    const cardById = new Map((cards || []).map((card: any) => [card.id, card]));
    const linksByProfile = new Map<string, any[]>();

    for (const link of links || []) {
      const company = cardById.get(link.company_card_id) as any;
      if (!company) continue;
      const current = linksByProfile.get(link.profile_card_id) || [];
      current.push({
        id: link.id,
        position_title: link.position_title || "",
        company_card_id: company.id,
        company_name: company.full_name || company.company || "Société",
        company_slug: company.slug || null,
        company_photo_url: company.photo_url || null,
      });
      linksByProfile.set(link.profile_card_id, current);
    }

    const users = usersData.users.map((user) => {
      const card: any = cardByUser.get(user.id);
      return {
        id: user.id,
        email: user.email || card?.email || "",
        name: card?.full_name || user.user_metadata?.name || user.user_metadata?.full_name || "",
        created_at: user.created_at,
        card_id: card?.id || null,
        card_slug: card?.slug || null,
        entity_type: card?.entity_type === "profile" ? "profile" : "company",
        job_title: card?.job_title || "",
        company: card?.company || "",
        photo_url: card?.photo_url || null,
        is_public: card?.is_public === true,
        linked_companies: card?.entity_type === "profile" ? linksByProfile.get(card.id) || [] : [],
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ users }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
  } catch (error: any) {
    console.error("ADMIN GET USERS:", error);
    return NextResponse.json({ error: error?.message || "Impossible de charger les utilisateurs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Accès administrateur refusé." }, { status: 403 });
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const entityType = body?.entity_type === "company" ? "company" : "profile";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "L'adresse e-mail n'est pas valide." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, entity_type: entityType } });
    if (error) throw error;
    if (!data.user) throw new Error("Utilisateur non créé.");

    const user = data.user;
    await supabase.from("profiles").upsert({ id: user.id, name: name || email.split("@")[0], email, updated_at: new Date().toISOString() }, { onConflict: "id" });
    const slug = await getUniqueSlug(supabase, name || email.split("@")[0]);
    const { error: cardError } = await supabase.from("cards").insert({
      user_id: user.id,
      slug,
      full_name: name || email.split("@")[0],
      email,
      entity_type: entityType,
      is_public: true,
      show_qr: true,
      show_reviews: entityType === "company",
      show_email: true,
      show_phone: true,
      show_address: entityType === "company",
      language: "fr",
      theme: "dark",
      primary_color: "#6D4AFF",
      background_color: "#071521",
      led_enabled: true,
      led_color: "#6D4AFF",
      social_links: [],
      custom_links: [],
    });
    if (cardError) throw cardError;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    console.error("ADMIN CREATE USER:", error);
    return NextResponse.json({ error: error?.message || "Impossible de créer l'utilisateur." }, { status: 500 });
  }
}
