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

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function isAdmin() {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

const DEFAULT_SETTINGS = {
  site_title: "VisiteCard",
  site_description: "",
  share_image_url: "",
};

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Accès administrateur refusé." },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("site_settings")
      .select("site_title,site_description,share_image_url,updated_at")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json(
      {
        settings: data
          ? {
              site_title: data.site_title || DEFAULT_SETTINGS.site_title,
              site_description:
                data.site_description || DEFAULT_SETTINGS.site_description,
              share_image_url:
                data.share_image_url || DEFAULT_SETTINGS.share_image_url,
              updated_at: data.updated_at || null,
            }
          : DEFAULT_SETTINGS,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("ADMIN GET SITE SETTINGS:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Impossible de charger les paramètres du site.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Accès administrateur refusé." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const siteTitle = String(body?.site_title || "").trim();
    const siteDescription = String(body?.site_description || "").trim();
    const shareImageUrl = String(body?.share_image_url || "").trim();

    if (!siteTitle) {
      return NextResponse.json(
        { error: "Le titre du site est obligatoire." },
        { status: 400 }
      );
    }

    if (siteTitle.length > 120) {
      return NextResponse.json(
        { error: "Le titre ne doit pas dépasser 120 caractères." },
        { status: 400 }
      );
    }

    if (siteDescription.length > 500) {
      return NextResponse.json(
        { error: "La description ne doit pas dépasser 500 caractères." },
        { status: 400 }
      );
    }

    if (shareImageUrl) {
      try {
        const parsedUrl = new URL(shareImageUrl);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error();
        }
      } catch {
        return NextResponse.json(
          { error: "L'URL de l'image de partage n'est pas valide." },
          { status: 400 }
        );
      }
    }

    const supabase = getSupabaseAdmin();

    const payload = {
      id: 1,
      site_title: siteTitle,
      site_description: siteDescription,
      share_image_url: shareImageUrl,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("site_settings")
      .upsert(payload, { onConflict: "id" })
      .select("site_title,site_description,share_image_url,updated_at")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (error: any) {
    console.error("ADMIN UPDATE SITE SETTINGS:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Impossible d'enregistrer les paramètres du site.",
      },
      { status: 500 }
    );
  }
}
