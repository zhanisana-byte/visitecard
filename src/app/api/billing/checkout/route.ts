import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Currency = "TND" | "EUR";

type Card = {
  id: string;
  user_id: string;
  full_name: string | null;
  company: string | null;
  entity_type: "profile" | "company";
  slug: string | null;
  vc_reference: string | null;
};

type Offer = {
  id: string;
  name: string;
  code: string;
  entity_type: "profile" | "company" | "bundle";
  profile_count: number;
  company_count: number;
  duration_value: number;
  duration_unit: string;
  price_tnd: number;
  price_eur: number;
  promo_enabled: boolean;
  promo_price_tnd: number | null;
  promo_price_eur: number | null;
  promo_start_at: string | null;
  promo_end_at: string | null;
  is_active: boolean;
};

function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Configuration Supabase manquante.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function adaptiveInsert(
  s: ReturnType<typeof adminDb>,
  table: string,
  payload: any
) {
  let current = Array.isArray(payload)
    ? payload.map((x) => ({ ...x }))
    : { ...payload };

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const result = await s.from(table).insert(current).select();

    if (!result.error) {
      return result.data;
    }

    const message = String(result.error.message || "");

    const match =
      message.match(/Could not find the ['"]([^'"]+)['"] column/i) ||
      message.match(/column ['"]?([^'" ]+)['"]? .* does not exist/i);

    if (!match) {
      throw result.error;
    }

    const column = match[1];

    if (Array.isArray(current)) {
      current = current.map((row) => {
        const next = { ...row };
        delete next[column];
        return next;
      });
    } else {
      delete current[column];
    }
  }

  throw new Error(`Insertion impossible dans ${table}.`);
}

async function currentUser(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  if (!token) {
    return null;
  }

  const s = adminDb();

  const { data, error } = await s.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

function activePrice(offer: Offer, currency: Currency) {
  const base =
    Number(currency === "EUR" ? offer.price_eur : offer.price_tnd) || 0;

  if (!offer.promo_enabled) {
    return base;
  }

  const now = Date.now();

  const starts = offer.promo_start_at
    ? new Date(offer.promo_start_at).getTime()
    : null;

  const ends = offer.promo_end_at
    ? new Date(offer.promo_end_at).getTime()
    : null;

  if (starts && now < starts) {
    return base;
  }

  if (ends && now > ends) {
    return base;
  }

  const promo =
    currency === "EUR"
      ? offer.promo_price_eur
      : offer.promo_price_tnd;

  if (promo === null || promo === undefined) {
    return base;
  }

  return Number(promo);
}

function chooseQuote(
  cards: Card[],
  offers: Offer[],
  currency: Currency
) {
  const profileCount = cards.filter(
    (c) => c.entity_type === "profile"
  ).length;

  const companyCount = cards.filter(
    (c) => c.entity_type === "company"
  ).length;

  const bundles = offers
    .filter(
      (o) =>
        o.entity_type === "bundle" &&
        Number(o.profile_count || 0) >= profileCount &&
        Number(o.company_count || 0) >= companyCount
    )
    .map((o) => ({
      offer: o,
      total: activePrice(o, currency),
    }))
    .sort((a, b) => a.total - b.total);

  const profileOffer = offers
    .filter((o) => o.entity_type === "profile")
    .map((o) => ({
      offer: o,
      total: activePrice(o, currency),
    }))
    .sort((a, b) => a.total - b.total)[0];

  const companyOffer = offers
    .filter((o) => o.entity_type === "company")
    .map((o) => ({
      offer: o,
      total: activePrice(o, currency),
    }))
    .sort((a, b) => a.total - b.total)[0];

  const individualItems: Array<{
    offer: Offer;
    quantity: number;
    unitPrice: number;
    total: number;
  }> = [];

  if (profileCount) {
    if (!profileOffer) {
      throw new Error(
        "Aucune offre Profil active n'est configurée."
      );
    }

    individualItems.push({
      offer: profileOffer.offer,
      quantity: profileCount,
      unitPrice: profileOffer.total,
      total: profileOffer.total * profileCount,
    });
  }

  if (companyCount) {
    if (!companyOffer) {
      throw new Error(
        "Aucune offre Société active n'est configurée."
      );
    }

    individualItems.push({
      offer: companyOffer.offer,
      quantity: companyCount,
      unitPrice: companyOffer.total,
      total: companyOffer.total * companyCount,
    });
  }

  const individualTotal = individualItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  if (bundles[0] && bundles[0].total <= individualTotal) {
    return {
      total: bundles[0].total,
      items: [
        {
          offer: bundles[0].offer,
          quantity: 1,
          unitPrice: bundles[0].total,
          total: bundles[0].total,
        },
      ],
    };
  }

  return {
    total: individualTotal,
    items: individualItems,
  };
}

async function accessibleCards(userId: string): Promise<Card[]> {
  const s = adminDb();

  const { data: own, error } = await s
    .from("cards")
    .select(
      "id,user_id,full_name,company,entity_type,slug,vc_reference"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const ownCards = (own || []) as Card[];

  const profiles = ownCards.filter(
    (c) => c.entity_type === "profile"
  );

  const profileIds = profiles.map((c) => c.id);

  let linked: Card[] = [];

  if (profileIds.length) {
    const { data: links, error: linksError } = await s
      .from("profile_company_links")
      .select("company_card_id")
      .in("profile_card_id", profileIds);

    if (linksError) {
      throw linksError;
    }

    const ids = [
      ...new Set(
        (links || [])
          .map((x: { company_card_id?: string | null }) =>
            x.company_card_id
          )
          .filter(
            (id): id is string =>
              typeof id === "string" && id.length > 0
          )
      ),
    ];

    if (ids.length) {
      const { data: companies, error: companiesError } =
        await s
          .from("cards")
          .select(
            "id,user_id,full_name,company,entity_type,slug,vc_reference"
          )
          .in("id", ids);

      if (companiesError) {
        throw companiesError;
      }

      linked = (companies || []) as Card[];
    }
  }

  const map = new Map<string, Card>();

  for (const card of [...ownCards, ...linked]) {
    map.set(card.id, card);
  }

  return [...map.values()];
}

export async function GET(request: Request) {
  try {
    const user = await currentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Session expirée." },
        { status: 401 }
      );
    }

    const s = adminDb();

    const cards = await accessibleCards(user.id);

    const [
      { data: offers, error: offersError },
      { data: settings, error: settingsError },
      { data: agents, error: agentsError },
      { data: banks, error: banksError },
      { data: subscriptions, error: subscriptionsError },
      { data: history, error: historyError },
      { data: paymentRequests, error: paymentRequestsError },
    ] = await Promise.all([
      s
        .from("vc_offers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),

      s
        .from("vc_billing_settings")
        .select("*")
        .limit(1)
        .maybeSingle(),

      s
        .from("vc_payment_agents")
        .select("*")
        .eq("is_active", true)
        .order("country_name")
        .order("region")
        .order("name"),

      s
        .from("vc_bank_accounts")
        .select("*")
        .eq("is_active", true)
        .order("currency"),

      s
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      s
        .from("vc_payment_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),

      s
        .from("vc_payment_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (offersError) throw offersError;
    if (settingsError) throw settingsError;
    if (agentsError) throw agentsError;
    if (banksError) throw banksError;
    if (subscriptionsError) throw subscriptionsError;
    if (historyError) throw historyError;
    if (paymentRequestsError) throw paymentRequestsError;

    return NextResponse.json({
      cards,
      offers: offers || [],
      settings: settings || null,
      agents: agents || [],
      banks: banks || [],
      subscriptions: subscriptions || [],
      history: history || [],
      payment_requests: paymentRequests || [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erreur." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Session expirée." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currency: Currency =
      body.currency === "EUR" ? "EUR" : "TND";

    const rawCardIds: unknown[] = Array.isArray(body.card_ids)
      ? body.card_ids
      : [];

    const selectedIds: string[] = Array.from(
      new Set(
        rawCardIds
          .filter(
            (id): id is string =>
              typeof id === "string" && id.trim().length > 0
          )
          .map((id) => id.trim())
      )
    );

    if (!selectedIds.length) {
      return NextResponse.json(
        { error: "Sélectionnez au moins une carte." },
        { status: 400 }
      );
    }

    const available = await accessibleCards(user.id);

    const allowed = new Map<string, Card>(
      available.map((card): [string, Card] => [
        card.id,
        card,
      ])
    );

    const cards: Card[] = selectedIds
      .map((id: string) => allowed.get(id))
      .filter((card): card is Card => card !== undefined);

    if (cards.length !== selectedIds.length) {
      return NextResponse.json(
        {
          error:
            "Une carte sélectionnée n'est pas autorisée.",
        },
        { status: 403 }
      );
    }

    const s = adminDb();

    const [
      { data: offers, error: offersError },
      { data: settings, error: settingsError },
    ] = await Promise.all([
      s
        .from("vc_offers")
        .select("*")
        .eq("is_active", true),

      s
        .from("vc_billing_settings")
        .select("*")
        .limit(1)
        .maybeSingle(),
    ]);

    if (offersError) throw offersError;
    if (settingsError) throw settingsError;

    const quote = chooseQuote(
      cards,
      (offers || []) as Offer[],
      currency
    );

    const method =
      body.payment_method === "agent"
        ? "agent"
        : body.payment_method === "bank" ||
          body.payment_method === "bank_transfer"
        ? "bank_transfer"
        : "online";

    if (method === "online") {
      return NextResponse.json(
        {
          error:
            "Le paiement en ligne sera bientôt disponible.",
        },
        { status: 400 }
      );
    }

    if (
      method === "agent" &&
      !settings?.payment_agent_enabled
    ) {
      return NextResponse.json(
        {
          error:
            "Le paiement par agent est désactivé.",
        },
        { status: 400 }
      );
    }

    if (
      method === "bank_transfer" &&
      !settings?.payment_bank_enabled
    ) {
      return NextResponse.json(
        {
          error:
            "Le virement bancaire est désactivé.",
        },
        { status: 400 }
      );
    }

    let agent: any = null;
    let bank: any = null;

    if (method === "agent") {
      if (!body.agent_id) {
        return NextResponse.json(
          { error: "Choisissez un agent." },
          { status: 400 }
        );
      }

      const { data, error } = await s
        .from("vc_payment_agents")
        .select("*")
        .eq("id", String(body.agent_id))
        .eq("is_active", true)
        .single();

      if (error) {
        throw error;
      }

      agent = data;
    }

    if (method === "bank_transfer") {
      const { data, error } = await s
        .from("vc_bank_accounts")
        .select("*")
        .eq("currency", currency)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return NextResponse.json(
          {
            error: `Aucun compte bancaire ${currency} actif.`,
          },
          { status: 400 }
        );
      }

      bank = data;
    }

    const profile = cards.find(
      (c) => c.entity_type === "profile"
    );

    const referenceCard = profile || cards[0];

    if (!referenceCard.vc_reference) {
      return NextResponse.json(
        {
          error:
            "La référence VC de cette carte est manquante.",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const requestPayload: any = {
      user_id: user.id,
      payment_reference: referenceCard.vc_reference,
      vc_reference: referenceCard.vc_reference,
      currency,
      amount: quote.total,
      total_amount: quote.total,
      payment_method: method,
      status: "pending",
      agent_id: agent?.id || null,
      bank_account_id: bank?.id || null,
      notes:
        String(body.notes || "").trim() || null,
      created_at: now,
      updated_at: now,
    };

    const requestRows = await adaptiveInsert(
      s,
      "vc_payment_requests",
      requestPayload
    );

    const paymentRequest = requestRows?.[0];

    if (!paymentRequest?.id) {
      throw new Error(
        "La demande de paiement n'a pas pu être créée."
      );
    }

    const itemRows = cards.map((card) => {
      const matching =
        quote.items.find(
          (item) =>
            item.offer.entity_type === "bundle" ||
            item.offer.entity_type === card.entity_type
        ) || quote.items[0];

      const unit =
        matching.offer.entity_type === "bundle"
          ? quote.total / cards.length
          : matching.unitPrice;

      return {
        payment_request_id: paymentRequest.id,
        request_id: paymentRequest.id,
        card_id: card.id,
        offer_id: matching.offer.id,
        entity_type: card.entity_type,
        label:
          card.full_name ||
          card.company ||
          (card.entity_type === "profile"
            ? "Profil"
            : "Société"),
        vc_reference: card.vc_reference,
        card_reference: card.vc_reference,
        quantity: 1,
        unit_price: unit,
        total_price: unit,
        currency,
        offer_name_snapshot: matching.offer.name,
        price_snapshot: unit,
      };
    });

    try {
      await adaptiveInsert(
        s,
        "vc_payment_request_items",
        itemRows
      );
    } catch (itemsError) {
      await s
        .from("vc_payment_requests")
        .delete()
        .eq("id", paymentRequest.id);

      throw itemsError;
    }

    return NextResponse.json(
      {
        request: paymentRequest,
        reference: referenceCard.vc_reference,
        amount: quote.total,
        currency,
        method,
        bank,
        agent,
        quote: quote.items.map((x) => ({
          offer_id: x.offer.id,
          name: x.offer.name,
          quantity: x.quantity,
          unit_price: x.unitPrice,
          total: x.total,
        })),
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        error:
          e?.message ||
          "Impossible de créer la demande.",
      },
      { status: 500 }
    );
  }
}
