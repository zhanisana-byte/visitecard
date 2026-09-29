"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/app/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

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
  duration_value?: number;
  duration_unit?: string;
  price_tnd: number;
  price_eur: number;
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
  country_name: string;
  region: string | null;
  city: string | null;
  whatsapp: string | null;
};

type Bank = {
  id: string;
  currency: "TND" | "EUR";
  beneficiary_name: string;
  bank_name: string;
  rib: string | null;
  iban: string | null;
  bic_swift: string | null;
  instructions_fr: string | null;
  instructions_en: string | null;
};

type PaymentRequest = {
  id: string;
  payment_reference?: string | null;
  vc_reference?: string | null;
  amount?: number | null;
  total_amount?: number | null;
  currency?: string | null;
  payment_method?: string | null;
  status?: string | null;
  created_at?: string | null;
};

function basePrice(o: Offer, currency: "TND" | "EUR") {
  return Number(currency === "EUR" ? o.price_eur : o.price_tnd) || 0;
}

function promoActive(o: Offer) {
  if (!o.promo_enabled) return false;

  const now = Date.now();

  if (
    o.promo_start_at &&
    now < new Date(o.promo_start_at).getTime()
  ) {
    return false;
  }

  if (
    o.promo_end_at &&
    now > new Date(o.promo_end_at).getTime()
  ) {
    return false;
  }

  return true;
}

function price(o: Offer, currency: "TND" | "EUR") {
  const base = basePrice(o, currency);

  if (!o.promo_enabled) return base;

  const now = Date.now();

  if (
    o.promo_start_at &&
    now < new Date(o.promo_start_at).getTime()
  ) {
    return base;
  }

  if (
    o.promo_end_at &&
    now > new Date(o.promo_end_at).getTime()
  ) {
    return base;
  }

  const promo =
    currency === "EUR"
      ? o.promo_price_eur
      : o.promo_price_tnd;

  return promo === null || promo === undefined
    ? base
    : Number(promo);
}

export default function AbonnementPage() {
  const { lang } = useLanguage();

  const fr = lang === "fr";

  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [currency, setCurrency] =
    useState<"TND" | "EUR">("TND");

  const [method, setMethod] =
    useState<"agent" | "bank" | "online">("bank");

  const [agentId, setAgentId] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  async function authFetch(
    url: string,
    options: RequestInit = {}
  ) {
    const supabase = getSupabaseBrowser();

    const { data: sessionData } =
      await supabase.auth.getSession();

    const token =
      sessionData.session?.access_token;

    if (!token) {
      throw new Error(
        fr
          ? "Votre session a expiré."
          : "Your session has expired."
      );
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
      const r = await authFetch(
        "/api/billing/checkout",
        {
          cache: "no-store",
        }
      );

      const d = await r.json();

      if (!r.ok) {
        throw new Error(
          d.error || "Erreur"
        );
      }

      setData(d);

      const profiles = (d.cards || []).filter(
        (c: Card) =>
          c.entity_type === "profile"
      );

      setSelected(
        profiles.length
          ? [profiles[0].id]
          : d.cards?.[0]?.id
          ? [d.cards[0].id]
          : []
      );
    } catch (e: any) {
      setError(
        e?.message || "Erreur"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const cards: Card[] =
    data?.cards || [];

  const offers: Offer[] =
    data?.offers || [];

  const agents: Agent[] =
    data?.agents || [];

  const banks: Bank[] =
    data?.banks || [];

  const settings =
    data?.settings || {};

  const chosenCards =
    cards.filter((c) =>
      selected.includes(c.id)
    );

  const quote = useMemo(() => {
    const p =
      chosenCards.filter(
        (c) =>
          c.entity_type === "profile"
      ).length;

    const c =
      chosenCards.filter(
        (x) =>
          x.entity_type === "company"
      ).length;

    if (!p && !c) {
      return {
        total: 0,
        baseTotal: 0,
        label: "",
        promo: false,
        promoStart: null as string | null,
        promoEnd: null as string | null,
      };
    }

    const bundles = offers
      .filter(
        (o) =>
          o.entity_type === "bundle" &&
          Number(o.profile_count || 0) >= p &&
          Number(o.company_count || 0) >= c
      )
      .map((o) => ({
        o,
        total: price(o, currency),
        baseTotal: basePrice(o, currency),
      }))
      .sort(
        (a, b) =>
          a.total - b.total
      );

    const po = offers
      .filter(
        (o) =>
          o.entity_type === "profile"
      )
      .map((o) => ({
        o,
        total: price(o, currency),
        baseTotal: basePrice(o, currency),
      }))
      .sort(
        (a, b) =>
          a.total - b.total
      )[0];

    const co = offers
      .filter(
        (o) =>
          o.entity_type === "company"
      )
      .map((o) => ({
        o,
        total: price(o, currency),
        baseTotal: basePrice(o, currency),
      }))
      .sort(
        (a, b) =>
          a.total - b.total
      )[0];

    const individual =
      (p
        ? (po?.total || 0) * p
        : 0) +
      (c
        ? (co?.total || 0) * c
        : 0);

    const individualBase =
      (p
        ? (po?.baseTotal || 0) * p
        : 0) +
      (c
        ? (co?.baseTotal || 0) * c
        : 0);

    if (
      bundles[0] &&
      bundles[0].total <= individual
    ) {
      const o =
        bundles[0].o;

      return {
        total: bundles[0].total,
        baseTotal:
          bundles[0].baseTotal,
        label: o.name,
        promo:
          promoActive(o) &&
          bundles[0].total <
            bundles[0].baseTotal,
        promoStart:
          o.promo_start_at,
        promoEnd:
          o.promo_end_at,
      };
    }

    const used = [
      p && po?.o,
      c && co?.o,
    ].filter(Boolean) as Offer[];

    return {
      total: individual,
      baseTotal:
        individualBase,
      label: used
        .map((o) => o.name)
        .join(" + "),
      promo:
        used.some((o) =>
          promoActive(o)
        ) &&
        individual <
          individualBase,
      promoStart:
        used
          .map(
            (o) =>
              o.promo_start_at
          )
          .find(Boolean) || null,
      promoEnd:
        used
          .map(
            (o) =>
              o.promo_end_at
          )
          .find(Boolean) || null,
    };
  }, [
    chosenCards,
    offers,
    currency,
  ]);

  const visibleAgents =
    useMemo(
      () => agents,
      [agents]
    );

  const bank =
    banks.find(
      (b) =>
        b.currency === currency
    );

  const paymentRequests:
    PaymentRequest[] =
    data?.payment_requests || [];

  const money =
    currency === "EUR"
      ? "€"
      : "DT";

  function formatDate(
    value?: string | null
  ) {
    if (!value) return "—";

    return new Date(
      value
    ).toLocaleDateString(
      fr
        ? "fr-FR"
        : "en-GB"
    );
  }

  function methodLabel(
    value?: string | null
  ) {
    if (
      value === "bank_transfer" ||
      value === "bank"
    ) {
      return fr
        ? "Virement bancaire"
        : "Bank transfer";
    }

    if (
      value === "agent"
    ) {
      return fr
        ? "Agent Visitecard"
        : "Visitecard agent";
    }

    if (
      value === "online"
    ) {
      return fr
        ? "Paiement en ligne"
        : "Online payment";
    }

    return value || "—";
  }

  function statusLabel(
    value?: string | null
  ) {
    const s = String(
      value || ""
    ).toLowerCase();

    if (s === "pending") {
      return fr
        ? "En attente"
        : "Pending";
    }

    if (
      [
        "paid",
        "confirmed",
        "approved",
      ].includes(s)
    ) {
      return fr
        ? "Confirmé"
        : "Confirmed";
    }

    if (
      [
        "rejected",
        "cancelled",
      ].includes(s)
    ) {
      return fr
        ? "Refusé"
        : "Rejected";
    }

    return value || "—";
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter(
            (x) => x !== id
          )
        : [...prev, id]
    );

    setSuccess(null);
  }

  async function submit() {
    if (!selected.length) {
      return setError(
        fr
          ? "Sélectionnez au moins une carte."
          : "Select at least one card."
      );
    }

    if (
      method === "agent" &&
      !agentId
    ) {
      return setError(
        fr
          ? "Choisissez un agent."
          : "Choose an agent."
      );
    }

    setSending(true);
    setError("");
    setSuccess(null);

    try {
      const r =
        await authFetch(
          "/api/billing/checkout",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              card_ids:
                selected,
              currency,
              payment_method:
                method,
              agent_id:
                method === "agent"
                  ? agentId
                  : null,
            }),
          }
        );

      const d =
        await r.json();

      if (!r.ok) {
        throw new Error(
          d.error || "Erreur"
        );
      }

      setSuccess(d);

      await load();

      setSuccess(d);
    } catch (e: any) {
      setError(
        e?.message ||
          "Erreur"
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="dashBody billing">
        <div className="loading">
          {fr
            ? "Chargement..."
            : "Loading..."}
        </div>
      </main>
    );
  }

  return (
    <main className="dashBody billing">
      <div className="title">
        <span>
          VISITECARD PRO
        </span>

        <h1>
          {fr
            ? "Abonnement & paiement"
            : "Subscription & payment"}
        </h1>

        <p>
          {fr
            ? "Choisissez les cartes à activer. Le meilleur tarif disponible est appliqué automatiquement."
            : "Choose the cards to activate. The best available price is applied automatically."}
        </p>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {success && (
        <div className="success">
          <strong>
            {fr
              ? "Demande enregistrée"
              : "Request saved"}
          </strong>

          <span>
            {fr
              ? "Référence à utiliser"
              : "Reference to use"}
            :{" "}
            <b>
              {success.reference}
            </b>
          </span>

          <span>
            {fr
              ? "Montant"
              : "Amount"}
            :{" "}
            <b>
              {Number(
                success.amount
              ).toFixed(2)}{" "}
              {success.currency ===
              "EUR"
                ? "€"
                : "DT"}
            </b>
          </span>
        </div>
      )}

      <div className="proBanner">
        <div className="proBannerText">
          <strong>
            {fr
              ? "Un seul QR code. Tous vos liens. Toujours à jour."
              : "One QR code. All your links. Always up to date."}
          </strong>

          <span>
            {fr
              ? "Votre carte digitale professionnelle avec un seul paiement par an."
              : "Your professional digital card with one annual payment."}
          </span>
        </div>
      </div>

      <div className="layout">
        <section className="panel">
          <div className="step">
            <b>1</b>

            <div>
              <h2>
                {fr
                  ? "Cartes à activer"
                  : "Cards to activate"}
              </h2>

              <p>
                {fr
                  ? "Profil et sociétés liées"
                  : "Profile and linked companies"}
              </p>
            </div>
          </div>

          <div className="cards">
            {cards.map(
              (card) => (
                <button
                  type="button"
                  key={card.id}
                  className={
                    selected.includes(
                      card.id
                    )
                      ? "card selected"
                      : "card"
                  }
                  onClick={() =>
                    toggle(
                      card.id
                    )
                  }
                >
                  <span className="check">
                    {selected.includes(
                      card.id
                    )
                      ? "✓"
                      : ""}
                  </span>

                  <div>
                    <strong>
                      {card.full_name ||
                        card.company ||
                        (card.entity_type ===
                        "profile"
                          ? "Profil"
                          : "Société")}
                    </strong>

                    <small>
                      {card.entity_type ===
                      "profile"
                        ? fr
                          ? "Profil"
                          : "Profile"
                        : fr
                        ? "Société"
                        : "Company"}{" "}
                      ·{" "}
                      {card.vc_reference ||
                        "VC—"}
                    </small>
                  </div>
                </button>
              )
            )}
          </div>

          <div className="step top">
            <b>2</b>

            <div>
              <h2>
                {fr
                  ? "Devise"
                  : "Currency"}
              </h2>
            </div>
          </div>

          <div className="choice">
            <button
              className={
                currency === "TND"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCurrency(
                  "TND"
                )
              }
            >
              DT · TND
            </button>

            <button
              className={
                currency === "EUR"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCurrency(
                  "EUR"
                )
              }
            >
              € · EUR
            </button>
          </div>

          <div className="step top">
            <b>3</b>

            <div>
              <h2>
                {fr
                  ? "Mode de paiement"
                  : "Payment method"}
              </h2>
            </div>
          </div>

          <div className="methods">
            {settings.payment_bank_enabled !==
              false && (
              <button
                className={
                  method ===
                  "bank"
                    ? "method active"
                    : "method"
                }
                onClick={() =>
                  setMethod(
                    "bank"
                  )
                }
              >
                <strong>
                  {fr
                    ? "Virement bancaire"
                    : "Bank transfer"}
                </strong>

                <small>
                  {fr
                    ? "Paiement avec votre référence VC"
                    : "Payment with your VC reference"}
                </small>
              </button>
            )}

            {settings.payment_agent_enabled !==
              false && (
              <button
                className={
                  method ===
                  "agent"
                    ? "method active"
                    : "method"
                }
                onClick={() =>
                  setMethod(
                    "agent"
                  )
                }
              >
                <strong>
                  {fr
                    ? "Agent Visitecard"
                    : "Visitecard agent"}
                </strong>

                <small>
                  {fr
                    ? "Paiement en espèces"
                    : "Cash payment"}
                </small>
              </button>
            )}

            <button
              className="method disabled"
              disabled
            >
              <strong>
                {fr
                  ? "Paiement en ligne"
                  : "Online payment"}
              </strong>

              <small>
                {fr
                  ? "Bientôt disponible"
                  : "Coming soon"}
              </small>
            </button>
          </div>

          {method ===
            "agent" && (
            <div className="agentBox">
              <label>
                {fr
                  ? "Choisir un agent"
                  : "Choose an agent"}

                <select
                  value={
                    agentId
                  }
                  onChange={(
                    e
                  ) =>
                    setAgentId(
                      e.target
                        .value
                    )
                  }
                >
                  <option value="">
                    —
                  </option>

                  {visibleAgents.map(
                    (a) => (
                      <option
                        key={
                          a.id
                        }
                        value={
                          a.id
                        }
                      >
                        {
                          a.name
                        }{" "}
                        ·{" "}
                        {[
                          a.country_name,
                          a.region,
                          a.city,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " / "
                          )}
                      </option>
                    )
                  )}
                </select>
              </label>

              {agentId && (
                <p>
                  {agents.find(
                    (a) =>
                      a.id ===
                      agentId
                  )?.whatsapp
                    ? `WhatsApp : ${
                        agents.find(
                          (
                            a
                          ) =>
                            a.id ===
                            agentId
                        )
                          ?.whatsapp
                      }`
                    : ""}
                </p>
              )}
            </div>
          )}

          {method ===
            "bank" &&
            bank && (
              <div className="bankBox">
                <h3>
                  {
                    bank.bank_name
                  }
                </h3>

                <p>
                  <span>
                    {fr
                      ? "Bénéficiaire"
                      : "Beneficiary"}
                  </span>

                  <b>
                    {
                      bank.beneficiary_name
                    }
                  </b>
                </p>

                {bank.rib && (
                  <p>
                    <span>
                      RIB
                    </span>

                    <b>
                      {
                        bank.rib
                      }
                    </b>
                  </p>
                )}

                {bank.iban && (
                  <p>
                    <span>
                      IBAN
                    </span>

                    <b>
                      {
                        bank.iban
                      }
                    </b>
                  </p>
                )}

                {bank.bic_swift && (
                  <p>
                    <span>
                      SWIFT /
                      BIC
                    </span>

                    <b>
                      {
                        bank.bic_swift
                      }
                    </b>
                  </p>
                )}

                <small>
                  {fr
                    ? bank.instructions_fr
                    : bank.instructions_en}
                </small>
              </div>
            )}
        </section>

        <aside className="summary">
          <span>
            {fr
              ? "COMPTE PRO"
              : "PRO ACCOUNT"}
          </span>

          <h2>
            {fr
              ? "Votre carte digitale complète"
              : "Your complete digital card"}
          </h2>

          <div
            className={`monthlyPrice ${
              quote.promo
                ? "hasPromo"
                : ""
            }`}
          >
            {quote.promo && (
              <div className="promoHead">
                <span>
                  PROMO
                </span>

                {(quote.promoStart ||
                  quote.promoEnd) && (
                  <small>
                    Promo{" "}
                    {quote.promoStart
                      ? `${
                          fr
                            ? "du"
                            : "from"
                        } ${formatDate(
                          quote.promoStart
                        )}`
                      : ""}

                    {quote.promoEnd
                      ? ` ${
                          fr
                            ? "au"
                            : "to"
                        } ${formatDate(
                          quote.promoEnd
                        )}`
                      : ""}
                  </small>
                )}
              </div>
            )}

            {quote.promo &&
              quote.baseTotal >
                quote.total && (
                <div className="oldAnnual">
                  {quote.baseTotal.toFixed(
                    2
                  )}{" "}
                  {money} /{" "}
                  {fr
                    ? "an"
                    : "year"}
                </div>
              )}

            <strong>
              {(
                quote.total /
                12
              ).toFixed(2)}{" "}
              {money}
            </strong>

            <b>
              {fr
                ? "/ mois"
                : "/ month"}
            </b>

            <small>
              {fr
                ? `soit ${quote.total.toFixed(
                    2
                  )} ${money} facturés une seule fois par an`
                : `${quote.total.toFixed(
                    2
                  )} ${money} billed once per year`}
            </small>

            {quote.promo &&
              quote.baseTotal >
                quote.total && (
                <div className="saving">
                  {fr
                    ? "Vous économisez"
                    : "You save"}{" "}
                  {(
                    quote.baseTotal -
                    quote.total
                  ).toFixed(
                    2
                  )}{" "}
                  {money}
                </div>
              )}
          </div>

          <div className="proFeatures">
            <p>
              ✓{" "}
              {fr
                ? "Un QR code permanent"
                : "One permanent QR code"}
            </p>

            <p>
              ✓{" "}
              {fr
                ? "Tous vos réseaux sociaux et liens"
                : "All your social networks and links"}
            </p>

            <p>
              ✓{" "}
              {fr
                ? "Informations modifiables à tout moment"
                : "Edit your information at any time"}
            </p>

            <p>
              ✓{" "}
              {fr
                ? "Même QR code après renouvellement"
                : "Same QR code after renewal"}
            </p>

            <p>
              ✓ Catalogue / Menu
            </p>

            <p>
              ✓{" "}
              {fr
                ? "Statistiques de consultation"
                : "View statistics"}
            </p>

            <p>
              ✓{" "}
              {fr
                ? "Avis Google et Wi-Fi selon votre carte"
                : "Google reviews and Wi-Fi depending on your card"}
            </p>
          </div>

          <div className="summaryCards">
            {chosenCards.map(
              (c) => (
                <p key={c.id}>
                  <span>
                    {c.full_name ||
                      c.company}
                  </span>

                  <b>
                    {c.vc_reference ||
                      "VC—"}
                  </b>
                </p>
              )
            )}
          </div>

          <div className="annualBilling">
            <div>
              <span>
                {fr
                  ? "Paiement aujourd’hui"
                  : "Payment today"}
              </span>

              <small>
                {fr
                  ? "Valable 1 an"
                  : "Valid for 1 year"}
              </small>
            </div>

            <div className="annualPrice">
              {quote.promo &&
                quote.baseTotal >
                  quote.total && (
                  <del>
                    {quote.baseTotal.toFixed(
                      2
                    )}{" "}
                    {money}
                  </del>
                )}

              <strong>
                {quote.total.toFixed(
                  2
                )}{" "}
                {money}
              </strong>
            </div>
          </div>

          <button
            className="submit"
            disabled={
              sending ||
              !selected.length ||
              quote.total < 0
            }
            onClick={submit}
          >
            {sending
              ? fr
                ? "Enregistrement..."
                : "Saving..."
              : fr
              ? "Activer mon Compte Pro"
              : "Activate my Pro Account"}
          </button>

          <small className="hint">
            {fr
              ? "Votre QR code reste le même. Vous renouvelez uniquement votre abonnement chaque année."
              : "Your QR code stays the same. You only renew your subscription each year."}
          </small>
        </aside>
      </div>

      <section className="requestsSection">
        <div className="requestsTitle">
          <div>
            <span>
              {fr
                ? "SUIVI"
                : "TRACKING"}
            </span>

            <h2>
              {fr
                ? "Mes demandes de paiement"
                : "My payment requests"}
            </h2>

            <p>
              {fr
                ? "Suivez ici l’état de vos demandes et confirmations."
                : "Track your payment requests and confirmations here."}
            </p>
          </div>
        </div>

        {paymentRequests.length ===
        0 ? (
          <div className="noRequests">
            {fr
              ? "Aucune demande de paiement pour le moment."
              : "No payment request yet."}
          </div>
        ) : (
          <div className="requestsTableWrap">
            <table className="requestsTable">
              <thead>
                <tr>
                  <th>
                    Date
                  </th>

                  <th>
                    {fr
                      ? "Référence"
                      : "Reference"}
                  </th>

                  <th>
                    {fr
                      ? "Montant"
                      : "Amount"}
                  </th>

                  <th>
                    {fr
                      ? "Méthode"
                      : "Method"}
                  </th>

                  <th>
                    {fr
                      ? "Statut"
                      : "Status"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {paymentRequests.map(
                  (
                    request
                  ) => {
                    const requestStatus =
                      String(
                        request.status ||
                          ""
                      ).toLowerCase();

                    return (
                      <tr
                        key={
                          request.id
                        }
                      >
                        <td
                          data-label="Date"
                        >
                          {formatDate(
                            request.created_at
                          )}
                        </td>

                        <td
                          data-label={
                            fr
                              ? "Référence"
                              : "Reference"
                          }
                        >
                          <b>
                            {request.payment_reference ||
                              request.vc_reference ||
                              "—"}
                          </b>
                        </td>

                        <td
                          data-label={
                            fr
                              ? "Montant"
                              : "Amount"
                          }
                        >
                          <strong>
                            {Number(
                              request.total_amount ??
                                request.amount ??
                                0
                            ).toFixed(
                              2
                            )}{" "}
                            {request.currency ===
                            "EUR"
                              ? "€"
                              : "DT"}
                          </strong>
                        </td>

                        <td
                          data-label={
                            fr
                              ? "Méthode"
                              : "Method"
                          }
                        >
                          {methodLabel(
                            request.payment_method
                          )}
                        </td>

                        <td
                          data-label={
                            fr
                              ? "Statut"
                              : "Status"
                          }
                        >
                          <span
                            className={`requestBadge ${requestStatus}`}
                          >
                            {statusLabel(
                              request.status
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style jsx>{`
        .billing {
          max-width: 1180px;
        }

        .title span,
        .summary > span {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          color: #ff501e;
        }

        .title h1 {
          font-size: 34px;
          margin: 7px 0;
          color: #07162e;
        }

        .title p {
          color: #697386;
          max-width: 720px;
        }

        .proBanner {
          margin-top: 24px;
          background: linear-gradient(
            100deg,
            #fff7f2,
            #fff
          );
          border: 1px solid #ffd8ca;
          border-radius: 18px;
          padding: 18px 20px;
        }

        .proBannerText {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .proBannerText strong {
          font-size: 18px;
          color: #07162e;
        }

        .proBannerText span {
          font-size: 13px;
          color: #697386;
        }

        .layout {
          display: grid;
          grid-template-columns: 1fr 370px;
          gap: 22px;
          margin-top: 28px;
        }

        .panel,
        .summary {
          background: #fff;
          border: 1px solid #e4e8ef;
          border-radius: 24px;
          padding: 24px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .step.top {
          margin-top: 28px;
        }

        .step > b {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #07162e;
          color: #fff;
        }

        .step h2 {
          margin: 0;
          font-size: 19px;
          color: #07162e;
        }

        .step p {
          margin: 3px 0 0;
          color: #89909d;
          font-size: 12px;
        }

        .cards {
          display: grid;
          gap: 9px;
          margin-top: 16px;
        }

        .card {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          padding: 14px;
          border: 1px solid #e1e5ec;
          background: #fff;
          border-radius: 14px;
          cursor: pointer;
        }

        .card.selected {
          border-color: #ff6a3d;
          background: #fff8f5;
        }

        .check {
          width: 25px;
          height: 25px;
          border: 2px solid #ccd2db;
          border-radius: 7px;
          display: grid;
          place-items: center;
          font-weight: 900;
        }

        .selected .check {
          background: #ff501e;
          border-color: #ff501e;
          color: #fff;
        }

        .card strong,
        .card small {
          display: block;
        }

        .card small {
          color: #89909d;
          margin-top: 4px;
        }

        .choice,
        .methods {
          display: grid;
          grid-template-columns: repeat(
            2,
            1fr
          );
          gap: 9px;
          margin-top: 13px;
        }

        .choice button,
        .method {
          border: 1px solid #e0e4eb;
          background: #fff;
          border-radius: 13px;
          padding: 13px;
          cursor: pointer;
          font-weight: 800;
        }

        .choice button.active,
        .method.active {
          border-color: #ff501e;
          background: #fff6f2;
          color: #d83d11;
        }

        .methods {
          grid-template-columns: repeat(
            3,
            1fr
          );
        }

        .method {
          text-align: left;
        }

        .method strong,
        .method small {
          display: block;
        }

        .method small {
          font-weight: 500;
          color: #89909d;
          margin-top: 5px;
        }

        .method.disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .agentBox,
        .bankBox {
          margin-top: 13px;
          padding: 16px;
          border-radius: 14px;
          background: #f7f8fa;
        }

        .agentBox label {
          font-size: 12px;
          font-weight: 800;
        }

        .agentBox select {
          display: block;
          width: 100%;
          height: 43px;
          border: 1px solid #dfe3ea;
          border-radius: 10px;
          margin-top: 7px;
          padding: 0 10px;
          background: #fff;
        }

        .agentBox p {
          font-size: 12px;
          color: #697386;
        }

        .bankBox h3 {
          margin: 0 0 12px;
        }

        .bankBox p {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 10px;
          margin: 8px 0;
          font-size: 12px;
        }

        .bankBox p span {
          color: #7c8491;
        }

        .bankBox b {
          word-break: break-all;
        }

        .bankBox > small {
          display: block;
          margin-top: 12px;
          color: #6f7784;
        }

        .summary {
          height: max-content;
          position: sticky;
          top: 95px;
        }

        .summary h2 {
          font-size: 21px;
          color: #07162e;
        }

        .monthlyPrice {
          margin: 18px 0;
          padding: 18px;
          border-radius: 17px;
          background: #fff6f1;
          border: 1px solid #ffd9cc;
          text-align: center;
        }

        .monthlyPrice.hasPromo {
          position: relative;
          background: #fff8f4;
        }

        .promoHead {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .promoHead > span {
          background: #ff501e;
          color: #fff;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .promoHead small {
          margin: 0;
          color: #a43c1d;
          font-weight: 800;
        }

        .oldAnnual {
          text-decoration: line-through;
          color: #98a2b3;
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .monthlyPrice strong {
          font-size: 34px;
          color: #ff501e;
          letter-spacing: -1px;
        }

        .monthlyPrice > b {
          font-size: 14px;
          color: #ff501e;
          margin-left: 5px;
        }

        .monthlyPrice small {
          display: block;
          margin-top: 5px;
          color: #6f7785;
          font-size: 12px;
          font-weight: 600;
        }

        .saving {
          margin-top: 9px;
          color: #16864b;
          font-size: 11px;
          font-weight: 900;
        }

        .proFeatures {
          padding: 2px 2px 12px;
        }

        .proFeatures p {
          margin: 9px 0;
          color: #344054;
          font-size: 13px;
          font-weight: 650;
        }

        .summaryCards {
          border-top: 1px solid #eceff3;
          border-bottom: 1px solid #eceff3;
          padding: 10px 0;
        }

        .summaryCards p {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 12px;
        }

        .summaryCards p span {
          color: #697386;
        }

        .annualBilling {
          margin: 14px 0;
          background: #07162e;
          color: #fff;
          border-radius: 16px;
          padding: 15px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .annualBilling div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .annualBilling span {
          font-size: 13px;
          font-weight: 800;
        }

        .annualBilling small {
          font-size: 11px;
          color: #cbd3df;
        }

        .annualBilling strong {
          font-size: 22px;
          white-space: nowrap;
        }

        .annualPrice {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .annualPrice del {
          color: #aab2bf;
          font-size: 12px;
          font-weight: 700;
        }

        .submit {
          width: 100%;
          border: 0;
          border-radius: 13px;
          background: #ff501e;
          color: #fff;
          padding: 15px;
          font-weight: 900;
          cursor: pointer;
        }

        .submit:disabled {
          opacity: 0.55;
        }

        .hint {
          display: block;
          text-align: center;
          color: #89909d;
          line-height: 1.5;
          margin-top: 12px;
        }

        .error,
        .success {
          padding: 14px 16px;
          border-radius: 13px;
          margin-top: 18px;
        }

        .error {
          background: #fff0f1;
          color: #a62332;
        }

        .success {
          background: #ebfbf3;
          color: #14784d;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .loading {
          padding: 50px;
          text-align: center;
        }

        .requestsSection {
          margin-top: 22px;
          background: #fff;
          border: 1px solid #e4e8ef;
          border-radius: 22px;
          padding: 22px;
        }

        .requestsTitle span {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          color: #ff501e;
        }

        .requestsTitle h2 {
          margin: 5px 0 4px;
          color: #07162e;
          font-size: 22px;
        }

        .requestsTitle p {
          margin: 0;
          color: #7b8492;
          font-size: 13px;
        }

        .requestsTableWrap {
          margin-top: 17px;
          overflow-x: auto;
          border: 1px solid #edf0f4;
          border-radius: 14px;
        }

        .requestsTable {
          width: 100%;
          border-collapse: collapse;
          min-width: 720px;
        }

        .requestsTable th {
          background: #f8f9fb;
          color: #7a8391;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: left;
          padding: 12px 14px;
        }

        .requestsTable td {
          border-top: 1px solid #edf0f4;
          padding: 13px 14px;
          color: #344054;
          font-size: 12px;
        }

        .requestsTable td b,
        .requestsTable td strong {
          color: #101828;
        }

        .requestBadge {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 999px;
          background: #eef1f5;
          color: #475467;
          font-size: 10px;
          font-weight: 900;
        }

        .requestBadge.pending {
          background: #fff4dd;
          color: #9a6700;
        }

        .requestBadge.paid,
        .requestBadge.confirmed,
        .requestBadge.approved {
          background: #e8f8ef;
          color: #16864b;
        }

        .requestBadge.rejected,
        .requestBadge.cancelled {
          background: #fff0f1;
          color: #b42335;
        }

        .noRequests {
          margin-top: 16px;
          padding: 22px;
          border: 1px dashed #d9dee7;
          border-radius: 14px;
          text-align: center;
          color: #8a92a0;
          font-size: 13px;
        }

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .summary {
            position: static;
          }

          .methods {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .billing {
            padding-left: 12px;
            padding-right: 12px;
            max-width: 100%;
          }

          .title h1 {
            font-size: 27px;
          }

          .title p {
            font-size: 13px;
          }

          .panel,
          .summary,
          .requestsSection {
            padding: 15px;
            border-radius: 17px;
          }

          .layout {
            gap: 14px;
            margin-top: 16px;
          }

          .proBanner {
            margin-top: 16px;
            padding: 14px;
            border-radius: 15px;
          }

          .proBannerText strong {
            font-size: 16px;
          }

          .choice {
            grid-template-columns: 1fr 1fr;
          }

          .card {
            padding: 12px;
          }

          .step h2 {
            font-size: 17px;
          }

          .bankBox p {
            grid-template-columns: 1fr;
            gap: 3px;
          }

          .bankBox b {
            font-size: 11px;
          }

          .monthlyPrice strong {
            font-size: 30px;
          }

          .annualBilling {
            align-items: flex-start;
          }

          .annualPrice {
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
          }

          .requestsTableWrap {
            border: 0;
            overflow: visible;
          }

          .requestsTable {
            min-width: 0;
            display: block;
          }

          .requestsTable thead {
            display: none;
          }

          .requestsTable tbody {
            display: grid;
            gap: 10px;
          }

          .requestsTable tr {
            display: block;
            border: 1px solid #e7eaf0;
            border-radius: 13px;
            padding: 8px 12px;
            background: #fff;
          }

          .requestsTable td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 14px;
            border: 0;
            border-bottom: 1px solid #f0f2f5;
            padding: 9px 0;
            text-align: right;
          }

          .requestsTable td:last-child {
            border-bottom: 0;
          }

          .requestsTable td:before {
            content: attr(data-label);
            color: #8a92a0;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
}
