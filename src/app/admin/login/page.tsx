"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/app/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = getSupabaseBrowser();

        const { data } = await supabase.auth.getSession();

        const token = data.session?.access_token;

        if (!token) {
          return;
        }

        const response = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.ok) {
          router.replace("/admin");
          return;
        }

        await supabase.auth.signOut();
      } catch {
      } finally {
        setChecking(false);
      }
    }

    checkSession();
  }, [router]);

  async function login(event: FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        throw new Error("Entrez votre adresse e-mail.");
      }

      if (!password) {
        throw new Error("Entrez votre mot de passe.");
      }

      const supabase = getSupabaseBrowser();

      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginError || !data.session) {
        throw new Error(
          "E-mail ou mot de passe incorrect."
        );
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        await supabase.auth.signOut();

        throw new Error(
          result.error ||
            "Ce compte n'est pas autorisé à accéder à l'administration."
        );
      }

      router.replace("/admin");
      router.refresh();
    } catch (err: any) {
      setError(
        err?.message ||
          "Connexion administrateur impossible."
      );
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        "Entrez d'abord votre adresse e-mail."
      );
      return;
    }

    setResetLoading(true);

    try {
      const supabase = getSupabaseBrowser();

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/admin/reset-password`
          : "https://www.visitecard.com/admin/reset-password";

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo,
          }
        );

      if (resetError) {
        throw resetError;
      }

      setSuccess(
        "E-mail envoyé. Consultez votre boîte mail pour définir un nouveau mot de passe."
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Impossible d'envoyer l'e-mail de réinitialisation."
      );
    } finally {
      setResetLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="loading">
        <div className="loader" />

        <style jsx>{`
          .loading {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f7f7f8;
          }

          .loader {
            width: 32px;
            height: 32px;
            border: 3px solid #e9e9e9;
            border-top-color: #ff6337;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <a href="/" className="brand">
          VisiteCard <span>Admin</span>
        </a>

        <span className="eyebrow">
          ADMINISTRATION
        </span>

        <h1>Connexion Admin</h1>

        <p className="intro">
          Accès réservé à l'administrateur de VisiteCard.
        </p>

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {success && (
          <div className="message success">
            {success}
          </div>
        )}

        <form onSubmit={login}>
          <label>
            Adresse e-mail

            <input
              type="email"
              autoComplete="email"
              placeholder="zhanisana@gmail.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </label>

          <label>
            Mot de passe

            <input
              type="password"
              autoComplete="current-password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </label>

          <div className="forgotRow">
            <button
              type="button"
              className="forgot"
              onClick={forgotPassword}
              disabled={resetLoading}
            >
              {resetLoading
                ? "Envoi..."
                : "Mot de passe oublié ?"}
            </button>
          </div>

          <button
            type="submit"
            className="loginButton"
            disabled={loading || resetLoading}
          >
            {loading
              ? "Connexion..."
              : "Se connecter"}
          </button>
        </form>

        <div className="secure">
          <span>●</span>
          Connexion sécurisée
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          padding: 20px;
          display: grid;
          place-items: center;
          background:
            radial-gradient(
              circle at top right,
              rgba(255, 99, 55, 0.1),
              transparent 32%
            ),
            #f7f7f8;
          font-family: Arial, sans-serif;
          color: #171717;
        }

        .card {
          width: 100%;
          max-width: 440px;
          padding: 36px;
          background: #ffffff;
          border: 1px solid #e8e8ea;
          border-radius: 24px;
          box-shadow:
            0 18px 60px
            rgba(0, 0, 0, 0.06);
        }

        .brand {
          display: block;
          margin-bottom: 36px;
          color: #111111;
          text-decoration: none;
          font-size: 23px;
          font-weight: 900;
        }

        .brand span {
          color: #ff6337;
        }

        .eyebrow {
          color: #ff6337;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        h1 {
          margin: 8px 0;
          font-size: 29px;
        }

        .intro {
          margin: 0 0 26px;
          color: #777777;
          font-size: 14px;
          line-height: 1.5;
        }

        .message {
          margin-bottom: 18px;
          padding: 12px 14px;
          border-radius: 11px;
          font-size: 13px;
          line-height: 1.5;
        }

        .error {
          background: #fff0f0;
          color: #a21818;
        }

        .success {
          background: #effaf3;
          color: #176b38;
        }

        form {
          display: grid;
          gap: 18px;
        }

        label {
          display: grid;
          gap: 8px;
          font-size: 12px;
          font-weight: 800;
        }

        input {
          width: 100%;
          padding: 14px;
          border: 1px solid #dddddd;
          border-radius: 12px;
          background: #ffffff;
          color: #171717;
          font-size: 15px;
          outline: none;
          transition: 0.2s;
        }

        input:focus {
          border-color: #ff6337;
          box-shadow:
            0 0 0 3px
            rgba(255, 99, 55, 0.1);
        }

        .forgotRow {
          margin-top: -8px;
          display: flex;
          justify-content: flex-end;
        }

        .forgot {
          padding: 0;
          border: none;
          background: transparent;
          color: #ff6337;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .forgot:hover {
          text-decoration: underline;
        }

        .forgot:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .loginButton {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: #ff6337;
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          transition: 0.2s;
        }

        .loginButton:hover {
          opacity: 0.92;
        }

        .loginButton:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .secure {
          margin-top: 24px;
          padding-top: 19px;
          border-top: 1px solid #eeeeee;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          color: #777777;
          font-size: 11px;
        }

        .secure span {
          color: #35a568;
          font-size: 9px;
        }

        @media (max-width: 500px) {
          .page {
            padding: 15px;
          }

          .card {
            padding: 27px 22px;
            border-radius: 20px;
          }

          .brand {
            margin-bottom: 30px;
          }

          h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </main>
  );
}
