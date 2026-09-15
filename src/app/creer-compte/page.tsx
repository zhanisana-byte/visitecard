"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SignupResponse = {
  id?: string;
  email?: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;

  user?: {
    id?: string;
    email?: string;
    user_metadata?: {
      name?: string;
    };
  };

  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
  code?: string;
};

export default function CreateAccountPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Indiquez votre nom.");
      return;
    }

    if (!cleanEmail) {
      setError("Indiquez votre e-mail.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (!acceptedTerms) {
      setError("Vous devez accepter les Conditions générales.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      setError("URL Supabase manquante.");
      return;
    }

    if (!supabaseKey) {
      setError("Clé Supabase manquante.");
      return;
    }

    try {
      setLoading(true);

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        window.location.origin;

      const redirectUrl = `${siteUrl}/mon-espace`;

      const response = await fetch(
        `${supabaseUrl}/auth/v1/signup?redirect_to=${encodeURIComponent(
          redirectUrl
        )}`,
        {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            data: {
              name: cleanName,
            },
          }),
        }
      );

      let data: SignupResponse = {};

      try {
        data = await response.json();
      } catch {
        setError("Réponse Supabase invalide.");
        return;
      }

      if (!response.ok) {
        const message =
          data.error_description ||
          data.msg ||
          data.message ||
          data.error ||
          "Impossible de créer le compte.";

        if (
          message.toLowerCase().includes("already") ||
          message.toLowerCase().includes("registered")
        ) {
          setError("Un compte existe déjà avec cet e-mail.");
          return;
        }

        setError(message);
        return;
      }

      if (data.access_token) {
        localStorage.setItem(
          "visitecard_access_token",
          data.access_token
        );

        if (data.refresh_token) {
          localStorage.setItem(
            "visitecard_refresh_token",
            data.refresh_token
          );
        }

        const user = data.user || {
          id: data.id,
          email: data.email || cleanEmail,
          user_metadata: {
            name: cleanName,
          },
        };

        localStorage.setItem(
          "visitecard_user",
          JSON.stringify(user)
        );

        router.replace("/mon-espace");
        router.refresh();
        return;
      }

      if (data.user || data.id || data.email) {
        setSuccess(
          "Compte créé. Vérifiez votre e-mail pour confirmer votre inscription."
        );

        setName("");
        setEmail("");
        setPassword("");
        return;
      }

      setSuccess(
        "Compte créé. Vérifiez votre e-mail pour continuer."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <div className="authTop">
        <Link
          href="/"
          aria-label="Retour à l’accueil VisiteCard"
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          <img
            src="/logo-visitecard.png.png"
            alt="VisiteCard"
            className="authLogo"
          />
        </Link>
      </div>

      <section className="authCard">
        <span className="miniLabel">
          VISITECARD
        </span>

        <h1>Créer un compte</h1>

        <p>
          Créez votre carte digitale en quelques secondes.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Nom
            <input
              type="text"
              placeholder="Votre nom"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              autoComplete="name"
              required
            />
          </label>

          <label>
            E-mail
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label className="termsRow">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              required
            />
            <span>
              J’accepte les{" "}
              <Link href="/conditions-generales" target="_blank">
                Conditions générales
              </Link>{" "}
              et la{" "}
              <Link href="/confidentialite" target="_blank">
                Politique de confidentialité
              </Link>
              .
            </span>
          </label>

          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "#fff1f0",
                color: "#b42318",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "#ecfdf3",
                color: "#027a48",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              opacity: loading ? 0.65 : 1,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading
              ? "Création..."
              : "Créer mon compte"}
          </button>
        </form>

        <p className="authFoot">
          Déjà inscrit ?{" "}
          <Link href="/connexion">
            Connexion
          </Link>
        </p>
      </section>

      <style jsx global>{`
        .authLogo {
          display: block;
          width: 170px;
          height: 64px;
          object-fit: contain;
          object-position: left center;
        }

        .termsRow {
          display: flex !important;
          grid-template-columns: none !important;
          align-items: flex-start;
          gap: 10px !important;
          font-size: 13px !important;
          line-height: 1.5;
          font-weight: 600 !important;
          color: #697386;
          cursor: pointer;
        }

        .termsRow input[type="checkbox"] {
          width: 18px;
          height: 18px;
          min-height: 18px !important;
          padding: 0 !important;
          margin: 1px 0 0;
          flex: 0 0 18px;
          accent-color: #ff4f23;
          box-shadow: none !important;
        }

        .termsRow a {
          color: #ff4f23;
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 560px) {
          .authLogo {
            width: 132px;
            height: 52px;
          }

          .authCard input:not([type="checkbox"]) {
            font-size: 16px !important;
          }

          .termsRow {
            font-size: 12.5px !important;
          }
        }
      `}</style>
    </main>
  );
}
