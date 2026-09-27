"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/app/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

type Currency = "TND" | "EUR";

type Card = {
  id: string;
  full_name: string | null;
  company: string | null;
  entity_type: "profile" | "company";
  slug: string | null;
  vc_reference: string | null;
};

type Offer = {
  id: string;
  name: string;
  entity_type: "profile" | "company" | "bundle";
  profile_count: number;
  company_count: number;
  duration_value: number;
  duration_unit: "day" | "month" | "year" | string;
  price_tnd: number | null;
  price_eur: number | null;
  promo_enabled: boolean;
  promo_price_tnd: number | null;
  promo_price_eur: number | null;
  promo_start_at: string | null;
  promo_end_at: string | null;
};

type Agent = {
  id: string;
  name: string;
  commercial_code: string | null;
  country_code?: string | null;
  country_name: string;
  region: string | null;
  city: string | null;
  whatsapp: string | null;
  phone?: string | null;
  photo_url?: string | null;
};

type Bank = {
  id: string;
  currency: Currency;
  beneficiary_name: string;
  bank_name: string;
  label?: string | null;
  rib: string | null;
  iban: string | null;
  bic_swift: string | null;
  instructions_fr: string | null;
  instructions_en: string | null;
};

function basePrice(offer: Offer, currency: Currency) {
  const value = currency === "EUR" ? offer.price_eur : offer.price_tnd;
  return value === null || value === undefined ? null : Number(value);
}

function promoPrice(offer: Offer, currency: Currency) {
  const base = basePrice(offer, currency);
  if (base === null) return null;
  if (!offer.promo_enabled) return base;

  const now = Date.now();
  if (offer.promo_start_at && now < new Date(offer.promo_start_at).getTime()) return base;
  if (offer.promo_end_at && now > new Date(offer.promo_end_at).getTime()) return base;

  const promo = currency === "EUR" ? offer.promo_price_eur : offer.promo_price_tnd;
  return promo === null || promo === undefined ? base : Number(promo);
}

function durationLabel(offer: Offer | null, fr: boolean) {
  if (!offer) return "—";
  const n = Number(offer.duration_value || 1);
  if (offer.duration_unit === "year") return fr ? `${n} an${n > 1 ? "s" : ""}` : `${n} year${n > 1 ? "s" : ""}`;
  if (offer.duration_unit === "month") return fr ? `${n} mois` : `${n} month${n > 1 ? "s" : ""}`;
  return fr ? `${n} jour${n > 1 ? "s" : ""}` : `${n} day${n > 1 ? "s" : ""}`;
}

function money(value: number, currency: Currency) {
  return `${Number(value || 0).toFixed(value % 1 ? 2 : 0)} ${currency === "EUR" ? "€" : "DT"}`;
}

function flag(countryCode?: string | null) {
  const code = (countryCode || "").toUpperCase();
  if (code === "TN") return "🇹🇳";
  if (code === "FR") return "🇫🇷";
  return "🌍";
}

export default function AbonnementPage() {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [currency, setCurrency] = useState<Currency>("TND");
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

    if (!token) {
      throw new Error(fr ? "Votre session a expiré." : "Your session has expired.");
    }

    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function load() {
    setLoading(true);
    setError("");

    try {
      const r = await authFetch("/api/billing/checkout", { cache: "no-store" });
      const d = await r.json();

      if (!r.ok) throw new Error(d.error || "Erreur");

      setData(d);

      const profiles = (d.cards || []).filter((c: Card) => c.entity_type === "profile");
      setSelected(
        profiles.length
          ? [profiles[0].id]
          : d.cards?.[0]?.id
            ? [d.cards[0].id]
            : []
      );
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const cards: Card[] = data?.cards || [];
  const offers: Offer[] = data?.offers || [];
  const agents: Agent[] = data?.agents || [];
  const banks: Bank[] = data?.banks || [];
  const settings = data?.settings || {};
  const chosenCards = cards.filter((c) => selected.includes(c.id));

  const quote = useMemo(() => {
    const profileCount = chosenCards.filter((c) => c.entity_type === "profile").length;
    const companyCount = chosenCards.filter((c) => c.entity_type === "company").length;

    if (!profileCount && !companyCount) {
      return { total: 0, normal: 0, label: "", offer: null as Offer | null };
    }

    const usable = offers.filter((o) => basePrice(o, currency) !== null);

    const bundles = usable
      .filter(
        (o) =>
          o.entity_type === "bundle" &&
          Number(o.profile_count || 0) >= profileCount &&
          Number(o.company_count || 0) >= companyCount
      )
      .map((o) => ({
        o,
        total: promoPrice(o, currency) ?? 0,
        normal: basePrice(o, currency) ?? 0,
      }))
      .sort((a, b) => a.total - b.total);

    const profileOffer = usable
      .filter((o) => o.entity_type === "profile")
      .map((o) => ({
        o,
        total: promoPrice(o, currency) ?? 0,
        normal: basePrice(o, currency) ?? 0,
      }))
      .sort((a, b) => a.total - b.total)[0];

    const companyOffer = usable
      .filter((o) => o.entity_type === "company")
      .map((o) => ({
        o,
        total: promoPrice(o, currency) ?? 0,
        normal: basePrice(o, currency) ?? 0,
      }))
      .sort((a, b) => a.total - b.total)[0];

    const individualTotal =
      (profileCount ? (profileOffer?.total || 0) * profileCount : 0) +
      (companyCount ? (companyOffer?.total || 0) * companyCount : 0);

    const individualNormal =
      (profileCount ? (profileOffer?.normal || 0) * profileCount : 0) +
      (companyCount ? (companyOffer?.normal || 0) * companyCount : 0);

    if (bundles[0] && bundles[0].total <= individualTotal) {
      return {
        total: bundles[0].total,
        normal: bundles[0].normal,
        label: bundles[0].o.name,
        offer: bundles[0].o,
      };
    }

    const offer =
      profileCount && !companyCount
        ? profileOffer?.o || null
        : companyCount && !profileCount
          ? companyOffer?.o || null
          : null;

    return {
      total: individualTotal,
      normal: individualNormal,
      label: [
        profileCount && profileOffer?.o.name,
        companyCount && companyOffer?.o.name,
      ]
        .filter(Boolean)
        .join(" + "),
      offer,
    };
  }, [chosenCards, offers, currency]);

  const topOffer = useMemo(() => {
    if (quote.offer) return quote.offer;

    const type =
      chosenCards.length === 1
        ? chosenCards[0]?.entity_type
        : chosenCards.some((c) => c.entity_type === "profile") &&
            chosenCards.some((c) => c.entity_type === "company")
          ? "bundle"
          : chosenCards[0]?.entity_type;

    return (
      offers
        .filter((o) => o.entity_type === type && basePrice(o, currency) !== null)
        .sort((a, b) => (promoPrice(a, currency) ?? 0) - (promoPrice(b, currency) ?? 0))[0] ||
      null
    );
  }, [quote.offer, chosenCards, offers, currency]);

  const bank = banks.find((b) => b.currency === currency);
  const selectedAgent = agents.find((a) => a.id === agentId) || null;

  useEffect(() => {
    if (method === "agent" && !agentId && agents.length) {
      setAgentId(agents[0].id);
    }
  }, [method, agentId, agents]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setSuccess(null);
  }

  async function submit() {
    if (!selected.length) {
      return setError(fr ? "Sélectionnez au moins une carte." : "Select at least one card.");
    }

    if (method === "agent" && !agentId) {
      return setError(fr ? "Choisissez un agent." : "Choose an agent.");
    }

    if (method === "bank" && !bank) {
      return setError(
        fr
          ? `Aucun compte bancaire ${currency} actif.`
          : `No active ${currency} bank account.`
      );
    }

    setSending(true);
    setError("");
    setSuccess(null);

    try {
      const r = await authFetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_ids: selected,
          currency,
          payment_method: method,
          agent_id: method === "agent" ? agentId : null,
        }),
      });

      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erreur");

      setSuccess(d);
      await load();
      setSuccess(d);
    } catch (e: any) {
      setError(e?.message || "Erreur");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="dashBody billing">
        <div className="loading">{fr ? "Chargement..." : "Loading..."}</div>
      </main>
    );
  }

  const normal = Number(quote.normal || 0);
  const finalPrice = Number(quote.total || 0);
  const hasPromo = normal > finalPrice;
  const topBase = topOffer ? basePrice(topOffer, currency) : null;
  const topFinal = topOffer ? promoPrice(topOffer, currency) : null;

  return (
    <main className="dashBody billing">
      <div className="heading">
        <div>
          <span>VISITECARD PRO</span>
          <h1>{fr ? "Abonnement & paiement" : "Subscription & payment"}</h1>
          <p>
            {fr
              ? "Choisissez l’offre et activez votre carte. Les tarifs et promotions sont gérés depuis votre espace VisiteCard."
              : "Choose your offer and activate your card. Prices and promotions are managed from your VisiteCard account."}
          </p>
        </div>

        {topOffer && topBase !== null && topFinal !== null && (
          <div className="offerCard">
            <div className="offerTop">
              <strong>
                {currency === "TND" ? "🇹🇳 Tunisie (DT)" : "🇪🇺 International (€)"}
              </strong>
              {topOffer.promo_enabled && (
                <span className="promoBadge">{fr ? "Offre promo" : "Promo offer"}</span>
              )}
            </div>

            <div className="offerPrice">
              <b>{money(topFinal, currency)}</b>
              {topBase > topFinal && <del>{money(topBase, currency)}</del>}
            </div>

            <div className="duration">
              {fr ? "Valable " : "Valid for "}
              {durationLabel(topOffer, fr)}
            </div>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {success && (
        <div className="success">
          <strong>{fr ? "Demande enregistrée" : "Request saved"}</strong>
          <span>
            {fr ? "Référence à utiliser" : "Reference to use"}:{" "}
            <b>{success.reference}</b>
          </span>
          <span>
            {fr ? "Montant" : "Amount"}:{" "}
            <b>
              {Number(success.amount).toFixed(2)}{" "}
              {success.currency === "EUR" ? "€" : "DT"}
            </b>
          </span>
        </div>
      )}

      <div className="layout">
        <section className="panel">
          <div className="step">
            <b>1</b>
            <div>
              <h2>{fr ? "Cartes à activer" : "Cards to activate"}</h2>
              <p>
                {fr
                  ? "Sélectionnez votre profil et/ou vos sociétés."
                  : "Select your profile and/or companies."}
              </p>
            </div>
          </div>

          <div className="cards">
            {cards.map((card) => (
              <button
                type="button"
                key={card.id}
                className={selected.includes(card.id) ? "card selected" : "card"}
                onClick={() => toggle(card.id)}
              >
                <span className="check">{selected.includes(card.id) ? "✓" : ""}</span>
                <div>
                  <strong>
                    {card.full_name ||
                      card.company ||
                      (card.entity_type === "profile" ? "Profil" : "Société")}
                  </strong>
                  <small>
                    {card.entity_type === "profile"
                      ? fr
                        ? "Profil"
                        : "Profile"
                      : fr
                        ? "Société"
                        : "Company"}{" "}
                    · {card.vc_reference || "VC—"}
                  </small>
                </div>
              </button>
            ))}
          </div>

          <div className="step top">
            <b>2</b>
            <div>
              <h2>{fr ? "Devise" : "Currency"}</h2>
              <p>{fr ? "Choisissez la devise de paiement." : "Choose payment currency."}</p>
            </div>
          </div>

          <div className="choice">
            <button
              className={currency === "TND" ? "active" : ""}
              onClick={() => setCurrency("TND")}
            >
              DT · TND
            </button>
            <button
              className={currency === "EUR" ? "active" : ""}
              onClick={() => setCurrency("EUR")}
            >
              € · EUR
            </button>
          </div>

          <div className="step top">
            <b>3</b>
            <div>
              <h2>{fr ? "Mode de paiement" : "Payment method"}</h2>
              <p>{fr ? "Choisissez comment vous souhaitez payer." : "Choose how you want to pay."}</p>
            </div>
          </div>

          <div className="methods">
            {settings.payment_bank_enabled !== false && (
              <button
                className={method === "bank" ? "method active" : "method"}
                onClick={() => setMethod("bank")}
              >
                <span className="methodIcon">🏦</span>
                <div>
                  <strong>{fr ? "Virement bancaire" : "Bank transfer"}</strong>
                  <small>
                    {fr
                      ? "Paiement avec votre référence VC"
                      : "Payment with your VC reference"}
                  </small>
                </div>
              </button>
            )}

            {settings.payment_agent_enabled !== false && (
              <button
                className={method === "agent" ? "method active" : "method"}
                onClick={() => setMethod("agent")}
              >
                <span className="methodIcon">👤</span>
                <div>
                  <strong>{fr ? "Agent Visitecard" : "Visitecard agent"}</strong>
                  <small>{fr ? "Paiement en espèces" : "Cash payment"}</small>
                </div>
              </button>
            )}

            <button className="method disabled" disabled>
              <span className="methodIcon">💳</span>
              <div>
                <strong>{fr ? "Paiement en ligne" : "Online payment"}</strong>
                <small>{fr ? "Bientôt disponible" : "Coming soon"}</small>
              </div>
            </button>
          </div>

          {method === "bank" && (
            <div className="paymentDetail">
              <div className="detailTitle">
                <div>
                  <span>{fr ? "VIREMENT" : "BANK TRANSFER"}</span>
                  <h3>{fr ? "Mes coordonnées bancaires" : "Bank details"}</h3>
                </div>
                <b>{currency}</b>
              </div>

              {bank ? (
                <div className="bankGrid">
                  <p>
                    <span>{fr ? "Bénéficiaire" : "Beneficiary"}</span>
                    <strong>{bank.beneficiary_name}</strong>
                  </p>
                  <p>
                    <span>{fr ? "Banque" : "Bank"}</span>
                    <strong>{bank.bank_name}</strong>
                  </p>
                  {bank.label && (
                    <p>
                      <span>{fr ? "Agence" : "Branch"}</span>
                      <strong>{bank.label}</strong>
                    </p>
                  )}
                  {bank.rib && (
                    <p>
                      <span>RIB</span>
                      <strong>{bank.rib}</strong>
                    </p>
                  )}
                  {bank.iban && (
                    <p>
                      <span>IBAN</span>
                      <strong>{bank.iban}</strong>
                    </p>
                  )}
                  {bank.bic_swift && (
                    <p>
                      <span>SWIFT / BIC</span>
                      <strong>{bank.bic_swift}</strong>
                    </p>
                  )}
                  <p className="referenceLine">
                    <span>{fr ? "Référence à utiliser" : "Reference"}</span>
                    <strong>
                      {chosenCards.find((c) => c.entity_type === "profile")?.vc_reference ||
                        chosenCards[0]?.vc_reference ||
                        "VCxxxx"}
                    </strong>
                  </p>
                  {(fr ? bank.instructions_fr : bank.instructions_en) && (
                    <small className="instructions">
                      {fr ? bank.instructions_fr : bank.instructions_en}
                    </small>
                  )}
                </div>
              ) : (
                <div className="emptyDetail">
                  {fr
                    ? `Aucun compte bancaire ${currency} actif. Ajoutez-le depuis l’administration.`
                    : `No active ${currency} bank account.`}
                </div>
              )}
            </div>
          )}

          {method === "agent" && (
            <div className="paymentDetail">
              <div className="detailTitle">
                <div>
                  <span>AGENT VISITECARD</span>
                  <h3>{fr ? "Choisissez votre agent" : "Choose your agent"}</h3>
                </div>
              </div>

              <div className="agents">
                {agents.map((agent) => {
                  const active = agent.id === agentId;
                  return (
                    <button
                      type="button"
                      key={agent.id}
                      className={active ? "agentCard selectedAgent" : "agentCard"}
                      onClick={() => setAgentId(agent.id)}
                    >
                      <div className="avatar">
                        {agent.photo_url ? (
                          <img src={agent.photo_url} alt={agent.name} />
                        ) : (
                          <span>{agent.name?.slice(0, 1)?.toUpperCase() || "V"}</span>
                        )}
                      </div>

                      <div className="agentInfo">
                        <strong>{agent.name}</strong>
                        <span>
                          {flag(agent.country_code)} {agent.country_name || "Tunisie"}
                        </span>
                        {(agent.phone || agent.whatsapp) && (
                          <span>☎ {agent.phone || agent.whatsapp}</span>
                        )}
                        {[agent.region, agent.city].filter(Boolean).length > 0 && (
                          <span>{[agent.region, agent.city].filter(Boolean).join(" · ")}</span>
                        )}
                      </div>

                      <span className="agentCheck">{active ? "✓" : ""}</span>
                    </button>
                  );
                })}

                {!agents.length && (
                  <div className="emptyDetail">
                    {fr ? "Aucun agent actif." : "No active agent."}
                  </div>
                )}
              </div>

              {selectedAgent?.whatsapp && (
                <a
                  className="whatsapp"
                  href={`https://wa.me/${selectedAgent.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp · {selectedAgent.whatsapp}
                </a>
              )}
            </div>
          )}
        </section>

        <aside className="summary">
          <span>{fr ? "RÉCAPITULATIF" : "SUMMARY"}</span>
          <h2>{quote.label || (fr ? "Votre sélection" : "Your selection")}</h2>

          <div className="summaryCards">
            {chosenCards.map((c) => (
              <p key={c.id}>
                <span>{c.full_name || c.company}</span>
                <b>{c.vc_reference || "VC—"}</b>
              </p>
            ))}
          </div>

          <div className="summaryRows">
            <p>
              <span>{fr ? "Durée" : "Duration"}</span>
              <b>{durationLabel(topOffer, fr)}</b>
            </p>

            {hasPromo && (
              <p>
                <span>{fr ? "Prix normal" : "Normal price"}</span>
                <del>{money(normal, currency)}</del>
              </p>
            )}

            <p>
              <span>{hasPromo ? (fr ? "Prix promo" : "Promo price") : fr ? "Prix" : "Price"}</span>
              <b className={hasPromo ? "promoPrice" : ""}>
                {money(finalPrice, currency)}
              </b>
            </p>
          </div>

          <div className="total">
            <span>{fr ? "Total à payer" : "Total to pay"}</span>
            <strong>{money(finalPrice, currency)}</strong>
          </div>

          <button
            className="submit"
            disabled={sending || !selected.length || finalPrice <= 0}
            onClick={submit}
          >
            {sending
              ? fr
                ? "Enregistrement..."
                : "Saving..."
              : fr
                ? "Activer et réserver mon QR code"
                : "Activate and reserve my QR code"}
          </button>

          <small className="hint">
            {fr
              ? "Votre QR code et votre référence VC restent les mêmes après chaque renouvellement."
              : "Your QR code and VC reference remain unchanged after each renewal."}
          </small>
        </aside>
      </div>

      <style jsx>{`
        .billing{max-width:1220px}
        .heading{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:24px;align-items:center;margin-bottom:24px}
        .heading>div:first-child>span,.summary>span,.detailTitle span{font-size:10px;font-weight:950;letter-spacing:.14em;color:#ff4d1d}
        .heading h1{font-size:36px;line-height:1.05;margin:7px 0 10px;color:#07162e}
        .heading p{color:#697386;max-width:720px;margin:0;line-height:1.55}
        .offerCard{background:#fff;border:1.5px solid #ff6539;border-radius:20px;padding:18px 20px;box-shadow:0 10px 28px rgba(20,32,55,.06)}
        .offerTop{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .offerTop strong{font-size:16px;color:#07162e}
        .promoBadge{background:#fff0e9;color:#ff4d1d;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900}
        .offerPrice{display:flex;align-items:baseline;justify-content:center;gap:12px;padding:12px 0 8px}
        .offerPrice b{font-size:31px;color:#ff4d1d}
        .offerPrice del{font-size:17px;color:#818895;font-weight:800}
        .duration{text-align:center;background:#fff2ec;color:#8d2e14;border-radius:10px;padding:8px;font-size:12px;font-weight:900}
        .layout{display:grid;grid-template-columns:minmax(0,1fr) 370px;gap:22px}
        .panel,.summary{background:#fff;border:1px solid #e4e8ef;border-radius:24px;padding:24px}
        .step{display:flex;align-items:center;gap:12px}
        .step.top{margin-top:28px}
        .step>b{width:36px;height:36px;flex:0 0 36px;border-radius:50%;display:grid;place-items:center;background:#07162e;color:#fff}
        .step h2{margin:0;font-size:19px;color:#07162e}
        .step p{margin:3px 0 0;color:#89909d;font-size:12px}
        .cards{display:grid;gap:9px;margin-top:16px}
        .card{width:100%;display:flex;align-items:center;gap:12px;text-align:left;padding:14px;border:1px solid #e1e5ec;background:#fff;border-radius:14px;cursor:pointer}
        .card.selected{border-color:#ff6a3d;background:#fff8f5}
        .check{width:25px;height:25px;border:2px solid #ccd2db;border-radius:7px;display:grid;place-items:center;font-weight:900}
        .selected .check{background:#ff501e;border-color:#ff501e;color:#fff}
        .card strong,.card small{display:block}
        .card small{color:#89909d;margin-top:4px}
        .choice{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:13px}
        .choice button{border:1px solid #e0e4eb;background:#fff;border-radius:13px;padding:14px;cursor:pointer;font-weight:900;font-size:16px}
        .choice button.active{border-color:#ff501e;background:#fff6f2;color:#d83d11}
        .methods{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:13px}
        .method{display:flex;align-items:center;gap:10px;border:1px solid #e0e4eb;background:#fff;border-radius:13px;padding:13px;cursor:pointer;text-align:left}
        .method.active{border-color:#ff501e;background:#fff6f2;color:#d83d11}
        .methodIcon{font-size:21px}
        .method strong,.method small{display:block}
        .method strong{font-size:13px}
        .method small{font-weight:500;color:#89909d;margin-top:4px;font-size:10px}
        .method.disabled{opacity:.45;cursor:not-allowed}
        .paymentDetail{margin-top:16px;border:1px solid #e4e8ef;background:#fbfcfd;border-radius:17px;padding:18px}
        .detailTitle{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:15px}
        .detailTitle h3{margin:4px 0 0;color:#07162e;font-size:18px}
        .detailTitle>b{background:#07162e;color:#fff;padding:7px 10px;border-radius:9px;font-size:11px}
        .bankGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .bankGrid p{margin:0;padding:11px;background:#fff;border:1px solid #edf0f4;border-radius:11px;min-width:0}
        .bankGrid p span,.bankGrid p strong{display:block}
        .bankGrid p span{font-size:10px;color:#7c8491;margin-bottom:5px}
        .bankGrid p strong{font-size:12px;color:#07162e;word-break:break-word}
        .referenceLine strong{color:#ff4d1d!important}
        .instructions{grid-column:1/-1;color:#6f7784;line-height:1.5;padding-top:4px}
        .agents{display:grid;gap:9px}
        .agentCard{display:grid;grid-template-columns:48px 1fr 28px;align-items:center;gap:12px;width:100%;padding:12px;border:1px solid #e3e7ed;background:#fff;border-radius:13px;text-align:left;cursor:pointer}
        .agentCard.selectedAgent{border-color:#ff6539;background:#fff8f5}
        .avatar{width:48px;height:48px;border-radius:50%;overflow:hidden;background:#07162e;color:#fff;display:grid;place-items:center;font-weight:950}
        .avatar img{width:100%;height:100%;object-fit:cover}
        .agentInfo strong,.agentInfo span{display:block}
        .agentInfo strong{color:#07162e;margin-bottom:3px}
        .agentInfo span{font-size:11px;color:#707887;margin-top:2px}
        .agentCheck{width:24px;height:24px;border-radius:50%;background:#ff501e;color:#fff;display:grid;place-items:center;font-weight:900}
        .whatsapp{display:inline-flex;margin-top:12px;color:#137b4c;text-decoration:none;font-size:12px;font-weight:900}
        .emptyDetail{padding:13px;background:#fff0f1;color:#a62332;border-radius:10px;font-size:12px}
        .summary{height:max-content;position:sticky;top:95px}
        .summary h2{font-size:21px;color:#07162e;margin:8px 0 16px}
        .summaryCards{border-top:1px solid #eceff3;border-bottom:1px solid #eceff3;padding:10px 0}
        .summaryCards p,.summaryRows p{display:flex;justify-content:space-between;gap:10px;font-size:12px}
        .summaryCards p span,.summaryRows p span{color:#697386}
        .summaryRows{padding:10px 0}
        .summaryRows del{color:#7f8794;font-weight:800}
        .promoPrice{color:#ff4d1d}
        .total{display:flex;justify-content:space-between;align-items:flex-end;padding:17px 14px;margin:6px 0 14px;background:#fff2ec;border-radius:13px}
        .total span{font-weight:900;color:#4a1e11}
        .total strong{font-size:27px;color:#ff4d1d}
        .submit{width:100%;border:0;border-radius:13px;background:#ff501e;color:#fff;padding:15px;font-weight:950;cursor:pointer}
        .submit:disabled{opacity:.55}
        .hint{display:block;text-align:center;color:#89909d;line-height:1.5;margin-top:12px}
        .error,.success{padding:14px 16px;border-radius:13px;margin-bottom:18px}
        .error{background:#fff0f1;color:#a62332}
        .success{background:#ebfbf3;color:#14784d;display:flex;gap:12px;flex-wrap:wrap}
        .loading{padding:50px;text-align:center}
        @media(max-width:950px){
          .heading{grid-template-columns:1fr}
          .layout{grid-template-columns:1fr}
          .summary{position:static}
        }
        @media(max-width:700px){
          .billing{padding-left:14px;padding-right:14px}
          .heading h1{font-size:29px}
          .panel,.summary{padding:17px}
          .methods{grid-template-columns:1fr}
          .bankGrid{grid-template-columns:1fr}
        }
      `}</style>
    </main>
  );
}
