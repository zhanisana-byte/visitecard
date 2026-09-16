"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/app/lib/supabase";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  card_slug: string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function adminApi(url: string) {
    const supabase = getSupabaseBrowser();

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      router.replace("/connexion");
      throw new Error("Connexion requise.");
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        router.replace("/mon-espace");
      }

      throw new Error(result.error || "Accès refusé.");
    }

    return result;
  }

  useEffect(() => {
    async function loadAdmin() {
      try {
        const result = await adminApi("/api/admin/users");

        setUsers(result.users || []);
      } catch (err: any) {
        setError(err?.message || "Impossible de charger l'administration.");
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, []);

  const filteredUsers = useMemo(() => {
    if (period === "all") {
      return users;
    }

    const days = Number(period);
    const start = Date.now() - days * 24 * 60 * 60 * 1000;

    return users.filter(
      (user) => new Date(user.created_at).getTime() >= start
    );
  }, [users, period]);

  const todayCount = useMemo(() => {
    const today = new Date();

    return users.filter((user) => {
      const date = new Date(user.created_at);

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }).length;
  }, [users]);

  const dailyStats = useMemo(() => {
    const stats = new Map<string, number>();

    filteredUsers.forEach((user) => {
      const date = new Date(user.created_at).toLocaleDateString("fr-FR");

      stats.set(date, (stats.get(date) || 0) + 1);
    });

    return Array.from(stats.entries()).reverse();
  }, [filteredUsers]);

  async function logout() {
    const supabase = getSupabaseBrowser();

    await supabase.auth.signOut();

    router.replace("/connexion");
  }

  if (loading) {
    return (
      <main className="loading">
        Chargement...
      </main>
    );
  }

  return (
    <main className="adminPage">
      <header className="header">
        <div className="logo">
          VisiteCard
          <span>Admin</span>
        </div>

        <button
          className="logout"
          type="button"
          onClick={logout}
        >
          Déconnexion
        </button>
      </header>

      <div className="container">
        <section className="top">
          <div>
            <span className="eyebrow">
              ADMINISTRATION
            </span>

            <h1>Tableau de bord</h1>

            <p>
              Suivez les inscriptions de VisiteCard.
            </p>
          </div>

          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value)
            }
          >
            <option value="7">
              7 derniers jours
            </option>

            <option value="30">
              30 derniers jours
            </option>

            <option value="90">
              90 derniers jours
            </option>

            <option value="all">
              Toute la période
            </option>
          </select>
        </section>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <section className="stats">
          <article>
            <span>Total inscrits</span>
            <strong>{users.length}</strong>
          </article>

          <article>
            <span>Inscrits aujourd'hui</span>
            <strong>{todayCount}</strong>
          </article>

          <article>
            <span>Sur la période</span>
            <strong>{filteredUsers.length}</strong>
          </article>
        </section>

        <section className="panel">
          <div className="panelTitle">
            <div>
              <h2>Inscriptions par jour</h2>

              <p>
                Nombre de nouveaux comptes.
              </p>
            </div>
          </div>

          <div className="daily">
            {dailyStats.length === 0 ? (
              <p className="empty">
                Aucune inscription.
              </p>
            ) : (
              dailyStats.map(([date, count]) => (
                <div
                  className="dailyRow"
                  key={date}
                >
                  <span>{date}</span>

                  <div className="bar">
                    <i
                      style={{
                        width: `${Math.max(
                          8,
                          Math.min(
                            100,
                            count * 12
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <strong>{count}</strong>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panelTitle">
            <div>
              <h2>Tous les inscrits</h2>

              <p>
                {filteredUsers.length} compte(s)
              </p>
            </div>
          </div>

          <div className="tableWrapper">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Date d'inscription</th>
                  <th>Carte</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.name || "—"}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      {new Date(
                        user.created_at
                      ).toLocaleString(
                        "fr-FR"
                      )}
                    </td>

                    <td>
                      {user.card_slug ? (
                        <a
                          href={`/${user.card_slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Voir
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .adminPage {
          min-height: 100vh;
          background: #f6f6f7;
          color: #171717;
          font-family: Arial, sans-serif;
        }

        .loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
          font-family: Arial, sans-serif;
        }

        .header {
          height: 72px;
          background: #ffffff;
          border-bottom: 1px solid #e8e8e8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 max(
            20px,
            calc((100vw - 1180px) / 2)
          );
        }

        .logo {
          font-size: 21px;
          font-weight: 900;
        }

        .logo span {
          margin-left: 7px;
          color: #ff6337;
        }

        .logout {
          border: 1px solid #dedede;
          background: #ffffff;
          border-radius: 10px;
          padding: 10px 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .container {
          width: min(
            1180px,
            calc(100% - 30px)
          );
          margin: 35px auto 70px;
        }

        .top {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .eyebrow {
          color: #ff6337;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        h1 {
          margin: 7px 0;
          font-size: 35px;
        }

        .top p {
          margin: 0;
          color: #777777;
        }

        select {
          padding: 12px 14px;
          background: white;
          border: 1px solid #dddddd;
          border-radius: 11px;
        }

        .stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 16px;
          margin: 25px 0;
        }

        .stats article {
          background: #ffffff;
          border: 1px solid #e8e8e8;
          border-radius: 18px;
          padding: 22px;
        }

        .stats span {
          display: block;
          color: #777777;
          font-size: 13px;
        }

        .stats strong {
          display: block;
          margin-top: 12px;
          font-size: 35px;
        }

        .panel {
          margin-top: 17px;
          padding: 23px;
          background: #ffffff;
          border: 1px solid #e8e8e8;
          border-radius: 18px;
        }

        .panelTitle {
          margin-bottom: 20px;
        }

        .panelTitle h2 {
          margin: 0 0 6px;
          font-size: 19px;
        }

        .panelTitle p {
          margin: 0;
          color: #777777;
          font-size: 13px;
        }

        .daily {
          display: grid;
          gap: 12px;
        }

        .dailyRow {
          display: grid;
          grid-template-columns:
            100px 1fr 35px;
          align-items: center;
          gap: 15px;
          font-size: 13px;
        }

        .bar {
          height: 9px;
          background: #eeeeef;
          border-radius: 100px;
          overflow: hidden;
        }

        .bar i {
          display: block;
          height: 100%;
          background: #ff6337;
          border-radius: 100px;
        }

        .tableWrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 720px;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 14px 10px;
          text-align: left;
          border-bottom: 1px solid #eeeeee;
          font-size: 13px;
        }

        th {
          color: #777777;
          font-size: 11px;
          text-transform: uppercase;
        }

        td a {
          color: #ff6337;
          font-weight: 800;
        }

        .error {
          margin-top: 20px;
          padding: 13px 15px;
          border-radius: 11px;
          background: #fff0f0;
          color: #a21818;
        }

        .empty {
          color: #777777;
        }

        @media (max-width: 700px) {
          .header {
            padding: 0 15px;
          }

          .container {
            width: calc(100% - 20px);
            margin-top: 22px;
          }

          .top {
            flex-direction: column;
            align-items: stretch;
          }

          h1 {
            font-size: 28px;
          }

          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
