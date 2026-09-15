"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";

type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
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
};

export default function ConnexionPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Indiquez votre e-mail.");
      return;
    }

    if (!password) {
      setError("Indiquez votre mot de passe.");
      return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setError("Configuration Supabase manquante.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${supabaseUrl}/auth/v1/token?grant_type=password`,
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
          }),
        }
      );

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        const message =
          data.error_description ||
          data.msg ||
          data.message ||
          data.error ||
          "E-mail ou mot de passe incorrect.";

        const normalized = message.toLowerCase();

        if (
          normalized.includes("invalid login") ||
          normalized.includes("invalid credentials")
        ) {
          setError("E-mail ou mot de passe incorrect.");
          return;
        }

        if (
          normalized.includes("email not confirmed") ||
          normalized.includes("email_not_confirmed")
        ) {
          setError("Veuillez confirmer votre e-mail avant de vous connecter.");
          return;
        }

        setError(message);
        return;
      }

      if (!data.access_token) {
        setError("Impossible de vous connecter.");
        return;
      }

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

      if (data.user) {
        localStorage.setItem(
          "visitecard_user",
          JSON.stringify(data.user)
        );
      }

      router.replace("/mon-espace");
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        background:
          "linear-gradient(180deg, #fffaf7 0%, #ffffff 55%, #fffdfb 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "28px 20px 0",
        }}
      >
        <Brand />
      </div>

      <div
        style={{
          width: "100%",
          minHeight: "calc(100dvh - 90px)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "48px 20px 60px",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#ffffff",
            border: "1px solid #eee7e2",
            borderRadius: 30,
            padding: "44px 40px",
            boxShadow: "0 24px 70px rgba(31, 20, 12, 0.08)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              color: "#ff4f23",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            VISITECARD
          </span>

          <h1
            style={{
              margin: 0,
              color: "#0d0d0d",
              fontSize: "clamp(36px, 5vw, 48px)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            Connexion
          </h1>

          <p
            style={{
              margin: "22px 0 34px",
              color: "#737d91",
              fontSize: 18,
              lineHeight: 1.55,
            }}
          >
            Connectez-vous pour modifier votre carte et récupérer votre QR code.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: 22,
            }}
          >
            <label
              style={{
                display: "grid",
                gap: 10,
                color: "#111",
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              E-mail

              <input
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                inputMode="email"
                required
                style={{
                  width: "100%",
                  minHeight: 58,
                  border: "1px solid #ddd",
                  borderRadius: 16,
                  padding: "0 16px",
                  background: "#fff",
                  color: "#111",
                  fontSize: 16,
                  fontWeight: 600,
                  outline: "none",
                  WebkitAppearance: "none",
                }}
              />
            </label>

            <label
              style={{
                display: "grid",
                gap: 10,
                color: "#111",
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              Mot de passe

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  minHeight: 58,
                  border: "1px solid #ddd",
                  borderRadius: 16,
                  padding: "0 16px",
                  background: "#fff",
                  color: "#111",
                  fontSize: 16,
                  fontWeight: 600,
                  outline: "none",
                  WebkitAppearance: "none",
                }}
              />
            </label>

            {error ? (
              <div
                style={{
                  padding: "13px 15px",
                  borderRadius: 14,
                  background: "#fff1f0",
                  color: "#b42318",
                  fontSize: 14,
                  lineHeight: 1.45,
                }}
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                minHeight: 60,
                marginTop: 2,
                border: 0,
                borderRadius: 17,
                background: "#ff4f23",
                color: "#fff",
                fontSize: 17,
                fontWeight: 800,
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.65 : 1,
              }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p
            style={{
              margin: "28px 0 0",
              textAlign: "center",
              color: "#7a8498",
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            Pas encore de compte ?{" "}
            <Link
              href="/creer-compte"
              style={{
                color: "#ff4f23",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Créer un compte
            </Link>
          </p>
        </section>
      </div>

      <style jsx global>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        html {
          -webkit-text-size-adjust: 100%;
        }

        input,
        textarea,
        select,
        button {
          font-size: 16px;
        }

        @media (max-width: 640px) {
          body {
            margin: 0;
          }

          main > div:first-child {
            padding: 20px 18px 0 !important;
          }

          main > div:nth-child(2) {
            padding: 28px 0 40px !important;
          }

          main section {
            max-width: none !important;
            border-left: 0 !important;
            border-right: 0 !important;
            border-radius: 0 0 28px 28px !important;
            padding: 30px 28px 38px !important;
            box-shadow: 0 16px 40px rgba(31, 20, 12, 0.06) !important;
          }

          main section h1 {
            font-size: 42px !important;
          }

          main section > p {
            font-size: 17px !important;
          }

          input {
            font-size: 16px !important;
          }
        }
      `}</style>
    </main>
  );
}
