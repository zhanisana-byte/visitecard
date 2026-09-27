"use client";

import { useEffect, useMemo, useState } from "react";

type Payment = { id: string; user_id: string; payment_reference?: string; vc_reference?: string; currency: string; amount?: number; total_amount?: number; payment_method: string; status: string; created_at: string; agent?: { name: string; commercial_code?: string } | null; items: Array<{ id: string; label?: string; vc_reference?: string; card?: { full_name?: string; company?: string; email?: string; entity_type?: string }; offer?: { name?: string } }> };

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

  const pending = items.filter((x) => x.status === "pending").length;
  const paid = items.filter((x) => x.status === "paid" || x.status === "confirmed").length;
  const total = items.filter((x) => x.status === "paid" || x.status === "confirmed").reduce((s, x) => s + Number(x.amount ?? x.total_amount ?? 0), 0);

  return <main className="admin"><header><div className="brand"><img src="/logo.png" alt="VisiteCard"/><span>Admin</span></div><nav><a href="/admin">Tableau de bord</a><a href="/admin/abonnements">Abonnements</a><a className="active" href="/admin/paiements">Paiements</a><a href="/admin/offres">Offres</a><a href="/admin/paiements-parametres">Paramètres</a></nav></header><div className="wrap"><section className="hero"><small>ADMINISTRATION</small><h1>Demandes & paiements</h1><p>Validation des virements, paiements agents et activation des abonnements.</p></section>{error && <div className="error">{error}</div>}<section className="stats"><article><span>Demandes</span><strong>{items.length}</strong></article><article><span>En attente</span><strong>{pending}</strong></article><article><span>Validés</span><strong>{paid}</strong></article><article><span>Montant validé</span><strong>{total.toFixed(2)}</strong></article></section><section className="panel"><div className="filters"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher référence, client..."/><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Tous les statuts</option><option value="pending">En attente</option><option value="paid">Payé</option><option value="rejected">Refusé</option></select></div><div className="table">{loading ? <div className="empty">Chargement...</div> : <table><thead><tr><th>Date</th><th>Référence</th><th>Client / cartes</th><th>Offre</th><th>Montant</th><th>Méthode</th><th>Statut</th><th>Action</th></tr></thead><tbody>{filtered.map((p) => <tr key={p.id}><td>{new Date(p.created_at).toLocaleDateString("fr-FR")}</td><td><b>{p.payment_reference || p.vc_reference || "—"}</b></td><td>{p.items.map((x, i) => <div key={x.id || i}><b>{x.card?.full_name || x.card?.company || x.label || "Carte"}</b><small>{x.vc_reference || ""} {x.card?.email || ""}</small></div>)}</td><td>{[...new Set(p.items.map((x) => x.offer?.name).filter(Boolean))].join(" + ") || "—"}</td><td><b>{Number(p.amount ?? p.total_amount ?? 0).toFixed(2)} {p.currency === "EUR" ? "€" : "DT"}</b></td><td>{p.payment_method === "bank" ? "Virement" : p.payment_method === "agent" ? `Agent${p.agent?.name ? ` · ${p.agent.name}` : ""}` : p.payment_method}</td><td><span className={`badge ${p.status}`}>{p.status === "pending" ? "En attente" : p.status === "paid" ? "Payé" : p.status === "rejected" ? "Refusé" : p.status}</span></td><td>{p.status === "pending" ? <div className="actions"><button disabled={busy === p.id} onClick={() => action(p.id, "confirm")}>Valider</button><button className="reject" disabled={busy === p.id} onClick={() => action(p.id, "reject")}>Refuser</button></div> : "—"}</td></tr>)}</tbody></table>}</div></section></div><style jsx>{`
    *{box-sizing:border-box}.admin{min-height:100vh;background:#f6f7fb;color:#171923;font-family:Arial,sans-serif}header{height:72px;background:#fff;border-bottom:1px solid #e7e9ef;display:flex;align-items:center;padding:0 max(20px,calc((100vw - 1440px)/2));gap:25px}.brand{display:flex;align-items:center;gap:10px}.brand img{width:140px}.brand span{background:#171b27;color:#fff;border-radius:7px;padding:5px 8px;font-size:11px;font-weight:900}nav{display:flex;gap:4px;margin-left:auto}nav a{text-decoration:none;color:#666d7a;font-size:12px;font-weight:800;padding:9px 10px;border-radius:9px}nav a.active,nav a:hover{background:#f0edff;color:#6543df}.wrap{max-width:1440px;margin:auto;padding:30px 22px 60px}.hero{background:#fff;border:1px solid #e5e8ef;border-radius:16px;padding:18px 20px}.hero small{color:#6d4aff;font-weight:900;letter-spacing:.15em}.hero h1{font-size:28px;margin:5px 0}.hero p{color:#777d89;margin:0}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:24px 0}.stats article{background:#fff;border:1px solid #e5e8ef;border-radius:15px;padding:18px}.stats span{display:block;color:#777d89;font-size:12px}.stats strong{display:block;font-size:26px;margin-top:8px}.panel{background:#fff;border:1px solid #e5e8ef;border-radius:18px;overflow:hidden}.filters{display:grid;grid-template-columns:2fr 1fr;gap:10px;padding:16px}.filters input,.filters select{height:42px;border:1px solid #dfe2e9;border-radius:10px;padding:0 12px;background:#fff}.table{overflow:auto}table{width:100%;border-collapse:collapse;min-width:1200px}th{text-align:left;background:#fafbfc;padding:12px;font-size:11px;color:#777;text-transform:uppercase}td{padding:13px 12px;border-top:1px solid #eef0f4;font-size:12px;vertical-align:top}td small{display:block;color:#9296a0;margin-top:3px}.badge{display:inline-block;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:900;background:#eee}.badge.pending{background:#fff6df;color:#946200}.badge.paid,.badge.confirmed{background:#e7f8ef;color:#16734a}.badge.rejected{background:#fff0f0;color:#b12635}.actions{display:flex;gap:6px}.actions button{border:0;background:#6d4aff;color:#fff;border-radius:8px;padding:7px 10px;font-weight:800;cursor:pointer}.actions .reject{background:#fff0f0;color:#b12635}.empty{padding:45px;text-align:center;color:#888}.error{background:#fff0f0;color:#ad2433;padding:11px;border-radius:10px;margin:15px 0}@media(max-width:900px){.stats{grid-template-columns:1fr 1fr}header{padding:0 12px;overflow:auto}nav{min-width:max-content}.brand img{width:110px}}@media(max-width:600px){.wrap{padding:20px 12px}.filters{grid-template-columns:1fr}.hero h1{font-size:28px}}
  `}</style></main>;
}
