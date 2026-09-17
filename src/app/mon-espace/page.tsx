"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { clearLegacyAuthStorage, getSupabaseBrowser } from "@/app/lib/supabase";
import ProfileCompaniesEditor from "@/components/ProfileCompaniesEditor";

type SocialType =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "tiktok"
  | "linkedin"
  | "youtube"
  | "x"
  | "website";

type SocialLink = {
  id: string;
  type: SocialType;
  label: string;
  value: string;
};

type CustomLink = {
  id: string;
  label: string;
  url: string;
  kind?: "link" | "location";
};

type CardData = {
  id?: string;
  user_id?: string;
  slug: string;
  full_name: string;
  job_title: string;
  company: string;
  bio: string;
  email: string;
  phone: string;
  address: string;
  photo_url: string;
  cover_url: string;
  primary_color: string;
  background_color: string;
  button_color: string;
  button_text_color: string;
  button_border_color: string;
  theme: "light" | "dark";
  language: "fr" | "en";
  is_public: boolean;
  show_qr: boolean;
  show_email: boolean;
  show_phone: boolean;
  show_address: boolean;
  show_reviews: boolean;
  led_enabled: boolean;
  led_color: string;
  social_links: SocialLink[];
  custom_links: CustomLink[];
  entity_type: "profile" | "company";
};

type StoredUser = {
  id?: string;
  email?: string;
  user_metadata?: {
    name?: string;
    entity_type?: "profile" | "company";
  };
};

const socialOptions: Array<{
  value: SocialType;
  label: string;
}> = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
  { value: "website", label: "Site web" },
];

const emptyCard: CardData = {
  slug: "",
  full_name: "",
  job_title: "",
  company: "",
  bio: "",
  email: "",
  phone: "",
  address: "",
  photo_url: "",
  cover_url: "",
  primary_color: "#ff6a3d",
  background_color: "#f5f1ef",
  button_color: "#b11235",
  button_text_color: "#ffffff",
  button_border_color: "#b11235",
  theme: "dark",
  language: "fr",
  is_public: true,
  show_qr: true,
  show_email: true,
  show_phone: true,
  show_address: true,
  show_reviews: true,
  led_enabled: true,
  led_color: "#ff6a3d",
  social_links: [],
  custom_links: [],
  entity_type: "company",
};

function uid() {
  return Math.random()
    .toString(36)
    .slice(2, 10);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}

function networkName(type: SocialType) {
  return (
    socialOptions.find(
      (item) => item.value === type
    )?.label || "Lien"
  );
}

function normalizeUrl(value: string) {
  const clean = (value || "").trim();

  if (!clean) return "";

  if (/^https?:\/\//i.test(clean)) {
    return clean;
  }

  return `https://${clean}`;
}

function socialHref(item: SocialLink) {
  const value = (item.value || "").trim();

  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (item.type === "whatsapp") {
    const number = value.replace(/\D/g, "");

    return number
      ? `https://wa.me/${number}`
      : "";
  }

  const handle =
    value.replace(/^@/, "");

  if (item.type === "instagram") {
    return `https://instagram.com/${handle}`;
  }

  if (item.type === "facebook") {
    return `https://facebook.com/${handle}`;
  }

  if (item.type === "tiktok") {
    return `https://tiktok.com/@${handle}`;
  }

  if (item.type === "linkedin") {
    return `https://linkedin.com/in/${handle}`;
  }

  if (item.type === "youtube") {
    return `https://youtube.com/@${handle}`;
  }

  if (item.type === "x") {
    return `https://x.com/${handle}`;
  }

  return normalizeUrl(value);
}

function socialColor(type: SocialType) {
  if (type === "instagram") {
    return "linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)";
  }

  if (type === "facebook") {
    return "#1877F2";
  }

  if (type === "whatsapp") {
    return "#25D366";
  }

  if (type === "tiktok") {
    return "#111111";
  }

  if (type === "linkedin") {
    return "#0A66C2";
  }

  if (type === "youtube") {
    return "#FF0000";
  }

  if (type === "x") {
    return "#111111";
  }

  if (type === "website") {
    return "#2563EB";
  }

  return "#E8B39B";
}

function SocialIcon({
  type,
}: {
  type: SocialType;
}) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (type === "instagram") {
    return (
      <svg {...common}>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke="white"
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          stroke="white"
          strokeWidth="2"
        />
        <circle
          cx="17.4"
          cy="6.7"
          r="1.1"
          fill="white"
        />
      </svg>
    );
  }

  if (type === "facebook") {
    return (
      <svg {...common}>
        <path
          d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.2-1.5 1.5-1.5h1.7V4a16 16 0 0 0-2.3-.1c-2.4 0-4 1.4-4 4V10H7.8v3h2.7v8h3.1Z"
          fill="white"
        />
      </svg>
    );
  }

  if (type === "whatsapp") {
    return (
      <svg {...common}>
        <path
          d="M20 11.7A8 8 0 0 1 8.2 18.8L4 20l1.2-4.1A8 8 0 1 1 20 11.7Z"
          stroke="white"
          strokeWidth="2"
        />
        <path
          d="M9 8.3c.2-.4.4-.4.7-.4h.4c.2 0 .4.1.5.4l.6 1.3c.1.2.1.4 0 .6l-.6.7c-.1.1-.2.2-.1.5.2.4.8 1.3 1.6 1.9.8.6 1.5.9 1.8 1 .2.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.7.8c.2.1.4.2.4.4.1.2.1.7-.2 1.3-.2.6-1.2 1.1-1.7 1.2-.5.1-1 .1-1.6-.1-.5-.2-1.2-.4-2-.8-3.4-1.5-5.5-5-5.7-5.2-.2-.3-1.4-1.9-1.4-3.6"
          fill="white"
          transform="scale(.67) translate(5.1 5.1)"
        />
      </svg>
    );
  }

  if (type === "tiktok") {
    return (
      <svg {...common}>
        <path
          d="M14.2 3c.4 2.5 1.9 4 4.3 4.2V10c-1.5.1-2.7-.3-4.3-1.3v4.9c0 6.2-6.8 8.2-9.5 3.7-1.8-2.8-.7-7.8 4.9-8v2.7c-.4.1-.9.2-1.4.4-1.3.5-2.1 1.3-1.9 2.9.4 2.9 5.8 3.7 5.4-1.9V3h2.5Z"
          fill="white"
        />
      </svg>
    );
  }

  if (type === "linkedin") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="9"
          width="3"
          height="11"
          rx="1"
          fill="white"
        />
        <circle
          cx="5.5"
          cy="5.5"
          r="1.7"
          fill="white"
        />
        <path
          d="M10 9h3v1.5c.8-1 1.9-1.8 3.5-1.8 2.8 0 3.2 2 3.2 4.6V20h-3v-5.5c0-1.3 0-2.9-1.8-2.9-1.8 0-2 1.4-2 2.9V20h-3V9Z"
          fill="white"
        />
      </svg>
    );
  }

  if (type === "youtube") {
    return (
      <svg {...common}>
        <path
          d="M21 12s0-3.4-.4-5a2.3 2.3 0 0 0-1.7-1.7C17.3 4.9 12 4.9 12 4.9s-5.3 0-6.9.4A2.3 2.3 0 0 0 3.4 7C3 8.6 3 12 3 12s0 3.4.4 5a2.3 2.3 0 0 0 1.7 1.7c1.6.4 6.9.4 6.9.4s5.3 0 6.9-.4a2.3 2.3 0 0 0 1.7-1.7c.4-1.6.4-5 .4-5Z"
          fill="white"
        />
        <path
          d="m10 15 5-3-5-3v6Z"
          fill="#FF0000"
        />
      </svg>
    );
  }

  if (type === "x") {
    return (
      <svg {...common}>
        <path
          d="M5 4h3.5l3.9 5.1L16.7 4h2l-5.3 6.5L19.4 20H16l-4.3-5.6L7.1 20H5l5.9-7.1L5 4Z"
          fill="white"
        />
      </svg>
    );
  }

  if (type === "website") {
    return (
      <svg {...common}>
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="white"
          strokeWidth="1.8"
        />
        <path
          d="M3.8 12h16.4M12 3.5c2.15 2.3 3.25 5.15 3.25 8.5S14.15 18.2 12 20.5M12 3.5C9.85 5.8 8.75 8.65 8.75 12s1.1 6.2 3.25 8.5"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Zm1 7h6m-3-3v6"
        stroke="#111"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

async function getValidAccessToken(
  _supabaseUrl: string,
  _supabaseKey: string
) {
  const supabase = getSupabaseBrowser();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // Nettoyage de l'ancien système d'authentification.
  // /mon-espace ne doit plus jamais choisir un utilisateur à partir
  // de visitecard_access_token / visitecard_refresh_token.
  clearLegacyAuthStorage();

  return {
    accessToken: session.access_token,
    user,
  };
}

export default function MonEspacePage() {
  const router = useRouter();

  const [card, setCard] =
    useState<CardData>(emptyCard);

  const [user, setUser] =
    useState<StoredUser | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    photoPreview,
    setPhotoPreview,
  ] = useState("");

  const [
    coverPreview,
    setCoverPreview,
  ] = useState("");

  const [imageEditor, setImageEditor] = useState<{
    kind: "photo" | "cover";
    src: string;
    zoom: number;
    x: number;
    y: number;
  } | null>(null);

  const [
    showNetworkPicker,
    setShowNetworkPicker,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showSaveSuccess, setShowSaveSuccess] =
    useState(false);

  const siteUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    (typeof window !==
    "undefined"
      ? window.location.origin
      : "");

  const publicUrl =
    useMemo(
      () =>
        card.slug
          ? `${siteUrl}/${card.slug}`
          : "",
      [
        card.slug,
        siteUrl,
      ]
    );

  const qrUrl =
    useMemo(
      () =>
        publicUrl
          ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=0&format=png&data=${encodeURIComponent(
              publicUrl
            )}`
          : "",
      [publicUrl]
    );

  useEffect(() => {
    async function init() {
      const supabaseUrl =
        process.env
          .NEXT_PUBLIC_SUPABASE_URL;

      const supabaseKey =
        process.env
          .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (
        !supabaseUrl ||
        !supabaseKey
      ) {
        setError(
          "Configuration Supabase manquante."
        );

        setLoading(false);
        return;
      }

      try {
        const session =
          await getValidAccessToken(
            supabaseUrl,
            supabaseKey
          );

        if (
          !session?.accessToken ||
          !session?.user?.id
        ) {
          logout();
          return;
        }

        const accessToken =
          session.accessToken;

        const currentUser =
          session.user as StoredUser;

        const currentUserId =
          currentUser.id;

        if (!currentUserId) {
          setError(
            "Utilisateur introuvable."
          );

          setLoading(false);
          return;
        }

        setUser(
          currentUser
        );

        const response =
          await fetch(
            `${supabaseUrl}/rest/v1/cards?user_id=eq.${currentUserId}&select=*&order=created_at.asc&limit=1`,
            {
              headers: {
                apikey:
                  supabaseKey,

                Authorization:
                  `Bearer ${accessToken}`,

                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          const raw =
            await response.text();

          setError(
            raw ||
              "Impossible de charger votre carte."
          );

          setLoading(false);
          return;
        }

        const rows =
          await response.json();

        if (
          Array.isArray(rows) &&
          rows.length
        ) {
          const loaded =
            rows[0];

          setCard({
            ...emptyCard,
            ...loaded,

            slug: loaded.slug ?? "",
            full_name: loaded.full_name ?? "",
            job_title: loaded.job_title ?? "",
            company: loaded.company ?? "",
            bio: loaded.bio ?? "",
            email: loaded.email ?? "",
            phone: loaded.phone ?? "",
            address: loaded.address ?? "",
            photo_url: loaded.photo_url ?? "",
            cover_url: loaded.cover_url ?? "",
            primary_color: loaded.primary_color ?? "#ff6a3d",
            background_color: loaded.background_color ?? "#f5f1ef",
            button_color: loaded.button_color ?? loaded.primary_color ?? "#b11235",
            button_text_color: loaded.button_text_color ?? "#ffffff",
            button_border_color: loaded.button_border_color ?? loaded.primary_color ?? "#b11235",

            led_enabled:
              typeof loaded.led_enabled ===
              "boolean"
                ? loaded.led_enabled
                : true,

            led_color:
              loaded.led_color ||
              loaded.primary_color ||
              "#ff6a3d",

            social_links: (() => {
              const links: SocialLink[] = Array.isArray(loaded.social_links)
                ? loaded.social_links.map((item: any): SocialLink => ({
                    id: item.id || uid(),
                    type: item.type || "website",
                    label:
                      item.label ||
                      item.name ||
                      networkName(item.type || "website"),
                    value: item.value || item.url || "",
                  }))
                : [];

              // Compatibilité avec les anciennes cartes : le site pouvait
              // être enregistré dans cards.website sans être dans social_links.
              const legacyWebsite = String(loaded.website || "").trim();

              if (
                legacyWebsite &&
                !links.some((item) => item.type === "website")
              ) {
                links.push({
                  id: uid(),
                  type: "website",
                  label: "Site web",
                  value: legacyWebsite,
                });
              }

              return links;
            })(),

            custom_links:
              Array.isArray(
                loaded.custom_links
              )
                ? loaded.custom_links.map(
                    (item: any): CustomLink => ({
                      id:
                        item.id ||
                        uid(),

                      label:
                        item.label ||
                        item.name ||
                        "",

                      url:
                        item.url ||
                        "",

                      kind:
                        item.kind === "location"
                          ? "location"
                          : "link",
                    })
                  )
                : [],
          });

          setPhotoPreview(
            loaded.photo_url || ""
          );

          setCoverPreview(
            loaded.cover_url || ""
          );

          setLoading(false);
          return;
        }

        const name =
          currentUser
            .user_metadata
            ?.name || "";

        const email =
          currentUser.email || "";

        const baseSlug =
          slugify(name) ||
          "carte";

        const generatedSlug =
          `${baseSlug}-${currentUserId.slice(
            0,
            6
          )}`;

        const draft: CardData =
          {
            ...emptyCard,

            full_name: name,

            email,

            slug:
              generatedSlug,
            entity_type: currentUser.user_metadata?.entity_type === "profile" ? "profile" : "company",
          };

        const createResponse =
          await fetch(
            `${supabaseUrl}/rest/v1/cards`,
            {
              method:
                "POST",

              headers: {
                apikey:
                  supabaseKey,

                Authorization:
                  `Bearer ${accessToken}`,

                "Content-Type":
                  "application/json",

                Prefer:
                  "return=representation",
              },

              body:
                JSON.stringify({
                  user_id:
                    currentUserId,

                  slug:
                    generatedSlug,

                  full_name:
                    name,

                  email,

                  primary_color:
                    draft.primary_color,

                  background_color:
                    draft.background_color,

                  theme:
                    draft.theme,

                  language:
                    draft.language,

                  is_public:
                    true,

                  show_qr:
                    true,

                  show_email:
                    true,

                  show_phone:
                    true,

                  show_address:
                    true,

                  led_enabled:
                    true,

                  led_color:
                    draft.led_color,

                  social_links:
                    [],

                  custom_links:
                    [],

                  entity_type:
                    draft.entity_type,
                }),
            }
          );

        if (
          createResponse.ok
        ) {
          const created =
            await createResponse.json();

          setCard(
            Array.isArray(
              created
            ) &&
              created[0]
              ? {
                  ...draft,
                  ...created[0],
                }
              : draft
          );
        } else {
          setCard(draft);
        }
      } catch {
        setError(
          "Impossible de charger votre espace."
        );
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  function updateField<
    K extends keyof CardData
  >(
    field: K,
    value: CardData[K]
  ) {
    setCard(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  }

  function addNetwork(
    type: SocialType
  ) {
    setCard(
      (previous) => ({
        ...previous,

        social_links: [
          ...previous.social_links,

          {
            id: uid(),
            type,
            label:
              networkName(type),
            value: "",
          },
        ],
      })
    );

    setShowNetworkPicker(
      false
    );
  }

  function updateSocial(
    index: number,
    field:
      | "value"
      | "label",
    value: string
  ) {
    setCard(
      (previous) => {
        const next = [
          ...previous.social_links,
        ];

        const item = {
          ...next[index],
        };

        if (
          field === "value"
        ) {
          item.value =
            value;

          if (
            !(item.label ?? "").trim()
          ) {
            item.label =
              networkName(
                item.type
              );
          }
        } else {
          item.label =
            value;
        }

        next[index] =
          item;

        return {
          ...previous,
          social_links: next,
        };
      }
    );
  }

  function removeSocial(
    index: number
  ) {
    setCard(
      (previous) => ({
        ...previous,

        social_links:
          previous.social_links.filter(
            (_, i) =>
              i !== index
          ),
      })
    );
  }

  function addCustomLink() {
    setCard(
      (previous) => ({
        ...previous,

        custom_links: [
          ...previous.custom_links,

          {
            id: uid(),
            label: "",
            url: "",
            kind: "link",
          },
        ],
      })
    );
  }

  function updateCustomLink(
    index: number,
    field:
      keyof CustomLink,
    value: string
  ) {
    setCard(
      (previous) => {
        const next = [
          ...previous.custom_links,
        ];

        next[index] = {
          ...next[index],
          [field]: value,
        };

        return {
          ...previous,
          custom_links: next,
        };
      }
    );
  }

  function removeCustomLink(
    index: number
  ) {
    setCard(
      (previous) => ({
        ...previous,

        custom_links:
          previous.custom_links.filter(
            (_, i) =>
              i !== index
          ),
      })
    );
  }

  function addLocation() {
    setCard((previous) => ({
      ...previous,
      custom_links: [
        ...previous.custom_links,
        {
          id: uid(),
          label: "",
          url: "",
          kind: "location",
        },
      ],
    }));
  }

  const imageDragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    width: number;
    height: number;
  } | null>(null);

  function clampCropPosition(value: number) {
    return Math.max(-100, Math.min(100, value));
  }

  function handleImagePointerDown(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    if (!imageEditor) return;

    const bounds = event.currentTarget.getBoundingClientRect();

    imageDragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: imageEditor.x,
      startY: imageEditor.y,
      width: Math.max(bounds.width, 1),
      height: Math.max(bounds.height, 1),
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleImagePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    const drag = imageDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = ((event.clientX - drag.startClientX) / drag.width) * 100;
    const dy = ((event.clientY - drag.startClientY) / drag.height) * 100;

    setImageEditor((previous) =>
      previous
        ? {
            ...previous,
            x: clampCropPosition(drag.startX + dx),
            y: clampCropPosition(drag.startY + dy),
          }
        : previous
    );
  }

  function handleImagePointerEnd(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    const drag = imageDragRef.current;

    if (drag?.pointerId === event.pointerId) {
      imageDragRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  }

  function readImage(
    event: ChangeEvent<HTMLInputElement>,
    kind: "photo" | "cover"
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choisissez une image.");
      return;
    }

    if (file.size > 5000000) {
      setError("L’image doit faire moins de 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageEditor({
        kind,
        src: String(reader.result || ""),
        zoom: 1,
        x: 0,
        y: 0,
      });
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function applyImageEditor() {
    if (!imageEditor) return;

    const { kind, src, zoom, x, y } = imageEditor;
    const image = new Image();

    const result = await new Promise<string>((resolve, reject) => {
      image.onload = () => {
        const width = kind === "photo" ? 800 : 1200;
        const height = kind === "photo" ? 800 : 630;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Impossible de préparer l’image."));
          return;
        }

        const targetRatio = width / height;
        const imageRatio = image.naturalWidth / image.naturalHeight;

        let sw: number;
        let sh: number;

        if (imageRatio > targetRatio) {
          sh = image.naturalHeight / zoom;
          sw = sh * targetRatio;
        } else {
          sw = image.naturalWidth / zoom;
          sh = sw / targetRatio;
        }

        const availableX = Math.max(0, image.naturalWidth - sw);
        const availableY = Math.max(0, image.naturalHeight - sh);

        const sx = Math.max(
          0,
          Math.min(availableX, availableX / 2 - (x / 100) * (availableX / 2))
        );
        const sy = Math.max(
          0,
          Math.min(availableY, availableY / 2 - (y / 100) * (availableY / 2))
        );

        ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };

      image.onerror = () => reject(new Error("Impossible de lire l’image."));
      image.src = src;
    });

    if (kind === "photo") {
      setPhotoPreview(result);
      updateField("photo_url", result);
    } else {
      setCoverPreview(result);
      updateField("cover_url", result);
    }

    setImageEditor(null);
  }

  async function saveCard(event?: FormEvent) {
    event?.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");
    setShowSaveSuccess(false);

    if (!(card.full_name ?? "").trim()) {
      setError("Ajoutez votre nom.");
      return;
    }

    setSaving(true);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Configuration Supabase manquante.");
      }

      const session = await getValidAccessToken(supabaseUrl, supabaseKey);

      if (!session?.accessToken || !session?.user?.id) {
        router.replace("/connexion");
        return;
      }

      const currentUserId = session.user.id;

      const cleanSocialLinks = card.social_links
        .map((item) => ({
          id: item.id || uid(),
          type: item.type,
          label: (item.label || "").trim() || networkName(item.type),
          value: (item.value || "").trim(),
          name: (item.label || "").trim() || networkName(item.type),
          url: (item.value || "").trim(),
        }))
        .filter((item) => item.value.length > 0);

      const cleanCustomLinks: CustomLink[] = card.custom_links
        .map((item): CustomLink => ({
          id: item.id || uid(),
          label: (item.label || "").trim(),
          url: (item.url || "").trim(),
          kind: item.kind === "location" ? "location" : "link",
        }))
        .filter((item) => item.label || item.url);

      const baseSlug =
        card.slug ||
        `${slugify(card.full_name ?? "") || "carte"}-${currentUserId.slice(0, 6)}`;

      const socialValue = (type: SocialType) =>
        cleanSocialLinks.find((item) => item.type === type)?.value || "";

      const payload = {
        user_id: currentUserId,
        slug: baseSlug,
        full_name: (card.full_name ?? "").trim(),
        job_title: (card.job_title ?? "").trim(),
        company: (card.company ?? "").trim(),
        bio: (card.bio ?? "").trim(),
        email: (card.email ?? "").trim(),
        phone: (card.phone ?? "").trim(),
        address: (card.address ?? "").trim(),
        whatsapp: socialValue("whatsapp"),
        website: socialValue("website"),
        facebook: socialValue("facebook"),
        instagram: socialValue("instagram"),
        tiktok: socialValue("tiktok"),
        linkedin: socialValue("linkedin"),
        photo_url: card.photo_url ?? "",
        cover_url: card.cover_url ?? "",
        primary_color: card.primary_color ?? "#ff6a3d",
        background_color: card.background_color ?? "#f5f1ef",
        button_color: card.button_color ?? "#b11235",
        button_text_color: card.button_text_color ?? "#ffffff",
        button_border_color: card.button_border_color ?? "#b11235",
        theme: card.theme,
        language: card.language,
        is_public: card.is_public,
        show_qr: card.show_qr,
        show_email: card.show_email,
        show_phone: card.show_phone,
        show_address: card.show_address,
        show_reviews: card.show_reviews,
        led_enabled: card.led_enabled,
        led_color: card.led_color ?? "#ff6a3d",
        social_links: cleanSocialLinks,
        custom_links: cleanCustomLinks,
        entity_type: card.entity_type,
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(
        card.id
          ? `${supabaseUrl}/rest/v1/cards?id=eq.${card.id}`
          : `${supabaseUrl}/rest/v1/cards`,
        {
          method: card.id ? "PATCH" : "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const raw = await response.text();
        let message = raw || "Impossible d'enregistrer votre carte.";

        try {
          const parsed = JSON.parse(raw);
          message =
            parsed?.message ||
            parsed?.details ||
            parsed?.hint ||
            message;
        } catch {}

        throw new Error(message);
      }

      setCard((previous) => ({
        ...previous,
        ...payload,
        slug: baseSlug,
        social_links: cleanSocialLinks.map((item) => ({
          id: item.id,
          type: item.type,
          label: item.label,
          value: item.value,
        })),
        custom_links: cleanCustomLinks,
      }));

      setSuccess("");
      setShowSaveSuccess(true);

      window.setTimeout(() => {
        setShowSaveSuccess(false);
      }, 1800);
    } catch (saveError: any) {
      if (saveError?.name === "AbortError") {
        setError("Enregistrement trop long. Réessayez.");
      } else {
        setError(
          saveError?.message ||
            "Impossible d'enregistrer votre carte."
        );
      }
    } finally {
      window.clearTimeout(timeout);
      setSaving(false);
    }
  }

  async function copyPublicLink() {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(
        publicUrl
      );

      setSuccess(
        "Lien copié."
      );
    } catch {
      window.prompt(
        "Copiez le lien",
        publicUrl
      );
    }
  }

  async function sharePublicLink() {
    if (!publicUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title:
            card.full_name ||
            "VisiteCard",

          text:
            card.job_title ||
            "",

          url:
            publicUrl,
        });

        return;
      } catch {}
    }

    await copyPublicLink();
  }

  async function downloadQr() {
    if (!qrUrl) return;

    try {
      const response =
        await fetch(qrUrl);

      const blob =
        await response.blob();

      const objectUrl =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        objectUrl;

      link.download =
        `visitecard-${card.slug}.png`;

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(
        objectUrl
      );
    } catch {
      window.open(
        qrUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  function sendQrByEmail() {
    if (!publicUrl) return;

    const subject =
      encodeURIComponent(
        `Ma carte digitale ${
          card.full_name ||
          ""
        }`
      );

    const body =
      encodeURIComponent(
        `Bonjour,\n\nVoici ma carte digitale :\n${publicUrl}\n\nQR Code :\n${qrUrl}`
      );

    window.location.href =
      `mailto:?subject=${subject}&body=${body}`;
  }

  async function logout() {
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
    } finally {
      clearLegacyAuthStorage();
      router.replace(
        "/connexion"
      );
    }
  }

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loader" />
      </main>
    );
  }

  const dark =
    card.theme === "dark";

  const previewBg =
    dark
      ? "#03111b"
      : card.background_color;

  const previewText =
    dark
      ? "#fff"
      : "#151515";

  const previewPanel =
    dark
      ? "#111f2a"
      : "#fff";

  return (
    <main className="dashboard">


      <section className="dashboardHead">
        <div>
          <span className="eyebrow">
            MON ESPACE
          </span>

          <h1>
            Ma carte digitale
          </h1>

          <p>
            Modifiez votre carte et voyez immédiatement le résultat public.
          </p>
        </div>

        <div className="statusPill">
          <span
            className={
              card.is_public
                ? "dot on"
                : "dot"
            }
          />

          {card.is_public
            ? "Carte publique"
            : "Carte privée"}
        </div>
      </section>

      {imageEditor && (
        <div className="imageEditorOverlay">
          <div className="imageEditorModal">
            <div className="imageEditorHeader">
              <strong>
                {imageEditor.kind === "photo"
                  ? "Ajuster la photo"
                  : "Ajuster la couverture"}
              </strong>
              <button type="button" onClick={() => setImageEditor(null)}>×</button>
            </div>

            <div
              className={`imageCropFrame ${imageEditor.kind === "photo" ? "roundCrop" : "coverCrop"}`}
              onPointerDown={handleImagePointerDown}
              onPointerMove={handleImagePointerMove}
              onPointerUp={handleImagePointerEnd}
              onPointerCancel={handleImagePointerEnd}
            >
              <img
                src={imageEditor.src}
                alt=""
                draggable={false}
                style={{
                  transform: `scale(${imageEditor.zoom}) translate(${imageEditor.x / imageEditor.zoom}%, ${imageEditor.y / imageEditor.zoom}%)`,
                }}
              />
              <div className="cropMoveHint">Glissez l’image pour la cadrer</div>
            </div>

            <div className="imageEditorControls">
              <div className="zoomLabel">
                <strong>Zoom</strong>
                <span>{Math.round(imageEditor.zoom * 100)}%</span>
              </div>

              <div className="zoomRow">
                <button type="button" onClick={() =>
                  setImageEditor(v => v ? {...v, zoom: Math.max(1, Number((v.zoom - .1).toFixed(2)))} : v)
                }>−</button>
                <input
                  type="range" min="1" max="3" step="0.05"
                  value={imageEditor.zoom}
                  onChange={e => setImageEditor(v => v ? {...v, zoom: Number(e.target.value)} : v)}
                />
                <button type="button" onClick={() =>
                  setImageEditor(v => v ? {...v, zoom: Math.min(3, Number((v.zoom + .1).toFixed(2)))} : v)
                }>+</button>
              </div>

              <button
                type="button"
                className="resetCrop"
                onClick={() => setImageEditor(v => v ? {...v, zoom: 1, x: 0, y: 0} : v)}
              >
                Réinitialiser le cadrage
              </button>

              <div className="imageEditorActions">
                <button type="button" onClick={() => setImageEditor(null)}>Annuler</button>
                <button type="button" className="applyCrop" onClick={applyImageEditor}>
                  Valider le cadrage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="workspace">
        <form
          className="editor"
          onSubmit={saveCard}
        >
          <section className="formSection">
            <div className="sectionTitle">
              <h2>
                Identité visuelle
              </h2>
            </div>

            <div className="mediaGrid">
              <div className="mediaCard">
                <div className="mediaPreview avatarPreview">
                  {photoPreview ||
                  card.photo_url ? (
                    <img
                      src={
                        photoPreview ||
                        card.photo_url
                      }
                      alt=""
                    />
                  ) : (
                    <span>
                      {card.full_name
                        ?.charAt(0)
                        .toUpperCase() ||
                        "V"}
                    </span>
                  )}
                </div>

                <div className="mediaInfo">
                  <strong>{card.entity_type === "profile" ? "Photo de profil" : "Logo"}</strong>

                  <small>
                    Importez puis zoomez et déplacez la photo.
                  </small>

                  <label className="uploadButton">
                    Choisir / Recadrer

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(
                        event
                      ) =>
                        readImage(
                          event,
                          "photo"
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="mediaCard">
                <div className="mediaPreview coverPreview">
                  {coverPreview ||
                  card.cover_url ? (
                    <img
                      src={
                        coverPreview ||
                        card.cover_url
                      }
                      alt=""
                    />
                  ) : (
                    <div
                      style={{
                        background:
                          `linear-gradient(135deg,#151515,${card.primary_color})`,
                      }}
                    />
                  )}
                </div>

                <div className="mediaInfo">
                  <strong>
                    Photo de couverture
                  </strong>

                  <small>
                    Importez, zoomez et choisissez exactement le cadrage.
                  </small>

                  <label className="uploadButton">
                    Choisir / Recadrer

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(
                        event
                      ) =>
                        readImage(
                          event,
                          "cover"
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid two">
              <label>
                {card.entity_type === "profile" ? "Nom et prénom" : "Nom de la société"}

                <input
                  value={
                    card.full_name
                  }
                  onChange={(e) =>
                    updateField(
                      "full_name",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                {card.entity_type === "profile" ? "Profession" : "Activité"}

                <input
                  value={
                    card.job_title
                  }
                  onChange={(e) =>
                    updateField(
                      "job_title",
                      e.target.value
                    )
                  }
                  placeholder="Facultatif"
                />
              </label>



              <label>
                E-mail

                <input
                  type="email"
                  value={
                    card.email
                  }
                  onChange={(e) =>
                    updateField(
                      "email",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Téléphone

                <input
                  value={
                    card.phone
                  }
                  onChange={(e) =>
                    updateField(
                      "phone",
                      e.target.value
                    )
                  }
                  placeholder="+216..."
                />
              </label>

            </div>

            <div className="locationManager">
              <div className="locationManagerHead">
                <div>
                  <h3>Localisations</h3>
                  <p>
                    Dans Google Maps : Partager → Copier le lien, puis collez-le ici.
                    Vous pouvez ajouter plusieurs adresses.
                  </p>
                </div>

                <button type="button" className="addLocationButton" onClick={addLocation}>
                  + Ajouter une adresse
                </button>
              </div>

              <div className="locationList">
                {card.custom_links.map((item, index) =>
                  item.kind === "location" ? (
                    <div className="locationCard" key={item.id}>
                      <div className="locationPin" aria-hidden="true">⌖</div>

                      <label>
                        Nom du lieu
                        <input
                          value={item.label}
                          onChange={(e) => updateCustomLink(index, "label", e.target.value)}
                          placeholder="Ex. Salle principale, Bureau..."
                        />
                      </label>

                      <label>
                        Lien Google Maps
                        <input
                          value={item.url}
                          onChange={(e) => updateCustomLink(index, "url", e.target.value)}
                          placeholder="https://maps.app.goo.gl/..."
                          inputMode="url"
                        />
                      </label>

                      {item.url.trim() ? (
                        <a
                          className="testMapLink"
                          href={normalizeUrl(item.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Tester
                        </a>
                      ) : (
                        <span className="testMapLink disabled">Tester</span>
                      )}

                      <button
                        type="button"
                        className="removeButton"
                        onClick={() => removeCustomLink(index)}
                        aria-label="Supprimer cette localisation"
                      >
                        ×
                      </button>
                    </div>
                  ) : null
                )}

                {!card.custom_links.some((item) => item.kind === "location") ? (
                  <div className="emptyLocations">
                    <span>⌖</span>
                    <div>
                      <strong>Aucune localisation ajoutée</strong>
                      <small>Collez simplement votre lien partagé depuis Google Maps.</small>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <label>
              Présentation

              <textarea
                value={
                  card.bio
                }
                maxLength={200}
                onChange={(e) =>
                  updateField(
                    "bio",
                    e.target.value
                  )
                }
                placeholder="Quelques mots sur vous..."
              />
            </label>
          </section>

          <section className="formSection">
            <div className="sectionTitle networkTitle">
              <div>
                <h2>
                  Réseaux sociaux
                </h2>

                <p>
                  Choisissez le vrai réseau, ajoutez le lien et le nom affiché.
                </p>
              </div>

              <button
                type="button"
                className="addNetworkMain"
                onClick={() =>
                  setShowNetworkPicker(
                    (value) =>
                      !value
                  )
                }
              >
                + Ajouter
              </button>
            </div>

            {showNetworkPicker ? (
              <div className="networkPicker">
                {socialOptions.map(
                  (option) => (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      onClick={() =>
                        addNetwork(
                          option.value
                        )
                      }
                    >
                      <span
                        style={{
                          background:
                            socialColor(
                              option.value
                            ),
                        }}
                      >
                        <SocialIcon
                          type={
                            option.value
                          }
                        />
                      </span>

                      <b>
                        {
                          option.label
                        }
                      </b>
                    </button>
                  )
                )}
              </div>
            ) : null}

            <div className="linkerList">
              {card.social_links.map(
                (
                  item,
                  index
                ) => (
                  <div
                    className="linkerCard"
                    key={
                      item.id
                    }
                  >
                    <div
                      className="socialLogo"
                      style={{
                        background:
                          socialColor(
                            item.type
                          ),
                      }}
                    >
                      <SocialIcon
                        type={
                          item.type
                        }
                      />
                    </div>

                    <div className="networkIdentity">
                      <strong>
                        {networkName(
                          item.type
                        )}
                      </strong>
                    </div>

                    <label>
                      Lien

                      <input
                        value={
                          item.value
                        }
                        onChange={(
                          e
                        ) =>
                          updateSocial(
                            index,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder={
                          item.type ===
                          "whatsapp"
                            ? "+216..."
                            : "https://... ou @profil"
                        }
                      />
                    </label>

                    <label>
                      Nom affiché

                      <input
                        value={
                          item.label
                        }
                        onChange={(
                          e
                        ) =>
                          updateSocial(
                            index,
                            "label",
                            e.target.value
                          )
                        }
                        placeholder={networkName(
                          item.type
                        )}
                      />
                    </label>

                    <button
                      type="button"
                      className="removeButton"
                      onClick={() =>
                        removeSocial(
                          index
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="formSection">
            <div className="sectionTitle">
              <h2>
                Autres liens
              </h2>
            </div>

            <div className="customList">
              {card.custom_links.map(
                (
                  item,
                  index
                ) =>
                  item.kind !== "location" ? (
                  <div
                    className="customCard"
                    key={
                      item.id
                    }
                  >
                    <div className="customIcon">
                      ↗
                    </div>

                    <label>
                      Lien

                      <input
                        value={
                          item.url
                        }
                        onChange={(
                          e
                        ) =>
                          updateCustomLink(
                            index,
                            "url",
                            e.target.value
                          )
                        }
                        placeholder="https://..."
                      />
                    </label>

                    <label>
                      Nom affiché

                      <input
                        value={
                          item.label
                        }
                        onChange={(
                          e
                        ) =>
                          updateCustomLink(
                            index,
                            "label",
                            e.target.value
                          )
                        }
                        placeholder="Ma boutique"
                      />
                    </label>

                    <button
                      type="button"
                      className="removeButton"
                      onClick={() =>
                        removeCustomLink(
                          index
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ) : null
              )}
            </div>

            <button
              type="button"
              className="addButton"
              onClick={
                addCustomLink
              }
            >
              + Ajouter un autre lien
            </button>
          </section>

          {card.entity_type === "profile" && card.id ? (
            <ProfileCompaniesEditor
              profileCardId={card.id}
              language={card.language === "en" ? "en" : "fr"}
            />
          ) : null}

          <section className="formSection">
            <div className="sectionTitle">
              <h2>
                Apparence
              </h2>
            </div>

            <div className="grid two">
              <label>
                Langue par défaut

                <select
                  value={
                    card.language
                  }
                  onChange={(e) =>
                    updateField(
                      "language",
                      e.target.value as
                        | "fr"
                        | "en"
                    )
                  }
                >
                  <option value="fr">
                    Français
                  </option>

                  <option value="en">
                    English
                  </option>
                </select>
              </label>

              <label>
                Thème

                <select
                  value={
                    card.theme
                  }
                  onChange={(e) =>
                    updateField(
                      "theme",
                      e.target.value as
                        | "light"
                        | "dark"
                    )
                  }
                >
                  <option value="dark">
                    Sombre
                  </option>

                  <option value="light">
                    Clair
                  </option>
                </select>
              </label>
            </div>

            <div className="colorsGrid">
              <div className="paletteIntro">
                <strong>Charte couleur</strong>
                <span>Choisissez votre couleur avec le sélecteur ou saisissez directement un code HEX comme #B11235. Les autres éléments reprennent automatiquement cette charte.</span>
              </div>

              <label className="colorField">
                Couleur principale

                <div>
                  <input
                    type="color"
                    value={
                      card.primary_color
                    }
                    onChange={(e) =>
                      updateField(
                        "primary_color",
                        e.target.value
                      )
                    }
                  />

                  <span>
                    {
                      card.primary_color
                    }
                  </span>
                </div>
              </label>

              <label className="colorField">
                Couleur bouton

                <div>
                  <input type="color" value={card.button_color} onChange={(e) => updateField("button_color", e.target.value)} />
                  <input
                    className="hexInput"
                    value={card.button_color}
                    onChange={(e) => updateField("button_color", e.target.value)}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (!/^#[0-9A-Fa-f]{6}$/.test(value)) updateField("button_color", "#b11235");
                    }}
                    maxLength={7}
                    spellCheck={false}
                  />
                </div>
              </label>

              <label className="colorField">
                Texte bouton

                <div>
                  <input type="color" value={card.button_text_color} onChange={(e) => updateField("button_text_color", e.target.value)} />
                  <input
                    className="hexInput"
                    value={card.button_text_color}
                    onChange={(e) => updateField("button_text_color", e.target.value)}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (!/^#[0-9A-Fa-f]{6}$/.test(value)) updateField("button_text_color", "#ffffff");
                    }}
                    maxLength={7}
                    spellCheck={false}
                  />
                </div>
              </label>

              <label className="colorField">
                Cadre bouton

                <div>
                  <input type="color" value={card.button_border_color} onChange={(e) => updateField("button_border_color", e.target.value)} />
                  <input
                    className="hexInput"
                    value={card.button_border_color}
                    onChange={(e) => updateField("button_border_color", e.target.value)}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (!/^#[0-9A-Fa-f]{6}$/.test(value)) updateField("button_border_color", "#b11235");
                    }}
                    maxLength={7}
                    spellCheck={false}
                  />
                </div>
              </label>

              <label className="colorField">
                Couleur LED

                <div>
                  <input
                    type="color"
                    value={
                      card.led_color
                    }
                    onChange={(e) =>
                      updateField(
                        "led_color",
                        e.target.value
                      )
                    }
                  />

                  <span>
                    {
                      card.led_color
                    }
                  </span>
                </div>
              </label>
            </div>

            <div className="toggleRow">
              <div>
                <strong>
                  Effet LED sur les cadres
                </strong>

                <small>
                  Contour lumineux sur la page publique.
                </small>
              </div>

              <button
                type="button"
                className={`switch ${
                  card.led_enabled
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateField(
                    "led_enabled",
                    !card.led_enabled
                  )
                }
              >
                <span />
              </button>
            </div>
          </section>

          <section className="formSection">
            <div className="sectionTitle">
              <h2>
                Boutons de contact
              </h2>
            </div>

            <div className="toggleRow">
              <strong>
                Afficher Email
              </strong>

              <button
                type="button"
                className={`switch ${
                  card.show_email
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateField(
                    "show_email",
                    !card.show_email
                  )
                }
              >
                <span />
              </button>
            </div>

            <div className="toggleRow">
              <strong>
                Afficher Appeler
              </strong>

              <button
                type="button"
                className={`switch ${
                  card.show_phone
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateField(
                    "show_phone",
                    !card.show_phone
                  )
                }
              >
                <span />
              </button>
            </div>

            <div className="toggleRow">
              <strong>
                Afficher Localisations
              </strong>

              <button
                type="button"
                className={`switch ${
                  card.show_address
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateField(
                    "show_address",
                    !card.show_address
                  )
                }
              >
                <span />
              </button>
            </div>
          </section>

          <section className="formSection">
            <div className="sectionTitle">
              <h2>
                Mon QR Code
              </h2>
            </div>

            <div className="qrManager">
              <div className="qrManagerImage">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="QR Code"
                  />
                ) : null}
              </div>

              <div className="qrManagerInfo">
                <small>
                  Votre lien public
                </small>

                <strong>
                  {publicUrl ||
                    "Création..."}
                </strong>

                <div className="qrManagerButtons">
                  <button
                    type="button"
                    onClick={
                      downloadQr
                    }
                  >
                    ↓ Télécharger
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={
                      sendQrByEmail
                    }
                  >
                    ✉ Envoyer par e-mail
                  </button>
                </div>
              </div>
            </div>

            <div className="readonlyLinkBox">
              <div>
                <small>
                  Lien public
                </small>

                <strong>
                  {publicUrl ||
                    "Création..."}
                </strong>
              </div>

              <div className="linkButtons">
                <button
                  type="button"
                  onClick={
                    copyPublicLink
                  }
                >
                  ⧉ Copier
                </button>

                <button
                  type="button"
                  onClick={
                    sharePublicLink
                  }
                >
                  ⌯ Partager
                </button>
              </div>
            </div>

            <div className="toggleRow">
              <strong>
                Carte publique
              </strong>

              <button
                type="button"
                className={`switch ${
                  card.is_public
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateField(
                    "is_public",
                    !card.is_public
                  )
                }
              >
                <span />
              </button>
            </div>

            <div className="toggleRow">
              <strong>
                Afficher le QR Code
              </strong>

              <button
                type="button"
                className={`switch ${
                  card.show_qr
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateField(
                    "show_qr",
                    !card.show_qr
                  )
                }
              >
                <span />
              </button>
            </div>
          </section>

          {error ? (
            <div className="message error">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="message success">
              {success}
            </div>
          ) : null}

          <div className="saveArea">
            <button
              type="submit"
              className="saveButton"
              disabled={saving}
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer ma carte"}
            </button>
          </div>
        </form>

        <aside className="previewColumn">
          <div className="stickyPreview">
            <div className="previewTopTools">
              <strong>
                Aperçu
              </strong>

              <button
                type="button"
                onClick={() =>
                  publicUrl &&
                  window.open(
                    publicUrl,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Ouvrir
              </button>
            </div>

            <div
              className={`previewCard ${
                card.led_enabled
                  ? "ledPreview"
                  : ""
              }`}
              style={{
                background:
                  previewBg,

                color:
                  previewText,

                ["--led" as any]:
                  card.led_color,

                ["--accent" as any]:
                  card.primary_color,

                ["--preview-panel" as any]:
                  previewPanel,

                ["--button-bg" as any]:
                  card.button_color || card.primary_color,

                ["--button-text" as any]:
                  card.button_text_color || "#ffffff",

                ["--button-border" as any]:
                  card.button_border_color || card.button_color || card.primary_color,
              }}
            >
              <div className="previewCover">
                {coverPreview ||
                card.cover_url ? (
                  <img
                    src={
                      coverPreview ||
                      card.cover_url
                    }
                    alt=""
                  />
                ) : (
                  <div
                    style={{
                      background:
                        `linear-gradient(135deg,#111820,${card.primary_color})`,
                    }}
                  />
                )}
              </div>

              <div className="previewAvatar">
                {photoPreview ||
                card.photo_url ? (
                  <img
                    src={
                      photoPreview ||
                      card.photo_url
                    }
                    alt=""
                  />
                ) : (
                  <span>
                    {card.full_name
                      ?.charAt(0)
                      .toUpperCase() ||
                      "V"}
                  </span>
                )}
              </div>

              <div className="previewIdentity">
                <h3>
                  {card.full_name ||
                    "Votre nom"}
                </h3>

                {card.job_title ? (
                  <p>
                    {
                      card.job_title
                    }
                  </p>
                ) : null}
              </div>

              <div className={`previewLinks ${card.entity_type === "profile" ? "profilePreviewLinks" : ""}`}>
                {card.social_links
                  .filter((item) =>
                    item.value.trim() &&
                    (card.entity_type !== "profile" || item.type !== "whatsapp")
                  )
                  .map((item) => (
                    <a
                      key={
                        item.id
                      }
                      className={
                        card.led_enabled
                          ? "ledItem"
                          : ""
                      }
                      href={
                        socialHref(
                          item
                        )
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span
                        className="previewSocialIcon"
                        style={{
                          background:
                            socialColor(
                              item.type
                            ),
                        }}
                      >
                        <SocialIcon
                          type={
                            item.type
                          }
                        />
                      </span>

                      <b>
                        {
                          item.label
                        }
                      </b>
                    </a>
                  ))}

                {card.entity_type !== "profile" && card.show_address
                  ? card.custom_links
                      .filter(
                        (item) =>
                          item.kind === "location" &&
                          item.label.trim() &&
                          item.url.trim()
                      )
                      .map((item) => (
                        <a
                          key={item.id}
                          className={card.led_enabled ? "ledItem previewLocation" : "previewLocation"}
                          href={normalizeUrl(item.url)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className="previewMapIcon">⌖</span>
                          <b>{item.label}</b>
                          <small>Itinéraire</small>
                        </a>
                      ))
                  : null}
              </div>

              {card.entity_type === "profile" &&
              ((card.show_phone !== false && card.phone.trim()) ||
                card.social_links.some(
                  (item) => item.type === "whatsapp" && item.value.trim()
                ) ||
                (card.show_email !== false && card.email.trim())) ? (
                <div className="profilePreviewContacts">
                  {card.show_phone !== false && card.phone ? (
                    <span>☎ Appeler</span>
                  ) : null}
                  {card.social_links.some((item) => item.type === "whatsapp" && item.value.trim()) ? (
                    <span>WhatsApp</span>
                  ) : null}
                  {card.show_email !== false && card.email ? (
                    <span>✉ Email</span>
                  ) : null}
                </div>
              ) : null}

              {card.show_qr &&
              publicUrl ? (
                <div
                  className={`previewQr ${
                    card.led_enabled
                      ? "ledItem"
                      : ""
                  }`}
                >
                  <div>
                    <small>
                      MON QR CODE
                    </small>

                    <h4>
                      Partagez ma carte
                    </h4>
                  </div>

                  <img
                    src={qrUrl}
                    alt="QR Code"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {showSaveSuccess ? (
        <div className="vcSaveModalOverlay" role="dialog" aria-modal="true">
          <div className="vcSaveModal">
            <div className="vcSaveModalIcon">✓</div>
            <h2>Enregistrement avec succès</h2>
          </div>
        </div>
      ) : null}

      <style jsx global>{`

        .vcSaveModalOverlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(8, 15, 25, 0.52);
          backdrop-filter: blur(4px);
        }

        .vcSaveModal {
          width: min(440px, 100%);
          padding: 32px 26px 26px;
          border-radius: 24px;
          background: #ffffff;
          text-align: center;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
        }

        .vcSaveModalIcon {
          width: 62px;
          height: 62px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #ff4f27;
          color: #ffffff;
          font-size: 32px;
          font-weight: 900;
        }

        .vcSaveModal h2 {
          margin: 0 0 10px;
          color: #0b1729;
          font-size: 23px;
          line-height: 1.2;
        }

        .vcSaveModal p {
          margin: 0;
          color: #6c7480;
          font-size: 15px;
          line-height: 1.55;
        }

        .vcSaveModalActions {
          margin-top: 24px;
          display: grid;
          gap: 10px;
        }

        .vcSaveModalPublic,
        .vcSaveModalClose {
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          font: inherit;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .vcSaveModalPublic {
          border: 1px solid #ff4f27;
          background: #ff4f27;
          color: #ffffff;
        }

        .vcSaveModalClose {
          border: 1px solid #dfe3e8;
          background: #ffffff;
          color: #172033;
        }
        * {
          box-sizing: border-box;
        }

        html {
          -webkit-text-size-adjust: 100%;
        }

        body {
          margin: 0;
          background: #f6f6f5;
          color: #111;
          font-family: Inter, ui-sans-serif, system-ui,
            -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        input,
        textarea,
        select {
          font-size: 16px;
        }

        .loadingPage {
          min-height: 100dvh;
          display: grid;
          place-items: center;
        }

        .loader {
          width: 38px;
          height: 38px;
          border: 4px solid #eee;
          border-top-color: #ff4f23;
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .topbar {
          height: 76px;
          padding: 0 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e8e8e6;
          background: rgba(255,255,255,.96);
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(14px);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #111;
          text-decoration: none;
          font-size: 22px;
          font-weight: 900;
        }

        .brand span:last-child span {
          color: #ff4f23;
        }

        .brandIcon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #ff4f23;
          color: #fff;
        }

        .topActions {
          display: flex;
          gap: 8px;
        }

        .topActions button {
          min-height: 42px;
          padding: 0 14px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .navTop {
          border: 1px solid #ddd;
          background: #fff;
          color: #111;
        }

        .navTop:hover {
          border-color: #ff4f23;
          color: #ff4f23;
        }

        .previewTop {
          border: 1px solid #ff4f23;
          background: #fff4ef;
          color: #ff4f23;
        }

        .copyTop,
        .shareTop,
        .avisTop {
          border: 1px solid #ddd;
          background: #fff;
        }

        .avisTop {
          color: #111;
        }

        .openAvisButton {
          margin-top: 12px;
          min-height: 44px;
          padding: 0 15px;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: #111;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .logout {
          border: 0;
          background: #111;
          color: #fff;
        }

        .dashboardHead {
          width: min(1400px, calc(100% - 48px));
          margin: auto;
          padding: 40px 0 28px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .eyebrow {
          color: #ff4f23;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .13em;
        }

        .dashboardHead h1 {
          margin: 7px 0 0;
          font-size: clamp(36px, 5vw, 56px);
          letter-spacing: -.055em;
        }

        .dashboardHead p {
          margin: 12px 0 0;
          color: #7d8490;
        }

        .statusPill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 14px;
          border: 1px solid #ddd;
          border-radius: 999px;
          background: #fff;
          font-size: 13px;
          font-weight: 800;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #aaa;
        }

        .dot.on {
          background: #18b77a;
        }

        .workspace {
          width: min(1400px, calc(100% - 48px));
          margin: auto;
          padding-bottom: 90px;
          display: grid;
          grid-template-columns: minmax(0,1fr) 410px;
          gap: 30px;
          align-items: start;
        }

        .editor {
          display: grid;
          gap: 18px;
        }

        .formSection {
          padding: 28px;
          border: 1px solid #e5e5e3;
          border-radius: 24px;
          background: #fff;
        }

        .sectionTitle {
          margin-bottom: 22px;
        }

        .sectionTitle h2 {
          margin: 0;
          font-size: 22px;
        }

        .sectionTitle p {
          margin: 5px 0 0;
          color: #8b919b;
          font-size: 12px;
        }

        .networkTitle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .addNetworkMain {
          min-height: 42px;
          padding: 0 15px;
          border: 0;
          border-radius: 12px;
          background: #111;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .networkPicker {
          margin: -8px 0 18px;
          padding: 12px;
          display: grid;
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 8px;
          border: 1px solid #e3e3e1;
          border-radius: 16px;
          background: #fafafa;
        }

        .networkPicker button {
          min-height: 82px;
          padding: 10px;
          display: grid;
          justify-items: center;
          align-content: center;
          gap: 7px;
          border: 1px solid #e2e2df;
          border-radius: 13px;
          background: #fff;
          cursor: pointer;
        }

        .networkPicker button span {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
        }

        .networkPicker button b {
          font-size: 11px;
        }

        .grid {
          display: grid;
          gap: 16px;
        }

        .grid.two {
          grid-template-columns:
            repeat(2,minmax(0,1fr));
        }

        label {
          display: grid;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
        }

        input,
        textarea,
        select {
          width: 100%;
          min-height: 50px;
          padding: 0 14px;
          border: 1px solid #dcdcd9;
          border-radius: 13px;
          background: #fff;
          color: #111;
          outline: none;
        }

        textarea {
          min-height: 110px;
          padding-top: 14px;
          resize: vertical;
        }

        .mediaGrid {
          margin-bottom: 24px;
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 14px;
        }

        .mediaCard {
          padding: 14px;
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 14px;
          align-items: center;
          border: 1px solid #e2e2df;
          border-radius: 16px;
          background: #fbfbfa;
        }

        .mediaPreview {
          overflow: hidden;
          background: #111;
        }

        .avatarPreview {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          font-size: 28px;
          font-weight: 900;
        }

        .coverPreview {
          width: 100px;
          height: 72px;
          border-radius: 12px;
        }

        .mediaPreview img,
        .mediaPreview > div {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .mediaInfo {
          min-width: 0;
          display: grid;
          gap: 5px;
        }

        .mediaInfo small {
          color: #8b919b;
          font-size: 12px;
        }

        .locationManager {
          margin: 22px 0;
          padding: 18px;
          border: 1px solid #e2e2df;
          border-radius: 18px;
          background: #fbfbfa;
        }
        .locationManagerHead {
          display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px;
        }
        .locationManagerHead h3 { margin:0;font-size:16px; }
        .locationManagerHead p { max-width:560px;margin:6px 0 0;color:#7d8490;font-size:12px;line-height:1.5; }
        .addLocationButton {
          min-height:42px;flex:0 0 auto;padding:0 14px;border:0;border-radius:11px;background:#111827;color:#fff;font-weight:850;cursor:pointer;
        }
        .locationList { display:grid;gap:10px; }
        .locationCard {
          display:grid;grid-template-columns:46px minmax(0,.8fr) minmax(0,1.3fr) auto 38px;gap:10px;align-items:end;padding:12px;border:1px solid #e3e3e1;border-radius:15px;background:#fff;
        }
        .locationPin {
          width:46px;height:46px;display:grid;place-items:center;align-self:end;border-radius:13px;background:#fff0eb;color:#ff4f23;font-size:24px;font-weight:900;
        }
        .testMapLink {
          min-height:46px;padding:0 13px;display:inline-flex;align-items:center;justify-content:center;align-self:end;border:1px solid #d9d9d6;border-radius:11px;background:#fff;color:#111827;font-size:12px;font-weight:850;text-decoration:none;
        }
        .testMapLink.disabled { opacity:.4;pointer-events:none; }
        .emptyLocations {
          min-height:76px;padding:14px;display:flex;align-items:center;gap:12px;border:1px dashed #d5d5d1;border-radius:14px;color:#68707d;background:#fff;
        }
        .emptyLocations > span {
          width:42px;height:42px;display:grid;place-items:center;border-radius:12px;background:#f4f4f2;font-size:22px;
        }
        .emptyLocations div { display:grid;gap:3px; }
        .emptyLocations strong { color:#242b35;font-size:13px; }
        .emptyLocations small { font-size:11px; }

        .uploadButton {
          width: max-content;
          margin-top: 5px;
          padding: 8px 11px;
          border: 1px solid #ddd;
          border-radius: 9px;
          background: #fff;
          cursor: pointer;
          font-size: 11px;
        }

        .uploadButton input {
          display: none;
        }

        .linkerList,
        .customList {
          display: grid;
          gap: 11px;
        }

        .linkerCard {
          display: grid;
          grid-template-columns: 50px 115px 1fr 1fr 38px;
          gap: 9px;
          align-items: end;
          padding: 12px;
          border: 1px solid #e3e3e1;
          border-radius: 16px;
          background: #fcfcfb;
        }

        .networkIdentity {
          min-height: 44px;
          display: flex;
          align-items: center;
          padding-bottom: 2px;
        }

        .networkIdentity strong {
          font-size: 12px;
        }

        .customCard {
          display: grid;
          grid-template-columns: 50px 1fr 1fr 38px;
          gap: 9px;
          align-items: end;
          padding: 12px;
          border: 1px solid #e3e3e1;
          border-radius: 16px;
          background: #fcfcfb;
        }

        .socialLogo,
        .customIcon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #fff;
          font-weight: 900;
        }

        .customIcon {
          background: #e8b39b;
          color: #111;
        }

        .removeButton {
          width: 38px;
          height: 38px;
          margin-bottom: 3px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background: #fff;
          color: #888;
          font-size: 21px;
          cursor: pointer;
        }

        .addButton {
          margin-top: 13px;
          min-height: 44px;
          padding: 0 15px;
          border: 1px dashed #d1d1cf;
          border-radius: 12px;
          background: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .colorsGrid {
          margin-top: 15px;
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 14px;
        }

        .colorField {
          padding: 14px;
          border: 1px solid #e2e2df;
          border-radius: 15px;
        }

        .colorField > div {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .colorField input {
          width: 42px;
          height: 42px;
          min-height: 0;
          padding: 0;
          border: 0;
        }

        .toggleRow {
          margin-top: 10px;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border: 1px solid #e2e2df;
          border-radius: 15px;
        }

        .toggleRow small {
          display: block;
          margin-top: 3px;
          color: #8b919b;
        }

        .switch {
          width: 48px;
          height: 28px;
          padding: 3px;
          border: 0;
          border-radius: 999px;
          background: #ddd;
          cursor: pointer;
        }

        .switch span {
          display: block;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          transition: .2s;
        }

        .switch.active {
          background: #ff4f23;
        }

        .switch.active span {
          transform: translateX(20px);
        }

        .qrManager {
          padding: 18px;
          display: grid;
          grid-template-columns: 170px 1fr;
          gap: 18px;
          align-items: center;
          border: 1px solid #e2e2df;
          border-radius: 18px;
          background: #fafafa;
        }

        .qrManagerImage {
          width: 170px;
          height: 170px;
          padding: 10px;
          border-radius: 15px;
          background: #fff;
          border: 1px solid #eee;
        }

        .qrManagerImage img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .qrManagerInfo {
          min-width: 0;
          display: grid;
          gap: 7px;
        }

        .qrManagerInfo small {
          color: #8b919b;
        }

        .qrManagerInfo strong {
          overflow-wrap: anywhere;
        }

        .qrManagerButtons {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .qrManagerButtons button {
          min-height: 42px;
          padding: 0 14px;
          border: 0;
          border-radius: 11px;
          background: #ff4f23;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .qrManagerButtons .secondary {
          border: 1px solid #ddd;
          background: #fff;
          color: #111;
        }

        .readonlyLinkBox {
          margin-top: 12px;
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border: 1px solid #dededb;
          border-radius: 15px;
          background: #fafafa;
        }

        .readonlyLinkBox > div:first-child {
          min-width: 0;
          display: grid;
          gap: 4px;
        }

        .readonlyLinkBox strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
        }

        .linkButtons {
          display: flex;
          gap: 7px;
        }

        .linkButtons button {
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid #ddd;
          border-radius: 9px;
          background: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .message {
          padding: 13px 15px;
          border-radius: 13px;
        }

        .message.error {
          background: #fff1f0;
          color: #b42318;
        }

        .message.success {
          background: #ecfdf3;
          color: #027a48;
        }

        .saveArea {
          position: sticky;
          bottom: 12px;
          z-index: 20;
          padding: 10px;
          border: 1px solid #e4e4e1;
          border-radius: 17px;
          background: rgba(255,255,255,.95);
        }

        .saveButton {
          width: 100%;
          min-height: 56px;
          border: 0;
          border-radius: 13px;
          background: #ff4f23;
          color: #fff;
          font-weight: 900;
          cursor: pointer;
        }

        .previewColumn {
          min-width: 0;
        }

        .stickyPreview {
          position: sticky;
          top: 94px;
          display: grid;
          gap: 12px;
        }

        .previewTopTools {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .previewTopTools button {
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .previewCard {
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 32px;
          box-shadow: 0 24px 60px rgba(20,18,16,.17);
        }

        .ledPreview {
          border-color: var(--led);
          box-shadow:
            0 0 0 1px
              color-mix(
                in srgb,
                var(--led) 45%,
                transparent
              ),
            0 0 18px
              color-mix(
                in srgb,
                var(--led) 26%,
                transparent
              ),
            0 24px 60px rgba(20,18,16,.17);
        }

        .previewCover {
          height: 160px;
          overflow: hidden;
          background: #111;
        }

        .previewCover img,
        .previewCover > div {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .previewAvatar {
          width: 94px;
          height: 94px;
          margin: -47px auto 10px;
          position: relative;
          z-index: 2;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 3px solid var(--accent);
          border-radius: 50%;
          background: #eee;
          color: #222;
          font-size: 30px;
          font-weight: 900;
        }

        .previewAvatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .previewIdentity {
          padding: 0 18px;
          text-align: center;
        }

        .previewIdentity h3 {
          margin: 0;
          font-size: 25px;
        }

        .previewIdentity p {
          margin: 6px 0 0;
          opacity: .65;
          font-size: 12px;
        }

        .previewMapIcon {
          width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border-radius:12px;background:color-mix(in srgb,var(--accent) 18%,transparent);color:var(--accent);font-size:21px;font-weight:900;
        }
        .previewLocation { border:2px solid var(--button-border) !important; background:var(--button-bg) !important; color:var(--button-text) !important; }
        .previewLocation .previewMapIcon,.previewLocation b,.previewLocation small { color:var(--button-text) !important; }
        .previewLocation small { margin-left:auto;font-size:10px;font-weight:850; }
        .profilePreviewLinks { display:flex !important; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:8px !important; }
        .profilePreviewLinks:empty { display:none !important; margin:0 !important; padding:0 !important; }
        .profilePreviewLinks a { width:38px !important; min-height:38px !important; padding:3px !important; border:0 !important; background:transparent !important; }
        .profilePreviewLinks a b { display:none; }
        .profilePreviewLinks .previewSocialIcon { width:34px;height:34px;border-radius:50%; }
        .profilePreviewContacts { display:flex;justify-content:center;gap:7px;flex-wrap:wrap;padding:6px 18px 18px; }
        .profilePreviewContacts span { min-height:34px;padding:0 11px;display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.045);font-size:10px;font-weight:800; }

        .previewLinks {
          margin-top: 18px;
          padding: 0 14px;
          display: grid;
          gap: 8px;
        }

        .previewLinks a {
          min-height: 56px;
          padding: 8px 11px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 15px;
          background: var(--preview-panel);
          color: inherit;
          text-decoration: none;
        }

        .ledItem {
          border-color:
            color-mix(
              in srgb,
              var(--led) 55%,
              rgba(255,255,255,.08)
            ) !important;

          box-shadow:
            0 0 10px
              color-mix(
                in srgb,
                var(--led) 14%,
                transparent
              );
        }

        .previewSocialIcon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: #fff;
          font-weight: 900;
        }

        .previewLinks b {
          font-size: 12px;
        }

        .previewQr {
          margin: 14px;
          padding: 14px;
          display: grid;
          grid-template-columns: 1fr 105px;
          gap: 12px;
          align-items: center;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 17px;
        }

        .previewQr small {
          color: var(--accent);
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .13em;
        }

        .previewQr h4 {
          margin: 5px 0;
          font-size: 17px;
        }

        .previewQr img {
          width: 105px;
          height: 105px;
          padding: 6px;
          border-radius: 10px;
          background: #fff;
        }

        @media (max-width: 1180px) {
          .workspace {
            grid-template-columns: 1fr;
          }

          .previewColumn {
            order: -1;
          }

          .stickyPreview {
            position: static;
            max-width: 430px;
            margin: auto;
          }
        }

        .paletteIntro{grid-column:1/-1;display:flex;flex-direction:column;gap:5px;padding:12px 14px;border:1px solid var(--line,#e5e7eb);border-radius:12px}
        .paletteIntro strong{font-size:13px}
        .paletteIntro span{font-size:11px;line-height:1.45;opacity:.7}
        .hexInput{width:92px!important;min-width:92px;height:34px!important;padding:0 8px!important;border:1px solid #d9dde7!important;border-radius:8px!important;font-size:12px!important;font-family:ui-monospace,SFMono-Regular,Menlo,monospace!important;text-transform:uppercase}

        @media (max-width: 760px) {
          .topbar {
            padding: 0 14px;
            height: 66px;
          }

          .brand {
            font-size: 18px;
          }

          .brandIcon {
            width: 32px;
            height: 32px;
          }

          .topbar {
            height: auto;
            min-height: 66px;
            padding-top: 10px;
            padding-bottom: 10px;
            align-items: flex-start;
          }

          .topActions {
            max-width: calc(100vw - 120px);
            gap: 5px;
            display: flex;
            overflow-x: auto;
            scrollbar-width: none;
            padding-bottom: 2px;
          }

          .topActions::-webkit-scrollbar {
            display: none;
          }

          .navTop {
            flex: 0 0 auto;
          }

          .topActions button {
            min-height: 38px;
            padding: 0 9px;
            font-size: 10px;
          }

          .copyTop,
          .shareTop {
            display: none;
          }

          .avisTop {
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .dashboardHead {
            width: calc(100% - 28px);
            padding: 26px 0 20px;
            flex-direction: column;
            align-items: flex-start;
          }

          .workspace {
            width: 100%;
            gap: 14px;
          }

          .formSection {
            padding: 20px 15px;
            border-left: 0;
            border-right: 0;
            border-radius: 0;
          }

          .grid.two,
          .mediaGrid,
          .colorsGrid {
            grid-template-columns: 1fr;
          }

          .networkPicker {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .networkTitle {
            align-items: flex-start;
          }

          .linkerCard {
            grid-template-columns: 50px 1fr 38px;
          }

          .socialLogo {
            grid-column: 1;
            grid-row: 1;
          }

          .networkIdentity {
            grid-column: 2;
            grid-row: 1;
          }

          .linkerCard .removeButton {
            grid-column: 3;
            grid-row: 1;
          }

          .linkerCard > label {
            grid-column: 1 / 4;
          }

          .customCard {
            grid-template-columns: 50px 1fr 38px;
          }

          .customCard > label {
            grid-column: 1 / 4;
          }

          .customCard > label:first-of-type {
            grid-column: 2;
            grid-row: 1;
          }

          .customCard .customIcon {
            grid-column: 1;
            grid-row: 1;
          }

          .customCard .removeButton {
            grid-column: 3;
            grid-row: 1;
          }

          .qrManager {
            grid-template-columns: 1fr;
          }

          .qrManagerImage {
            margin: auto;
          }

          .readonlyLinkBox {
            align-items: stretch;
            flex-direction: column;
          }

          .linkButtons {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .saveArea {
            margin: 0 12px;
          }
        }
        @media (max-width: 760px) {
          .locationManagerHead { display:grid; }
          .addLocationButton { width:100%; }
          .locationCard { grid-template-columns:42px 1fr 38px;align-items:start; }
          .locationPin { width:42px;height:42px;grid-row:1 / span 2; }
          .locationCard label { grid-column:2 / 4; }
          .locationCard .testMapLink { grid-column:2 / 3;width:max-content;min-height:40px; }
          .locationCard .removeButton { grid-column:3 / 4;align-self:end; }
          .cropMoveHint { font-size:10px; }
        }

        .imageEditorOverlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:grid;place-items:center;padding:16px}
        .imageEditorModal{width:min(560px,100%);max-height:94vh;overflow:auto;background:#fff;color:#171717;border-radius:22px;padding:18px}
        .imageEditorHeader{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;font-size:18px}
        .imageEditorHeader button{width:36px;height:36px;border:0;border-radius:50%;font-size:24px;cursor:pointer}
        .imageCropFrame{position:relative;margin:0 auto 20px;overflow:hidden;background:#111;display:grid;place-items:center;touch-action:none;cursor:grab}
        .imageCropFrame:active{cursor:grabbing}
        .imageCropFrame.roundCrop{width:min(340px,78vw);aspect-ratio:1;border-radius:50%}
        .imageCropFrame.coverCrop{width:100%;aspect-ratio:1200/630;border-radius:16px}
        .imageCropFrame img{width:100%;height:100%;object-fit:cover;user-select:none;pointer-events:none;transform-origin:center;will-change:transform}
        .cropMoveHint{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);max-width:calc(100% - 24px);padding:7px 10px;border-radius:999px;background:rgba(0,0,0,.62);color:#fff;font-size:11px;font-weight:800;white-space:nowrap;pointer-events:none}
        .imageEditorControls{display:grid;gap:14px}
        .imageEditorControls input[type="range"]{width:100%;accent-color:#ff6a3d}
        .zoomLabel{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px}
        .zoomLabel span{color:#ff6a3d;font-weight:900}
        .zoomRow{display:grid;grid-template-columns:42px 1fr 42px;gap:10px;align-items:center}
        .zoomRow button{height:42px;border:1px solid #ddd;border-radius:11px;background:#fff;font-size:22px;cursor:pointer}
        .resetCrop{min-height:40px;border:1px solid #e3e3df;border-radius:10px;background:#fafafa;color:#4b5563;font-weight:800;cursor:pointer}
        .imageEditorActions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .imageEditorActions button{min-height:44px;border-radius:12px;border:1px solid #ddd;background:#fff;font-weight:800;cursor:pointer}
        .imageEditorActions .applyCrop{background:#ff6a3d;border-color:#ff6a3d;color:#fff}
      `}
</style>
    </main>
  );
}
