"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/app/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

type Card = { id: string; full_name: string | null; company: string | null; entity_type: "profile" | "company"; slug: string | null; vc_reference: string | null };
type Offer = { id: string; name: string; entity_type: "profile" | "company" | "bundle"; profile_count: number; company_count: number; price_tnd: number; price_eur: number; promo_enabled: boolean; promo_price_tnd: number | null; promo_price_eur: number | null; promo_start_at: string | null; promo_end_at: string | null };
type Agent = { id: string; name: string; commercial_code: string | null; country_name: string; region: string | null; city: string | null; whatsapp: string | null };
type Bank = { id: string; currency: "TND" | "EUR"; beneficiary_name: string; bank_name: string; rib: string | null; iban: string | null; bic_swift: string | null; instructions_fr: string | null; instructions_en: string | null };

function price(o: Offer, currency: "TND" | "EUR") {
  const base = Number(currency === "EUR" ? o.price_eur : o.price_tnd) || 0;
  if (!o.promo_enabled) return base;
  const now = Date.now();
  if (o.promo_start_at && now < new Date(o.promo_start_at).getTime()) return base;
  if (o.promo_end_at && now > new Date(o.promo_end_at).getTime()) return base;
  const promo = currency === "EUR" ? o.promo_price_eur : o.promo_price_tnd;
  return promo === null || promo === undefined ? base : Number(promo);
}

export default function AbonnementPage() {
  const { lang } = useLanguage();
  const fr = lang === "fr";
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [currency, setCurrency] = useState<"TND" | "EUR">("TND");
  const [method, setMethod] = useState<"agent" | "bank" | "online">("bank");
  const [agentId, setAgentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  async function authFetch(url: string, options: RequestInit = {}) {
    const supabase = getSupabaseBrowser();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error(fr ? "Votre session a expiré." : "Your session has expired.");
    return fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` } });
  }

  async function load() {
    setLoading(true); setError("");
    try {
      const r = await authFetch("/api/billing/checkout", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erreur");
      setData(d);
      const profiles = (d.cards || []).filter((c: Card) => c.entity_type === "profile");
      setSelected(profiles.length ? [profiles[0].id] : d.cards?.[0]?.id ? [d.cards[0].id] : []);
    } catch (e: any) { setError(e?.message || "Erreur"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const cards: Card[] = data?.cards || [];
  const offers: Offer[] = data?.offers || [];
  const agents: Agent[] = data?.agents || [];
  const banks: Bank[] = data?.banks || [];
  const settings = data?.settings || {};
  const chosenCards = cards.filter((c) => selected.includes(c.id));

  const quote = useMemo(() => {
    const p = chosenCards.filter((c) => c.entity_type === "profile").length;
    const c = chosenCards.filter((x) => x.entity_type === "company").length;
    if (!p && !c) return { total: 0, label: "" };
    const bundles = offers.filter((o) => o.entity_type === "bundle" && Number(o.profile_count || 0) >= p && Number(o.company_count || 0) >= c).map((o) => ({ o, total: price(o, currency) })).sort((a, b) => a.total - b.total);
    const po = offers.filter((o) => o.entity_type === "profile").map((o) => ({ o, total: price(o, currency) })).sort((a, b) => a.total - b.total)[0];
    const co = offers.filter((o) => o.entity_type === "company").map((o) => ({ o, total: price(o, currency) })).sort((a, b) => a.total - b.total)[0];
    const individual = (p ? (po?.total || 0) * p : 0) + (c ? (co?.total || 0) * c : 0);
    if (bundles[0] && bundles[0].total <= individual) return { total: bundles[0].total, label: bundles[0].o.name };
    return { total: individual, label: [p && po?.o.name, c && co?.o.name].filter(Boolean).join(" + ") };
  }, [chosenCards, offers, currency]);

  const visibleAgents = useMemo(() => agents, [agents]);
  const bank = banks.find((b) => b.currency === currency);

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    setSuccess(null);
  }

  async function submit() {
    if (!selected.length) return setError(fr ? "Sélectionnez au moins une carte." : "Select at least one card.");
    if (method === "agent" && !agentId) return setError(fr ? "Choisissez un agent." : "Choose an agent.");
    setSending(true); setError(""); setSuccess(null);
    try {
      const r = await authFetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ card_ids: selected, currency, payment_method: method, agent_id: method === "agent" ? agentId : null }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erreur");
      setSuccess(d);
      await load();
      setSuccess(d);
    } catch (e: any) { setError(e?.message || "Erreur"); }
    finally { setSending(false); }
  }

  if (loading) return <main className="dashBody billing"><div className="loading">{fr ? "Chargement..." : "Loading..."}</div></main>;

  return <main className="dashBody billing">
    <div className="title"><span>VISITECARD PRO</span><h1>{fr ? "Abonnement & paiement" : "Subscription & payment"}</h1><p>{fr ? "Choisissez les cartes à activer. Le meilleur tarif disponible est appliqué automatiquement." : "Choose the cards to activate. The best available price is applied automatically."}</p></div>
    {error && <div className="error">{error}</div>}
    {success && <div className="success"><strong>{fr ? "Demande enregistrée" : "Request saved"}</strong><span>{fr ? "Référence à utiliser" : "Reference to use"}: <b>{success.reference}</b></span><span>{fr ? "Montant" : "Amount"}: <b>{Number(success.amount).toFixed(2)} {success.currency === "EUR" ? "€" : "DT"}</b></span></div>}
    <div className="layout">
      <section className="panel">
        <div className="step"><b>1</b><div><h2>{fr ? "Cartes à activer" : "Cards to activate"}</h2><p>{fr ? "Profil et sociétés liées" : "Profile and linked companies"}</p></div></div>
        <div className="cards">{cards.map((card) => <button type="button" key={card.id} className={selected.includes(card.id) ? "card selected" : "card"} onClick={() => toggle(card.id)}><span className="check">{selected.includes(card.id) ? "✓" : ""}</span><div><strong>{card.full_name || card.company || (card.entity_type === "profile" ? "Profil" : "Société")}</strong><small>{card.entity_type === "profile" ? (fr ? "Profil" : "Profile") : (fr ? "Société" : "Company")} · {card.vc_reference || "VC—"}</small></div></button>)}</div>
        <div className="step top"><b>2</b><div><h2>{fr ? "Devise" : "Currency"}</h2></div></div>
        <div className="choice"><button className={currency === "TND" ? "active" : ""} onClick={() => setCurrency("TND")}>DT · TND</button><button className={currency === "EUR" ? "active" : ""} onClick={() => setCurrency("EUR")}>€ · EUR</button></div>
        <div className="step top"><b>3</b><div><h2>{fr ? "Mode de paiement" : "Payment method"}</h2></div></div>
        <div className="methods">
          {settings.payment_bank_enabled !== false && <button className={method === "bank" ? "method active" : "method"} onClick={() => setMethod("bank")}><strong>{fr ? "Virement bancaire" : "Bank transfer"}</strong><small>{fr ? "Paiement avec votre référence VC" : "Payment with your VC reference"}</small></button>}
          {settings.payment_agent_enabled !== false && <button className={method === "agent" ? "method active" : "method"} onClick={() => setMethod("agent")}><strong>{fr ? "Agent Visitecard" : "Visitecard agent"}</strong><small>{fr ? "Paiement en espèces" : "Cash payment"}</small></button>}
          <button className="method disabled" disabled><strong>{fr ? "Paiement en ligne" : "Online payment"}</strong><small>{fr ? "Bientôt disponible" : "Coming soon"}</small></button>
        </div>
        {method === "agent" && <div className="agentBox"><label>{fr ? "Choisir un agent" : "Choose an agent"}<select value={agentId} onChange={(e) => setAgentId(e.target.value)}><option value="">—</option>{visibleAgents.map((a) => <option key={a.id} value={a.id}>{a.name} · {[a.country_name, a.region, a.city].filter(Boolean).join(" / ")}</option>)}</select></label>{agentId && <p>{agents.find((a) => a.id === agentId)?.whatsapp ? `WhatsApp : ${agents.find((a) => a.id === agentId)?.whatsapp}` : ""}</p>}</div>}
        {method === "bank" && bank && <div className="bankBox"><h3>{bank.bank_name}</h3><p><span>{fr ? "Bénéficiaire" : "Beneficiary"}</span><b>{bank.beneficiary_name}</b></p>{bank.rib && <p><span>RIB</span><b>{bank.rib}</b></p>}{bank.iban && <p><span>IBAN</span><b>{bank.iban}</b></p>}{bank.bic_swift && <p><span>SWIFT / BIC</span><b>{bank.bic_swift}</b></p>}<small>{fr ? bank.instructions_fr : bank.instructions_en}</small></div>}
      </section>
      <aside className="summary"><span>{fr ? "RÉCAPITULATIF" : "SUMMARY"}</span><h2>{quote.label || (fr ? "Votre sélection" : "Your selection")}</h2><div className="summaryCards">{chosenCards.map((c) => <p key={c.id}><span>{c.full_name || c.company}</span><b>{c.vc_reference || "VC—"}</b></p>)}</div><div className="total"><span>Total</span><strong>{quote.total.toFixed(2)} {currency === "EUR" ? "€" : "DT"}</strong></div><button className="submit" disabled={sending || !selected.length || quote.total < 0} onClick={submit}>{sending ? (fr ? "Enregistrement..." : "Saving...") : (fr ? "Activer et réserver mon QR code" : "Activate and reserve my QR code")}</button><small className="hint">{fr ? "Votre QR code et votre référence VC restent les mêmes après chaque renouvellement." : "Your QR code and VC reference remain unchanged after each renewal."}</small></aside>
    </div>
    <style jsx>{`
      .billing{max-width:1180px}.title span,.summary>span{font-size:10px;font-weight:900;letter-spacing:.14em;color:#ff501e}.title h1{font-size:34px;margin:7px 0;color:#07162e}.title p{color:#697386;max-width:720px}.layout{display:grid;grid-template-columns:1fr 370px;gap:22px;margin-top:28px}.panel,.summary{background:#fff;border:1px solid #e4e8ef;border-radius:24px;padding:24px}.step{display:flex;align-items:center;gap:12px}.step.top{margin-top:28px}.step>b{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#07162e;color:#fff}.step h2{margin:0;font-size:19px;color:#07162e}.step p{margin:3px 0 0;color:#89909d;font-size:12px}.cards{display:grid;gap:9px;margin-top:16px}.card{width:100%;display:flex;align-items:center;gap:12px;text-align:left;padding:14px;border:1px solid #e1e5ec;background:#fff;border-radius:14px;cursor:pointer}.card.selected{border-color:#ff6a3d;background:#fff8f5}.check{width:25px;height:25px;border:2px solid #ccd2db;border-radius:7px;display:grid;place-items:center;font-weight:900}.selected .check{background:#ff501e;border-color:#ff501e;color:#fff}.card strong,.card small{display:block}.card small{color:#89909d;margin-top:4px}.choice,.methods{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:13px}.choice button,.method{border:1px solid #e0e4eb;background:#fff;border-radius:13px;padding:13px;cursor:pointer;font-weight:800}.choice button.active,.method.active{border-color:#ff501e;background:#fff6f2;color:#d83d11}.methods{grid-template-columns:repeat(3,1fr)}.method{text-align:left}.method strong,.method small{display:block}.method small{font-weight:500;color:#89909d;margin-top:5px}.method.disabled{opacity:.55;cursor:not-allowed}.agentBox,.bankBox{margin-top:13px;padding:16px;border-radius:14px;background:#f7f8fa}.agentBox label{font-size:12px;font-weight:800}.agentBox select{display:block;width:100%;height:43px;border:1px solid #dfe3ea;border-radius:10px;margin-top:7px;padding:0 10px;background:#fff}.bankBox h3{margin:0 0 12px}.bankBox p{display:grid;grid-template-columns:110px 1fr;gap:10px;margin:8px 0;font-size:12px}.bankBox p span{color:#7c8491}.bankBox b{word-break:break-all}.bankBox>small{display:block;margin-top:12px;color:#6f7784}.summary{height:max-content;position:sticky;top:95px}.summary h2{font-size:21px;color:#07162e}.summaryCards{border-top:1px solid #eceff3;border-bottom:1px solid #eceff3;padding:10px 0}.summaryCards p{display:flex;justify-content:space-between;gap:10px;font-size:12px}.summaryCards p span{color:#697386}.total{display:flex;justify-content:space-between;align-items:flex-end;padding:20px 0}.total strong{font-size:28px;color:#07162e}.submit{width:100%;border:0;border-radius:13px;background:#ff501e;color:#fff;padding:15px;font-weight:900;cursor:pointer}.submit:disabled{opacity:.55}.hint{display:block;text-align:center;color:#89909d;line-height:1.5;margin-top:12px}.error,.success{padding:14px 16px;border-radius:13px;margin-top:18px}.error{background:#fff0f1;color:#a62332}.success{background:#ebfbf3;color:#14784d;display:flex;gap:12px;flex-wrap:wrap}.loading{padding:50px;text-align:center}.agentBox p{font-size:12px;color:#697386}@media(max-width:900px){.layout{grid-template-columns:1fr}.summary{position:static}.methods{grid-template-columns:1fr}}@media(max-width:600px){.billing{padding-left:14px;padding-right:14px}.title h1{font-size:28px}.panel,.summary{padding:17px}.choice{grid-template-columns:1fr 1fr}}
    `}</style>
  </main>;
}
