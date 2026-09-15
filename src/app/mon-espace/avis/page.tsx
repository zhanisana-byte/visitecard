"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Review = {
  id: string;
  reviewer_name?: string;
  reviewer_phone?: string;
  rating: number;
  comment?: string;
  status: "pending" | "published" | "hidden";
  created_at: string;
};

async function getSession(supabaseUrl: string, supabaseKey: string) {
  let accessToken = localStorage.getItem("visitecard_access_token");
  const refreshToken = localStorage.getItem("visitecard_refresh_token");

  if (!accessToken) return null;

  const check = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (check.ok) {
    const user = await check.json();
    return { accessToken, user };
  }

  if (!refreshToken) return null;

  const refresh = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }
  );

  if (!refresh.ok) return null;

  const session = await refresh.json();

  localStorage.setItem("visitecard_access_token", session.access_token);
  if (session.refresh_token) {
    localStorage.setItem("visitecard_refresh_token", session.refresh_token);
  }

  return {
    accessToken: session.access_token,
    user: session.user,
  };
}

export default function AvisPage() {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [cardId, setCardId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setError("Configuration Supabase manquante.");
      setLoading(false);
      return;
    }

    const session = await getSession(supabaseUrl, supabaseKey);

    if (!session?.user?.id) {
      router.replace("/connexion");
      return;
    }

    const cardResponse = await fetch(
      `${supabaseUrl}/rest/v1/cards?user_id=eq.${session.user.id}&select=id&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    const cardRows = await cardResponse.json();
    const card = Array.isArray(cardRows) ? cardRows[0] : null;

    if (!card?.id) {
      setError("Carte introuvable.");
      setLoading(false);
      return;
    }

    setCardId(card.id);

    const reviewResponse = await fetch(
      `${supabaseUrl}/rest/v1/card_reviews?card_id=eq.${card.id}&select=*&order=created_at.desc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!reviewResponse.ok) {
      setError(await reviewResponse.text());
      setLoading(false);
      return;
    }

    const rows = await reviewResponse.json();
    setReviews(Array.isArray(rows) ? rows : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: Review["status"]) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return;

    const session = await getSession(supabaseUrl, supabaseKey);
    if (!session?.accessToken) return;

    await fetch(`${supabaseUrl}/rest/v1/card_reviews?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ status }),
    });

    setReviews((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }

  async function removeReview(id: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return;

    const session = await getSession(supabaseUrl, supabaseKey);
    if (!session?.accessToken) return;

    await fetch(`${supabaseUrl}/rest/v1/card_reviews?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.accessToken}`,
        Prefer: "return=minimal",
      },
    });

    setReviews((current) => current.filter((item) => item.id !== id));
  }

  const stats = useMemo(() => {
    const published = reviews.filter((item) => item.status === "published");
    const hidden = reviews.filter((item) => item.status === "hidden");

    return {
      total: reviews.length,
      published: published.length,
      hidden: hidden.length,
      average: published.length
        ? published.reduce((sum, item) => sum + item.rating, 0) / published.length
        : 0,
    };
  }, [reviews]);

  if (loading) {
    return (
      <main className="loading">
        <div className="loader" />
      </main>
    );
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="topLinks">
          <Link href="/">Accueil</Link>
          <Link href="/mon-espace">Mon espace</Link>
          <Link href="/mon-espace/statistiques">Statistiques</Link>
        </div>
        <strong>Avis</strong>
      </header>

      <div className="content">
        <div className="heading">
          <span>AVIS CLIENTS</span>
          <h1>Gérer les avis</h1>
          <p>Les nouveaux avis sont publiés automatiquement et classés du plus récent au plus ancien. Vous pouvez les masquer ou les supprimer.</p>
        </div>

        {error ? <div className="error">{error}</div> : null}

        <section className="kpis">
          <article>
            <small>Total</small>
            <strong>{stats.total}</strong>
          </article>
          <article>
            <small>Masqués</small>
            <strong>{stats.hidden}</strong>
          </article>
          <article>
            <small>Publiés</small>
            <strong>{stats.published}</strong>
          </article>
          <article>
            <small>Note moyenne</small>
            <strong>{stats.average ? stats.average.toFixed(1) : "—"}</strong>
          </article>
        </section>

        <section className="list">
          {reviews.length ? (
            reviews.map((review) => (
              <article key={review.id} className="reviewCard">
                <div className="reviewTop">
                  <div>
                    <div className="stars">
                      {"★★★★★".slice(0, review.rating)}
                      <i>{"★★★★★".slice(review.rating)}</i>
                    </div>
                    <strong>{review.reviewer_name || "Client"}</strong>
                    {review.reviewer_phone ? (
                      <small>{review.reviewer_phone}</small>
                    ) : null}
                  </div>

                  <span className={`status ${review.status}`}>
                    {review.status === "hidden" ? "Masqué" : "Visible"}
                  </span>
                </div>

                {review.comment ? <p>{review.comment}</p> : null}

                <div className="actions">
                  {review.status === "hidden" ? (
                    <button
                      type="button"
                      onClick={() => updateStatus(review.id, "published")}
                    >
                      Afficher
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => updateStatus(review.id, "hidden")}
                    >
                      Masquer
                    </button>
                  )}

                  <button
                    type="button"
                    className="danger"
                    onClick={() => removeReview(review.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty">Aucun avis reçu.</div>
          )}
        </section>
      </div>

      <style jsx>{`
        * { box-sizing:border-box; }
        .page { min-height:100dvh; background:#f6f6f5; color:#111; font-family:Inter,system-ui,sans-serif; }
        .topbar { min-height:72px; padding:12px 28px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e7e7e4; background:#fff; }
        .topbar a { color:#111; text-decoration:none; font-weight:800; }
        .topbar > div { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

        .topLinks a {
          min-height:38px;
          padding:0 11px;
          display:inline-flex;
          align-items:center;
          border:1px solid #ddd;
          border-radius:10px;
          background:#fff;
          color:#111;
          text-decoration:none;
          font-size:12px;
          font-weight:800;
        }
        .content { width:min(1000px,calc(100% - 36px)); margin:auto; padding:40px 0 80px; }
        .heading span { color:#ff4f23; font-size:12px; font-weight:900; letter-spacing:.14em; }
        .heading h1 { margin:8px 0 0; font-size:clamp(36px,6vw,58px); letter-spacing:-.05em; }
        .heading p { margin:8px 0 0; color:#7d8490; }
        .kpis { margin-top:28px; display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .kpis article { min-height:120px; padding:20px; display:grid; align-content:space-between; border:1px solid #e2e2df; border-radius:20px; background:#fff; }
        .kpis small { color:#8a9099; font-weight:700; }
        .kpis strong { font-size:38px; }
        .list { margin-top:18px; display:grid; gap:12px; }
        .reviewCard { padding:20px; border:1px solid #e2e2df; border-radius:20px; background:#fff; }
        .reviewTop { display:flex; justify-content:space-between; gap:14px; }
        .reviewTop > div { display:grid; gap:5px; }
        .reviewTop small { color:#8a9099; }
        .stars { color:#ffb000; }
        .stars i { color:#e5e5e5; font-style:normal; }
        .status { height:max-content; padding:7px 10px; border-radius:999px; font-size:11px; font-weight:900; }
        .status.pending { background:#fff3cd; color:#7a5b00; }
        .status.published { background:#eafaf1; color:#087a42; }
        .status.hidden { background:#f0f0f0; color:#666; }
        .reviewCard p { margin:14px 0; line-height:1.55; }
        .actions { display:flex; gap:8px; flex-wrap:wrap; }
        .actions button { min-height:40px; padding:0 13px; border:0; border-radius:10px; background:#111; color:#fff; font-weight:800; cursor:pointer; }
        .actions .secondary { border:1px solid #ddd; background:#fff; color:#111; }
        .actions .danger { background:#fff0f0; color:#b42318; }
        .empty { padding:40px; text-align:center; color:#8a9099; }
        .error { margin-top:18px; padding:14px; border-radius:12px; background:#fff1f0; color:#b42318; }
        .loading { min-height:100dvh; display:grid; place-items:center; }
        .loader { width:40px; height:40px; border:4px solid #eee; border-top-color:#ff4f23; border-radius:50%; animation:spin .8s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @media(max-width:760px) {
          .kpis { grid-template-columns:repeat(2,1fr); }
          .content { width:calc(100% - 24px); padding-top:26px; }
        }
      `}</style>
    </main>
  );
}
