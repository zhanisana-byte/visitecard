import { NextResponse } from "next/server";
import { requireAdmin } from "../_auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request
) {
  try {
    /*
     * Vérifie d'abord que la personne
     * connectée est bien l'administrateur.
     */
    const auth =
      await requireAdmin(request);

    if (!auth) {
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

    const {
      supabase,
      user: adminUser,
    } = auth;

    /*
     * Récupération des comptes
     * Supabase Authentication.
     */
    const {
      data,
      error,
    } =
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Récupération des cartes pour
     * associer chaque utilisateur
     * à son slug public.
     */
    const {
      data: cards,
      error: cardsError,
    } = await supabase
      .from("cards")
      .select(
        "user_id, slug"
      );

    if (cardsError) {
      return NextResponse.json(
        {
          error:
            cardsError.message,
        },
        {
          status: 500,
        }
      );
    }

    const cardByUser =
      new Map<string, string>();

    (cards || []).forEach(
      (card: any) => {
        if (
          card.user_id &&
          card.slug
        ) {
          cardByUser.set(
            card.user_id,
            card.slug
          );
        }
      }
    );

    /*
     * Préparation des informations
     * envoyées au dashboard.
     */
    const users =
      data.users
        .map((user) => {
          const metadata =
            user.user_metadata || {};

          return {
            id: user.id,

            email:
              user.email || "",

            name:
              metadata.name ||
              metadata.full_name ||
              "",

            created_at:
              user.created_at,

            card_slug:
              cardByUser.get(
                user.id
              ) || null,
          };
        })

        /*
         * Les inscriptions les plus
         * récentes apparaissent d'abord.
         */
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
        adminEmail:
          adminUser.email,

        total:
          users.length,

        users,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error(
      "ADMIN USERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Impossible de récupérer les inscrits.",
      },
      {
        status: 500,
      }
    );
  }
}
