"use client";

import { useEffect, useMemo, useState } from "react";

type SocialType =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "tiktok"
  | "linkedin"
  | "youtube"
  | "x"
  | "website"
  | "custom";

type SocialLink = {
  id: string;
  type: SocialType;
  label: string;
  value: string;
};

type WifiPosition = "bottom-left" | "bottom-center" | "bottom-right";

type CustomLink = {
  id: string;
  label: string;
  url: string;
  kind?: "link" | "location" | "wifi";
  image_url?: string;
  enabled?: boolean;
  ssid?: string;
  password?: string;
  wifi_position?: WifiPosition;
};

type CardRow = {
  id: string;
  slug: string;
  qr_token?: string;
  full_name?: string;
  job_title?: string;
  company?: string;
  bio?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  photo_url?: string;
  cover_url?: string;
  primary_color?: string;
  background_color?: string;
  button_color?: string;
  button_text_color?: string;
  button_border_color?: string;
  theme?: "light" | "dark";
  language?: "fr" | "en";
  is_public?: boolean;
  show_qr?: boolean;
  show_email?: boolean;
  show_phone?: boolean;
  show_address?: boolean;
  led_enabled?: boolean;
  led_color?: string;
  show_reviews?: boolean;
  social_links?: SocialLink[];
  custom_links?: CustomLink[];
  entity_type?: "profile" | "company";
  google_reviews_enabled?: boolean;
  google_reviews_url?: string;
  google_reviews_button_mode?: "view" | "write";
  google_reviews_label_fr?: string;
  google_reviews_label_en?: string;
  google_reviews_button_color?: string;
  google_reviews_text_color?: string;
  google_rating?: number | null;
  google_reviews_count?: number | null;
  catalog_enabled?: boolean;
  catalog_mode?: "manual" | "external" | "file";
  catalog_external_url?: string | null;
  catalog_file_url?: string | null;
  catalog_file_type?: "pdf" | "image" | "video" | null;
  catalog_label_fr?: string;
  catalog_label_en?: string;
  catalog_icon?: string;
  catalog_button_color?: string;
  catalog_button_text_color?: string;
  catalog_default_language?: "fr" | "en";
  catalog_languages?: string[];
  catalog_primary_currency?: string;
  catalog_secondary_currency?: string;
  catalog_show_secondary_currency?: boolean;
  catalog_auto_convert?: boolean;
  catalog_exchange_rate?: number | null;
};

type ProfileCompany = { id:string; position_title:string; company?: { id:string; full_name:string; slug:string; photo_url?:string; job_title?:string; bio?:string } };

type CatalogItem = {
  id: string;
  category_id: string;
  title_fr: string;
  title_en: string;
  description_fr?: string;
  description_en?: string;
  visual_type?: "none" | "icon" | "image";
  image_url?: string;
  icon?: string;
  price?: number | null;
  price_mode?: "fixed" | "from" | "range" | "hidden";
  currency?: string;
  secondary_price?: number | null;
  secondary_currency?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

type CatalogCategory = {
  id: string;
  card_id: string;
  title_fr: string;
  title_en: string;
  visual_type?: "color" | "image";
  image_url?: string;
  background_color?: string;
  text_color?: string;
  sort_order?: number;
  is_active?: boolean;
  items: CatalogItem[];
};

type Review = {
  id: string;
  reviewer_name?: string;
  reviewer_phone?: string;
  rating: number;
  comment?: string;
  created_at: string;
};

const texts = {
  fr: {
    email: "Email",
    call: "Appeler",
    address: "Adresse",
    locations: "Localisations",
    directions: "Itinéraire",
    copy: "Copier",
    copied: "Copié",
    share: "Partager",
    qrMini: "MON QR CODE",
    qrTitle: "Partagez ma carte",
    qrText: "Scannez ce QR Code pour découvrir ma carte digitale.",
    qrDownload: "Télécharger mon QR Code",
    reviews: "Avis",
    leaveReview: "Donner un avis",
    name: "Nom",
    optional: "optionnel",
    phone: "Téléphone",
    rating: "Votre note",
    message: "Votre avis",
    send: "Envoyer mon avis",
    sent: "Merci, votre avis a été ajouté.",
    empty: "Aucun avis publié pour le moment.",
  },
  en: {
    email: "Email",
    call: "Call",
    address: "Address",
    locations: "Locations",
    directions: "Directions",
    copy: "Copy",
    copied: "Copied",
    share: "Share",
    qrMini: "MY QR CODE",
    qrTitle: "Share my card",
    qrText: "Scan this QR Code to discover my digital card.",
    qrDownload: "Download my QR Code",
    reviews: "Reviews",
    leaveReview: "Leave a review",
    name: "Name",
    optional: "optional",
    phone: "Phone",
    rating: "Your rating",
    message: "Your review",
    send: "Send my review",
    sent: "Thank you, your review has been added.",
    empty: "No published reviews yet.",
  },
};

const catalogIconMap: Record<string, string> = {
  grid: "▦",
  menu: "☰",
  fork: "🍴",
  bag: "🛍️",
  sparkles: "✦",
  heart: "♥",
  star: "★",
  book: "▤",
  coffee: "☕",
  pizza: "🍕",
  cake: "🍰",
  drink: "🥤",
  scissors: "✂",
  beauty: "💅",
  fitness: "🏋️",
  medical: "✚",
  car: "🚗",
  home: "⌂",
  tools: "🧰",
  camera: "📷",
  music: "♫",
  gift: "🎁",
  ticket: "🎟",
  calendar: "▣",
};

function getCatalogIcon(key?: string) {
  return catalogIconMap[key || "grid"] || catalogIconMap.grid;
}

function normalizeUrl(value: string) {
  const clean = (value || "").trim();
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  return `https://${clean}`;
}

function isGoogleMapsUrl(value?: string | null) {
  const url = (value || "").trim().toLowerCase();
  if (!url) return false;

  return (
    url.includes("maps.app.goo.gl") ||
    url.includes("google.com/maps") ||
    url.includes("maps.google.") ||
    url.includes("goo.gl/maps") ||
    url.includes("googleusercontent.com/maps")
  );
}

function isLocationLink(item?: Partial<CustomLink> | null) {
  if (!item) return false;
  return item.kind === "location" || isGoogleMapsUrl(item.url);
}


function extractGoogleMapsCoordinates(value?: string | null) {
  const raw = (value || "").trim();
  if (!raw) return null;

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {}

  const atMatch = decoded.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    return { lat: atMatch[1], lng: atMatch[2] };
  }

  const queryMatch = decoded.match(/[?&](?:q|query|ll|center)=(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/i);
  if (queryMatch) {
    return { lat: queryMatch[1], lng: queryMatch[2] };
  }

  const dataLatLng = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dataLatLng) {
    return { lat: dataLatLng[1], lng: dataLatLng[2] };
  }

  const dataLngLat = decoded.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);
  if (dataLngLat) {
    return { lat: dataLngLat[2], lng: dataLngLat[1] };
  }

  return null;
}

function extractGoogleMapsPlaceName(value?: string | null) {
  const raw = (value || "").trim();
  if (!raw) return "";

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {}

  const placeMatch = decoded.match(/\/maps\/place\/([^/?#]+)/i);
  if (placeMatch?.[1]) {
    return placeMatch[1].replace(/\+/g, " ").trim();
  }

  const queryMatch = decoded.match(/[?&](?:q|query)=([^&#]+)/i);
  if (queryMatch?.[1]) {
    return queryMatch[1].replace(/\+/g, " ").trim();
  }

  return "";
}

function getGoogleMapsEmbedUrl(item: CustomLink, fallbackName?: string) {
  const coordinates = extractGoogleMapsCoordinates(item.url);

  if (coordinates) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${coordinates.lat},${coordinates.lng}`)}&z=17&output=embed`;
  }

  const placeName = extractGoogleMapsPlaceName(item.url);
  const query = placeName || item.label || fallbackName || "";

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;
}

function socialHref(item: SocialLink) {
  const value = (item.value || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  if (item.type === "whatsapp") {
    const number = value.replace(/\D/g, "");
    return number ? `https://wa.me/${number}` : "";
  }

  const handle = value.replace(/^@/, "");

  if (item.type === "instagram") return `https://instagram.com/${handle}`;
  if (item.type === "facebook") return `https://facebook.com/${handle}`;
  if (item.type === "tiktok") return `https://tiktok.com/@${handle}`;
  if (item.type === "linkedin") return `https://linkedin.com/in/${handle}`;
  if (item.type === "youtube") return `https://youtube.com/@${handle}`;
  if (item.type === "x") return `https://x.com/${handle}`;

  return normalizeUrl(value);
}

function socialColor(type: SocialType) {
  if (type === "instagram") return "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)";
  if (type === "facebook") return "#1877F2";
  if (type === "whatsapp") return "#25D366";
  if (type === "tiktok") return "#111111";
  if (type === "linkedin") return "#0A66C2";
  if (type === "youtube") return "#FF0000";
  if (type === "x") return "#111111";
  if (type === "website") return "#2563EB";
  return "#E8B39B";
}

function SocialIcon({ type }: { type: SocialType }) {
  const common = {
    width: 23,
    height: 23,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (type === "instagram") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" />
        <circle cx="17.4" cy="6.7" r="1.1" fill="white" />
      </svg>
    );
  }

  if (type === "facebook") {
    return (
      <svg {...common}>
        <path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.2-1.5 1.5-1.5h1.7V4a16 16 0 0 0-2.3-.1c-2.4 0-4 1.4-4 4V10H7.8v3h2.7v8h3.1Z" fill="white" />
      </svg>
    );
  }

  if (type === "whatsapp") {
    return (
      <svg {...common}>
        <path d="M20 11.7A8 8 0 0 1 8.2 18.8L4 20l1.2-4.1A8 8 0 1 1 20 11.7Z" stroke="white" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "tiktok") {
    return (
      <svg {...common}>
        <path d="M14.2 3c.4 2.5 1.9 4 4.3 4.2V10c-1.5.1-2.7-.3-4.3-1.3v4.9c0 6.2-6.8 8.2-9.5 3.7-1.8-2.8-.7-7.8 4.9-8v2.7c-.4.1-.9.2-1.4.4-1.3.5-2.1 1.3-1.9 2.9.4 2.9 5.8 3.7 5.4-1.9V3h2.5Z" fill="white" />
      </svg>
    );
  }

  if (type === "linkedin") {
    return (
      <svg {...common}>
        <rect x="4" y="9" width="3" height="11" rx="1" fill="white" />
        <circle cx="5.5" cy="5.5" r="1.7" fill="white" />
        <path d="M10 9h3v1.5c.8-1 1.9-1.8 3.5-1.8 2.8 0 3.2 2 3.2 4.6V20h-3v-5.5c0-1.3 0-2.9-1.8-2.9-1.8 0-2 1.4-2 2.9V20h-3V9Z" fill="white" />
      </svg>
    );
  }

  if (type === "youtube") {
    return (
      <svg {...common}>
        <path d="M21 12s0-3.4-.4-5a2.3 2.3 0 0 0-1.7-1.7C17.3 4.9 12 4.9 12 4.9s-5.3 0-6.9.4A2.3 2.3 0 0 0 3.4 7C3 8.6 3 12 3 12s0 3.4.4 5a2.3 2.3 0 0 0 1.7 1.7c1.6.4 6.9.4 6.9.4s5.3 0 6.9-.4a2.3 2.3 0 0 0 1.7-1.7c.4-1.6.4-5 .4-5Z" fill="white" />
        <path d="m10 15 5-3-5-3v6Z" fill="#FF0000" />
      </svg>
    );
  }

  if (type === "x") {
    return (
      <svg {...common}>
        <path d="M5 4h3.5l3.9 5.1L16.7 4h2l-5.3 6.5L19.4 20H16l-4.3-5.6L7.1 20H5l5.9-7.1L5 4Z" fill="white" />
      </svg>
    );
  }

  if (type === "website") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" stroke="white" strokeWidth="1.8" />
        <path d="M3.8 12h16.4M12 3.5c2.15 2.3 3.25 5.15 3.25 8.5S14.15 18.2 12 20.5M12 3.5C9.85 5.8 8.75 8.65 8.75 12s1.1 6.2 3.25 8.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Zm1 7h6m-3-3v6" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function PublicCardClient({ slug }: { slug: string }) {

  const [card, setCard] = useState<CardRow | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [copied, setCopied] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewPhone, setReviewPhone] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [thanksMessage, setThanksMessage] = useState("");
  const [profileCompanies, setProfileCompanies] = useState<ProfileCompany[]>([]);
  const [wifiOpen, setWifiOpen] = useState(false);
  const [wifiCopied, setWifiCopied] = useState<"ssid" | "password" | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [catalogActiveCategory, setCatalogActiveCategory] = useState<string>("");

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://visitecard.com");

  const publicUrl = useMemo(
    () => (slug ? `${siteUrl}/${slug}` : ""),
    [slug, siteUrl]
  );

  const qrTargetUrl = useMemo(
    () =>
      card?.qr_token ? `${siteUrl}/q/${card.qr_token}` : publicUrl,
    [card?.qr_token, publicUrl, siteUrl]
  );

  const qrUrl = useMemo(
    () =>
      qrTargetUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=0&format=png&data=${encodeURIComponent(
            qrTargetUrl
          )}`
        : "",
    [qrTargetUrl]
  );

  useEffect(() => {
    async function load() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey || !slug) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/cards?slug=eq.${encodeURIComponent(
            slug
          )}&is_public=eq.true&select=*`,
          {
            headers: {
              apikey: supabaseKey,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const rows = await response.json();
        const row = Array.isArray(rows) ? rows[0] : null;

        if (!row) return;

        const normalized: CardRow = {
          ...row,
          social_links: Array.isArray(row.social_links)
            ? row.social_links.map((item: any) => ({
                id: item.id || crypto.randomUUID(),
                type: item.type || "website",
                label: item.label || item.name || "Lien",
                value: item.value || item.url || "",
              }))
            : [],
          custom_links: Array.isArray(row.custom_links)
            ? row.custom_links.map((item: any): CustomLink => {
                const url = item.url || item.value || "";
                return {
                  id: item.id || crypto.randomUUID(),
                  label:
                    item.label ||
                    item.name ||
                    (isGoogleMapsUrl(url) ? "Localisation" : "Lien"),
                  url,
                  kind:
                    item.kind === "wifi"
                      ? "wifi"
                      : item.kind === "location" || isGoogleMapsUrl(url)
                        ? "location"
                        : "link",
                  image_url: item.kind === "wifi" ? "" : item.image_url || item.image || "",
                  enabled: item.kind === "wifi"
                    ? typeof item.enabled === "boolean"
                      ? item.enabled
                      : typeof item.wifi_enabled === "boolean"
                        ? item.wifi_enabled
                        : true
                    : undefined,
                  ssid: item.kind === "wifi" ? String(item.ssid || item.login || item.wifi_ssid || "") : undefined,
                  password: item.kind === "wifi" ? String(item.password || item.wifi_password || "") : undefined,
                  wifi_position:
                    item.kind === "wifi" &&
                    ["bottom-left", "bottom-center", "bottom-right"].includes(item.wifi_position)
                      ? item.wifi_position
                      : item.kind === "wifi"
                        ? "bottom-right"
                        : undefined,
                };
              })
            : [],
        };

        setCard(normalized);
        setLang(
          normalized.catalog_enabled && normalized.catalog_default_language === "en"
            ? "en"
            : normalized.language === "en"
              ? "en"
              : "fr"
        );

        if (normalized.entity_type !== "profile" && normalized.catalog_enabled && normalized.id) {
          Promise.all([
            fetch(`${supabaseUrl}/rest/v1/card_catalog_categories?card_id=eq.${normalized.id}&is_active=eq.true&select=*&order=sort_order.asc`, {
              headers: { apikey: supabaseKey, Accept: "application/json" }, cache: "no-store"
            }),
            fetch(`${supabaseUrl}/rest/v1/card_catalog_items?is_active=eq.true&select=*&order=sort_order.asc`, {
              headers: { apikey: supabaseKey, Accept: "application/json" }, cache: "no-store"
            })
          ]).then(async ([categoriesResponse, itemsResponse]) => {
            if (!categoriesResponse.ok || !itemsResponse.ok) return;
            const categoryRows = await categoriesResponse.json();
            const itemRows = await itemsResponse.json();
            const categories = Array.isArray(categoryRows) ? categoryRows : [];
            const items = Array.isArray(itemRows) ? itemRows : [];
            setCatalogCategories(categories.map((category: any) => ({
              ...category,
              items: items.filter((item: any) => item.category_id === category.id)
            })));
          }).catch(() => {});
        }

        if (normalized.entity_type === "profile" && normalized.id) {
          fetch(`${supabaseUrl}/rest/v1/profile_company_links?profile_card_id=eq.${normalized.id}&select=id,position_title,company:cards!profile_company_links_company_card_id_fkey(id,full_name,slug,photo_url,job_title,bio)`, {
            headers: { apikey: supabaseKey, Accept: "application/json" }, cache: "no-store"
          }).then(async r => { if (r.ok) { const data = await r.json(); setProfileCompanies(Array.isArray(data) ? data : []); } }).catch(() => {});
        }

        setLoading(false);

        if (normalized.show_reviews !== false && normalized.id) {
          fetch(
            `${supabaseUrl}/rest/v1/card_reviews?card_id=eq.${normalized.id}&status=eq.published&select=id,reviewer_name,reviewer_phone,rating,comment,created_at&order=created_at.desc&limit=20`,
            {
              headers: {
                apikey: supabaseKey,
                Accept: "application/json",
              },
              cache: "no-store",
            }
          )
            .then(async (reviewsResponse) => {
              if (!reviewsResponse.ok) return;
              const reviewRows = await reviewsResponse.json();
              setReviews(Array.isArray(reviewRows) ? reviewRows : []);
            })
            .catch(() => {});
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  const t = texts[lang];

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  }, [reviews]);

  async function copyLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copier le lien", publicUrl);
    }
  }

  async function shareLink() {
    if (!publicUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: card?.full_name || "VisiteCard",
          text: card?.job_title || "",
          url: publicUrl,
        });
        return;
      } catch {}
    }

    await copyLink();
  }

  async function downloadQr() {
    if (!qrUrl) return;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `visitecard-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(qrUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function submitReview() {
    if (!card?.id || !reviewRating) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return;

    setReviewSending(true);
    setReviewMessage("");

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/card_reviews`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          card_id: card.id,
          reviewer_name: reviewName.trim() || null,
          reviewer_phone: reviewPhone.trim() || null,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
          status: "published",
        }),
      });

      if (response.ok) {
        setReviewMessage("");
        setReviewName("");
        setReviewPhone("");
        setReviewComment("");
        setReviewRating(5);
        setReviewOpen(false);
        setThanksMessage(
          lang === "fr"
            ? "Merci pour votre avis."
            : "Thank you for your review."
        );

        const freshReviewsResponse = await fetch(
          `${supabaseUrl}/rest/v1/card_reviews?card_id=eq.${card.id}&status=eq.published&select=id,reviewer_name,reviewer_phone,rating,comment,created_at&order=created_at.desc&limit=20`,
          {
            headers: {
              apikey: supabaseKey,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (freshReviewsResponse.ok) {
          const freshRows = await freshReviewsResponse.json();
          setReviews(Array.isArray(freshRows) ? freshRows : []);
        }

        window.setTimeout(() => {
          setThanksMessage("");
        }, 3000);
      }
    } finally {
      setReviewSending(false);
    }
  }

  if (loading) {
    return (
      <main className="centerState">
        <div className="loader" />
      </main>
    );
  }

  if (!card) {
    return (
      <main className="centerState">
        <div>Carte indisponible</div>
      </main>
    );
  }

  async function copyWifiValue(value: string, field: "ssid" | "password") {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setWifiCopied(field);
      window.setTimeout(() => setWifiCopied(null), 1600);
    } catch {
      const input = document.createElement("textarea");
      input.value = value;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setWifiCopied(field);
      window.setTimeout(() => setWifiCopied(null), 1600);
    }
  }

  const dark = (card.theme || "dark") === "dark";
  const accent = card.primary_color || "#ff6a3d";
  const ledColor = card.led_color || accent;
  const ledOn = card.led_enabled !== false;
  const pageBg = dark ? "#03111b" : card.background_color || "#f4f1ef";
  const text = dark ? "#ffffff" : "#151515";
  const muted = dark ? "#9ea9b5" : "#666";
  const panel = dark ? "#111f2a" : "#ffffff";
  const buttonColor = card.button_color || accent;
  const buttonTextColor = card.button_text_color || "#ffffff";
  const buttonBorderColor = card.button_border_color || buttonColor;

  const baseSocials = (card.social_links || []).filter((item) =>
    (item.value || "").trim()
  );

  const socials: SocialLink[] = [...baseSocials];
  const storedWebsite = (card.website || "").trim();
  if (storedWebsite && !socials.some((item) => item.type === "website")) {
    socials.push({
      id: "website-fallback",
      type: "website",
      label: lang === "en" ? "Website" : "Site web",
      value: storedWebsite,
    });
  }

  const isProfile = card.entity_type === "profile";
  const profileWhatsapp = socials.find((item) => item.type === "whatsapp");
  const profileSocials = socials.filter((item) => item.type !== "whatsapp");
  const hasProfileMeta = Boolean(
    (card.job_title || "").trim() ||
      (card.company || "").trim() ||
      (card.bio || "").trim()
  );
  const hasProfileContacts = Boolean(
    (card.show_phone !== false && (card.phone || "").trim()) ||
      profileWhatsapp ||
      (card.show_email !== false && (card.email || "").trim())
  );

  const customs = (card.custom_links || []).filter(
    (item) =>
      item.kind !== "wifi" &&
      !isLocationLink(item) &&
      (item.label || "").trim() &&
      (item.url || "").trim()
  );

  const locations = (card.custom_links || []).filter(
    (item) => item.kind !== "wifi" && isLocationLink(item) && (item.url || "").trim()
  );

  const wifiConfig = (card.custom_links || []).find(
    (item) => item.kind === "wifi" && item.enabled !== false && (item.ssid || "").trim()
  );

  const catalogLabel = lang === "en"
    ? (card.catalog_label_en || "Our services")
    : (card.catalog_label_fr || "Nos services");

  function catalogText(fr?: string, en?: string) {
    return lang === "en" ? (en || fr || "") : (fr || en || "");
  }

  function formatCatalogPrice(item: CatalogItem) {
    if (item.price_mode === "hidden" || item.price == null) return "";
    const currentCard = card;
    if (!currentCard) return "";
    const prefix = item.price_mode === "from" ? (lang === "en" ? "From " : "À partir de ") : "";
    const primaryCurrency = item.currency || currentCard.catalog_primary_currency || "TND";
    const primary = `${prefix}${Number(item.price).toLocaleString(lang === "fr" ? "fr-FR" : "en-US")} ${primaryCurrency}`;
    if (!currentCard.catalog_show_secondary_currency || !currentCard.catalog_secondary_currency) return primary;
    let secondary = item.secondary_price;
    if (currentCard.catalog_auto_convert && currentCard.catalog_exchange_rate && Number(currentCard.catalog_exchange_rate) > 0) {
      secondary = Number(item.price) * Number(currentCard.catalog_exchange_rate);
    }
    if (secondary == null) return primary;
    return `${primary} · ${Number(secondary).toLocaleString(lang === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: 2 })} ${item.secondary_currency || currentCard.catalog_secondary_currency}`;
  }

  return (
    <main
      className={`vcPublicPage ${wifiConfig ? "hasWifiAction" : ""}`}
      style={{
        background: pageBg,
        color: text,
        ["--accent" as any]: accent,
        ["--led" as any]: ledColor,
        ["--panel" as any]: panel,
        ["--muted" as any]: muted,
        ["--button-bg" as any]: buttonColor,
        ["--button-text" as any]: buttonTextColor,
        ["--button-border" as any]: buttonBorderColor,
      }}
    >
      {thanksMessage ? (
        <div className="thanksToast" role="status">
          <span>✓</span>
          <strong>{thanksMessage}</strong>
        </div>
      ) : null}

      <div className="vcPublicShell">
        <div className="topTools">
          <div className="langSwitch">
            <button
              className={lang === "fr" ? "active" : ""}
              onClick={() => setLang("fr")}
            >
              FR
            </button>
            <span>|</span>
            <button
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>

          <div className="shareTools">
            <button onClick={copyLink}>⧉ {copied ? t.copied : t.copy}</button>
            <button onClick={shareLink}>⌯ {t.share}</button>
          </div>
        </div>

        <section className={`vcPublicHero ${ledOn ? "ledFrame" : ""}`}>
          <div className="vcPublicCover">
            {card.cover_url ? (
              <img src={card.cover_url} alt="" />
            ) : (
              <div className="vcPublicCoverFallback" />
            )}
          </div>

          <div className="vcPublicAvatar">
            {card.photo_url ? (
              <img src={card.photo_url} alt="" />
            ) : (
              <span>{(card.full_name || "V").charAt(0).toUpperCase()}</span>
            )}
          </div>

          {!isProfile && card.google_reviews_enabled && card.google_reviews_url ? (
            <div className="googleReviewsUnderLogoWrap">
              <a
                className="googleReviewsUnderLogo"
                href={card.google_reviews_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: card.google_reviews_button_color || "#ffffff",
                  color: card.google_reviews_text_color || "#111827",
                  borderColor: card.google_reviews_button_color || "#ffffff",
                }}
              >
                <span className="googleReviewsUnderLogoStar">★</span>
                <span className="googleReviewsUnderLogoText">
                  <strong>Google</strong>
                  <small>
                    {card.google_rating != null
                      ? `${Number(card.google_rating).toFixed(1)} ★`
                      : lang === "en"
                        ? card.google_reviews_label_en || (card.google_reviews_button_mode === "write" ? "Leave a review" : "View reviews")
                        : card.google_reviews_label_fr || (card.google_reviews_button_mode === "write" ? "Donner un avis" : "Voir les avis")}
                    {card.google_reviews_count != null
                      ? ` · ${card.google_reviews_count} ${lang === "en" ? "reviews" : "avis"}`
                      : ""}
                  </small>
                </span>
              </a>
            </div>
          ) : null}

          <div className={`vcPublicIdentity ${isProfile && !hasProfileMeta ? "compactProfileIdentity" : ""}`}>
            <h1>{card.full_name || "VisiteCard"}</h1>
            {card.job_title ? <p>{card.job_title}</p> : null}
            {card.company ? <small>{card.company}</small> : null}
            {card.bio ? <div className="bio">{card.bio}</div> : null}
            {!isProfile && card.show_reviews !== false ? (
              <button
                type="button"
                className="ratingSummary"
                onClick={() => setReviewOpen(true)}
                aria-label={t.leaveReview}
              >
                <span>★</span>
                <strong>{averageRating ? averageRating.toFixed(1) : "—"}</strong>
                <em>•</em>
                <small>{reviews.length} {t.reviews}</small>
              </button>
            ) : null}
          </div>

          {isProfile ? (
            <>
              {profileSocials.length ? (
                <div className="profileSocialsCompact" aria-label={lang === "en" ? "Social networks" : "Réseaux sociaux"}>
                  {profileSocials.map((item) => (
                    <a
                      key={item.id}
                      href={socialHref(item)}
                      target="_blank"
                      rel="noreferrer"
                      className="profileSocialMini"
                      aria-label={item.label || item.type}
                      title={item.label || item.type}
                    >
                      <span style={{ background: socialColor(item.type) }}>
                        <SocialIcon type={item.type} />
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}

              {hasProfileContacts ? (
                <div className="profileContactCompact">
                  {card.show_phone !== false && card.phone ? (
                    <a href={`tel:${card.phone}`} className="profileContactPill">
                      <span>☎</span><strong>{t.call}</strong>
                    </a>
                  ) : null}
                  {profileWhatsapp ? (
                    <a href={socialHref(profileWhatsapp)} target="_blank" rel="noreferrer" className="profileContactPill whatsapp">
                      <span className="miniSocial"><SocialIcon type="whatsapp" /></span><strong>WhatsApp</strong>
                    </a>
                  ) : null}
                  {card.show_email !== false && card.email ? (
                    <a href={`mailto:${card.email}`} className="profileContactPill">
                      <span>✉</span><strong>{t.email}</strong>
                    </a>
                  ) : null}
                </div>
              ) : null}

              {customs.length ? (
                <div className="profileCustomLinks">
                  {customs.map((item) => (
                    <a
                      key={item.id}
                      className={ledOn ? "linkCard ledSoft" : "linkCard"}
                      href={normalizeUrl(item.url)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className={`vcPublicSocialIcon customIcon ${item.image_url ? "hasImage" : ""}`}>
                        {item.image_url ? (
                          <img src={item.image_url} alt="" />
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M10.6 13.4a2 2 0 0 0 2.8 0l3.2-3.2a2 2 0 1 0-2.8-2.8l-1.2 1.2" />
                            <path d="M13.4 10.6a2 2 0 0 0-2.8 0l-3.2 3.2a2 2 0 1 0 2.8 2.8l1.2-1.2" />
                          </svg>
                        )}
                      </span>
                      <strong>{item.label}</strong>
                    </a>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="vcPublicLinks">
                {!isProfile && card.catalog_enabled ? (
                  card.catalog_mode === "external" && card.catalog_external_url ? (
                    <a
                      className={ledOn ? "linkCard catalogMainButton ledSoft" : "linkCard catalogMainButton"}
                      href={card.catalog_external_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: card.catalog_button_color || buttonColor,
                        color: card.catalog_button_text_color || buttonTextColor,
                        borderColor: card.catalog_button_color || buttonBorderColor,
                      }}
                    >
                      <span className="vcPublicSocialIcon catalogIcon">{getCatalogIcon(card.catalog_icon)}</span>
                      <strong>{catalogLabel}</strong>
                    </a>
                  ) : card.catalog_mode === "file" && card.catalog_file_url ? (
                    <a
                      className={ledOn ? "linkCard catalogMainButton ledSoft" : "linkCard catalogMainButton"}
                      href={card.catalog_file_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: card.catalog_button_color || buttonColor,
                        color: card.catalog_button_text_color || buttonTextColor,
                        borderColor: card.catalog_button_color || buttonBorderColor,
                      }}
                    >
                      <span className="vcPublicSocialIcon catalogIcon">{getCatalogIcon(card.catalog_icon)}</span>
                      <strong>{catalogLabel}</strong>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={ledOn ? "linkCard catalogMainButton ledSoft" : "linkCard catalogMainButton"}
                      onClick={() => setCatalogOpen(true)}
                      style={{
                        background: card.catalog_button_color || buttonColor,
                        color: card.catalog_button_text_color || buttonTextColor,
                        borderColor: card.catalog_button_color || buttonBorderColor,
                      }}
                    >
                      <span className="vcPublicSocialIcon catalogIcon">{getCatalogIcon(card.catalog_icon)}</span>
                      <strong>{catalogLabel}</strong>
                    </button>
                  )
                ) : null}

                {socials.map((item) => (
                  <a
                    key={item.id}
                    className={ledOn ? "linkCard ledSoft" : "linkCard"}
                    href={socialHref(item)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="vcPublicSocialIcon" style={{ background: socialColor(item.type) }}>
                      <SocialIcon type={item.type} />
                    </span>
                    <strong>{item.label}</strong>
                  </a>
                ))}

                {customs.map((item) => (
                  <a
                    key={item.id}
                    className={ledOn ? "linkCard ledSoft" : "linkCard"}
                    href={normalizeUrl(item.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className={`vcPublicSocialIcon customIcon ${item.image_url ? "hasImage" : ""}`}>
                      {item.image_url ? (
                        <img src={item.image_url} alt="" />
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M10.6 13.4a2 2 0 0 0 2.8 0l3.2-3.2a2 2 0 1 0-2.8-2.8l-1.2 1.2" />
                          <path d="M13.4 10.6a2 2 0 0 0-2.8 0l-3.2 3.2a2 2 0 1 0 2.8 2.8l1.2-1.2" />
                        </svg>
                      )}
                    </span>
                    <strong>{item.label}</strong>
                  </a>
                ))}
              </div>

              {card.show_address !== false && locations.length ? (
                <div className="vcPublicLocations premiumLocations">
                  <div className="premiumLocationHeader">
                    <div className="premiumLocationTitle">
                      <span className="premiumLocationPin">⌖</span>
                      <div>
                        <strong>{locations.length > 1 ? t.locations : (lang === "en" ? "Location" : "Localisation")}</strong>
                        <small>{lang === "en" ? "Find us easily" : "Retrouvez-nous facilement"}</small>
                      </div>
                    </div>
                  </div>
                  <div className="premiumLocationList">
                    {locations.map((item, index) => (
                      <article key={item.id} className={ledOn ? "premiumLocationCard ledSoft" : "premiumLocationCard"}>
                        <div className="premiumMapWrap">
                          <iframe
                            title={`${lang === "en" ? "Location" : "Localisation"} ${index + 1}`}
                            src={getGoogleMapsEmbedUrl(item, card.full_name)}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                            tabIndex={-1}
                          />
                          <a
                            href={normalizeUrl(item.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="premiumMapClickTarget"
                            aria-label={lang === "en" ? "Open this exact location in Google Maps" : "Ouvrir cette adresse exacte dans Google Maps"}
                          />
                        </div>
                        <div className="premiumLocationInfo">
                          <div className="premiumLocationAddress">
                            <span className="premiumLocationInfoIcon">●</span>
                            <div>
                              <small>{lang === "en" ? `Address ${locations.length > 1 ? index + 1 : ""}` : `Adresse ${locations.length > 1 ? index + 1 : ""}`}</small>
                              <strong>{item.label}</strong>
                            </div>
                          </div>
                          <a href={normalizeUrl(item.url)} target="_blank" rel="noopener noreferrer" className="premiumDirections">
                            <span>➤</span>
                            <strong>{t.directions}</strong>
                          </a>
                          <a href={normalizeUrl(item.url)} target="_blank" rel="noopener noreferrer" className="premiumGoogleMaps">
                            {lang === "en" ? "View on Google Maps" : "Voir sur Google Maps"} ↗
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="vcPublicContactRow">
                {card.show_email !== false && card.email ? <a href={`mailto:${card.email}`} className="vcPublicContact primary">✉ {t.email}</a> : null}
                {card.show_phone !== false && card.phone ? <a href={`tel:${card.phone}`} className="vcPublicContact">☎ {t.call}</a> : null}
                {card.show_address !== false && !locations.length && card.address ? (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.address)}`} target="_blank" rel="noreferrer" className="vcPublicContact">⌖ {t.address}</a>
                ) : null}
              </div>
            </>
          )}
        </section>

        {!isProfile && catalogOpen && card.catalog_enabled ? (
          <div className="catalogModalBackdrop" onClick={() => setCatalogOpen(false)}>
            <div className="catalogModal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
              <div className="catalogModalHead">
                <div>
                  <small>{lang === "en" ? "CATALOG" : "CATALOGUE"}</small>
                  <h2>{catalogLabel}</h2>
                </div>
                <div className="catalogHeadActions">
                  <div className="catalogLangSwitch">
                    <button type="button" className={lang === "fr" ? "active" : ""} onClick={() => setLang("fr")}>FR</button>
                    <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
                  </div>
                  <button type="button" className="catalogClose" onClick={() => setCatalogOpen(false)}>×</button>
                </div>
              </div>

              {catalogCategories.length ? (() => {
                const activeCategory =
                  catalogCategories.find((category) => category.id === catalogActiveCategory) ||
                  catalogCategories[0];
                return (
                  <div className="menuCatalog">
                    <div className="menuCategoryRail">
                      {catalogCategories.map((category) => {
                        const active = category.id === activeCategory.id;
                        return (
                          <button
                            type="button"
                            key={category.id}
                            className={`menuCategoryTab ${active ? "active" : ""}`}
                            onClick={() => setCatalogActiveCategory(category.id)}
                          >
                            <span
                              className="menuCategoryVisual"
                              style={
                                category.visual_type === "image" && category.image_url
                                  ? { backgroundImage: `url(${category.image_url})` }
                                  : { background: category.background_color || "#171717" }
                              }
                            >
                              {!(category.visual_type === "image" && category.image_url) ? (
                                <b style={{ color: category.text_color || "#fff" }}>
                                  {catalogText(category.title_fr, category.title_en).charAt(0).toUpperCase()}
                                </b>
                              ) : null}
                            </span>
                            <strong>{catalogText(category.title_fr, category.title_en)}</strong>
                          </button>
                        );
                      })}
                    </div>

                    <section className="menuActiveCategory">
                      <div className="menuSectionTitle">
                        <div>
                          <h3>{catalogText(activeCategory.title_fr, activeCategory.title_en)}</h3>
                          <span />
                        </div>
                        <p>
                          {lang === "en"
                            ? `${activeCategory.items.length} ${activeCategory.items.length === 1 ? "item" : "items"}`
                            : `${activeCategory.items.length} ${activeCategory.items.length === 1 ? "élément" : "éléments"}`}
                        </p>
                      </div>

                      <div className="menuItems">
                        {activeCategory.items.length ? activeCategory.items.map((item) => (
                          <article key={item.id} className="menuItem">
                            <div className="menuItemVisual">
                              {item.visual_type === "image" && item.image_url ? (
                                <img src={item.image_url} alt={catalogText(item.title_fr, item.title_en)} />
                              ) : (
                                <span>{item.icon === "sparkles" ? "✦" : "◆"}</span>
                              )}
                            </div>
                            <div className="menuItemInfo">
                              <strong>{catalogText(item.title_fr, item.title_en)}</strong>
                              {catalogText(item.description_fr, item.description_en) ? (
                                <p>{catalogText(item.description_fr, item.description_en)}</p>
                              ) : null}
                            </div>
                            {formatCatalogPrice(item) ? (
                              <div className="menuItemPrice">{formatCatalogPrice(item)}</div>
                            ) : null}
                          </article>
                        )) : (
                          <div className="catalogEmpty">
                            {lang === "en" ? "No item in this category yet." : "Aucun élément dans cette catégorie."}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                );
              })() : (
                <div className="catalogEmpty">{lang === "en" ? "No item available yet." : "Aucun élément disponible pour le moment."}</div>
              )}
            </div>
          </div>
        ) : null}

        {card.entity_type === "profile" && profileCompanies.length ? (
          <section className="profileCompaniesPublic">
            <div className="profileCompaniesTitle"><span>SOCIÉTÉS</span><h2>Mes sociétés</h2></div>
            <div className="profileCompaniesGrid">
              {profileCompanies.map((link) => (
                <a key={link.id} href={`/${link.company?.slug || ""}`} target="_blank" rel="noopener noreferrer" className={ledOn ? "profileCompanyCard ledSoft" : "profileCompanyCard"}>
                  <span className="profileCompanyLogo">{link.company?.photo_url ? <img src={link.company.photo_url} alt="" /> : (link.company?.full_name || "S").charAt(0)}</span>
                  <span className="profileCompanyCopy"><strong>{link.company?.full_name}</strong><small>{link.position_title}</small></span>
                  <span className="profileCompanyArrow">Voir la page →</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {!isProfile && reviewOpen && card.show_reviews !== false ? (
          <div className="reviewModalBackdrop" onClick={() => setReviewOpen(false)}>
            <div
              className="reviewModal"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="reviewModalHead">
                <div>
                  <small>{t.reviews}</small>
                  <h3>{t.leaveReview}</h3>
                </div>

                <button
                  type="button"
                  className="reviewClose"
                  onClick={() => setReviewOpen(false)}
                  aria-label="Fermer"
                >
                  ×
                </button>
              </div>

              <div className="reviewForm simple">
                <div className="reviewFormHead">
                  <strong>{t.rating}</strong>
                  <span>{reviewRating}/5</span>
                </div>

                <div className="scoreLine">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      className={reviewRating >= score ? "active" : ""}
                      onClick={() => setReviewRating(score)}
                      aria-label={`${score}/5`}
                    >
                      <span>{score}</span>
                    </button>
                  ))}
                </div>

                <label>
                  {t.name} ({t.optional})
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder={t.name}
                  />
                </label>

                <label>
                  {t.phone}
                  <input
                    value={reviewPhone}
                    onChange={(e) => setReviewPhone(e.target.value)}
                    placeholder="+216..."
                  />
                </label>

                <label>
                  {t.message}
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength={500}
                    placeholder={t.message}
                  />
                </label>

                <button
                  type="button"
                  className="sendReview"
                  onClick={submitReview}
                  disabled={reviewSending}
                >
                  {reviewSending ? "..." : t.send}
                </button>

                {reviewMessage ? (
                  <div className="reviewSuccess">{reviewMessage}</div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {card.show_qr !== false ? (
          <section className={ledOn ? "vcPublicQrSection ledFrame" : "vcPublicQrSection"}>
            <div className="vcPublicQrCopy">
              <small>{t.qrMini}</small>
              <h2>{t.qrTitle}</h2>
              <p>{t.qrText}</p>
              <button type="button" onClick={downloadQr}>
                ↓ {t.qrDownload}
              </button>
            </div>

            <div className="vcPublicQrBox">
              <img src={qrUrl} alt="QR Code" />
            </div>
          </section>
        ) : null}
      </div>

      {wifiConfig ? (
        <>
          <button
            type="button"
            className={`wifiFloatingAction ${wifiConfig.wifi_position || "bottom-right"}`}
            onClick={() => setWifiOpen(true)}
            aria-label={lang === "en" ? "Wi-Fi access" : "Accès Wi-Fi"}
          >
            <span className="wifiFloatingIcon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4.5 9.5a11.2 11.2 0 0 1 15 0" />
                <path d="M7.6 12.7a6.8 6.8 0 0 1 8.8 0" />
                <path d="M10.5 15.8a2.5 2.5 0 0 1 3 0" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </span>
            <span className="wifiFloatingCopy">
              <small>{lang === "en" ? "GUEST ACCESS" : "ACCÈS INVITÉ"}</small>
              <strong>Wi-Fi</strong>
            </span>
            <span className="wifiPulse" aria-hidden="true" />
          </button>

          {wifiOpen ? (
            <div className="wifiSheetBackdrop" onClick={() => setWifiOpen(false)}>
              <section
                className="wifiSheet"
                role="dialog"
                aria-modal="true"
                aria-label={lang === "en" ? "Wi-Fi access" : "Accès Wi-Fi"}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="wifiSheetHead">
                  <div className="wifiSheetBrand">
                    <span className="wifiSheetIcon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4.5 9.5a11.2 11.2 0 0 1 15 0" />
                        <path d="M7.6 12.7a6.8 6.8 0 0 1 8.8 0" />
                        <path d="M10.5 15.8a2.5 2.5 0 0 1 3 0" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </span>
                    <div>
                      <small>{lang === "en" ? "GUEST ACCESS" : "ACCÈS INVITÉ"}</small>
                      <h3>Wi-Fi</h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="wifiSheetClose"
                    onClick={() => setWifiOpen(false)}
                    aria-label={lang === "en" ? "Close" : "Fermer"}
                  >
                    ×
                  </button>
                </div>

                <div className="wifiCredential">
                  <div>
                    <small>{lang === "en" ? "Wi-Fi name" : "Nom du Wi-Fi"}</small>
                    <strong>{wifiConfig.ssid}</strong>
                  </div>
                  <button type="button" onClick={() => copyWifiValue(wifiConfig.ssid || "", "ssid")}>
                    {wifiCopied === "ssid" ? (lang === "en" ? "Copied" : "Copié") : (lang === "en" ? "Copy" : "Copier")}
                  </button>
                </div>

                {(wifiConfig.password || "").length ? (
                  <div className="wifiCredential">
                    <div>
                      <small>{lang === "en" ? "Password" : "Mot de passe"}</small>
                      <strong className="wifiPassword">{wifiConfig.password}</strong>
                    </div>
                    <button type="button" onClick={() => copyWifiValue(wifiConfig.password || "", "password")}>
                      {wifiCopied === "password" ? (lang === "en" ? "Copied" : "Copié") : (lang === "en" ? "Copy" : "Copier")}
                    </button>
                  </div>
                ) : null}

                <p className="wifiHint">
                  {lang === "en"
                    ? "Use these details to connect to the guest Wi-Fi network."
                    : "Utilisez ces informations pour vous connecter au réseau Wi-Fi invité."}
                </p>
              </section>
            </div>
          ) : null}
        </>
      ) : null}

      <style jsx>{`
        * { box-sizing: border-box; }
        .vcPublicPage { min-height:100dvh; padding:28px 18px 46px; font-family:Inter,system-ui,sans-serif; }
        .vcPublicPage.hasWifiAction { padding-bottom:112px; }
        .wifiFloatingAction { position:fixed;z-index:850;bottom:20px;min-height:58px;padding:7px 14px 7px 7px;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(7,17,28,.94);color:#fff;box-shadow:0 16px 48px rgba(0,0,0,.32);backdrop-filter:blur(14px);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease; }
        .wifiFloatingAction:hover { transform:translateY(-2px);box-shadow:0 20px 56px rgba(0,0,0,.4); }
        .wifiFloatingAction.bottom-left { left:20px; }
        .wifiFloatingAction.bottom-center { left:50%;transform:translateX(-50%); }
        .wifiFloatingAction.bottom-center:hover { transform:translate(-50%,-2px); }
        .wifiFloatingAction.bottom-right { right:20px; }
        .wifiFloatingIcon,.wifiSheetIcon { width:42px;height:42px;display:grid;place-items:center;border-radius:50%;background:linear-gradient(145deg,#2f6df6,#1646be);box-shadow:0 8px 20px rgba(47,109,246,.28); }
        .wifiFloatingIcon svg,.wifiSheetIcon svg { width:23px;height:23px;fill:none;stroke:#fff;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round; }
        .wifiFloatingCopy { display:grid;text-align:left;line-height:1.05; }
        .wifiFloatingCopy small { color:#9fb8ff;font-size:8px;font-weight:900;letter-spacing:.12em; }
        .wifiFloatingCopy strong { margin-top:4px;font-size:14px; }
        .wifiPulse { width:7px;height:7px;margin-left:2px;border-radius:50%;background:#41d17d;box-shadow:0 0 0 5px rgba(65,209,125,.12); }
        .wifiSheetBackdrop { position:fixed;inset:0;z-index:1200;padding:18px;display:grid;place-items:center;background:rgba(0,0,0,.68);backdrop-filter:blur(9px); }
        .wifiSheet { width:min(430px,100%);padding:20px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:#101d27;color:#fff;box-shadow:0 30px 90px rgba(0,0,0,.5); }
        .wifiSheetHead { display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px; }
        .wifiSheetBrand { display:flex;align-items:center;gap:12px; }
        .wifiSheetBrand > div { display:grid;gap:3px; }
        .wifiSheetBrand small { color:#9fb8ff;font-size:9px;font-weight:900;letter-spacing:.13em; }
        .wifiSheetBrand h3 { margin:0;font-size:24px; }
        .wifiSheetClose { width:38px;height:38px;border:1px solid rgba(255,255,255,.13);border-radius:11px;background:rgba(255,255,255,.05);color:#fff;font-size:24px;cursor:pointer; }
        .wifiCredential { margin-top:10px;padding:13px 13px 13px 15px;display:flex;align-items:center;justify-content:space-between;gap:14px;border:1px solid rgba(255,255,255,.09);border-radius:15px;background:#0a151e; }
        .wifiCredential > div { min-width:0;display:grid;gap:5px; }
        .wifiCredential small { color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:.08em; }
        .wifiCredential strong { overflow-wrap:anywhere;font-size:15px; }
        .wifiCredential button { min-height:38px;padding:0 12px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.07);color:#fff;font-weight:850;cursor:pointer; }
        .wifiPassword { font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em; }
        .wifiHint { margin:14px 2px 0;color:#9ea9b5;font-size:11px;line-height:1.5; }
        .vcPublicShell { width:min(800px,100%); margin:auto; }
        .topTools { margin-bottom:14px; display:flex; justify-content:space-between; gap:12px; }
        .langSwitch,.shareTools { display:flex; align-items:center; gap:8px; }
        .langSwitch { min-height:42px; padding:0 12px; border:1px solid rgba(255,255,255,.1); border-radius:14px; background:rgba(255,255,255,.04); }
        .langSwitch button { border:0; background:transparent; color:var(--muted); font-weight:900; cursor:pointer; }
        .langSwitch button.active { color:var(--accent); }
        .langSwitch span { opacity:.35; }
        .shareTools button { min-height:42px; padding:0 14px; border:2px solid var(--button-border); border-radius:14px; background:var(--button-bg); color:var(--button-text); font-weight:800; cursor:pointer; }
        .profileSocialsCompact{display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 8px}.compactProfileIdentity + .profileSocialsCompact{margin-top:4px}.compactProfileIdentity + .profileContactCompact{margin-top:4px}.profileSocialMini{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;text-decoration:none;transition:transform .18s ease,opacity .18s ease}.profileSocialMini:hover{transform:translateY(-2px);opacity:.9}.profileSocialMini>span{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;box-shadow:0 5px 16px rgba(0,0,0,.15)}.profileSocialMini :global(svg){width:16px;height:16px}.profileContactCompact{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:8px 0 4px}.profileCustomLinks{display:grid;gap:10px;margin:14px 24px 20px}.profileContactPill{min-height:38px;padding:0 13px;display:inline-flex;align-items:center;justify-content:center;gap:7px;border:2px solid var(--button-border);border-radius:999px;background:var(--button-bg);color:var(--button-text);text-decoration:none;font-size:11px}.profileContactPill strong{font-weight:800;color:var(--button-text)}.miniSocial{width:18px;height:18px;display:grid;place-items:center;border-radius:50%;background:#25d366}.miniSocial :global(svg){width:11px;height:11px}
                .profileCompaniesPublic{margin:18px 0;padding:22px;border:1px solid rgba(255,255,255,.09);border-radius:28px;background:rgba(255,255,255,.02)}
        .profileCompaniesTitle span{font-size:10px;letter-spacing:.14em;font-weight:900;color:var(--accent)}.profileCompaniesTitle h2{margin:5px 0 16px;font-size:22px}.profileCompaniesGrid{display:grid;gap:10px}.profileCompanyCard{display:grid;grid-template-columns:52px 1fr auto;gap:12px;align-items:center;padding:12px;border-radius:18px;background:var(--panel);color:inherit;text-decoration:none;border:1px solid rgba(255,255,255,.08)}.profileCompanyLogo{width:52px;height:52px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) 18%,var(--panel));font-weight:900}.profileCompanyLogo img{width:100%;height:100%;object-fit:cover}.profileCompanyCopy{display:grid;gap:4px}.profileCompanyCopy small{color:var(--muted)}.profileCompanyArrow{min-height:34px;padding:0 11px;display:inline-flex;align-items:center;justify-content:center;border:2px solid var(--button-border);border-radius:10px;background:var(--button-bg);color:var(--button-text);font-size:12px;font-weight:800;white-space:nowrap}
        @media(max-width:560px){.profileCompaniesPublic{padding:15px}.profileCompanyCard{grid-template-columns:46px 1fr}.profileCompanyLogo{width:46px;height:46px}.profileCompanyArrow{grid-column:2}}
        
        .vcPublicHero,.vcPublicQrSection,.reviewsSection { border:1px solid rgba(255,255,255,.09); border-radius:28px; background:rgba(255,255,255,.02); }
        .ledFrame { border-color:var(--led); box-shadow:0 0 0 1px color-mix(in srgb,var(--led) 45%,transparent),0 0 18px color-mix(in srgb,var(--led) 32%,transparent); }
        .ledSoft { border-color:color-mix(in srgb,var(--led) 55%,rgba(255,255,255,.08)) !important; box-shadow:0 0 12px color-mix(in srgb,var(--led) 16%,transparent); }
        .vcPublicHero { overflow:hidden; }
        .vcPublicCover { height:230px; overflow:hidden; background:#111; }
        .vcPublicCover img,.vcPublicCoverFallback { width:100%; height:100%; object-fit:cover; display:block; }
        .vcPublicCoverFallback { background:radial-gradient(circle at 85% 30%,color-mix(in srgb,var(--accent) 35%,transparent),transparent 34%),linear-gradient(135deg,#111820,#25140f); }
        .vcPublicAvatar { width:126px; height:126px; margin:-63px auto 0; position:relative; z-index:2; display:grid; place-items:center; overflow:hidden; border:3px solid var(--accent); border-radius:50%; background:#eee; color:#222; font-size:40px; font-weight:900; }
        .vcPublicAvatar img { width:100%; height:100%; object-fit:cover; }
        .googleReviewsUnderLogoWrap { display:flex; justify-content:center; padding:10px 20px 0; position:relative; z-index:3; }
        .googleReviewsUnderLogo { display:inline-flex; align-items:center; gap:9px; max-width:calc(100% - 20px); min-height:42px; padding:7px 14px; border:1px solid; border-radius:999px; text-decoration:none; box-shadow:0 8px 24px rgba(0,0,0,.12); }
        .googleReviewsUnderLogoStar { display:grid; place-items:center; width:28px; height:28px; flex:0 0 28px; border-radius:50%; background:rgba(255,193,7,.14); color:#fbbc04; font-size:17px; line-height:1; }
        .googleReviewsUnderLogoText { display:flex; align-items:baseline; gap:7px; min-width:0; }
        .googleReviewsUnderLogoText strong { font-size:14px; line-height:1.1; white-space:nowrap; }
        .googleReviewsUnderLogoText small { font-size:12px; line-height:1.2; font-weight:700; opacity:.8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .vcPublicIdentity { padding:18px 24px 10px; text-align:center; }
        .vcPublicIdentity.compactProfileIdentity { padding-bottom:2px; }
        .vcPublicIdentity h1 { margin:0; font-size:clamp(34px,7vw,52px); letter-spacing:-.05em; }
        .vcPublicIdentity p,.vcPublicIdentity small,.bio { color:var(--muted); }
        .vcPublicIdentity p { margin:10px 0 0; }
        .vcPublicIdentity small { display:block; margin-top:4px; }
        .bio { max-width:560px; margin:14px auto 0; line-height:1.55; }
        .ratingSummary {
          margin:16px auto 0;
          padding:7px 12px;
          display:inline-flex;
          align-items:center;
          gap:7px;
          border:1px solid rgba(127,127,127,.16);
          border-radius:999px;
          background:transparent;
          color:inherit;
          cursor:pointer;
        }

        .ratingSummary > span {
          color:#ffb000;
          font-size:16px;
        }

        .ratingSummary strong {
          font-size:14px;
        }

        .ratingSummary em {
          opacity:.35;
          font-style:normal;
        }

        .ratingSummary small {
          margin:0;
          color:var(--muted);
          font-size:12px;
        }

        .vcPublicLinks { padding:0 24px; display:grid; gap:10px; }
        .linkCard { min-height:72px; padding:11px 18px; display:flex; align-items:center; gap:14px; border:1px solid rgba(255,255,255,.08); border-radius:19px; background:var(--panel); color:inherit; text-decoration:none; }
        .vcPublicSocialIcon { width:48px; height:48px; flex:0 0 48px; display:grid; place-items:center; border-radius:14px; color:#fff; }
        .customIcon { background:#e8b39b; color:#111; overflow:hidden; }
        .customIcon svg { width:23px; height:23px; fill:none; stroke:currentColor; stroke-width:1.9; stroke-linecap:round; stroke-linejoin:round; }
        .customIcon.hasImage { background:transparent; }
        .customIcon.hasImage img { width:100%; height:100%; display:block; object-fit:cover; }
        .vcPublicLocations {
          padding: 14px 24px 0;
        }

        .vcPublicLocationsTitle {
          margin: 2px 0 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .vcPublicLocationsTitle > span {
          color: var(--accent);
          font-size: 18px;
          line-height: 1;
        }

        .vcPublicLocationsList {
          display: grid;
          gap: 9px;
        }


        .premiumLocations{margin-top:18px;padding:18px;border:1px solid color-mix(in srgb,var(--accent) 45%,rgba(255,255,255,.08));border-radius:24px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 9%,var(--panel)),var(--panel));overflow:hidden}
        .premiumLocationHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.premiumLocationTitle{display:flex;align-items:center;gap:11px}.premiumLocationPin{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) 20%,transparent);color:var(--accent);font-size:22px}.premiumLocationTitle div{display:grid;gap:2px}.premiumLocationTitle strong{font-size:18px}.premiumLocationTitle small{color:var(--muted);font-size:12px}
        .premiumLocationList{display:grid;gap:14px}.premiumLocationCard{display:grid;grid-template-columns:minmax(220px,1.1fr) minmax(220px,.9fr);gap:16px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:19px;background:rgba(255,255,255,.025)}.premiumMapWrap{position:relative;min-height:190px;border-radius:15px;overflow:hidden;background:rgba(255,255,255,.05)}.premiumMapWrap iframe{width:100%;height:100%;min-height:190px;border:0;display:block;pointer-events:none}.premiumMapClickTarget{position:absolute;inset:0;z-index:2;display:block;cursor:pointer;background:transparent}.premiumLocationInfo{display:flex;flex-direction:column;justify-content:center;gap:11px}.premiumLocationAddress{display:flex;gap:10px;align-items:flex-start}.premiumLocationInfoIcon{width:36px;height:36px;flex:0 0 36px;border-radius:11px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) 22%,transparent);color:var(--accent);font-size:10px}.premiumLocationAddress div{display:grid;gap:3px;min-width:0}.premiumLocationAddress small{color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.08em}.premiumLocationAddress strong{font-size:13px;line-height:1.4}.premiumDirections,.premiumGoogleMaps{display:flex;align-items:center;gap:8px;text-decoration:none;border-radius:12px;background:var(--button-bg);color:var(--button-text);border:2px solid var(--button-border);font-weight:900}.premiumDirections{padding:11px 12px}.premiumDirections span{color:var(--button-text)}.premiumGoogleMaps{justify-content:center;padding:10px 12px;font-size:11px}
        @media(max-width:680px){.premiumLocations{padding:13px;border-radius:20px}.premiumLocationCard{grid-template-columns:1fr;padding:9px;gap:11px}.premiumMapWrap,.premiumMapWrap iframe{min-height:180px}.premiumLocationInfo{padding:3px 2px 4px}.premiumLocationTitle strong{font-size:16px}}

        .locationLink {
          min-height: 66px;
          padding: 10px 13px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 17px;
          background: var(--panel);
          color: inherit;
          text-decoration: none;
        }

        .locationIcon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: color-mix(in srgb,var(--accent) 18%,transparent);
          color: var(--accent);
          font-size: 22px;
          font-weight: 900;
        }

        .locationCopy {
          min-width: 0;
          display: grid;
          gap: 3px;
        }

        .locationCopy strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
        }

        .locationCopy small {
          color: var(--muted);
          font-size: 11px;
        }

        .locationAction {
          margin-left: auto;
          color: var(--accent);
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }

        .vcPublicContactRow { padding:14px 24px 24px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
        .vcPublicContact { min-height:56px; display:flex; align-items:center; justify-content:center; border:2px solid var(--button-border); border-radius:16px; background:var(--button-bg); color:var(--button-text); text-decoration:none; font-weight:900; }
        .vcPublicContact.primary { background:var(--button-bg); color:var(--button-text); border-color:var(--button-border); }

        .reviewModalBackdrop {
          position:fixed;
          inset:0;
          z-index:1000;
          padding:18px;
          display:grid;
          place-items:center;
          background:rgba(0,0,0,.72);
          backdrop-filter:blur(8px);
        }

        .reviewModal {
          width:min(470px,100%);
          max-height:calc(100dvh - 36px);
          overflow:auto;
          padding:20px;
          border:1px solid rgba(255,255,255,.12);
          border-radius:22px;
          background:#101d27;
          color:#fff;
          box-shadow:0 30px 90px rgba(0,0,0,.5);
        }

        .reviewModalHead {
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:14px;
          margin-bottom:16px;
        }

        .reviewModalHead small {
          color:var(--accent);
          font-size:10px;
          font-weight:900;
          letter-spacing:.14em;
        }

        .reviewModalHead h3 {
          margin:4px 0 0;
          font-size:24px;
          letter-spacing:-.03em;
        }

        .reviewClose {
          width:38px;
          height:38px;
          flex:0 0 38px;
          border:1px solid rgba(255,255,255,.14);
          border-radius:11px;
          background:rgba(255,255,255,.05);
          color:#fff;
          font-size:24px;
          line-height:1;
          cursor:pointer;
        }

        .reviewForm.simple {
          padding:0;
        }

        .reviewFormHead {
          margin-bottom:10px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
        }

        .catalogMainButton { width:100%; cursor:pointer; font:inherit; text-align:left; }
        .catalogIcon { display:grid; place-items:center; font-size:22px; background:rgba(255,255,255,.18); color:inherit; }
        .catalogModalBackdrop { position:fixed; inset:0; z-index:1800; padding:24px; display:grid; place-items:center; background:rgba(0,0,0,.72); backdrop-filter:blur(8px); }
        .catalogModal { width:min(820px,100%); max-height:92dvh; overflow:auto; border:1px solid rgba(255,255,255,.12); border-radius:26px; background:#07131c; color:#fff; box-shadow:0 28px 90px rgba(0,0,0,.45); }
        .catalogModalHead { position:sticky; top:0; z-index:3; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:20px; background:rgba(7,19,28,.94); backdrop-filter:blur(14px); border-bottom:1px solid rgba(255,255,255,.08); }
        .catalogModalHead small { color:var(--accent); font-weight:900; letter-spacing:.14em; }
        .catalogModalHead h2 { margin:4px 0 0; font-size:26px; }
        .catalogHeadActions,.catalogLangSwitch { display:flex; align-items:center; gap:8px; }
        .catalogLangSwitch { padding:4px; border-radius:12px; background:rgba(255,255,255,.07); }
        .catalogLangSwitch button,.catalogClose { border:0; color:#fff; cursor:pointer; font-weight:900; }
        .catalogLangSwitch button { min-width:38px; height:34px; border-radius:9px; background:transparent; }
        .catalogLangSwitch button.active { background:var(--accent); }
        .catalogClose { width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,.09); font-size:24px; }
        .menuCatalog { padding:0 0 18px; }
        .menuCategoryRail { display:flex; gap:12px; overflow-x:auto; padding:16px 18px 12px; scrollbar-width:none; border-bottom:1px solid rgba(255,255,255,.08); }
        .menuCategoryRail::-webkit-scrollbar { display:none; }
        .menuCategoryTab { flex:0 0 78px; border:0; background:transparent; color:#fff; cursor:pointer; padding:0 0 10px; position:relative; }
        .menuCategoryTab::after { content:""; position:absolute; left:12px; right:12px; bottom:0; height:3px; border-radius:99px; background:transparent; }
        .menuCategoryTab.active::after { background:var(--accent); box-shadow:0 0 12px color-mix(in srgb,var(--accent) 70%,transparent); }
        .menuCategoryVisual { width:58px; height:58px; margin:0 auto 7px; display:grid; place-items:center; border-radius:50%; background-size:cover!important; background-position:center!important; border:2px solid rgba(255,255,255,.18); box-shadow:inset 0 0 0 3px #07131c; }
        .menuCategoryTab.active .menuCategoryVisual { border-color:var(--accent); box-shadow:0 0 0 2px #07131c,0 0 0 4px var(--accent); }
        .menuCategoryVisual b { font-size:21px; }
        .menuCategoryTab strong { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; }
        .menuActiveCategory { padding:18px 20px 4px; }
        .menuSectionTitle { display:flex; align-items:end; justify-content:space-between; gap:16px; margin-bottom:10px; }
        .menuSectionTitle>div { display:flex; align-items:center; gap:12px; min-width:0; }
        .menuSectionTitle h3 { margin:0; font-size:25px; line-height:1; }
        .menuSectionTitle span { display:block; width:42px; height:3px; border-radius:99px; background:var(--accent); }
        .menuSectionTitle p { margin:0; color:rgba(255,255,255,.5); font-size:11px; font-weight:800; white-space:nowrap; }
        .menuItems { display:grid; }
        .menuItem { display:grid; grid-template-columns:76px minmax(0,1fr) auto; gap:13px; align-items:center; padding:13px 0; border-bottom:1px solid rgba(255,255,255,.11); }
        .menuItem:last-child { border-bottom:0; }
        .menuItemVisual { width:76px; height:68px; overflow:hidden; border-radius:12px; display:grid; place-items:center; background:rgba(255,255,255,.07); color:var(--accent); font-size:24px; }
        .menuItemVisual img { width:100%; height:100%; object-fit:cover; }
        .menuItemInfo { min-width:0; }
        .menuItemInfo strong { display:block; font-size:15px; line-height:1.25; }
        .menuItemInfo p { margin:5px 0 0; color:rgba(255,255,255,.65); font-size:12px; line-height:1.35; }
        .menuItemPrice { max-width:145px; color:var(--accent); font-size:14px; line-height:1.25; font-weight:950; text-align:right; }
        .catalogEmpty { padding:42px 20px; text-align:center; color:rgba(255,255,255,.62); }

        .reviewFormHead span {
          color:var(--accent);
          font-weight:900;
        }

        .scoreLine {
          display:grid;
          grid-template-columns:repeat(5,1fr);
          gap:8px;
          position:relative;
          margin-bottom:16px;
        }

        .scoreLine:before {
          content:"";
          position:absolute;
          left:6%;
          right:6%;
          top:50%;
          height:3px;
          background:rgba(255,255,255,.12);
          transform:translateY(-50%);
        }

        .scoreLine button {
          position:relative;
          z-index:2;
          min-height:42px;
          border:0;
          background:transparent;
          cursor:pointer;
        }

        .scoreLine button span {
          width:34px;
          height:34px;
          margin:auto;
          display:grid;
          place-items:center;
          border-radius:50%;
          background:#2b3440;
          color:#fff;
          font-weight:900;
          transition:.2s;
        }

        .scoreLine button.active span {
          background:var(--accent);
          transform:scale(1.08);
          box-shadow:0 0 0 5px color-mix(in srgb,var(--accent) 18%,transparent);
        }

        .reviewForm label {
          display:grid;
          gap:7px;
          margin-top:12px;
          font-size:12px;
          font-weight:800;
        }

        .reviewForm input,
        .reviewForm textarea {
          width:100%;
          min-height:46px;
          padding:0 12px;
          border:1px solid rgba(255,255,255,.13);
          border-radius:12px;
          background:#0a151e;
          color:#fff;
          font:inherit;
          outline:none;
        }

        .reviewForm textarea {
          min-height:92px;
          padding-top:12px;
          resize:vertical;
        }

        .sendReview {
          width:100%;
          margin-top:14px;
          min-height:46px;
          padding:0 16px;
          border:2px solid var(--button-border);
          border-radius:12px;
          background:var(--button-bg);
          color:var(--button-text);
          font-weight:900;
          cursor:pointer;
        }

        .reviewSuccess {
          margin-top:10px;
          color:#22c55e;
          font-size:13px;
          text-align:center;
        }

        .vcPublicQrSection { margin-top:18px; padding:24px; display:grid; grid-template-columns:1fr auto; gap:30px; align-items:center; }
        .vcPublicQrCopy small { color:var(--accent); font-size:11px; font-weight:900; letter-spacing:.16em; }
        .vcPublicQrCopy h2 { margin:8px 0; font-size:clamp(28px,5vw,42px); }
        .vcPublicQrCopy p { max-width:420px; margin:0 0 18px; color:var(--muted); line-height:1.55; }
        .vcPublicQrCopy button { min-height:46px; padding:0 16px; border:2px solid var(--button-border); border-radius:13px; background:var(--button-bg); color:var(--button-text); font-weight:900; cursor:pointer; }
        .vcPublicQrBox { width:176px; height:176px; padding:10px; border-radius:16px; background:#fff; }
        .vcPublicQrBox img { width:100%; height:100%; object-fit:contain; }
        .thanksToast {
          position: fixed;
          top: 22px;
          left: 50%;
          z-index: 2000;
          transform: translateX(-50%);
          min-width: 260px;
          max-width: calc(100% - 28px);
          padding: 13px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 1px solid rgba(34,197,94,.35);
          border-radius: 14px;
          background: #ecfdf3;
          color: #087a42;
          box-shadow: 0 18px 45px rgba(0,0,0,.14);
          font-size: 14px;
        }

        .thanksToast span {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #22c55e;
          color: #fff;
          font-weight: 900;
        }

        .centerState { min-height:100dvh; display:grid; place-items:center; background:#03111b; color:#fff; }
        .loader { width:40px; height:40px; border:4px solid rgba(255,255,255,.2); border-top-color:#ff6a3d; border-radius:50%; animation:spin .8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @media (max-width:620px) {
          .vcPublicPage { padding:12px 10px 28px; }
          .vcPublicPage.hasWifiAction { padding-bottom:108px; }
          .wifiFloatingAction { bottom:14px; }
          .wifiFloatingAction.bottom-left { left:14px; }
          .wifiFloatingAction.bottom-right { right:14px; }
          .wifiSheetBackdrop { padding:10px;place-items:end center; }
          .wifiSheet { border-radius:24px 24px 18px 18px; }
          .catalogModalBackdrop { padding:0; place-items:end center; }
          .catalogModal { width:100%; max-height:94dvh; border-radius:26px 26px 0 0; }
          .catalogModalHead { padding:16px; }
          .menuCategoryRail { gap:8px; padding:14px 12px 10px; }
          .menuCategoryTab { flex-basis:66px; }
          .menuCategoryVisual { width:52px; height:52px; }
          .menuActiveCategory { padding:16px 16px 2px; }
          .menuSectionTitle h3 { font-size:23px; }
          .menuItem { grid-template-columns:70px minmax(0,1fr) auto; gap:11px; padding:12px 0; }
          .menuItemVisual { width:70px; height:64px; }
          .menuItemPrice { max-width:105px; font-size:13px; }
          .shareTools button { padding:0 10px; font-size:12px; }
          .vcPublicCover { height:180px; }
          .vcPublicLinks { padding:0 14px; }
          .vcPublicContactRow { padding:14px; grid-template-columns:1fr; }
          .vcPublicQrSection { grid-template-columns:1fr; }
          .vcPublicQrBox { width:160px; height:160px; }
        }
.googleReviewsPublicButton{align-items:center}.googleReviewsIcon{display:grid;place-items:center;font-size:18px}.googleReviewsCopy{display:flex;flex-direction:column;align-items:flex-start;gap:3px}.googleReviewsCopy small{font-size:11px;opacity:.72;font-weight:600}
              `}</style>
    </main>
  );
}
