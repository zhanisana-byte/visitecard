import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PublicCardClient from "./PublicCardClient";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export default async function PublicCardPage({ params }: PageProps) {
  const { slug } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return <PublicCardClient slug={slug} />;
  const s = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: card } = await s.from("cards").select("id,is_public").eq("slug", slug).limit(1).maybeSingle();
  if (!card?.id || card.is_public !== true) redirect("/");
  const { data: subscription } = await s.from("subscriptions").select("status,end_date").eq("card_id", card.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (subscription) {
    const activeStatus = ["active", "startup", "included"].includes(subscription.status);
    const notExpired = !subscription.end_date || new Date(subscription.end_date).getTime() >= new Date().setHours(0, 0, 0, 0);
    if (!activeStatus || !notExpired) redirect("/");
  }
  return <PublicCardClient slug={slug} />;
}
