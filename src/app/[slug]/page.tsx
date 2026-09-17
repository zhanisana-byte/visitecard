import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PublicCardClient from "./PublicCardClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicCardPage({ params }: PageProps) {
  const { slug } = await params;

  /*
   * ==========================================================
   * 1. CHARGER LA CARTE
   * ==========================================================
   */

  const { data: card, error } = await supabase
    .from("cards")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error) {
    console.error("Public card error:", error);
  }

  if (!card) {
    notFound();
  }

  /*
   * ==========================================================
   * 2. SI SOCIÉTÉ
   * ==========================================================
   *
   * Pas besoin de chercher profile_company_links.
   * On conserve simplement le fonctionnement existant.
   */

  if (card.entity_type !== "profile") {
    return (
      <PublicCardClient
        card={card}
        profileCompanies={[]}
      />
    );
  }

  /*
   * ==========================================================
   * 3. SI PROFIL
   *
   * Charger les relations :
   *
   * Mohamed
   *   -> Tawa Voyage
   *   -> Edream
   *   -> ...
   * ==========================================================
   */

  const { data: links, error: linksError } = await supabase
    .from("profile_company_links")
    .select(`
      id,
      profile_card_id,
      company_card_id,
      position_title,
      created_at
    `)
    .eq("profile_card_id", card.id)
    .order("created_at", {
      ascending: true,
    });

  if (linksError) {
    console.error(
      "Profile company links error:",
      linksError
    );
  }

  const cleanLinks = links || [];

  /*
   * Aucun lien
   */

  if (cleanLinks.length === 0) {
    return (
      <PublicCardClient
        card={card}
        profileCompanies={[]}
      />
    );
  }

  /*
   * ==========================================================
   * 4. RÉCUPÉRER LES IDS DES SOCIÉTÉS
   * ==========================================================
   */

  const companyIds = cleanLinks.map(
    (link) => link.company_card_id
  );

  /*
   * ==========================================================
   * 5. CHARGER LES SOCIÉTÉS
   *
   * Seulement :
   * entity_type = company
   * is_public = true
   * ==========================================================
   */

  const {
    data: companies,
    error: companiesError,
  } = await supabase
    .from("cards")
    .select(`
      id,
      slug,
      full_name,
      job_title,
      company,
      bio,
      phone,
      email,
      whatsapp,
      website,
      facebook,
      instagram,
      tiktok,
      linkedin,
      photo_url,
      cover_url,
      address,
      primary_color,
      background_color,
      theme,
      language,
      social_links,
      custom_links,
      entity_type,
      is_public
    `)
    .in("id", companyIds)
    .eq("entity_type", "company")
    .eq("is_public", true);

  if (companiesError) {
    console.error(
      "Profile companies error:",
      companiesError
    );
  }

  /*
   * ==========================================================
   * 6. FUSIONNER SOCIÉTÉ + POSTE
   *
   * Exemple résultat :
   *
   * {
   *   id: "...",
   *   full_name: "Tawa Voyage",
   *   slug: "tawa-voyage-906fa3",
   *   position_title: "Directeur général"
   * }
   * ==========================================================
   */

  const profileCompanies = cleanLinks
    .map((link) => {
      const company = (companies || []).find(
        (item) =>
          item.id === link.company_card_id
      );

      if (!company) {
        return null;
      }

      return {
        ...company,

        link_id: link.id,

        position_title:
          link.position_title || "",
      };
    })
    .filter(Boolean);

  /*
   * ==========================================================
   * 7. ENVOYER AU DESIGN PUBLIC
   * ==========================================================
   */

  return (
    <PublicCardClient
      card={card}
      profileCompanies={profileCompanies}
    />
  );
}
