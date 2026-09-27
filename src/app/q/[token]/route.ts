import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Params = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  if (!supabaseUrl || !serviceRoleKey || !token) return NextResponse.redirect(new URL("/", siteUrl));
  try {
    const s = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: card, error } = await s.from("cards").select("id,slug,is_public").eq("qr_token", token).limit(1).maybeSingle();
    if (error || !card?.id || !card?.slug || card.is_public !== true) return NextResponse.redirect(new URL("/", siteUrl));
    const { data: subscription } = await s.from("subscriptions").select("status,end_date").eq("card_id", card.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (subscription) {
      const activeStatus = ["active", "startup", "included"].includes(subscription.status);
      const notExpired = !subscription.end_date || new Date(subscription.end_date).getTime() >= new Date().setHours(0, 0, 0, 0);
      if (!activeStatus || !notExpired) return NextResponse.redirect(new URL("/", siteUrl));
    }
    await s.from("qr_scans").insert({ card_id: card.id, user_agent: request.headers.get("user-agent") || null, referrer: request.headers.get("referer") || null });
    return NextResponse.redirect(new URL(`/${card.slug}`, siteUrl));
  } catch {
    return NextResponse.redirect(new URL("/", siteUrl));
  }
}
