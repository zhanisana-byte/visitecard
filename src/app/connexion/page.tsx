"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";
import LangSwitch from "@/components/LangSwitch";
import { useLanguage } from "@/components/LanguageProvider";
import { clearLegacyAuthStorage, getSupabaseBrowser } from "../lib/supabase";

export default function LoginPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const fr = lang === "fr";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (!data.session || !data.user) {
        throw new Error(fr ? "Session introuvable." : "Session not found.");
      }

      // Supprime définitivement les anciens tokens utilisés par l'ancienne version.
      // La session officielle est déjà persistée par Supabase JS.
      clearLegacyAuthStorage();

      router.replace("/mon-espace");
      router.refresh();
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : fr ? "Erreur de connexion." : "Sign-in error.";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <div className="authTop">
        <Brand />
        <LangSwitch />
      </div>

      <form className="authCard" onSubmit={handleSubmit}>
        <span className="eyebrow">VISITECARD</span>
        <h1>{fr ? "Connexion" : "Sign in"}</h1>
        <p>
          {fr
            ? "Connectez-vous pour modifier votre carte et récupérer votre QR code."
            : "Sign in to edit your card and access your QR code."}
        </p>

        <label>
          {fr ? "E-mail" : "Email"}
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label>
          {fr ? "Mot de passe" : "Password"}
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {message && <div className="error">{message}</div>}

        <button className="submit" type="submit" disabled={loading}>
          {loading ? "..." : fr ? "Se connecter" : "Sign in"}
        </button>

        <div className="authFoot">
          {fr ? "Pas encore de compte ?" : "No account yet?"}{" "}
          <Link href="/creer-compte">
            {fr ? "Créer un compte" : "Create account"}
          </Link>
        </div>
      </form>
    </main>
  );
}
