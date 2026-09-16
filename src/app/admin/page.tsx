"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/app/lib/supabase";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  card_slug: string | null;
};

type Period =
  | "7"
  | "30"
  | "90"
  | "all";

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [period, setPeriod] =
    useState<Period>("30");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [adminEmail, setAdminEmail] =
    useState("");

  const [newEmail, setNewEmail] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [savingEmail, setSavingEmail] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  async function adminApi(
    url: string,
    init?: RequestInit
  ) {
    const supabase =
      getSupabaseBrowser();

    const { data } =
      await supabase.auth.getSession();

    const token =
      data.session?.access_token;

    if (!token) {
      router.replace(
        "/connexion"
      );

      throw new Error(
        "Connexion requise."
      );
    }

    const response =
      await fetch(url, {
        ...init,

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,

          ...(init?.headers || {}),
        },
      });

    const result =
      await response
        .json()
        .catch(() => ({}));

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      router.replace(
        "/mon-espace"
      );

      throw new Error(
        result.error ||
          "Accès administrateur refusé."
      );
    }

    if (!response.ok) {
      throw new Error(
        result.error ||
          "Une erreur est survenue."
      );
    }

    return result;
  }

  useEffect(() => {
    async function loadAdmin() {
      try {
        const result =
          await adminApi(
            "/api/admin/users"
          );

        setUsers(
          result.users || []
        );

        setAdminEmail(
          result.adminEmail || ""
        );

        setNewEmail(
          result.adminEmail || ""
        );
      } catch (err: any) {
        setError(
          err?.message ||
            "Impossible de charger l'administration."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, []);

  const filteredUsers =
    useMemo(() => {
      if (period === "all") {
        return users;
      }

      const days =
        Number(period);

      const start =
        Date.now() -
        days *
          24 *
          60 *
          60 *
          1000;

      return users.filter(
        (user) =>
          new Date(
            user.created_at
          ).getTime() >= start
      );
    }, [users, period]);

  const todayCount =
    useMemo(() => {
      const today =
        new Date();

      return users.filter(
        (user) => {
          const date =
            new Date(
              user.created_at
            );

          return (
            date.getFullYear() ===
              today.getFullYear() &&
            date.getMonth() ===
              today.getMonth() &&
            date.getDate() ===
              today.getDate()
          );
        }
      ).length;
    }, [users]);

  const dailyStats =
    useMemo(() => {
      const map =
        new Map<
          string,
          number
        >();

      filteredUsers.forEach(
        (user) => {
          const date =
            new Date(
              user.created_at
            ).toLocaleDateString(
              "fr-FR"
            );

          map.set(
            date,
            (map.get(date) ||
              0) + 1
          );
        }
      );

      return Array.from(
        map.entries()
      ).reverse();
    }, [filteredUsers]);

  async function changeEmail(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const email =
      newEmail
        .trim()
        .toLowerCase();

    if (!email) {
      setError(
        "Entrez un e-mail."
      );

      return;
    }

    setSavingEmail(true);

    try {
      const result =
        await adminApi(
          "/api/admin/account",
          {
            method: "PATCH",

            body:
              JSON.stringify({
                email,
              }),
          }
        );

      setAdminEmail(
        result.email ||
          email
      );

      setNewEmail(
        result.email ||
          email
      );

      setSuccess(
        "E-mail administrateur modifié."
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Impossible de modifier l'e-mail."
      );
    } finally {
      setSavingEmail(
        false
      );
    }
  }

  async function changePassword(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      newPassword.length <
      8
    ) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "Les deux mots de passe sont différents."
      );

      return;
    }

    setSavingPassword(
      true
    );

    try {
      await adminApi(
        "/api/admin/account",
        {
          method: "PATCH",

          body:
            JSON.stringify({
              password:
                newPassword,
            }),
        }
      );

      setNewPassword("");
      setConfirmPassword("");

      setSuccess(
        "Mot de passe administrateur modifié."
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Impossible de modifier le mot de passe."
      );
    } finally {
      setSavingPassword(
        false
      );
    }
  }

  async function logout() {
    const supabase =
      getSupabaseBrowser();

    await supabase.auth.signOut();

    router.replace(
      "/connexion"
    );
  }

  if (loading) {
    return (
      <main className="loading">
        <div className="loader" />

        <span>
          Chargement...
        </span>

        <style jsx>{`
          .loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 14px;
            font-family: Arial,
              sans-serif;
            background: #f7f7f8;
          }

          .loader {
            width: 30px;
            height: 30px;
            border: 3px solid
              #eeeeee;
            border-top-color:
              #ff6337;
            border-radius: 50%;
            animation: spin
              0.7s linear
              infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(
                360deg
              );
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <header className="header">
        <a
          href="/admin"
          className="brand"
        >
          VisiteCard
          <span>Admin</span>
        </a>

        <div className="headerRight">
          <div className="adminIdentity">
            <span>
              Administrateur
            </span>

            <strong>
              {adminEmail}
            </strong>
          </div>

          <button
            type="button"
            className="logout"
            onClick={logout}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div className="container">
        <section className="top">
          <div>
            <span className="eyebrow">
              ADMINISTRATION
            </span>

            <h1>
              Tableau de bord
            </h1>

            <p>
              Suivez les
              inscriptions et
              gérez votre compte
              administrateur.
            </p>
          </div>

          <select
            value={period}
            onChange={(
              event
            ) =>
              setPeriod(
                event.target
                  .value as Period
              )
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
          <div className="alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert success">
            {success}
          </div>
        )}

        <section className="stats">
          <article>
            <span>
              Total inscrits
            </span>

            <strong>
              {users.length}
            </strong>
          </article>

          <article>
            <span>
              Inscrits aujourd'hui
            </span>

            <strong>
              {todayCount}
            </strong>
          </article>

          <article>
            <span>
              Sur la période
            </span>

            <strong>
              {
                filteredUsers.length
              }
            </strong>
          </article>
        </section>

        <section className="panel">
          <div className="panelHead">
            <div>
              <h2>
                Inscriptions par
                jour
              </h2>

              <p>
                Évolution des
                nouveaux comptes.
              </p>
            </div>
          </div>

          <div className="daily">
            {dailyStats.length ===
            0 ? (
              <p className="empty">
                Aucune inscription
                sur cette période.
              </p>
            ) : (
              dailyStats.map(
                ([
                  date,
                  count,
                ]) => (
                  <div
                    className="dailyRow"
                    key={date}
                  >
                    <span>
                      {date}
                    </span>

                    <div className="bar">
                      <i
                        style={{
                          width: `${Math.max(
                            8,
                            Math.min(
                              100,
                              count *
                                12
                            )
                          )}%`,
                        }}
                      />
                    </div>

                    <strong>
                      {count}
                    </strong>
                  </div>
                )
              )
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panelHead">
            <div>
              <h2>
                Tous les inscrits
              </h2>

              <p>
                {
                  filteredUsers.length
                }{" "}
                compte(s) affiché(s)
              </p>
            </div>
          </div>

          <div className="tableWrapper">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>
                    E-mail
                  </th>
                  <th>
                    Inscription
                  </th>
                  <th>
                    Carte
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (user) => (
                    <tr
                      key={
                        user.id
                      }
                    >
                      <td>
                        {user.name ||
                          "—"}
                      </td>

                      <td>
                        {
                          user.email
                        }
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
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="securityTitle">
          <span className="eyebrow">
            SÉCURITÉ
          </span>

          <h2>
            Compte administrateur
          </h2>

          <p>
            Modifiez vos
            informations de
            connexion.
          </p>
        </section>

        <section className="securityGrid">
          <form
            className="panel securityCard"
            onSubmit={
              changeEmail
            }
          >
            <div className="securityIcon">
              @
            </div>

            <div>
              <h2>
                E-mail
                administrateur
              </h2>

              <p>
                E-mail actuellement
                autorisé à accéder à
                l'administration.
              </p>
            </div>

            <label>
              E-mail actuel

              <input
                type="email"
                value={
                  adminEmail
                }
                disabled
              />
            </label>

            <label>
              Nouvel e-mail

              <input
                type="email"
                value={
                  newEmail
                }
                onChange={(
                  event
                ) =>
                  setNewEmail(
                    event.target
                      .value
                  )
                }
                required
              />
            </label>

            <button
              type="submit"
              className="primaryButton"
              disabled={
                savingEmail
              }
            >
              {savingEmail
                ? "Modification..."
                : "Modifier l'e-mail"}
            </button>
          </form>

          <form
            className="panel securityCard"
            onSubmit={
              changePassword
            }
          >
            <div className="securityIcon">
              ●
            </div>

            <div>
              <h2>
                Mot de passe
              </h2>

              <p>
                Définissez un
                nouveau mot de passe
                administrateur.
              </p>
            </div>

            <label>
              Nouveau mot de passe

              <input
                type="password"
                value={
                  newPassword
                }
                onChange={(
                  event
                ) =>
                  setNewPassword(
                    event.target
                      .value
                  )
                }
                minLength={8}
                required
                placeholder="Minimum 8 caractères"
              />
            </label>

            <label>
              Confirmer le mot de
              passe

              <input
                type="password"
                value={
                  confirmPassword
                }
                onChange={(
                  event
                ) =>
                  setConfirmPassword(
                    event.target
                      .value
                  )
                }
                minLength={8}
                required
                placeholder="Confirmer"
              />
            </label>

            <button
              type="submit"
              className="primaryButton"
              disabled={
                savingPassword
              }
            >
              {savingPassword
                ? "Modification..."
                : "Modifier le mot de passe"}
            </button>
          </form>
        </section>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .adminPage {
          min-height: 100vh;
          background: #f7f7f8;
          color: #171717;
          font-family: Arial,
            sans-serif;
        }

        .header {
          min-height: 72px;
          padding: 0
            max(
              20px,
              calc(
                (100vw - 1180px) /
                  2
              )
            );
          background: #ffffff;
          border-bottom: 1px
            solid #e9e9eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand {
          color: #111111;
          text-decoration: none;
          font-size: 21px;
          font-weight: 900;
        }

        .brand span {
          color: #ff6337;
          margin-left: 7px;
        }

        .headerRight {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .adminIdentity {
          display: flex;
          flex-direction: column;
          text-align: right;
          gap: 2px;
        }

        .adminIdentity span {
          font-size: 10px;
          color: #999999;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .adminIdentity strong {
          font-size: 12px;
        }

        .logout {
          padding: 10px 14px;
          border: 1px solid
            #dddddd;
          border-radius: 10px;
          background: #ffffff;
          cursor: pointer;
          font-weight: 700;
        }

        .container {
          width: min(
            1180px,
            calc(100% - 30px)
          );
          margin: 36px auto 70px;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
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

        .top p,
        .securityTitle p {
          margin: 0;
          color: #777777;
        }

        select {
          border: 1px solid
            #dddddd;
          border-radius: 11px;
          padding: 12px 14px;
          background: #ffffff;
        }

        .stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 16px;
          margin: 25px 0;
        }

        .stats article,
        .panel {
          background: #ffffff;
          border: 1px solid
            #e8e8ea;
          border-radius: 18px;
          padding: 22px;
        }

        .stats span {
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
        }

        .panelHead h2,
        .securityCard h2 {
          margin: 0 0 6px;
          font-size: 18px;
        }

        .panelHead p,
        .securityCard p {
          margin: 0;
          color: #777777;
          font-size: 13px;
          line-height: 1.5;
        }

        .daily {
          margin-top: 22px;
          display: grid;
          gap: 13px;
        }

        .dailyRow {
          display: grid;
          grid-template-columns:
            100px 1fr 35px;
          gap: 15px;
          align-items: center;
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
          margin-top: 20px;
        }

        table {
          width: 100%;
          min-width: 720px;
          border-collapse: collapse;
        }

        th,
        td {
          text-align: left;
          padding: 14px 10px;
          border-bottom: 1px
            solid #eeeeee;
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

        .securityTitle {
          margin-top: 45px;
        }

        .securityTitle h2 {
          margin: 7px 0;
          font-size: 25px;
        }

        .securityGrid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 17px;
        }

        .securityCard {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .securityIcon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #fff1ec;
          color: #ff6337;
          display: grid;
          place-items: center;
          font-size: 20px;
          font-weight: 900;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 12px;
          font-weight: 800;
        }

        input {
          width: 100%;
          border: 1px solid
            #dddddd;
          border-radius: 11px;
          padding: 13px;
          background: #ffffff;
          font-size: 14px;
          outline: none;
        }

        input:focus {
          border-color: #ff6337;
          box-shadow: 0 0 0
            3px
            rgba(
              255,
              99,
              55,
              0.1
            );
        }

        input:disabled {
          background: #f4f4f5;
          color: #888888;
        }

        .primaryButton {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 11px;
          background: #ff6337;
          color: #ffffff;
          font-weight: 900;
          cursor: pointer;
        }

        .primaryButton:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .alert {
          margin-top: 20px;
          padding: 13px 15px;
          border-radius: 11px;
          font-size: 13px;
        }

        .error {
          background: #fff0f0;
          color: #a21818;
        }

        .success {
          background: #effaf3;
          color: #176b38;
        }

        .empty {
          color: #777777;
        }

        @media (
          max-width: 760px
        ) {
          .header {
            padding: 0 15px;
          }

          .adminIdentity {
            display: none;
          }

          .brand {
            font-size: 18px;
          }

          .container {
            width: calc(
              100% - 20px
            );
            margin-top: 22px;
          }

          .top {
            flex-direction: column;
            align-items: stretch;
          }

          h1 {
            font-size: 28px;
          }

          .stats,
          .securityGrid {
            grid-template-columns:
              1fr;
          }

          .dailyRow {
            grid-template-columns:
              85px 1fr 28px;
          }
        }
      `}</style>
    </main>
  );
}
