import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!url || !serviceKey || !token) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }

    const { data: cards, error: cardsError } = await admin
      .from("cards")
      .select("id,full_name,company,slug,entity_type,views,social_links,custom_links,vc_reference")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: true });

    if (cardsError) throw cardsError;
    const ids = (cards || []).map((c: any) => c.id);
    if (!ids.length) return NextResponse.json({ cards: [], scans: [], reviews: [] });

    const [scanResult, reviewResult] = await Promise.all([
      admin.from("qr_scans").select("card_id,created_at").in("card_id", ids).order("created_at", { ascending: true }),
      admin.from("card_reviews").select("card_id,rating").in("card_id", ids).eq("status", "published"),
    ]);

    if (scanResult.error) throw scanResult.error;

    return NextResponse.json({
      cards: cards || [],
      scans: scanResult.data || [],
      reviews: reviewResult.error ? [] : (reviewResult.data || []),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur statistiques." }, { status: 500 });
  }
}
