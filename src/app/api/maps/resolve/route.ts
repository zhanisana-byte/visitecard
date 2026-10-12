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
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname.toLowerCase());
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

    let currentUrl = source;
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; VisiteCard/1.0)" },
      });

      const location = response.headers.get("location");
      if (response.status >= 300 && response.status < 400 && location) {
        const nextUrl = new URL(location, currentUrl).toString();
        if (!isAllowedGoogleMapsUrl(nextUrl)) {
          return NextResponse.json({ finalUrl: currentUrl, placeName: placeNameFromUrl(currentUrl) });
        }
        currentUrl = nextUrl;
        continue;
      }
      break;
    }

    return NextResponse.json({ finalUrl: currentUrl, placeName: placeNameFromUrl(currentUrl) });
  } catch {
    return NextResponse.json({ error: "Résolution du lien impossible." }, { status: 502 });
  }
}
