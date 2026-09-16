import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import {
  ADMIN_COOKIE,
  verifyAdminSession,
} from "@/lib/admin-session";

export const dynamic = "force-dynamic";

/* =========================================================
   SUPABASE ADMIN
========================================================= */

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL manquante."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/* =========================================================
   VÉRIFIER SESSION ADMIN
========================================================= */

async function isAdmin() {
  const cookieStore = await cookies();

  const sessionCookie =
    cookieStore.get(ADMIN_COOKIE)?.value;

  return verifyAdminSession(sessionCookie);
}

/* =========================================================
   GET
   Récupérer tous les utilisateurs
========================================================= */

export async function GET() {
  try {
    const authorized = await isAdmin();

    if (!authorized) {
      return NextResponse.json(
        {
          error:
            "Accès administrateur refusé.",
        },
        {
          status: 403,
        }
      );
    }

    const supabase = getSupabaseAdmin();

    /* -----------------------------------------
       AUTH USERS
    ----------------------------------------- */

    const {
      data: usersData,
      error: usersError,
    } =
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) {
      throw usersError;
    }

    /* -----------------------------------------
       CARTES
    ----------------------------------------- */

    const {
      data: cards,
      error: cardsError,
    } = await supabase
      .from("cards")
      .select("user_id, slug");

    if (cardsError) {
      console.error(
        "Erreur chargement cards:",
        cardsError
      );
    }

    const cardsMap = new Map<
      string,
      string | null
    >();

    for (const card of cards || []) {
      cardsMap.set(
        card.user_id,
        card.slug || null
      );
    }

    /* -----------------------------------------
       FORMAT UTILISATEURS
    ----------------------------------------- */

    const users = usersData.users
      .map((user) => ({
        id: user.id,

        email:
          user.email || "",

        name:
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          "",

        created_at:
          user.created_at,

        card_slug:
          cardsMap.get(user.id) || null,
      }))
      .sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      );

    return NextResponse.json(
      {
        total: users.length,
        users,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error(
      "ADMIN GET USERS:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Impossible de charger les utilisateurs.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   Ajouter un utilisateur
========================================================= */

export async function POST(
  request: Request
) {
  try {
    const authorized = await isAdmin();

    if (!authorized) {
      return NextResponse.json(
        {
          error:
            "Accès administrateur refusé.",
        },
        {
          status: 403,
        }
      );
    }

    /* -----------------------------------------
       BODY
    ----------------------------------------- */

    let body: any;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Données envoyées invalides.",
        },
        {
          status: 400,
        }
      );
    }

    const name =
      String(body?.name || "").trim();

    const email =
      String(body?.email || "")
        .trim()
        .toLowerCase();

    const password =
      String(body?.password || "");

    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!email) {
      return NextResponse.json(
        {
          error:
            "L'adresse e-mail est obligatoire.",
        },
        {
          status: 400,
        }
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error:
            "L'adresse e-mail n'est pas valide.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Le mot de passe doit contenir au moins 8 caractères.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      getSupabaseAdmin();

    /* -----------------------------------------
       CRÉER USER AUTH
    ----------------------------------------- */

    const {
      data: createData,
      error: createError,
    } =
      await supabase.auth.admin.createUser(
        {
          email,
          password,

          email_confirm: true,

          user_metadata: {
            name,
          },
        }
      );

    if (createError) {
      const message =
        createError.message || "";

      if (
        message
          .toLowerCase()
          .includes("already")
      ) {
        return NextResponse.json(
          {
            error:
              "Un utilisateur avec cette adresse e-mail existe déjà.",
          },
          {
            status: 409,
          }
        );
      }

      throw createError;
    }

    const user =
      createData.user;

    if (!user) {
      throw new Error(
        "Utilisateur non créé."
      );
    }

    /* -----------------------------------------
       CRÉER / METTRE À JOUR PROFILE
    ----------------------------------------- */

    const {
      error: profileError,
    } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          name:
            name ||
            email.split("@")[0],
          email,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

    if (profileError) {
      console.error(
        "Création profile:",
        profileError
      );
    }

    /* -----------------------------------------
       CRÉER CARTE PAR DÉFAUT
    ----------------------------------------- */

    const baseSlug = makeSlug(
      name ||
        email.split("@")[0]
    );

    const uniqueSlug =
      `${baseSlug}-${user.id
        .replace(/-/g, "")
        .slice(0, 6)}`;

    const {
      error: cardError,
    } = await supabase
      .from("cards")
      .upsert(
        {
          user_id:
            user.id,

          slug:
            uniqueSlug,

          full_name:
            name ||
            email.split("@")[0],

          email,

          is_public:
            false,

          show_qr:
            true,

          language:
            "fr",

          theme:
            "light",
        },
        {
          onConflict:
            "user_id",
        }
      );

    if (cardError) {
      console.error(
        "Création card:",
        cardError
      );
    }

    /* -----------------------------------------
       RESPONSE
    ----------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        message:
          "Utilisateur créé avec succès.",

        user: {
          id:
            user.id,

          email:
            user.email || email,

          name,

          created_at:
            user.created_at,

          card_slug:
            cardError
              ? null
              : uniqueSlug,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      "ADMIN CREATE USER:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Impossible de créer l'utilisateur.",
      },
      {
        status: 500,
      }
    );
  }
}


function makeSlug(
  value: string
) {
  const slug = value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );

  return slug || "card";
}
