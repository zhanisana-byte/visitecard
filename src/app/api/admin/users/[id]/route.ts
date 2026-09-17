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
   VÉRIFIER ADMIN
========================================================= */

async function isAdmin() {
  const cookieStore = await cookies();

  const sessionCookie =
    cookieStore.get(ADMIN_COOKIE)?.value;

  return verifyAdminSession(
    sessionCookie
  );
}

/* =========================================================
   PATCH
   Modifier :
   - nom
   - e-mail
   - mot de passe
========================================================= */

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    /* -----------------------------------------------------
       SÉCURITÉ ADMIN
    ----------------------------------------------------- */

    const authorized =
      await isAdmin();

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

    /* -----------------------------------------------------
       USER ID
    ----------------------------------------------------- */

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Identifiant utilisateur manquant.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       BODY
    ----------------------------------------------------- */

    let body: any;

    try {
      body =
        await request.json();
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

    const supabase =
      getSupabaseAdmin();

    /* -----------------------------------------------------
       RÉCUPÉRER USER ACTUEL
    ----------------------------------------------------- */

    const {
      data: currentData,
      error: currentError,
    } =
      await supabase.auth.admin.getUserById(
        id
      );

    if (
      currentError ||
      !currentData.user
    ) {
      return NextResponse.json(
        {
          error:
            "Utilisateur introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    const currentUser =
      currentData.user;

    /* -----------------------------------------------------
       CONSTRUIRE MODIFICATIONS AUTH
    ----------------------------------------------------- */

    const authUpdates: {
      email?: string;
      password?: string;
      user_metadata?: {
        name: string;
      };
    } = {};

    let newName:
      | string
      | undefined;

    let newEmail:
      | string
      | undefined;

    /* -----------------------------------------------------
       NOM
    ----------------------------------------------------- */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "name"
      )
    ) {
      newName = String(
        body.name || ""
      ).trim();

      authUpdates.user_metadata = {
        ...(currentUser.user_metadata ||
          {}),
        name: newName,
      } as any;
    }

    /* -----------------------------------------------------
       EMAIL
    ----------------------------------------------------- */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "email"
      )
    ) {
      newEmail = String(
        body.email || ""
      )
        .trim()
        .toLowerCase();

      if (!newEmail) {
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

      if (
        !emailRegex.test(
          newEmail
        )
      ) {
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

      authUpdates.email =
        newEmail;
    }

    /* -----------------------------------------------------
       PASSWORD
    ----------------------------------------------------- */

    if (
      Object.prototype.hasOwnProperty.call(
        body,
        "password"
      )
    ) {
      const password =
        String(
          body.password || ""
        );

      if (
        password.length < 8
      ) {
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

      authUpdates.password =
        password;
    }

    /* -----------------------------------------------------
       RIEN À MODIFIER
    ----------------------------------------------------- */

    if (
      Object.keys(authUpdates)
        .length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Aucune modification demandée.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------------------
       MODIFIER AUTH USER
    ----------------------------------------------------- */

    const {
      data: updatedData,
      error: updateError,
    } =
      await supabase.auth.admin.updateUserById(
        id,
        authUpdates
      );

    if (updateError) {
      const message =
        updateError.message || "";

      if (
        message
          .toLowerCase()
          .includes("already")
      ) {
        return NextResponse.json(
          {
            error:
              "Cette adresse e-mail est déjà utilisée.",
          },
          {
            status: 409,
          }
        );
      }

      throw updateError;
    }

    /* -----------------------------------------------------
       SYNCHRONISER PROFILE
    ----------------------------------------------------- */

    const profileUpdates: Record<
      string,
      any
    > = {
      updated_at:
        new Date().toISOString(),
    };

    if (
      newName !== undefined
    ) {
      profileUpdates.name =
        newName;
    }

    if (
      newEmail !== undefined
    ) {
      profileUpdates.email =
        newEmail;
    }

    if (
      Object.keys(
        profileUpdates
      ).length > 1
    ) {
      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .update(
          profileUpdates
        )
        .eq("id", id);

      if (profileError) {
        console.error(
          "PROFILE UPDATE:",
          profileError
        );
      }
    }

    /* -----------------------------------------------------
       SYNCHRONISER CARTE
    ----------------------------------------------------- */

    const cardUpdates: Record<
      string,
      any
    > = {
      updated_at:
        new Date().toISOString(),
    };

    if (
      newName !== undefined
    ) {
      cardUpdates.full_name =
        newName;
    }

    if (
      newEmail !== undefined
    ) {
      cardUpdates.email =
        newEmail;
    }

    if (
      Object.keys(
        cardUpdates
      ).length > 1
    ) {
      const {
        error: cardError,
      } = await supabase
        .from("cards")
        .update(
          cardUpdates
        )
        .eq(
          "user_id",
          id
        );

      if (cardError) {
        console.error(
          "CARD UPDATE:",
          cardError
        );
      }
    }

    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        message:
          "Utilisateur modifié avec succès.",

        user: {
          id:
            updatedData.user.id,

          email:
            updatedData.user.email ||
            newEmail ||
            currentUser.email ||
            "",

          name:
            updatedData.user
              .user_metadata
              ?.name ||
            newName ||
            currentUser
              .user_metadata
              ?.name ||
            "",
        },
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "ADMIN UPDATE USER:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Impossible de modifier l'utilisateur.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE
   Supprimer définitivement utilisateur
========================================================= */

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    /* -----------------------------------------------------
       SÉCURITÉ
    ----------------------------------------------------- */

    const authorized =
      await isAdmin();

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

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Identifiant utilisateur manquant.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      getSupabaseAdmin();

    /* -----------------------------------------------------
       EMPÊCHER LA SUPPRESSION DU COMPTE ADMIN
    ----------------------------------------------------- */

    const {
      data: userData,
      error: userError,
    } =
      await supabase.auth.admin.getUserById(
        id
      );

    if (
      userError ||
      !userData.user
    ) {
      return NextResponse.json(
        {
          error:
            "Utilisateur introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    const adminEmail =
      (
        process.env.ADMIN_EMAIL ||
        ""
      )
        .trim()
        .toLowerCase();

    const userEmail =
      (
        userData.user.email ||
        ""
      )
        .trim()
        .toLowerCase();

    if (
      adminEmail &&
      userEmail === adminEmail
    ) {
      return NextResponse.json(
        {
          error:
            "Le compte administrateur principal ne peut pas être supprimé.",
        },
        {
          status: 403,
        }
      );
    }

    /* -----------------------------------------------------
       IMPORTANT

       Les tables cards/profiles référencent auth.users.
       On les supprime avant le compte Auth afin d'éviter
       un blocage par les clés étrangères.
    ----------------------------------------------------- */

    /* -----------------------------------------------------
       RÉCUPÉRER CARTE
    ----------------------------------------------------- */

    const {
      data: card,
    } = await supabase
      .from("cards")
      .select("id")
      .eq(
        "user_id",
        id
      )
      .maybeSingle();

    /* -----------------------------------------------------
       SUPPRIMER DONNÉES CARTE
    ----------------------------------------------------- */

    if (card?.id) {
      await supabase.from("profile_company_links").delete().or(`profile_card_id.eq.${card.id},company_card_id.eq.${card.id}`);

      /*
       * qr_scans et card_reviews ont une FK vers cards.
       * On les supprime d'abord.
       */

      const {
        error: scansError,
      } = await supabase
        .from("qr_scans")
        .delete()
        .eq(
          "card_id",
          card.id
        );

      if (scansError) {
        console.error(
          "DELETE QR SCANS:",
          scansError
        );
      }

      const {
        error: reviewsError,
      } = await supabase
        .from("card_reviews")
        .delete()
        .eq(
          "card_id",
          card.id
        );

      if (reviewsError) {
        console.error(
          "DELETE REVIEWS:",
          reviewsError
        );
      }

      const {
        error: cardError,
      } = await supabase
        .from("cards")
        .delete()
        .eq(
          "id",
          card.id
        );

      if (cardError) {
        throw new Error(
          "Impossible de supprimer la carte de l'utilisateur."
        );
      }
    }

    /* -----------------------------------------------------
       SUPPRIMER PROFILE
    ----------------------------------------------------- */

    const {
      error: profileError,
    } = await supabase
      .from("profiles")
      .delete()
      .eq(
        "id",
        id
      );

    if (profileError) {
      throw new Error(
        "Impossible de supprimer le profil de l'utilisateur."
      );
    }

    /* -----------------------------------------------------
       SUPPRIMER AUTH USER
    ----------------------------------------------------- */

    const {
      error: authDeleteError,
    } =
      await supabase.auth.admin.deleteUser(
        id
      );

    if (authDeleteError) {
      throw authDeleteError;
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Utilisateur supprimé définitivement.",
        id,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "ADMIN DELETE USER:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Impossible de supprimer l'utilisateur.",
      },
      {
        status: 500,
      }
    );
  }
}
