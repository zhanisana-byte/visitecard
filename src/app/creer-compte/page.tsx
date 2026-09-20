"use client";

import { FormEvent, useState } from "react";
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

      const { error: cardError } =
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
          show_reviews: true,

          show_email: true,
          show_phone: true,
          show_address: true,

          led_enabled: true,
          led_color: "#6D4AFF",

          social_links: [],
          custom_links: [],

          address: "",

          is_public: true,

          entity_type: entityType,
        });

      if (cardError) {
        throw cardError;
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
            src="/logo.png"
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

          {error && (
            <div className="errorMessage">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="submitButton"
            disabled={loading}
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
        * {
          box-sizing: border-box;
        }

        .registerPage {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 40px 20px;
          background:
            radial-gradient(
              circle at 20% 15%,
              rgba(109, 74, 255, 0.09),
              transparent 28%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(255, 102, 66, 0.08),
              transparent 30%
            ),
            #f8f9fc;
          color: #111827;
        }

        .registerBackground {
          position: absolute;
          border-radius: 999px;
          filter: blur(2px);
          pointer-events: none;
        }

        .registerBackgroundOne {
          width: 330px;
          height: 330px;
          top: -160px;
          right: -100px;
          background: rgba(
            109,
            74,
            255,
            0.08
          );
        }

        .registerBackgroundTwo {
          width: 260px;
          height: 260px;
          bottom: -130px;
          left: -90px;
          background: rgba(
            255,
            103,
            64,
            0.07
          );
        }

        .registerCard {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 570px;
          padding: 38px;
          border: 1px solid #e7e9f0;
          border-radius: 28px;
          background: rgba(
            255,
            255,
            255,
            0.97
          );
          box-shadow:
            0 30px 80px
              rgba(20, 27, 45, 0.09),
            0 4px 14px
              rgba(20, 27, 45, 0.03);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 36px;
        }

        .brandLogo {
          display: block;
          width: auto;
          height: 52px;
          max-width: 220px;
          object-fit: contain;
        }

        .heading {
          margin-bottom: 30px;
        }

        .eyebrow {
          display: block;
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
          color: #6d4aff;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          line-height: 1.1;
          letter-spacing: -1.2px;
          color: #0f172a;
        }

        .heading p {
          max-width: 440px;
          margin: 12px 0 0;
          font-size: 14px;
          line-height: 1.55;
          color: #687084;
        }

        .typeSection {
          margin-bottom: 26px;
        }

        .sectionLabel {
          display: block;
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 800;
          color: #252b3b;
        }

        .typeGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .typeCard {
          position: relative;
          min-height: 95px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px;
          text-align: left;
          border: 1.5px solid #e4e6ed;
          border-radius: 18px;
          background: #fff;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .typeCard:hover {
          transform: translateY(-1px);
          border-color: #cfc6ff;
        }

        .typeCard.active {
          border-color: #6d4aff;
          background: #f8f6ff;
          box-shadow: 0 7px 22px
            rgba(109, 74, 255, 0.1);
        }

        .typeIcon {
          flex: 0 0 auto;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #f3f1ff;
          color: #6d4aff;
        }

        .typeText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .typeText strong {
          font-size: 15px;
          color: #161b2b;
        }

        .typeText span {
          font-size: 11px;
          color: #83899a;
        }

        .radio {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #d7dae4;
          border-radius: 50%;
          background: white;
        }

        .typeCard.active .radio {
          border-color: #6d4aff;
        }

        .radio span {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #6d4aff;
        }

        .fields {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          font-size: 13px;
          font-weight: 800;
          color: #252b3b;
        }

        .field input {
          width: 100%;
          height: 52px;
          padding: 0 16px;
          outline: none;
          border: 1.5px solid #e2e5ec;
          border-radius: 14px;
          background: #fff;
          font-size: 16px;
          color: #111827;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .field input:focus {
          border-color: #6d4aff;
          box-shadow: 0 0 0 4px
            rgba(109, 74, 255, 0.09);
        }

        .field input::placeholder {
          color: #a7acb8;
        }

        .emailHelp {
          display: block;
          margin-top: -1px;
          font-size: 11px;
          line-height: 1.4;
          color: #8a91a1;
        }

        .errorMessage {
          margin-top: 18px;
          padding: 12px 14px;
          border: 1px solid #ffd4d4;
          border-radius: 12px;
          background: #fff3f3;
          font-size: 13px;
          line-height: 1.4;
          color: #c73434;
        }

        .submitButton {
          width: 100%;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 24px;
          border: 0;
          border-radius: 15px;
          background: linear-gradient(
            135deg,
            #6042ed,
            #7b4cff
          );
          box-shadow: 0 10px 25px
            rgba(102, 68, 238, 0.22);
          font-size: 15px;
          font-weight: 900;
          color: white;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .submitButton:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 13px 30px
            rgba(102, 68, 238, 0.27);
        }

        .submitButton:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .login {
          margin-top: 25px;
          text-align: center;
          font-size: 13px;
          color: #777e90;
        }

        .login :global(a) {
          font-weight: 900;
          text-decoration: none;
          color: #6243eb;
        }

        @media (max-width: 600px) {
          .registerPage {
            align-items: flex-start;
            padding: 20px 14px;
          }

          .registerCard {
            padding: 26px 18px;
            border-radius: 22px;
          }

          .brand {
            margin-bottom: 28px;
          }

          .brandLogo {
            height: 45px;
            max-width: 190px;
          }

          h1 {
            font-size: 27px;
          }

          .typeGrid {
            grid-template-columns: 1fr;
          }

          .typeCard {
            min-height: 82px;
          }

          .field input {
            font-size: 16px;
          }
        }
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
