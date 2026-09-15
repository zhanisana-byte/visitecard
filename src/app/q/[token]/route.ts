import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    token: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const { token } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  if (!supabaseUrl || !serviceRoleKey || !token) {
    return NextResponse.redirect(new URL("/", siteUrl));
  }

  try {
    const cardResponse = await fetch(
      `${supabaseUrl}/rest/v1/cards?qr_token=eq.${encodeURIComponent(
        token
      )}&is_public=eq.true&select=id,slug&limit=1`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!cardResponse.ok) {
      return NextResponse.redirect(new URL("/", siteUrl));
    }

    const rows = await cardResponse.json();
    const card = Array.isArray(rows) ? rows[0] : null;

    if (!card?.id || !card?.slug) {
      return NextResponse.redirect(new URL("/", siteUrl));
    }

    await fetch(`${supabaseUrl}/rest/v1/qr_scans`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        card_id: card.id,
        user_agent: request.headers.get("user-agent") || null,
        referrer: request.headers.get("referer") || null,
      }),
    });

    return NextResponse.redirect(new URL(`/${card.slug}`, siteUrl));
  } catch {
    return NextResponse.redirect(new URL("/", siteUrl));
  }
}
