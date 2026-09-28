"use client";

import { useEffect, useMemo, useState } from "react";

type Payment = {
  id: string;
  user_id: string;
  payment_reference?: string;
  vc_reference?: string;
  currency: string;
  amount?: number;
  total_amount?: number;
  payment_method: string;
  status: string;
  created_at: string;
  agent?: { name: string; commercial_code?: string } | null;
  items: Array<{
    id: string;
    label?: string;
    vc_reference?: string;
    price_snapshot?: number | null;
    unit_price?: number | null;
    total_price?: number | null;
    card?: {
      full_name?: string;
      company?: string;
      email?: string;
      entity_type?: string;
    };
    offer?: {
      name?: string;
      price_tnd?: number | null;
      price_eur?: number | null;
      promo_enabled?: boolean;
      promo_price_tnd?: number | null;
      promo_price_eur?: number | null;
    };
  }>;
};

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/payments", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erreur");
      setItems(d.payments || []);
    } catch (e: any) { setError(e?.message || "Erreur"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function action(id: string, type: "confirm" | "reject") {
    if (type === "confirm" && !window.confirm("Confirmer ce paiement et activer l'abonnement ?")) return;
    if (type === "reject" && !window.confirm("Refuser cette demande ?")) return;
    setBusy(id); setError("");
    try {
      const r = await fetch("/api/admin/payments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: type }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erreur");
      await load();
    } catch (e: any) { setError(e?.message || "Erreur"); }
    finally { setBusy(""); }
  }

  const filtered = useMemo(() => items.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${p.payment_reference || p.vc_reference || ""} ${p.payment_method} ${p.items.map((x) => `${x.label || ""} ${x.card?.full_name || ""} ${x.card?.company || ""} ${x.card?.email || ""}`).join(" ")}`.toLowerCase().includes(q);
  }), [items, status, search]);


  function normalPrice(p: Payment) {
    return p.items.reduce((sum, item) => {
      const offer = item.offer;
      if (!offer) return sum;
      const value =
        p.currency === "EUR"
          ? Number(offer.price_eur ?? 0)
          : Number(offer.price_tnd ?? 0);
      return sum + value;
    }, 0);
  }

  function hasPromo(p: Payment) {
    const normal = normalPrice(p);
    const paid = Number(p.amount ?? p.total_amount ?? 0);
    return normal > 0 && paid < normal;
  }

  const pending = items.filter((x) => x.status === "pending").length;
  const paid = items.filter((x) => x.status === "paid" || x.status === "confirmed").length;
  const total = items.filter((x) => x.status === "paid" || x.status === "confirmed").reduce((s, x) => s + Number(x.amount ?? x.total_amount ?? 0), 0);

  return (
    <main className="admin">
      <header>
        <div className="brand">
          <img src="/logo.png" alt="VisiteCard" />
          <span>Admin</span>
        </div>
        <nav>
          <a href="/admin">Tableau de bord</a>
          <a href="/admin/abonnements">Abonnements</a>
          <a className="active" href="/admin/paiements">Paiements</a>
          <a href="/admin/offres">Offres</a>
          <a href="/admin/paiements-parametres">Paramètres</a>
        </nav>
      </header>

      <div className="wrap">
        <section className="hero">
          <div>
            <small>ADMINISTRATION</small>
            <h1>Demandes & paiements</h1>
            <p>Validation des virements, paiements agents et activation des abonnements.</p>
          </div>
        </section>

        {error && <div className="error">{error}</div>}

        <section className="stats">
          <article><span>Demandes</span><strong>{items.length}</strong></article>
          <article><span>En attente</span><strong>{pending}</strong></article>
          <article><span>Validés</span><strong>{paid}</strong></article>
          <article><span>Montant validé</span><strong>{total.toFixed(2)}</strong></article>
        </section>

        <section className="panel">
          <div className="filters">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher référence, client..."
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
              <option value="rejected">Refusé</option>
            </select>
          </div>

          <div className="table">
            {loading ? (
              <div className="empty">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="empty">Aucune demande.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Référence</th>
                    <th>Client / cartes</th>
                    <th>Offre</th>
                    <th>Tarif</th>
                    <th>Méthode</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const promo = hasPromo(p);
                    const normal = normalPrice(p);
                    const amount = Number(p.amount ?? p.total_amount ?? 0);
                    const symbol = p.currency === "EUR" ? "€" : "DT";

                    return (
                      <tr key={p.id}>
                        <td>{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                        <td>
                          <b className="reference">
                            {p.payment_reference || p.vc_reference || "—"}
                          </b>
                        </td>
                        <td>
                          {p.items.map((x, i) => (
                            <div className="client" key={x.id || i}>
                              <b>{x.card?.full_name || x.card?.company || x.label || "Carte"}</b>
                              <small>
                                {x.vc_reference || ""} {x.card?.email || ""}
                              </small>
                            </div>
                          ))}
                        </td>
                        <td>
                          <div className="offerCell">
                            <b>
                              {[...new Set(p.items.map((x) => x.offer?.name).filter(Boolean))].join(" + ") || "—"}
                            </b>
                            {promo && <span className="promoBadge">PROMO</span>}
                          </div>
                        </td>
                        <td>
                          <div className="priceCell">
                            {promo && normal > 0 && (
                              <span className="oldPrice">
                                {normal.toFixed(2)} {symbol}
                              </span>
                            )}
                            <strong className={promo ? "promoPrice" : ""}>
                              {amount.toFixed(2)} {symbol}
                            </strong>
                            {promo && (
                              <small>
                                Économie {(normal - amount).toFixed(2)} {symbol}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          {p.payment_method === "bank_transfer" || p.payment_method === "bank"
                            ? "Virement bancaire"
                            : p.payment_method === "agent"
                            ? `Agent${p.agent?.name ? ` · ${p.agent.name}` : ""}`
                            : p.payment_method}
                        </td>
                        <td>
                          <span className={`badge ${p.status}`}>
                            {p.status === "pending"
                              ? "En attente"
                              : p.status === "paid" || p.status === "confirmed"
                              ? "Payé"
                              : p.status === "rejected"
                              ? "Refusé"
                              : p.status}
                          </span>
                        </td>
                        <td>
                          {p.status === "pending" ? (
                            <div className="actions">
                              <button disabled={busy === p.id} onClick={() => action(p.id, "confirm")}>
                                Valider
                              </button>
                              <button className="reject" disabled={busy === p.id} onClick={() => action(p.id, "reject")}>
                                Refuser
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        *{box-sizing:border-box}
        .admin{min-height:100vh;background:#f6f7fb;color:#171923;font-family:Arial,sans-serif}
        header{height:72px;background:#fff;border-bottom:1px solid #e7e9ef;display:flex;align-items:center;padding:0 max(20px,calc((100vw - 1440px)/2));gap:25px}
        .brand{display:flex;align-items:center;gap:10px}
        .brand img{width:120px;height:auto}
        .brand span{background:#171b27;color:#fff;border-radius:7px;padding:5px 8px;font-size:11px;font-weight:900}
        nav{display:flex;gap:4px;margin-left:auto}
        nav a{text-decoration:none;color:#666d7a;font-size:12px;font-weight:800;padding:9px 10px;border-radius:9px}
        nav a.active,nav a:hover{background:#f0edff;color:#6543df}
        .wrap{max-width:1440px;margin:auto;padding:24px 22px 60px}
        .hero{background:#fff;border:1px solid #e5e8ef;border-radius:16px;padding:18px 20px;min-height:0;height:auto}
        .hero small{color:#6d4aff;font-weight:900;letter-spacing:.15em}
        .hero h1{font-size:27px;line-height:1.15;margin:5px 0}
        .hero p{color:#777d89;margin:0;font-size:14px}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}
        .stats article{background:#fff;border:1px solid #e5e8ef;border-radius:15px;padding:16px}
        .stats span{display:block;color:#777d89;font-size:12px}
        .stats strong{display:block;font-size:24px;margin-top:7px}
        .panel{background:#fff;border:1px solid #e5e8ef;border-radius:18px;overflow:hidden}
        .filters{display:grid;grid-template-columns:2fr 1fr;gap:10px;padding:16px}
        .filters input,.filters select{height:42px;border:1px solid #dfe2e9;border-radius:10px;padding:0 12px;background:#fff}
        .table{overflow:auto}
        table{width:100%;border-collapse:collapse;min-width:1250px}
        th{text-align:left;background:#fafbfc;padding:12px;font-size:11px;color:#777;text-transform:uppercase}
        td{padding:13px 12px;border-top:1px solid #eef0f4;font-size:12px;vertical-align:top}
        td small{display:block;color:#9296a0;margin-top:3px}
        .reference{color:#101828}
        .client+ .client{margin-top:7px}
        .offerCell{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
        .promoBadge{display:inline-flex;align-items:center;background:#fff0e9;color:#f04a1d;border:1px solid #ffd1c1;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:900;letter-spacing:.06em}
        .priceCell{display:flex;flex-direction:column;align-items:flex-start;gap:3px}
        .oldPrice{text-decoration:line-through;color:#9aa0aa;font-size:11px}
        .priceCell strong{font-size:14px}
        .promoPrice{color:#ff501e}
        .priceCell small{color:#16864b;font-size:10px;font-weight:800}
        .badge{display:inline-block;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:900;background:#eee}
        .badge.pending{background:#fff6df;color:#946200}
        .badge.paid,.badge.confirmed{background:#e7f8ef;color:#16734a}
        .badge.rejected{background:#fff0f0;color:#b12635}
        .actions{display:flex;gap:6px}
        .actions button{border:0;background:#6d4aff;color:#fff;border-radius:8px;padding:7px 10px;font-weight:800;cursor:pointer}
        .actions .reject{background:#fff0f0;color:#b12635}
        .actions button:disabled{opacity:.5;cursor:wait}
        .empty{padding:45px;text-align:center;color:#888}
        .error{background:#fff0f0;color:#ad2433;padding:11px;border-radius:10px;margin:15px 0}
        @media(max-width:900px){.stats{grid-template-columns:1fr 1fr}header{padding:0 12px;overflow:auto}nav{min-width:max-content}.brand img{width:105px}}
        @media(max-width:600px){.wrap{padding:16px 12px}.filters{grid-template-columns:1fr}.hero h1{font-size:23px}.stats{grid-template-columns:1fr 1fr}}
      `}</style>
    </main>
  );
}
