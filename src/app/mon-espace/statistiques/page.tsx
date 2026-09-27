"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

type CardRow = {
  id: string;
  full_name: string | null;
  slug: string | null;
  entity_type: string | null;
  views: number | null;
  social_links: any[] | null;
  custom_links: any[] | null;
};

type ScanRow = {
  card_id: string;
  created_at: string;
};

type ReviewRow = {
  card_id: string;
  rating: number | null;
};

type CardPerformance = {
  id: string;
  name: string;
  type: string;
  views: number;
  scans: number;
  reviews: number;
  rating: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatDate(date: Date, fr: boolean) {
  return date.toLocaleDateString(fr ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
  });
}

export default function StatistiquesPage() {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const [cards, setCards] = useState<CardRow[]>([]);
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      try {
        const s = getSupabaseBrowser();

        const { data: auth } = await s.auth.getUser();

        if (!auth.user) {
          if (active) setLoading(false);
          return;
        }

        const { data: cardRows } = await s
          .from("cards")
          .select(
            "id,full_name,slug,entity_type,views,social_links,custom_links"
          )
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: true });

        const myCards = (cardRows || []) as CardRow[];

        if (!active) return;

        setCards(myCards);

        if (!myCards.length) {
          setScans([]);
          setReviews([]);
          return;
        }

        const ids = myCards.map((card) => card.id);

        const [scanResult, reviewResult] = await Promise.all([
          s
            .from("qr_scans")
            .select("card_id,created_at")
            .in("card_id", ids)
            .order("created_at", { ascending: true }),

          s
            .from("card_reviews")
            .select("card_id,rating")
            .in("card_id", ids)
            .eq("status", "published"),
        ]);

        if (!active) return;

        setScans((scanResult.data || []) as ScanRow[]);
        setReviews((reviewResult.data || []) as ReviewRow[]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const statistics = useMemo(() => {
    const totalViews = cards.reduce(
      (sum, card) => sum + Number(card.views || 0),
      0
    );

    const totalScans = scans.length;

    const totalReviews = reviews.length;

    const averageRating = totalReviews
      ? reviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0
        ) / totalReviews
      : 0;

    const totalLinks = cards.reduce((sum, card) => {
      const social = Array.isArray(card.social_links)
        ? card.social_links.length
        : 0;

      const custom = Array.isArray(card.custom_links)
        ? card.custom_links.length
        : 0;

      return sum + social + custom;
    }, 0);

    const performances: CardPerformance[] = cards
      .map((card) => {
        const cardScans = scans.filter(
          (scan) => scan.card_id === card.id
        ).length;

        const cardReviews = reviews.filter(
          (review) => review.card_id === card.id
        );

        const rating = cardReviews.length
          ? cardReviews.reduce(
              (sum, review) => sum + Number(review.rating || 0),
              0
            ) / cardReviews.length
          : 0;

        return {
          id: card.id,
          name: card.full_name || card.slug || "VisiteCard",
          type:
            card.entity_type === "profile"
              ? fr
                ? "Profil"
                : "Profile"
              : fr
                ? "Société"
                : "Company",
          views: Number(card.views || 0),
          scans: cardScans,
          reviews: cardReviews.length,
          rating,
        };
      })
      .sort((a, b) => {
        if (b.views !== a.views) return b.views - a.views;
        return b.scans - a.scans;
      });

    return {
      totalViews,
      totalScans,
      totalReviews,
      averageRating,
      totalLinks,
      performances,
      topCard: performances[0] || null,
    };
  }, [cards, scans, reviews, fr]);

  const recentScans = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (13 - index));

      return {
        date,
        label: formatDate(date, fr),
        count: 0,
      };
    });

    scans.forEach((scan) => {
      const scanDate = new Date(scan.created_at);
      scanDate.setHours(0, 0, 0, 0);

      const item = days.find(
        (day) => day.date.getTime() === scanDate.getTime()
      );

      if (item) item.count += 1;
    });

    return days;
  }, [scans, fr]);

  const maxScan = Math.max(
    1,
    ...recentScans.map((item) => item.count)
  );

  return (
    <main className="dashBody statsPage">
      <div className="statsHeader">
        <div className="pageTitle">
          <span>VISITECARD</span>

          <h1>
            {fr ? "Statistiques" : "Statistics"}
          </h1>

          <p>
            {fr
              ? "Suivez les performances de vos cartes digitales."
              : "Track the performance of your digital cards."}
          </p>
        </div>
      </div>

      <section className="mainStats">
        <div className="panel statCard">
          <div className="statTop">
            <span className="statIcon">
              <EyeIcon />
            </span>

            <small>
              {fr ? "Vues" : "Views"}
            </small>
          </div>

          <strong>
            {loading
              ? "…"
              : formatNumber(statistics.totalViews)}
          </strong>

          <p>
            {fr
              ? "Nombre total de consultations"
              : "Total card views"}
          </p>
        </div>

        <div className="panel statCard">
          <div className="statTop">
            <span className="statIcon">
              <QrIcon />
            </span>

            <small>
              {fr ? "Scans QR" : "QR scans"}
            </small>
          </div>

          <strong>
            {loading
              ? "…"
              : formatNumber(statistics.totalScans)}
          </strong>

          <p>
            {fr
              ? "Scans de vos QR Codes"
              : "QR Code scans"}
          </p>
        </div>

        <div className="panel statCard">
          <div className="statTop">
            <span className="statIcon">
              <StarIcon />
            </span>

            <small>
              {fr ? "Avis publiés" : "Published reviews"}
            </small>
          </div>

          <strong>
            {loading
              ? "…"
              : statistics.totalReviews}
          </strong>

          <p>
            {statistics.totalReviews
              ? `★ ${statistics.averageRating.toFixed(1)} / 5`
              : fr
                ? "Pas encore d'avis"
                : "No reviews yet"}
          </p>
        </div>

        <div className="panel statCard">
          <div className="statTop">
            <span className="statIcon">
              <LinkIcon />
            </span>

            <small>
              {fr ? "Liens actifs" : "Active links"}
            </small>
          </div>

          <strong>
            {loading
              ? "…"
              : statistics.totalLinks}
          </strong>

          <p>
            {fr
              ? "Réseaux sociaux et liens"
              : "Social networks and links"}
          </p>
        </div>
      </section>

      <section className="secondaryStats">
        <div className="panel highlightCard">
          <div className="highlightIcon">
            <TrophyIcon />
          </div>

          <div>
            <small>
              {fr
                ? "Carte la plus consultée"
                : "Most viewed card"}
            </small>

            <strong>
              {loading
                ? "…"
                : statistics.topCard?.name || "—"}
            </strong>

            <p>
              {statistics.topCard
                ? `${formatNumber(
                    statistics.topCard.views
                  )} ${fr ? "vues" : "views"} · ${
                    statistics.topCard.scans
                  } ${fr ? "scans" : "scans"}`
                : fr
                  ? "Aucune donnée"
                  : "No data"}
            </p>
          </div>
        </div>

        <div className="panel highlightCard">
          <div className="highlightIcon">
            <QrIcon />
          </div>

          <div>
            <small>
              {fr
                ? "Scans sur 14 jours"
                : "Scans in 14 days"}
            </small>

            <strong>
              {loading
                ? "…"
                : recentScans.reduce(
                    (sum, item) => sum + item.count,
                    0
                  )}
            </strong>

            <p>
              {fr
                ? "Activité récente de vos QR Codes"
                : "Recent QR Code activity"}
            </p>
          </div>
        </div>

        <div className="panel highlightCard">
          <div className="highlightIcon">
            <CardsIcon />
          </div>

          <div>
            <small>
              {fr
                ? "Mes cartes"
                : "My cards"}
            </small>

            <strong>
              {loading ? "…" : cards.length}
            </strong>

            <p>
              {fr
                ? "Profils et sociétés"
                : "Profiles and companies"}
            </p>
          </div>
        </div>
      </section>

      <section className="panel chartPanel">
        <div className="sectionTitle">
          <div>
            <h2>
              {fr
                ? "Scans QR des 14 derniers jours"
                : "QR scans over the last 14 days"}
            </h2>

            <p>
              {fr
                ? "Visualisez les jours où vos QR Codes sont le plus utilisés."
                : "See when your QR Codes are used most."}
            </p>
          </div>
        </div>

        <div className="chart">
          {recentScans.map((item, index) => {
            const height =
              item.count === 0
                ? 4
                : Math.max(
                    12,
                    (item.count / maxScan) * 150
                  );

            return (
              <div
                className="barItem"
                key={`${item.label}-${index}`}
              >
                <div className="barArea">
                  {item.count > 0 && (
                    <span className="barValue">
                      {item.count}
                    </span>
                  )}

                  <div
                    className="bar"
                    style={{
                      height: `${height}px`,
                    }}
                  />
                </div>

                <small>
                  {index % 2 === 0 ||
                  index === recentScans.length - 1
                    ? item.label
                    : ""}
                </small>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel rankingPanel">
        <div className="sectionTitle">
          <div>
            <h2>
              {fr
                ? "Performance de mes cartes"
                : "My card performance"}
            </h2>

            <p>
              {fr
                ? "Comparez vos profils et vos sociétés."
                : "Compare your profiles and companies."}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty">
            …
          </div>
        ) : statistics.performances.length ? (
          <div className="ranking">
            <div className="rankingHeader">
              <span>
                {fr ? "Carte" : "Card"}
              </span>

              <span>
                {fr ? "Vues" : "Views"}
              </span>

              <span>
                {fr ? "Scans QR" : "QR scans"}
              </span>

              <span>
                {fr ? "Avis" : "Reviews"}
              </span>

              <span>
                {fr ? "Note" : "Rating"}
              </span>
            </div>

            {statistics.performances.map(
              (card, index) => (
                <div
                  className="rankingRow"
                  key={card.id}
                >
                  <div className="cardName">
                    <span
                      className={`rankNumber ${
                        index === 0 ? "first" : ""
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div>
                      <strong>
                        {card.name}
                      </strong>

                      <small>
                        {card.type}
                      </small>
                    </div>
                  </div>

                  <b>
                    {formatNumber(card.views)}
                  </b>

                  <b>
                    {formatNumber(card.scans)}
                  </b>

                  <b>
                    {card.reviews}
                  </b>

                  <b>
                    {card.reviews
                      ? `${card.rating.toFixed(1)}/5`
                      : "—"}
                  </b>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="empty">
            {fr
              ? "Aucune carte disponible."
              : "No card available."}
          </div>
        )}
      </section>

      <style jsx>{`
        .statsPage {
          max-width: 1280px;
        }

        .statsHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .mainStats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-top: 30px;
        }

        .statCard {
          min-height: 170px;
          padding: 26px;
          display: flex;
          flex-direction: column;
        }

        .statTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .statTop small {
          flex: 1;
          color: #7c8799;
          font-size: 13px;
          font-weight: 800;
        }

        .statIcon {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #ff501e;
          background: #fff1ec;
        }

        .statIcon :global(svg) {
          width: 21px;
          height: 21px;
        }

        .statCard > strong {
          margin-top: 22px;
          color: #07162e;
          font-size: 42px;
          line-height: 1;
          letter-spacing: -2px;
        }

        .statCard p {
          margin: auto 0 0;
          padding-top: 16px;
          color: #8b94a3;
          font-size: 12px;
        }

        .secondaryStats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .highlightCard {
          min-height: 128px;
          padding: 22px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .highlightIcon {
          width: 54px;
          height: 54px;
          flex: 0 0 54px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: #fff1ec;
          color: #ff501e;
        }

        .highlightIcon :global(svg) {
          width: 25px;
          height: 25px;
        }

        .highlightCard > div:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .highlightCard small {
          color: #8b94a3;
          font-size: 11px;
          font-weight: 800;
        }

        .highlightCard strong {
          overflow: hidden;
          color: #07162e;
          font-size: 20px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .highlightCard p {
          margin: 0;
          color: #7e8998;
          font-size: 11px;
        }

        .chartPanel,
        .rankingPanel {
          margin-top: 16px;
          padding: 26px;
        }

        .sectionTitle h2 {
          margin: 0;
          color: #07162e;
          font-size: 20px;
        }

        .sectionTitle p {
          margin: 6px 0 0;
          color: #8b94a3;
          font-size: 12px;
        }

        .chart {
          height: 220px;
          margin-top: 30px;
          padding-top: 12px;
          display: grid;
          grid-template-columns: repeat(14, minmax(0, 1fr));
          align-items: end;
          gap: 8px;
          border-bottom: 1px solid #e9edf2;
        }

        .barItem {
          height: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
        }

        .barArea {
          width: 100%;
          height: 170px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 5px;
        }

        .barValue {
          color: #ff501e;
          font-size: 10px;
          font-weight: 900;
        }

        .bar {
          width: min(30px, 70%);
          min-height: 4px;
          border-radius: 8px 8px 3px 3px;
          background: linear-gradient(
            180deg,
            #ff6c40 0%,
            #ff501e 100%
          );
        }

        .barItem small {
          min-height: 25px;
          color: #939cab;
          font-size: 9px;
          text-align: center;
        }

        .ranking {
          margin-top: 24px;
          overflow-x: auto;
        }

        .rankingHeader,
        .rankingRow {
          min-width: 720px;
          display: grid;
          grid-template-columns:
            minmax(260px, 1.7fr)
            repeat(4, minmax(85px, 0.55fr));
          gap: 15px;
          align-items: center;
        }

        .rankingHeader {
          padding: 0 15px 12px;
          color: #929aa8;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .rankingRow {
          min-height: 72px;
          padding: 12px 15px;
          border-top: 1px solid #edf0f3;
        }

        .rankingRow b {
          color: #07162e;
          font-size: 14px;
        }

        .cardName {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .rankNumber {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #f4f6f8;
          color: #788292;
          font-size: 12px;
          font-weight: 900;
        }

        .rankNumber.first {
          background: #fff0ea;
          color: #ff501e;
        }

        .cardName > div {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cardName strong {
          overflow: hidden;
          color: #07162e;
          font-size: 14px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cardName small {
          color: #9099a7;
          font-size: 10px;
        }

        .empty {
          padding: 45px 10px 25px;
          color: #8b94a3;
          text-align: center;
        }

        @media (max-width: 980px) {
          .mainStats {
            grid-template-columns: repeat(2, 1fr);
          }

          .secondaryStats {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .mainStats {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 22px;
          }

          .statCard {
            min-height: 145px;
            padding: 18px;
          }

          .statIcon {
            width: 36px;
            height: 36px;
            flex-basis: 36px;
          }

          .statIcon :global(svg) {
            width: 18px;
            height: 18px;
          }

          .statTop small {
            font-size: 11px;
          }

          .statCard > strong {
            margin-top: 18px;
            font-size: 32px;
          }

          .statCard p {
            font-size: 10px;
          }

          .chartPanel,
          .rankingPanel {
            padding: 19px;
          }

          .chart {
            gap: 3px;
          }

          .bar {
            width: 70%;
          }

          .barItem small {
            font-size: 7px;
          }
        }
      `}</style>
    </main>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM18 18h3v3h-3M18 14h3M14 19v2" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9L6.4 20l1.1-6.2L3 9.4l6.2-.9L12 2.8Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
      <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="11" r="2" />
      <path d="M13 10h5M13 14h4" />
    </svg>
  );
}
