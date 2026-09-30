"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p">
      <section className="c">
        <a href="/" className="brand">
          VisiteCard <span>Admin</span>
        </a>

        <small>ADMINISTRATION</small>
        <h1>Connexion Admin</h1>
        <p>Accès réservé à l&apos;administrateur de VisiteCard.</p>

        {error && <div className="err">{error}</div>}

        <form onSubmit={submit} autoComplete="off">
          <label>
            Adresse e-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Votre adresse e-mail"
              autoComplete="off"
              spellCheck={false}
              required
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Votre mot de passe"
              autoComplete="new-password"
              required
            />
          </label>

          <button disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="sec">● Connexion sécurisée</div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .p {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 20px;
          background: #f7f7f8;
          font-family: Arial;
        }
        .c {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border: 1px solid #e8e8ea;
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 18px 60px #0000000f;
        }
        .brand {
          display: block;
          margin-bottom: 36px;
          color: #111;
          text-decoration: none;
          font-size: 23px;
          font-weight: 900;
        }
        .brand span,
        small {
          color: #ff6337;
        }
        small {
          font-weight: 900;
          letter-spacing: 0.15em;
        }
        h1 {
          margin: 8px 0;
        }
        p {
          color: #777;
          margin: 0 0 26px;
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
          padding: 14px;
          border: 1px solid #ddd;
          border-radius: 12px;
          font-size: 15px;
        }
        button {
          padding: 14px;
          border: 0;
          border-radius: 12px;
          background: #ff6337;
          color: #fff;
          font-weight: 900;
        }
        .err {
          background: #fff0f0;
          color: #a21818;
          padding: 12px;
          border-radius: 11px;
          margin-bottom: 18px;
        }
        .sec {
          text-align: center;
          border-top: 1px solid #eee;
          margin-top: 24px;
          padding-top: 19px;
          color: #35a568;
          font-size: 11px;
        }
      `}</style>
    </main>
  );
}
