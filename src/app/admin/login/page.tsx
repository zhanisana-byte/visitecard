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
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = getSupabaseBrowser();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) return;

        const response = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (response.ok) {
          router.replace("/admin");
          return;
        }

        await supabase.auth.signOut();
      } finally {
        setChecking(false);
      }
    }

    checkSession();
  }, [router]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = getSupabaseBrowser();
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError || !data.session) {
        throw new Error("E-mail ou mot de passe incorrect.");
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        await supabase.auth.signOut();
        throw new Error(result.error || "Accès administrateur refusé.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="loading">
        <div className="loader" />
        <style jsx>{`
          .loading{min-height:100vh;display:grid;place-items:center;background:#f7f7f8}
          .loader{width:32px;height:32px;border:3px solid #e9e9e9;border-top-color:#ff6337;border-radius:50%;animation:spin .7s linear infinite}
          @keyframes spin{to{transform:rotate(360deg)}}
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <a href="/" className="brand">VisiteCard <span>Admin</span></a>
        <span className="eyebrow">ADMINISTRATION</span>
        <h1>Connexion Admin</h1>
        <p className="intro">Accès réservé à l'administrateur de VisiteCard.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={login}>
          <label>
            Adresse e-mail
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="secure">● Connexion sécurisée</div>
      </section>

      <style jsx>{`
        *{box-sizing:border-box}.page{min-height:100vh;padding:20px;display:grid;place-items:center;background:radial-gradient(circle at top right,rgba(255,99,55,.1),transparent 32%),#f7f7f8;font-family:Arial,sans-serif;color:#171717}.card{width:100%;max-width:440px;padding:36px;background:#fff;border:1px solid #e8e8ea;border-radius:24px;box-shadow:0 18px 60px rgba(0,0,0,.06)}.brand{display:block;margin-bottom:36px;color:#111;text-decoration:none;font-size:23px;font-weight:900}.brand span,.eyebrow{color:#ff6337}.eyebrow{font-size:10px;font-weight:900;letter-spacing:.15em}h1{margin:8px 0;font-size:29px}.intro{margin:0 0 26px;color:#777;font-size:14px;line-height:1.5}form{display:grid;gap:18px}label{display:grid;gap:8px;font-size:12px;font-weight:800}input{width:100%;padding:14px;border:1px solid #ddd;border-radius:12px;font-size:15px;outline:none}input:focus{border-color:#ff6337;box-shadow:0 0 0 3px rgba(255,99,55,.1)}button{padding:14px;border:0;border-radius:12px;background:#ff6337;color:#fff;font-weight:900;cursor:pointer}button:disabled{opacity:.55}.error{margin-bottom:18px;padding:12px 14px;border-radius:11px;background:#fff0f0;color:#a21818;font-size:13px}.secure{margin-top:24px;padding-top:19px;border-top:1px solid #eee;text-align:center;color:#35a568;font-size:11px}@media(max-width:500px){.card{padding:27px 22px}}
      `}</style>
    </main>
  );
}
