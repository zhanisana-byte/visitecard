import type { Metadata } from "next";
import PublicCardClient from "./PublicCardClient";

type CardMeta = {
  full_name?: string | null;
  job_title?: string | null;
  company?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  cover_url?: string | null;
};

async function getCard(slug: string): Promise<CardMeta | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    const response = await fetch(
      `${url}/rest/v1/cards?slug=eq.${encodeURIComponent(slug)}&is_public=eq.true&select=full_name,job_title,company,bio,photo_url,cover_url&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) return null;
    const rows = await response.json();
    return rows?.[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCard(slug);

  const name = card?.full_name?.trim() || "VisiteCard";
  const title = `${name} | VisiteCard`;
  const description =
    card?.bio?.trim() ||
    [card?.job_title, card?.company].filter(Boolean).join(" · ") ||
    "Découvrez ma carte digitale et tous mes liens.";

  const image =
    card?.cover_url?.startsWith("https://")
      ? card.cover_url
      : card?.photo_url?.startsWith("https://")
      ? card.photo_url
      : undefined;

  return {
    title,
    description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.visitecard.com"
    ),
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: "profile",
      title,
      description,
      url: `/${slug}`,
      siteName: "VisiteCard",
      ...(image ? { images: [{ url: image, alt: name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PublicCardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicCardClient slug={slug} />;
}
