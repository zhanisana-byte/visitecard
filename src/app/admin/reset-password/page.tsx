"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/app/lib/supabase";

export default function AdminResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  const [validSession, setValidSession] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function initializeRecovery() {
      const supabase = getSupabaseBrowser();

      try {
        const hash = window.location.hash;

        if (hash) {
          const params = new URLSearchParams(
            hash.startsWith("#") ? hash.substring(1) : hash
          );

          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (sessionError) {
              throw sessionError;
            }
          }
        }

        const code = new URLSearchParams(
          window.location.search
        ).get("code");

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session) {
          setValidSession(false);
          setError(
            "Ce lien de réinitialisation est invalide ou a expiré."
          );
          return;
        }

        setValidSession(true);
      } catch {
        if (!mounted) return;

        setValidSession(false);
        setError(
          "Ce lien de réinitialisation est invalide ou a expiré."
        );
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    }

    initializeRecovery();

    return () => {
      mounted = false;
    };
  }, []);

  async function updatePassword(event: FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validSession) {
      setError(
        "Votre session de réinitialisation n'est plus valide."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Les deux mots de passe ne correspondent pas."
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowser();

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw updateError;
      }

      setSuccess(
        "Votre nouveau mot de passe a été enregistré."
      );

      setPassword("");
      setConfirmPassword("");

      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.replace("/admin/login");
      }, 1800);
    } catch (err: any) {
      setError(
        err?.message ||
          "Impossible de modifier votre mot de passe."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="loadingPage">
        <div className="loader" />

        <style jsx>{`
          .loadingPage {
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
          SÉCURITÉ
        </span>

        <h1>Nouveau mot de passe</h1>

        <p className="intro">
          Définissez votre nouveau mot de passe administrateur.
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

        {validSession && !success && (
          <form onSubmit={updatePassword}>
            <label>
              Nouveau mot de passe

              <input
                type="password"
                autoComplete="new-password"
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={8}
                required
              />
            </label>

            <label>
              Confirmer le mot de passe

              <input
                type="password"
                autoComplete="new-password"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                minLength={8}
                required
              />
            </label>

            <button
              type="submit"
              className="primaryButton"
              disabled={loading}
            >
              {loading
                ? "Enregistrement..."
                : "Enregistrer le nouveau mot de passe"}
            </button>
          </form>
        )}

        {!validSession && (
          <button
            type="button"
            className="backButton"
            onClick={() =>
              router.replace("/admin/login")
            }
          >
            Retour à la connexion
          </button>
        )}

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

        .brand span,
        .eyebrow {
          color: #ff6337;
        }

        .eyebrow {
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
        }

        input:focus {
          border-color: #ff6337;
          box-shadow:
            0 0 0 3px
            rgba(255, 99, 55, 0.1);
        }

        .primaryButton,
        .backButton {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .primaryButton {
          background: #ff6337;
          color: #ffffff;
        }

        .backButton {
          background: #f3f3f4;
          color: #171717;
        }

        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
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
          }

          h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </main>
  );
}
