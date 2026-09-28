import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
  "www.google.com",
  "google.com",
  "maps.google.com",
]);

function isAllowedGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      ALLOWED_HOSTS.has(host) ||
      host.endsWith(".google.com") ||
      host.startsWith("maps.google.")
    );
  } catch {
    return false;
  }
}

function placeNameFromUrl(value: string) {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {}

  const place = decoded.match(/\/maps\/place\/([^/?#]+)/i)?.[1];
  return place ? place.replace(/\+/g, " ").trim() : "";
}

export async function GET(request: Request) {
  try {
    const source = new URL(request.url).searchParams.get("url")?.trim() || "";

    if (!source || !isAllowedGoogleMapsUrl(source)) {
      return NextResponse.json({ error: "Lien Google Maps invalide." }, { status: 400 });
    }

    const response = await fetch(source, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VisiteCard/1.0)",
      },
    });

    const finalUrl = response.url || source;

    if (!isAllowedGoogleMapsUrl(finalUrl)) {
      return NextResponse.json({ finalUrl: source, placeName: "" });
    }

    return NextResponse.json({
      finalUrl,
      placeName: placeNameFromUrl(finalUrl),
    });
  } catch {
    return NextResponse.json({ error: "Résolution du lien impossible." }, { status: 502 });
  }
}
