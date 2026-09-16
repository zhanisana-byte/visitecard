"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";
import LangSwitch from "@/components/LangSwitch";
import { useLanguage } from "@/components/LanguageProvider";
import { getSupabaseBrowser } from "../lib/supabase";

export default function Signup() {
  const { lang } = useLanguage();
  const router = useRouter();

  const [n, setN] = useState("");
  const [e, setE] = useState("");
  const [p, setP] = useState("");
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function go(ev: FormEvent) {
    ev.preventDefault();

    if (!ok || loading) return;

    setMsg("");
    setLoading(true);

    try {
      const supabase = getSupabaseBrowser();

      const { data, error } = await supabase.auth.signUp({
        email: e.trim(),
        password: p,
        options: {
          data: {
            name: n.trim(),
          },
        },
      });

      if (error) throw error;

      let session = data.session;

      // Si la confirmation e-mail est désactivée dans Supabase,
      // signUp renvoie normalement déjà une session.
      // Ce fallback reconnecte immédiatement l'utilisateur si nécessaire.
      if (!session) {
        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: e.trim(),
            password: p,
          });

        if (loginError) throw loginError;
        session = loginData.session;
      }

      if (!session?.access_token || !session?.user) {
        throw new Error(
          lang === "fr"
            ? "Le compte a été créé, mais la session n’a pas pu être ouverte."
            : "The account was created, but the session could not be opened."
        );
      }

      // Compatibilité avec votre page /mon-espace actuelle.
      localStorage.setItem(
        "visitecard_access_token",
        session.access_token
      );

      localStorage.setItem(
        "visitecard_refresh_token",
        session.refresh_token
      );

      localStorage.setItem(
        "visitecard_user",
        JSON.stringify(session.user)
      );

      // Ouvre directement Mon espace.
      router.replace("/mon-espace");
      router.refresh();
    } catch (x: any) {
      setMsg(
        x?.message ||
          (lang === "fr"
            ? "Une erreur est survenue."
            : "An error occurred.")
      );
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <div className="authTop">
        <Brand />
        <LangSwitch />
      </div>

      <form className="authCard" onSubmit={go}>
        <span className="eyebrow">VISITECARD</span>

        <h1>
          {lang === "fr" ? "Créer un compte" : "Create account"}
        </h1>

        <p>
          {lang === "fr"
            ? "Créez votre espace et votre carte digitale."
            : "Create your space and digital card."}
        </p>

        <label>
          {lang === "fr" ? "Nom complet" : "Full name"}
          <input
            required
            value={n}
            onChange={(x) => setN(x.target.value)}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            required
            value={e}
            onChange={(x) => setE(x.target.value)}
          />
        </label>

        <label>
          {lang === "fr" ? "Mot de passe" : "Password"}
          <input
            type="password"
            minLength={6}
            required
            value={p}
            onChange={(x) => setP(x.target.value)}
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={ok}
            onChange={(x) => setOk(x.target.checked)}
          />

          <span>
            {lang === "fr" ? (
              <>
                J’accepte les{" "}
                <Link href="/conditions-generales">
                  conditions générales
                </Link>
                .
              </>
            ) : (
              <>
                I accept the{" "}
                <Link href="/conditions-generales">
                  terms and conditions
                </Link>
                .
              </>
            )}
          </span>
        </label>

        {msg && <div className="notice">{msg}</div>}

        <button
          disabled={!ok || loading}
          className="submit"
          type="submit"
        >
          {loading
            ? lang === "fr"
              ? "Création..."
              : "Creating..."
            : lang === "fr"
              ? "Créer mon compte"
              : "Create my account"}
        </button>

        <div className="authFoot">
          <Link href="/connexion">
            {lang === "fr"
              ? "J’ai déjà un compte"
              : "I already have an account"}
          </Link>
        </div>
      </form>
    </main>
  );
}
