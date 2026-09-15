"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type StoredUser = {
  id?: string;
};

type CardRow = {
  id: string;
  slug: string;
  full_name?: string;
  qr_token?: string;
};

type ScanRow = {
  id: number;
  scanned_at: string;
};

async function getValidAccessToken(
  supabaseUrl: string,
  supabaseKey: string
) {
  let accessToken =
    localStorage.getItem(
      "visitecard_access_token"
    );

  const refreshToken =
    localStorage.getItem(
      "visitecard_refresh_token"
    );

  if (!accessToken) {
    return null;
  }

  const check = await fetch(
    `${supabaseUrl}/auth/v1/user`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  );

  if (check.ok) {
    const user =
      await check.json();

    localStorage.setItem(
      "visitecard_user",
      JSON.stringify(user)
    );

    return {
      accessToken,
      user,
    };
  }

  if (!refreshToken) {
    return null;
  }

  const refresh = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        refresh_token:
          refreshToken,
      }),
    }
  );

  if (!refresh.ok) {
    return null;
  }

  const session =
    await refresh.json();

  if (
    !session?.access_token ||
    !session?.user
  ) {
    return null;
  }

  localStorage.setItem(
    "visitecard_access_token",
    session.access_token
  );

  if (
    session.refresh_token
  ) {
    localStorage.setItem(
      "visitecard_refresh_token",
      session.refresh_token
    );
  }

  localStorage.setItem(
    "visitecard_user",
    JSON.stringify(
      session.user
    )
  );

  return {
    accessToken:
      session.access_token,
    user:
      session.user,
  };
}

function startOfLocalDay(
  value = new Date()
) {
  const date =
    new Date(value);

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;
}

function formatDayKey(
  value: Date
) {
  return [
    value.getFullYear(),
    String(
      value.getMonth() + 1
    ).padStart(2, "0"),
    String(
      value.getDate()
    ).padStart(2, "0"),
  ].join("-");
}

function niceDate(
  key: string
) {
  const date =
    new Date(
      `${key}T12:00:00`
    );

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
    }
  ).format(date);
}

export default function StatisticsPage() {
  const router =
    useRouter();

  const [card, setCard] =
    useState<CardRow | null>(
      null
    );

  const [scans, setScans] =
    useState<ScanRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const todayKey =
    formatDayKey(
      new Date()
    );

  const [
    startDate,
    setStartDate,
  ] = useState(() => {
    const date =
      new Date();

    date.setDate(
      date.getDate() - 29
    );

    return formatDayKey(date);
  });

  const [
    endDate,
    setEndDate,
  ] = useState(todayKey);

  useEffect(() => {
    async function load() {
      const supabaseUrl =
        process.env
          .NEXT_PUBLIC_SUPABASE_URL;

      const supabaseKey =
        process.env
          .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (
        !supabaseUrl ||
        !supabaseKey
      ) {
        setError(
          "Configuration Supabase manquante."
        );

        setLoading(false);
        return;
      }

      const session =
        await getValidAccessToken(
          supabaseUrl,
          supabaseKey
        );

      if (
        !session?.accessToken ||
        !session?.user?.id
      ) {
        router.replace(
          "/connexion"
        );

        return;
      }

      const user =
        session.user as StoredUser;

      const cardResponse =
        await fetch(
          `${supabaseUrl}/rest/v1/cards?user_id=eq.${user.id}&select=id,slug,full_name,qr_token&limit=1`,
          {
            headers: {
              apikey:
                supabaseKey,
              Authorization:
                `Bearer ${session.accessToken}`,
              Accept:
                "application/json",
            },
          }
        );

      if (
        !cardResponse.ok
      ) {
        setError(
          "Impossible de charger votre carte."
        );

        setLoading(false);
        return;
      }

      const cardRows =
        await cardResponse.json();

      const currentCard =
        Array.isArray(
          cardRows
        )
          ? cardRows[0]
          : null;

      if (
        !currentCard?.id
      ) {
        setError(
          "Carte introuvable."
        );

        setLoading(false);
        return;
      }

      setCard(
        currentCard
      );

      const scansResponse =
        await fetch(
          `${supabaseUrl}/rest/v1/qr_scans?card_id=eq.${currentCard.id}&select=id,scanned_at&order=scanned_at.desc&limit=5000`,
          {
            headers: {
              apikey:
                supabaseKey,
              Authorization:
                `Bearer ${session.accessToken}`,
              Accept:
                "application/json",
            },
          }
        );

      if (
        !scansResponse.ok
      ) {
        const raw =
          await scansResponse.text();

        setError(
          raw ||
            "Impossible de charger les statistiques."
        );

        setLoading(false);
        return;
      }

      const scanRows =
        await scansResponse.json();

      setScans(
        Array.isArray(
          scanRows
        )
          ? scanRows
          : []
      );

      setLoading(false);
    }

    load();
  }, [router]);

  const totals =
    useMemo(() => {
      const now =
        new Date();

      const todayStart =
        startOfLocalDay(now);

      const sevenStart =
        new Date(
          todayStart
        );

      sevenStart.setDate(
        sevenStart.getDate() - 6
      );

      const thirtyStart =
        new Date(
          todayStart
        );

      thirtyStart.setDate(
        thirtyStart.getDate() - 29
      );

      return {
        total:
          scans.length,

        today:
          scans.filter(
            (scan) =>
              new Date(
                scan.scanned_at
              ) >= todayStart
          ).length,

        seven:
          scans.filter(
            (scan) =>
              new Date(
                scan.scanned_at
              ) >= sevenStart
          ).length,

        thirty:
          scans.filter(
            (scan) =>
              new Date(
                scan.scanned_at
              ) >= thirtyStart
          ).length,
      };
    }, [scans]);

  const filteredScans =
    useMemo(() => {
      const start =
        new Date(
          `${startDate}T00:00:00`
        );

      const end =
        new Date(
          `${endDate}T23:59:59.999`
        );

      return scans.filter(
        (scan) => {
          const date =
            new Date(
              scan.scanned_at
            );

          return (
            date >= start &&
            date <= end
          );
        }
      );
    }, [
      scans,
      startDate,
      endDate,
    ]);

  const dailyRows =
    useMemo(() => {
      const map =
        new Map<
          string,
          number
        >();

      filteredScans.forEach(
        (scan) => {
          const date =
            new Date(
              scan.scanned_at
            );

          const key =
            formatDayKey(date);

          map.set(
            key,
            (map.get(key) || 0) +
              1
          );
        }
      );

      const start =
        new Date(
          `${startDate}T12:00:00`
        );

      const end =
        new Date(
          `${endDate}T12:00:00`
        );

      const result: Array<{
        key: string;
        count: number;
      }> = [];

      const cursor =
        new Date(start);

      while (
        cursor <= end &&
        result.length < 366
      ) {
        const key =
          formatDayKey(
            cursor
          );

        result.push({
          key,
          count:
            map.get(key) || 0,
        });

        cursor.setDate(
          cursor.getDate() + 1
        );
      }

      return result.reverse();
    }, [
      filteredScans,
      startDate,
      endDate,
    ]);

  const maxCount =
    Math.max(
      1,
      ...dailyRows.map(
        (item) => item.count
      )
    );

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
          <Link href="/mon-espace/avis">Avis</Link>
        </div>

        <div>
          <strong>Statistiques QR</strong>
          <small>{card?.full_name || card?.slug}</small>
        </div>
      </header>

      <div className="content">
        <section className="intro">
          <span>
            ANALYTIQUE
          </span>

          <h1>
            Scans de votre QR Code
          </h1>

          <p>
            Chaque passage par votre QR Code unique est enregistré ici.
          </p>
        </section>

        {error ? (
          <div className="error">
            {error}
          </div>
        ) : null}

        <section className="kpis">
          <article>
            <small>
              Aujourd’hui
            </small>

            <strong>
              {totals.today}
            </strong>
          </article>

          <article>
            <small>
              7 derniers jours
            </small>

            <strong>
              {totals.seven}
            </strong>
          </article>

          <article>
            <small>
              30 derniers jours
            </small>

            <strong>
              {totals.thirty}
            </strong>
          </article>

          <article>
            <small>
              Total
            </small>

            <strong>
              {totals.total}
            </strong>
          </article>
        </section>

        <section className="panel">
          <div className="panelHead">
            <div>
              <h2>
                Rechercher par date
              </h2>

              <p>
                Sélectionnez une période.
              </p>
            </div>

            <div className="dates">
              <label>
                Du
                <input
                  type="date"
                  value={
                    startDate
                  }
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                Au
                <input
                  type="date"
                  value={
                    endDate
                  }
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                />
              </label>
            </div>
          </div>

          <div className="periodTotal">
            <span>
              Scans sur cette période
            </span>

            <strong>
              {
                filteredScans.length
              }
            </strong>
          </div>
        </section>

        <section className="panel">
          <div className="panelHead">
            <div>
              <h2>
                Scans par jour
              </h2>

              <p>
                Historique quotidien.
              </p>
            </div>
          </div>

          <div className="bars">
            {dailyRows.length ? (
              dailyRows.map(
                (item) => (
                  <div
                    className="barRow"
                    key={
                      item.key
                    }
                  >
                    <span>
                      {niceDate(
                        item.key
                      )}
                    </span>

                    <div className="barTrack">
                      <div
                        className="barFill"
                        style={{
                          width:
                            `${
                              (item.count /
                                maxCount) *
                              100
                            }%`,
                        }}
                      />
                    </div>

                    <strong>
                      {
                        item.count
                      }
                    </strong>
                  </div>
                )
              )
            ) : (
              <div className="empty">
                Aucun scan sur cette période.
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100dvh;
          background: #f6f6f5;
          color: #111;
          font-family: Inter, ui-sans-serif, system-ui,
            -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        .topbar {
          min-height: 72px;
          padding: 12px 28px;
          display: flex;
          align-items: center;
          gap: 18px;
          border-bottom: 1px solid #e6e6e3;
          background: #fff;
        }

        .topbar > div {
          display: grid;
          gap: 2px;
        }

        .topbar small {
          color: #8a909a;
        }

        .back {
          color: #111;
          text-decoration: none;
          font-weight: 800;
        }

        .topLinks {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .topLinks a {
          min-height: 38px;
          padding: 0 11px;
          display: inline-flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 10px;
          background: #fff;
          color: #111;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        }

        .content {
          width: min(1100px, calc(100% - 36px));
          margin: auto;
          padding: 40px 0 80px;
        }

        .intro span {
          color: #ff4f23;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .13em;
        }

        .intro h1 {
          margin: 8px 0 0;
          font-size: clamp(36px, 6vw, 58px);
          letter-spacing: -.055em;
        }

        .intro p {
          margin: 10px 0 0;
          color: #7d8490;
        }

        .kpis {
          margin-top: 28px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .kpis article {
          min-height: 130px;
          padding: 20px;
          display: grid;
          align-content: space-between;
          border: 1px solid #e2e2df;
          border-radius: 20px;
          background: #fff;
        }

        .kpis small {
          color: #858c96;
          font-weight: 700;
        }

        .kpis strong {
          font-size: 42px;
          letter-spacing: -.05em;
        }

        .panel {
          margin-top: 16px;
          padding: 22px;
          border: 1px solid #e2e2df;
          border-radius: 22px;
          background: #fff;
        }

        .panelHead {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 18px;
        }

        .panelHead h2 {
          margin: 0;
          font-size: 21px;
        }

        .panelHead p {
          margin: 5px 0 0;
          color: #8b919b;
          font-size: 13px;
        }

        .dates {
          display: flex;
          gap: 10px;
        }

        .dates label {
          display: grid;
          gap: 5px;
          color: #666;
          font-size: 11px;
          font-weight: 800;
        }

        .dates input {
          min-height: 42px;
          padding: 0 10px;
          border: 1px solid #ddd;
          border-radius: 10px;
          background: #fff;
          font: inherit;
        }

        .periodTotal {
          margin-top: 20px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 14px;
          background: #fff3ee;
          color: #ff4f23;
          font-weight: 800;
        }

        .periodTotal strong {
          font-size: 30px;
        }

        .bars {
          margin-top: 20px;
          display: grid;
          gap: 9px;
        }

        .barRow {
          display: grid;
          grid-template-columns: 78px 1fr 42px;
          gap: 10px;
          align-items: center;
        }

        .barRow > span {
          color: #737982;
          font-size: 12px;
        }

        .barTrack {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: #eeeeeb;
        }

        .barFill {
          min-width: 0;
          height: 100%;
          border-radius: 999px;
          background: #ff4f23;
        }

        .barRow strong {
          text-align: right;
        }

        .empty {
          padding: 30px;
          text-align: center;
          color: #8a9098;
        }

        .error {
          margin-top: 20px;
          padding: 14px;
          border-radius: 13px;
          background: #fff1f0;
          color: #b42318;
        }

        .loading {
          min-height: 100dvh;
          display: grid;
          place-items: center;
        }

        .loader {
          width: 40px;
          height: 40px;
          border: 4px solid #eee;
          border-top-color: #ff4f23;
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 760px) {
          .content {
            width: calc(100% - 24px);
            padding-top: 26px;
          }

          .kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .panelHead {
            align-items: stretch;
            flex-direction: column;
          }

          .dates {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .barRow {
            grid-template-columns: 66px 1fr 34px;
          }
        }
      `}</style>
    </main>
  );
}
