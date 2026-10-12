"use client";

import { FormEvent, useState } from "react";
import Turnstile from "@/components/Turnstile";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/app/lib/supabase";

const supabase = getSupabaseBrowser();

type EntityType = "profile" | "company";

export default function CreerComptePage() {
  const router = useRouter();

  const [entityType, setEntityType] =
    useState<EntityType>("company");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function slugify(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70);
  }

  async function createAvailableSlug(name: string) {
    const base =
      slugify(name) ||
      (entityType === "profile" ? "profil" : "societe");

    const { data: existing, error: slugError } = await supabase
      .from("cards")
      .select("slug")
      .or(`slug.eq.${base},slug.like.${base}-%`);

    if (slugError) {
      throw slugError;
    }

    const used = new Set(
      (existing || []).map((item: { slug: string }) => item.slug)
    );

    // Premier nom disponible : /tunivet
    if (!used.has(base)) {
      return base;
    }

    // Doublons : /tunivet-2, /tunivet-3, /tunivet-4...
    let suffix = 2;

    while (used.has(`${base}-${suffix}`)) {
      suffix += 1;
    }

    return `${base}-${suffix}`;
  }

  function validateEmail(value: string) {
    /*
      IMPORTANT :
      - aucune transformation de l'e-mail
      - pas de toLowerCase()
      - pas de remplacement automatique
      - caractères accentués interdits
      - domaine obligatoire avec extension
    */

    if (!value) {
      return false;
    }

    const emailRegex =
      /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

    return emailRegex.test(value);
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    /*
      On supprime seulement les espaces
      accidentels avant/après.

      L'e-mail lui-même n'est PAS transformé.
    */
    const cleanName = displayName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError(
        entityType === "profile"
          ? "Veuillez saisir votre nom complet."
          : "Veuillez saisir le nom de la société."
      );
      return;
    }

    if (!cleanEmail) {
      setError(
        "Veuillez saisir votre adresse e-mail."
      );
      return;
    }

    /*
      Empêche par exemple :
      contact@gmail.coù
      contact@gmail.côm
      contact @gmail.com
      contact@gmail
      etc.

      Le compte n'est PAS créé.
    */
    if (!validateEmail(cleanEmail)) {
      setError(
        "Adresse e-mail incorrecte. Vérifiez chaque lettre avant de créer le compte."
      );
      return;
    }

    /*
      Sécurité supplémentaire :
      refuse explicitement tout caractère
      non ASCII pour éviter la conversion
      automatique en xn-- par le système.
    */
    if (/[^\x00-\x7F]/.test(cleanEmail)) {
      setError(
        "L'adresse e-mail contient un caractère incorrect. Vérifiez votre saisie."
      );
      return;
    }

    /*
      On refuse également une adresse qui
      contiendrait déjà un domaine Punycode.
    */
    if (cleanEmail.toLowerCase().includes("xn--")) {
      setError(
        "Cette adresse e-mail semble incorrecte. Vérifiez le domaine."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    if (!captchaToken) {
      setError("Veuillez valider la vérification anti-robot.");
      return;
    }

    try {
      setLoading(true);

      /*
        IMPORTANT :
        on transmet EXACTEMENT l'adresse
        validée par l'utilisateur.

        Aucun :
        .toLowerCase()
        .replace()
        encodage
        ou transformation.
      */
      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          captchaToken,
          data: {
            entity_type: entityType,
            name: cleanName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!data.user) {
        throw new Error(
          "Impossible de créer le compte."
        );
      }

      // Nouveau compte uniquement : le lien reprend le nom du profil / de la société.
      // Les anciennes cartes en base ne sont jamais modifiées.
      const temporarySlug = await createAvailableSlug(cleanName);

      const { data: createdCard, error: cardError } =
        await supabase.from("cards").insert({
          user_id: data.user.id,

          slug: temporarySlug,

          full_name: cleanName,
          job_title: "",
          company: entityType === "company" ? cleanName : "",
          bio: "",

          phone: "",

          /*
            Même adresse que celle tapée.
            Aucune modification.
          */
          email: cleanEmail,

          whatsapp: "",
          website: "",

          facebook: "",
          instagram: "",
          tiktok: "",
          linkedin: "",

          photo_url: "",
          cover_url: "",

          primary_color: "#6D4AFF",
          background_color: "#071521",

          theme: "dark",
          language: "fr",

          show_qr: true,
          show_reviews: false,

          show_email: true,
          show_phone: true,
          show_address: entityType === "company",

          led_enabled: true,
          led_color: "#6D4AFF",

          social_links: [],
          custom_links: [],

          address: "",

          is_public: true,

          entity_type: entityType,

          catalog_enabled: false,
          catalog_label_fr: "Nos services",
          catalog_label_en: "Our services",
          catalog_icon: "grid",
          catalog_button_color: "#b11235",
          catalog_button_text_color: "#ffffff",
          catalog_default_language: "fr",
          catalog_languages: ["fr", "en"],
          catalog_primary_currency: entityType === "company" ? "TND" : "TND",
          catalog_secondary_currency: null,
          catalog_show_secondary_currency: false,
          catalog_auto_convert: false,
          catalog_exchange_rate: null,
          catalog_exchange_rate_updated_at: null,
        })
        .select("id")
        .single();

      if (cardError) {
        throw cardError;
      }

      // L'offre de démarrage configurée dans l'admin est appliquée
      // immédiatement au nouveau compte. Cela rend aussi le lien public
      // accessible, car la page publique exige un abonnement startup/active/included.
      const accessToken = data.session?.access_token;

      if (createdCard?.id && accessToken) {
        const startupResponse = await fetch("/api/account/startup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ card_id: createdCard.id }),
        });

        const startupResult = await startupResponse.json().catch(() => ({}));

        if (!startupResponse.ok) {
          throw new Error(
            startupResult?.error ||
              "Le compte a été créé, mais l'offre de démarrage n'a pas pu être activée."
          );
        }
      }

      router.push("/mon-espace");
      router.refresh();
    } catch (err: any) {
      console.error(
        "Erreur création compte :",
        err
      );

      if (
        err?.message
          ?.toLowerCase()
          .includes("already registered")
      ) {
        setError(
          "Cette adresse e-mail possède déjà un compte."
        );
      } else if (
        err?.message
          ?.toLowerCase()
          .includes("invalid email")
      ) {
        setError(
          "Adresse e-mail incorrecte. Vérifiez chaque lettre."
        );
      } else {
        setError(
          err?.message ||
            "Une erreur est survenue pendant la création du compte."
        );
      }
    } finally {
      setCaptchaToken("");
      setLoading(false);
    }
  }

  return (
    <main className="registerPage">
      <div className="registerBackground registerBackgroundOne" />
      <div className="registerBackground registerBackgroundTwo" />

      <section className="registerCard">
        <div className="brand">
          <img
            src="/Logo2.png"
            alt="VisiteCard"
            className="brandLogo"
          />
        </div>

        <div className="heading">
          <span className="eyebrow">
            CRÉER UN COMPTE
          </span>

          <h1>Créez votre VisiteCard</h1>

          <p>
            Choisissez simplement le type de
            carte que vous souhaitez créer.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="typeSection">
            <label className="sectionLabel">
              Type de carte
            </label>

            <div className="typeGrid">
              <button
                type="button"
                className={`typeCard ${
                  entityType === "profile"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setEntityType("profile")
                }
              >
                <div className="typeIcon">
                  <PersonIcon />
                </div>

                <div className="typeText">
                  <strong>Profil</strong>
                  <span>
                    Carte personnelle
                  </span>
                </div>

                <div className="radio">
                  {entityType ===
                    "profile" && <span />}
                </div>
              </button>

              <button
                type="button"
                className={`typeCard ${
                  entityType === "company"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setEntityType("company")
                }
              >
                <div className="typeIcon">
                  <CompanyIcon />
                </div>

                <div className="typeText">
                  <strong>Société</strong>
                  <span>
                    Carte entreprise
                  </span>
                </div>

                <div className="radio">
                  {entityType ===
                    "company" && <span />}
                </div>
              </button>
            </div>
          </div>

          <div className="fields">
            <div className="field">
              <label htmlFor="displayName">
                {entityType === "profile" ? "Nom complet" : "Nom de la société"}
              </label>

              <input
                id="displayName"
                type="text"
                autoComplete={entityType === "profile" ? "name" : "organization"}
                placeholder={entityType === "profile" ? "Ex. Sana Zhani" : "Ex. Tunivet"}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (error) setError("");
                }}
                required
              />

              <small className="emailHelp">
                Votre lien sera créé à partir de ce nom, par exemple : visitecard.com/{slugify(displayName) || (entityType === "profile" ? "votre-nom" : "nom-societe")}
              </small>
            </div>

            <div className="field">
              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                type="text"
                autoComplete="email"
                inputMode="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => {
                  /*
                    On conserve exactement
                    ce que tape l'utilisateur.
                  */
                  setEmail(e.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                required
              />

              <small className="emailHelp">
                Vérifiez attentivement votre
                adresse e-mail avant de créer
                votre compte.
              </small>
            </div>

            <div className="field">
              <label htmlFor="password">
                Mot de passe
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 6 caractères"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">
                Confirmer le mot de passe
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Répétez votre mot de passe"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
              />
            </div>
          </div>

          <div className="captchaArea">
            <Turnstile
              value={captchaToken}
              onChange={setCaptchaToken}
            />
          </div>

          {error && (
            <div className="errorMessage">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="submitButton"
            disabled={loading || !captchaToken}
          >
            {loading ? (
              "Création..."
            ) : (
              <>
                Créer mon compte
                <ArrowIcon />
              </>
            )}
          </button>
        </form>

        <div className="login">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion">
            Se connecter
          </Link>
        </div>
      </section>

      <style jsx>{`
        * { box-sizing: border-box; }
        .registerPage { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 46px 18px; color: #09182c; background: radial-gradient(circle at 8% 13%, rgba(255,92,31,.075), transparent 34%), radial-gradient(circle at 94% 88%, rgba(10,31,58,.045), transparent 32%), #fcfbfa; }
        .registerBackground { position: absolute; border-radius: 50%; pointer-events: none; }
        .registerBackgroundOne { width: 380px; height: 380px; right: -210px; top: -190px; background: rgba(255,91,29,.045); }
        .registerBackgroundTwo { width: 310px; height: 310px; left: -200px; bottom: -170px; background: rgba(255,146,65,.07); }
        .registerCard { position: relative; z-index: 1; width: 100%; max-width: 610px; padding: 40px 42px; border: 1px solid #f0e9e5; border-radius: 28px; background: #fff; box-shadow: 0 24px 85px rgba(12,28,47,.065), 0 4px 16px rgba(12,28,47,.025); }
        .brand { display: flex; align-items: center; margin-bottom: 32px; }
        .brandLogo { width: 220px; max-width: 100%; height: auto; display: block; object-fit: contain; }
        .heading { margin-bottom: 30px; }
        .eyebrow { display: block; margin-bottom: 9px; color: #ff521c; font-size: 11px; font-weight: 900; letter-spacing: 1.9px; }
        h1 { margin: 0; color: #08172b; font-size: clamp(27px, 4vw, 35px); line-height: 1.14; letter-spacing: -1.2px; font-weight: 850; }
        .heading p { margin: 12px 0 0; font-size: 14px; color: #758196; line-height: 1.65; }
        .typeSection { margin-bottom: 26px; }
        .sectionLabel, .field label { display: block; margin-bottom: 10px; color: #102038; font-size: 13px; font-weight: 800; }
        .typeGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .typeCard { display: flex; align-items: center; gap: 12px; position: relative; min-height: 97px; padding: 17px 15px; text-align: left; border: 1.5px solid #e6e9ef; background: #fff; border-radius: 18px; cursor: pointer; transition: border-color .18s, background .18s, transform .18s, box-shadow .18s; }
        .typeCard:hover { border-color: #ffae8b; transform: translateY(-2px); }
        .typeCard.active { border-color: #ff5a20; background: #fff8f4; box-shadow: 0 6px 22px rgba(255,82,28,.08); }
        .typeIcon { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 13px; background: #fff1e9; color: #ff521c; }
        .typeText { display: flex; min-width: 0; flex-direction: column; gap: 4px; padding-right: 10px; }
        .typeText strong { font-size: 15px; color: #0c1d34; }
        .typeText span { font-size: 11px; color: #8992a1; }
        .radio { position: absolute; top: 12px; right: 12px; display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #d7dce4; background: #fff; }
        .typeCard.active .radio { border-color: #ff521c; }
        .radio span { width: 9px; height: 9px; border-radius: 50%; background: #ff521c; }
        .fields { display: flex; flex-direction: column; gap: 18px; }
        .field { display: flex; flex-direction: column; }
        .field label { margin-bottom: 8px; }
        .field input { width: 100%; height: 54px; padding: 0 16px; border-radius: 14px; border: 1.5px solid #e2e7ee; outline: none; color: #102038; background: #fff; font-size: 16px; transition: border-color .18s, box-shadow .18s; }
        .field input:focus { border-color: #ff642e; box-shadow: 0 0 0 4px rgba(255,88,32,.10); }
        .field input::placeholder { color: #a6afbe; }
        .emailHelp { display: block; margin-top: 8px; color: #8994a5; font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }
        .captchaArea { min-height: 79px; margin-top: 23px; display: flex; align-items: center; justify-content: flex-start; }
        .errorMessage { margin-top: 14px; padding: 12px 14px; border: 1px solid #ffd4d4; border-radius: 12px; background: #fff3f3; color: #c73434; font-size: 13px; line-height: 1.5; }
        .submitButton { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 55px; margin-top: 20px; border: 0; border-radius: 15px; color: #fff; background: #ff521c; font-size: 15px; font-weight: 850; cursor: pointer; box-shadow: 0 10px 23px rgba(255,81,28,.16); transition: background .2s, transform .2s, box-shadow .2s; }
        .submitButton:hover:not(:disabled) { background: #ef4511; transform: translateY(-1px); box-shadow: 0 14px 28px rgba(255,81,28,.2); }
        .submitButton:disabled { opacity: .55; cursor: not-allowed; }
        .login { margin-top: 25px; text-align: center; color: #818b9d; font-size: 13px; }
        .login :global(a) { color: #ff521c; font-weight: 850; text-decoration: underline; text-underline-offset: 3px; }
        @media (max-width: 600px) { .registerPage { align-items: flex-start; padding: 16px 12px 28px; } .registerCard { padding: 26px 20px; border-radius: 22px; } .brand { margin-bottom: 26px; } .brandLogo { width: 180px; } .heading { margin-bottom: 25px; } h1 { font-size: 28px; } .typeCard { min-height: 87px; padding: 14px 12px; } .typeGrid { gap: 9px; } .typeIcon { width: 37px; height: 37px; } .typeText strong { font-size: 13px; } .typeText span { font-size: 10px; } .field input { font-size: 16px; } }
        @media (max-width: 370px) { .registerCard { padding: 22px 15px; } .typeGrid { grid-template-columns: 1fr; } .typeCard { min-height: 74px; } }
      `}</style>
    </main>
  );
}

function PersonIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function CompanyIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
      <path d="M17 9h2a1 1 0 0 1 1 1v11" />
      <path d="M8 7h5M8 11h5M8 15h5" />
      <path d="M2 21h20" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
