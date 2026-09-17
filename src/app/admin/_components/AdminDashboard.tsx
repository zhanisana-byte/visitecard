"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type U = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  card_slug: string | null;
};

type ModalType = "add" | "edit" | "password" | null;

export default function AdminDashboard() {
  const router = useRouter();

  const [users, setUsers] = useState<U[]>([]);
  const [days, setDays] = useState("30");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [selected, setSelected] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [modal, setModal] = useState<ModalType>(null);
  const [currentUser, setCurrentUser] = useState<U | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");

  async function loadUsers() {
    setLoading(true);
    setErr("");

    try {
      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const text = await response.text();

      let result: any = {};

      if (text) {
        try {
          result = JSON.parse(text);
        } catch {
          result = {};
        }
      }

      if (!response.ok) {
        throw new Error(
          result.error || "Impossible de charger les utilisateurs."
        );
      }

      setUsers(result.users || []);
    } catch (error: any) {
      setErr(
        error?.message || "Impossible de charger les utilisateurs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (days !== "all") {
      const maxAge = Number(days) * 86400000;

      result = result.filter(
        (user) =>
          Date.now() - new Date(user.created_at).getTime() <= maxAge
      );
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((user) => {
        const name = (user.name || "").toLowerCase();
        const email = (user.email || "").toLowerCase();

        return name.includes(query) || email.includes(query);
      });
    }

    return result;
  }, [users, days, search]);

  const today = useMemo(() => {
    const todayString = new Date().toDateString();

    return users.filter(
      (user) =>
        new Date(user.created_at).toDateString() === todayString
    ).length;
  }, [users]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / perPage)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, days, perPage]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredUsers.slice(start, start + perPage);
  }, [filteredUsers, page, perPage]);

  const startResult =
    filteredUsers.length === 0 ? 0 : (page - 1) * perPage + 1;

  const endResult = Math.min(
    page * perPage,
    filteredUsers.length
  );

  const allPageSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((user) =>
      selected.includes(user.id)
    );

  function toggleSelect(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleSelectPage() {
    const pageIds = paginatedUsers.map((user) => user.id);

    if (allPageSelected) {
      setSelected((current) =>
        current.filter((id) => !pageIds.includes(id))
      );
    } else {
      setSelected((current) => [
        ...new Set([...current, ...pageIds]),
      ]);
    }
  }

  function openAdd() {
    setCurrentUser(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setErr("");
    setSuccess("");
    setModal("add");
  }

  function openEdit(user: U) {
    setCurrentUser(user);
    setFormName(user.name || "");
    setFormEmail(user.email || "");
    setFormPassword("");
    setErr("");
    setSuccess("");
    setModal("edit");
  }

  function openPassword(user: U) {
    setCurrentUser(user);
    setFormPassword("");
    setErr("");
    setSuccess("");
    setModal("password");
  }

  function closeModal() {
    if (actionLoading) return;

    setModal(null);
    setCurrentUser(null);
    setFormPassword("");
  }

  async function addUser() {
    setErr("");
    setSuccess("");

    if (!formEmail.trim()) {
      setErr("L'adresse e-mail est obligatoire.");
      return;
    }

    if (formPassword.length < 8) {
      setErr(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          password: formPassword,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          result.error || "Impossible de créer l'utilisateur."
        );
      }

      setModal(null);
      setSuccess("Utilisateur ajouté avec succès.");

      await loadUsers();
    } catch (error: any) {
      setErr(
        error?.message || "Impossible de créer l'utilisateur."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function editUser() {
    if (!currentUser) return;

    setErr("");
    setSuccess("");

    if (!formEmail.trim()) {
      setErr("L'adresse e-mail est obligatoire.");
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(
        `/api/admin/users/${currentUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formName.trim(),
            email: formEmail.trim().toLowerCase(),
          }),
        }
      );

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          result.error || "Modification impossible."
        );
      }

      setModal(null);
      setSuccess("Utilisateur modifié avec succès.");

      await loadUsers();
    } catch (error: any) {
      setErr(error?.message || "Modification impossible.");
    } finally {
      setActionLoading(false);
    }
  }

  async function changePassword() {
    if (!currentUser) return;

    setErr("");
    setSuccess("");

    if (formPassword.length < 8) {
      setErr(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(
        `/api/admin/users/${currentUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: formPassword,
          }),
        }
      );

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Impossible de modifier le mot de passe."
        );
      }

      setModal(null);
      setFormPassword("");

      setSuccess("Mot de passe modifié avec succès.");
    } catch (error: any) {
      setErr(
        error?.message ||
          "Impossible de modifier le mot de passe."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteUser(user: U) {
    const confirmation = window.confirm(
      `Supprimer définitivement ${user.email} ?`
    );

    if (!confirmation) return;

    setErr("");
    setSuccess("");
    setActionLoading(true);

    try {
      const response = await fetch(
        `/api/admin/users/${user.id}`,
        {
          method: "DELETE",
        }
      );

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          result.error || "Suppression impossible."
        );
      }

      setSelected((current) =>
        current.filter((id) => id !== user.id)
      );

      setSuccess("Utilisateur supprimé.");

      await loadUsers();
    } catch (error: any) {
      setErr(error?.message || "Suppression impossible.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteSelected() {
    if (selected.length === 0) return;

    const confirmation = window.confirm(
      `Supprimer définitivement ${selected.length} utilisateur(s) ?`
    );

    if (!confirmation) return;

    setErr("");
    setSuccess("");
    setActionLoading(true);

    try {
      for (const id of selected) {
        const response = await fetch(
          `/api/admin/users/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const text = await response.text();

          let result: any = {};

          try {
            result = text ? JSON.parse(text) : {};
          } catch {}

          throw new Error(
            result.error ||
              "Une suppression n'a pas pu être effectuée."
          );
        }
      }

      const count = selected.length;

      setSelected([]);

      setSuccess(
        `${count} utilisateur(s) supprimé(s) avec succès.`
      );

      await loadUsers();
    } catch (error: any) {
      setErr(error?.message || "Suppression impossible.");

      await loadUsers();
    } finally {
      setActionLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="admin">
      <header>
        <b className="logo">
          VisiteCard <i>Admin</i>
        </b>

        <button
          type="button"
          className="logout"
          onClick={logout}
        >
          Déconnexion
        </button>
      </header>

      <div className="wrapper">
        <div className="top">
          <div>
            <small>ADMINISTRATION</small>

            <h1>Tableau de bord</h1>

            <p>Gestion des inscriptions VisiteCard.</p>
          </div>

          <div className="topActions">
            <select
              value={days}
              onChange={(event) =>
                setDays(event.target.value)
              }
            >
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="90">90 jours</option>
              <option value="all">
                Toute la période
              </option>
            </select>

            <button
              type="button"
              className="addButton"
              onClick={openAdd}
            >
              + Ajouter
            </button>
          </div>
        </div>

        {err && (
          <div className="message error">
            {err}
          </div>
        )}

        {success && (
          <div className="message success">
            {success}
          </div>
        )}

        <section className="stats">
          <article>
            Total inscrits
            <strong>{users.length}</strong>
          </article>

          <article>
            Aujourd&apos;hui
            <strong>{today}</strong>
          </article>

          <article>
            Sur la période
            <strong>{filteredUsers.length}</strong>
          </article>
        </section>

        <section className="box">
          <div className="boxHeader">
            <div>
              <h2>Tous les inscrits</h2>

              <span className="subtitle">
                {filteredUsers.length} utilisateur(s)
              </span>
            </div>

            <div className="tools">
              <input
                className="search"
                type="search"
                placeholder="Rechercher nom ou e-mail..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {selected.length > 0 && (
                <button
                  type="button"
                  className="deleteSelected"
                  disabled={actionLoading}
                  onClick={deleteSelected}
                >
                  Supprimer ({selected.length})
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading">
              Chargement des utilisateurs...
            </div>
          ) : (
            <>
              <div className="table">
                <table>
                  <thead>
                    <tr>
                      <th className="checkColumn">
                        <input
                          type="checkbox"
                          checked={allPageSelected}
                          onChange={toggleSelectPage}
                          aria-label="Tout sélectionner"
                        />
                      </th>

                      <th>Nom</th>
                      <th>E-mail</th>
                      <th>Inscription</th>
                      <th>Carte</th>
                      <th className="actionsTitle">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={
                          selected.includes(user.id)
                            ? "selectedRow"
                            : ""
                        }
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(
                              user.id
                            )}
                            onChange={() =>
                              toggleSelect(user.id)
                            }
                            aria-label={`Sélectionner ${user.email}`}
                          />
                        </td>

                        <td>
                          <strong className="userName">
                            {user.name || "—"}
                          </strong>
                        </td>

                        <td>{user.email}</td>

                        <td>
                          {new Date(
                            user.created_at
                          ).toLocaleString("fr-FR")}
                        </td>

                        <td>
                          {user.card_slug ? (
                            <a
                              className="cardLink"
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

                        <td>
                          <div className="actions">
                            <button
                              type="button"
                              className="edit"
                              onClick={() =>
                                openEdit(user)
                              }
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              className="password"
                              onClick={() =>
                                openPassword(user)
                              }
                            >
                              Mot de passe
                            </button>

                            <button
                              type="button"
                              className="delete"
                              disabled={actionLoading}
                              onClick={() =>
                                deleteUser(user)
                              }
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {paginatedUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="empty"
                        >
                          Aucun utilisateur trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <div className="paginationInfo">
                  {startResult}–{endResult} sur{" "}
                  {filteredUsers.length}
                </div>

                <div className="paginationControls">
                  <label className="perPage">
                    Afficher

                    <select
                      value={perPage}
                      onChange={(event) =>
                        setPerPage(
                          Number(event.target.value)
                        )
                      }
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                  >
                    ‹
                  </button>

                  <span className="pageNumber">
                    Page {page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                      )
                    }
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {modal && (
        <div
          className="modalOverlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="modal">
            <div className="modalHeader">
              <div>
                <small>ADMINISTRATION</small>

                <h3>
                  {modal === "add" &&
                    "Ajouter un utilisateur"}

                  {modal === "edit" &&
                    "Modifier l'utilisateur"}

                  {modal === "password" &&
                    "Modifier le mot de passe"}
                </h3>
              </div>

              <button
                type="button"
                className="close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {modal === "add" && (
              <div className="modalForm">
                <label>
                  Nom
                  <input
                    value={formName}
                    onChange={(event) =>
                      setFormName(event.target.value)
                    }
                    placeholder="Nom"
                  />
                </label>

                <label>
                  Adresse e-mail
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(event) =>
                      setFormEmail(event.target.value)
                    }
                    placeholder="email@exemple.com"
                  />
                </label>

                <label>
                  Mot de passe
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(event) =>
                      setFormPassword(
                        event.target.value
                      )
                    }
                    placeholder="Minimum 8 caractères"
                  />
                </label>

                <button
                  type="button"
                  className="primary"
                  disabled={actionLoading}
                  onClick={addUser}
                >
                  {actionLoading
                    ? "Création..."
                    : "Créer l'utilisateur"}
                </button>
              </div>
            )}

            {modal === "edit" && (
              <div className="modalForm">
                <label>
                  Nom
                  <input
                    value={formName}
                    onChange={(event) =>
                      setFormName(event.target.value)
                    }
                  />
                </label>

                <label>
                  Adresse e-mail
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(event) =>
                      setFormEmail(event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="primary"
                  disabled={actionLoading}
                  onClick={editUser}
                >
                  {actionLoading
                    ? "Enregistrement..."
                    : "Enregistrer"}
                </button>
              </div>
            )}

            {modal === "password" && (
              <div className="modalForm">
                <p className="modalDescription">
                  Nouveau mot de passe pour{" "}
                  <strong>
                    {currentUser?.email}
                  </strong>
                </p>

                <label>
                  Nouveau mot de passe
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(event) =>
                      setFormPassword(
                        event.target.value
                      )
                    }
                    placeholder="Minimum 8 caractères"
                  />
                </label>

                <button
                  type="button"
                  className="primary"
                  disabled={actionLoading}
                  onClick={changePassword}
                >
                  {actionLoading
                    ? "Enregistrement..."
                    : "Modifier le mot de passe"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .admin {
          min-height: 100vh;
          background: #f7f7f8;
          font-family: Arial, sans-serif;
          color: #171717;
        }

        header {
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
          font-size: 18px;
        }

        header i,
        small,
        .cardLink {
          color: #ff6337;
          font-style: normal;
        }

        small {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        button,
        select,
        input {
          font-family: inherit;
        }

        button {
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .logout {
          padding: 10px 14px;
          border: 1px solid #dddddd;
          border-radius: 10px;
          background: #ffffff;
          font-weight: 800;
        }

        .wrapper {
          width: min(
            1180px,
            calc(100% - 30px)
          );
          margin: 35px auto;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
        }

        .top h1 {
          margin: 7px 0;
          font-size: 35px;
        }

        .top p {
          margin: 0;
          color: #777777;
        }

        .topActions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .top select,
        .perPage select {
          padding: 11px 12px;
          border: 1px solid #dddddd;
          border-radius: 11px;
          background: #ffffff;
        }

        .addButton {
          padding: 12px 17px;
          border: 0;
          border-radius: 11px;
          background: #ff6337;
          color: #ffffff;
          font-weight: 900;
        }

        .stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 16px;
          margin: 25px 0;
        }

        .stats article,
        .box {
          background: #ffffff;
          border: 1px solid #e8e8ea;
          border-radius: 18px;
          padding: 22px;
        }

        .stats article {
          color: #777777;
          font-size: 13px;
        }

        .stats strong {
          display: block;
          margin-top: 12px;
          color: #111111;
          font-size: 35px;
        }

        .message {
          margin-top: 18px;
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

        .boxHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .boxHeader h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .subtitle {
          color: #888888;
          font-size: 12px;
        }

        .tools {
          display: flex;
          gap: 10px;
        }

        .search {
          width: 260px;
          padding: 11px 13px;
          border: 1px solid #dddddd;
          border-radius: 11px;
          outline: none;
        }

        .search:focus {
          border-color: #ff6337;
        }

        .deleteSelected {
          padding: 11px 14px;
          border: 1px solid #f1c3c3;
          border-radius: 10px;
          background: #fff4f4;
          color: #b42323;
          font-weight: 800;
        }

        .table {
          overflow: auto;
        }

        table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 14px 10px;
          border-bottom: 1px solid #eeeeee;
          text-align: left;
          font-size: 13px;
        }

        th {
          color: #777777;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .checkColumn {
          width: 40px;
        }

        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #ff6337;
        }

        .selectedRow {
          background: #fff8f5;
        }

        .userName {
          color: #222222;
        }

        .cardLink {
          font-weight: 800;
          text-decoration: none;
        }

        .actionsTitle {
          text-align: right;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .actions button {
          padding: 8px 9px;
          border-radius: 8px;
          background: #ffffff;
          font-size: 11px;
          font-weight: 800;
        }

        .edit {
          border: 1px solid #dddddd;
          color: #333333;
        }

        .password {
          border: 1px solid #ffd8ca;
          color: #d94d1e;
        }

        .delete {
          border: 1px solid #f1c3c3;
          color: #b42323;
        }

        .empty,
        .loading {
          padding: 40px;
          color: #888888;
          text-align: center;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #eeeeee;
        }

        .paginationInfo {
          color: #777777;
          font-size: 12px;
        }

        .paginationControls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .perPage {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-right: 8px;
          color: #777777;
          font-size: 12px;
        }

        .paginationControls > button {
          min-width: 38px;
          height: 38px;
          border: 1px solid #dddddd;
          border-radius: 9px;
          background: #ffffff;
          font-size: 18px;
        }

        .pageNumber {
          padding: 0 7px;
          font-size: 12px;
          font-weight: 800;
        }

        .modalOverlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.45);
        }

        .modal {
          width: 100%;
          max-width: 470px;
          padding: 26px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow:
            0 25px 80px
            rgba(0, 0, 0, 0.2);
        }

        .modalHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .modalHeader h3 {
          margin: 6px 0 0;
          font-size: 22px;
        }

        .close {
          width: 34px;
          height: 34px;
          border: 1px solid #eeeeee;
          border-radius: 9px;
          background: #f7f7f8;
          font-size: 22px;
        }

        .modalForm {
          display: grid;
          gap: 17px;
        }

        .modalForm label {
          display: grid;
          gap: 8px;
          font-size: 12px;
          font-weight: 800;
        }

        .modalForm input {
          width: 100%;
          padding: 13px;
          border: 1px solid #dddddd;
          border-radius: 11px;
          outline: none;
          font-size: 14px;
        }

        .modalForm input:focus {
          border-color: #ff6337;
          box-shadow:
            0 0 0 3px
            rgba(255, 99, 55, 0.08);
        }

        .modalDescription {
          margin: 0;
          color: #777777;
          font-size: 13px;
          line-height: 1.5;
        }

        .primary {
          margin-top: 4px;
          padding: 13px;
          border: 0;
          border-radius: 11px;
          background: #ff6337;
          color: #ffffff;
          font-weight: 900;
        }

        @media (max-width: 800px) {
          .stats {
            grid-template-columns: 1fr;
          }

          .top {
            display: grid;
          }

          .topActions {
            width: 100%;
          }

          .topActions select,
          .addButton {
            flex: 1;
          }

          .boxHeader {
            align-items: stretch;
            flex-direction: column;
          }

          .tools {
            width: 100%;
          }

          .search {
            width: 100%;
            flex: 1;
          }

          .pagination {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 520px) {
          header {
            height: 64px;
            padding: 0 15px;
          }

          .wrapper {
            margin-top: 24px;
          }

          .top h1 {
            font-size: 28px;
          }

          .topActions {
            flex-direction: column;
          }

          .topActions select,
          .addButton {
            width: 100%;
          }

          .tools {
            flex-direction: column;
          }

          .deleteSelected {
            width: 100%;
          }

          .box,
          .stats article {
            padding: 17px;
          }

          .modal {
            padding: 21px;
          }

          .paginationControls {
            width: 100%;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}
