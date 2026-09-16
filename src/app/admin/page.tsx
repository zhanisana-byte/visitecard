"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/app/lib/supabase";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  card_slug: string | null;
};

type Period = "7" | "30" | "90" | "all";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [period, setPeriod] = useState<Period>("30");
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function adminApi(url: string, init?: RequestInit) {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      router.replace("/admin/login");
      throw new Error("AUTH_REDIRECT");
    }

    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      await supabase.auth.signOut();
      router.replace("/admin/login");
      throw new Error("AUTH_REDIRECT");
    }

    if (!response.ok) {
      throw new Error(result.error || "Une erreur est survenue.");
    }

    return result;
  }

  useEffect(() => {
    async function load() {
      try {
        const result = await adminApi("/api/admin/users");
        setUsers(result.users || []);
        setAdminEmail(result.adminEmail || "");
        setNewEmail(result.adminEmail || "");
      } catch (err: any) {
        if (err?.message !== "AUTH_REDIRECT") {
          setError(err?.message || "Impossible de charger l'administration.");
        }
      } finally {
        setChecking(false);
      }
    }
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    if (period === "all") return users;
    const start = Date.now() - Number(period) * 86400000;
    return users.filter((u) => new Date(u.created_at).getTime() >= start);
  }, [users, period]);

  const todayCount = useMemo(() => {
    const today = new Date();
    return users.filter((u) => {
      const d = new Date(u.created_at);
      return d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
    }).length;
  }, [users]);

  const dailyStats = useMemo(() => {
    const map = new Map<string, number>();
    filteredUsers.forEach((u) => {
      const date = new Date(u.created_at).toLocaleDateString("fr-FR");
      map.set(date, (map.get(date) || 0) + 1);
    });
    return Array.from(map.entries()).reverse();
  }, [filteredUsers]);

  async function changeEmail(event: FormEvent) {
    event.preventDefault();
    setError(""); setSuccess(""); setSavingEmail(true);
    try {
      const result = await adminApi("/api/admin/account", {
        method: "PATCH",
        body: JSON.stringify({ email: newEmail.trim().toLowerCase() }),
      });
      setAdminEmail(result.email || newEmail);
      setNewEmail(result.email || newEmail);
      setSuccess("E-mail administrateur modifié.");
    } catch (err: any) {
      if (err?.message !== "AUTH_REDIRECT") setError(err?.message || "Modification impossible.");
    } finally { setSavingEmail(false); }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setError(""); setSuccess("");
    if (newPassword.length < 8) return setError("8 caractères minimum.");
    if (newPassword !== confirmPassword) return setError("Les mots de passe sont différents.");
    setSavingPassword(true);
    try {
      await adminApi("/api/admin/account", {
        method: "PATCH",
        body: JSON.stringify({ password: newPassword }),
      });
      setNewPassword(""); setConfirmPassword("");
      setSuccess("Mot de passe administrateur modifié.");
    } catch (err: any) {
      if (err?.message !== "AUTH_REDIRECT") setError(err?.message || "Modification impossible.");
    } finally { setSavingPassword(false); }
  }

  async function logout() {
    await getSupabaseBrowser().auth.signOut();
    router.replace("/admin/login");
  }

  if (checking) {
    return <main className="checking">Vérification de l'accès...</main>;
  }

  return (
    <main className="adminPage">
      <header>
        <b>VisiteCard <i>Admin</i></b>
        <div><span>{adminEmail}</span><button onClick={logout}>Déconnexion</button></div>
      </header>

      <div className="wrap">
        <section className="top">
          <div><small>ADMINISTRATION</small><h1>Tableau de bord</h1><p>Suivez les inscriptions et gérez votre compte administrateur.</p></div>
          <select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="all">Toute la période</option>
          </select>
        </section>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <section className="stats">
          <article><span>Total inscrits</span><strong>{users.length}</strong></article>
          <article><span>Inscrits aujourd'hui</span><strong>{todayCount}</strong></article>
          <article><span>Sur la période</span><strong>{filteredUsers.length}</strong></article>
        </section>

        <section className="box">
          <h2>Inscriptions par jour</h2>
          {dailyStats.length ? dailyStats.map(([date,count]) => (
            <div className="day" key={date}>
              <span>{date}</span>
              <em><i style={{width:`${Math.max(8,Math.min(100,count*12))}%`}} /></em>
              <b>{count}</b>
            </div>
          )) : <p className="muted">Aucune inscription sur cette période.</p>}
        </section>

        <section className="box">
          <h2>Tous les inscrits</h2>
          <p className="muted">{filteredUsers.length} compte(s) affiché(s)</p>
          <div className="table">
            <table>
              <thead><tr><th>Nom</th><th>E-mail</th><th>Inscription</th><th>Carte</th></tr></thead>
              <tbody>{filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name || "—"}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.created_at).toLocaleString("fr-FR")}</td>
                  <td>{u.card_slug ? <a href={`/${u.card_slug}`} target="_blank" rel="noreferrer">Voir</a> : "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        <div className="securityTitle"><small>SÉCURITÉ</small><h2>Compte administrateur</h2></div>

        <section className="forms">
          <form className="box" onSubmit={changeEmail}>
            <h2>Changer l'e-mail</h2>
            <label>E-mail actuel<input value={adminEmail} disabled /></label>
            <label>Nouvel e-mail<input type="email" value={newEmail} onChange={(e)=>setNewEmail(e.target.value)} required /></label>
            <button disabled={savingEmail}>{savingEmail ? "Modification..." : "Modifier l'e-mail"}</button>
          </form>

          <form className="box" onSubmit={changePassword}>
            <h2>Changer le mot de passe</h2>
            <label>Nouveau mot de passe<input type="password" minLength={8} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required /></label>
            <label>Confirmer<input type="password" minLength={8} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required /></label>
            <button disabled={savingPassword}>{savingPassword ? "Modification..." : "Modifier le mot de passe"}</button>
          </form>
        </section>
      </div>

      <style jsx>{`
        *{box-sizing:border-box}.checking{min-height:100vh;display:grid;place-items:center;font-family:Arial;background:#f7f7f8}.adminPage{min-height:100vh;background:#f7f7f8;color:#171717;font-family:Arial,sans-serif}header{height:72px;background:#fff;border-bottom:1px solid #e8e8e8;display:flex;justify-content:space-between;align-items:center;padding:0 max(20px,calc((100vw - 1180px)/2))}header b{font-size:21px}header i,small,a{color:#ff6337;font-style:normal}header div{display:flex;align-items:center;gap:14px;font-size:12px}header button{background:#fff;border:1px solid #ddd}.wrap{width:min(1180px,calc(100% - 30px));margin:35px auto 70px}.top{display:flex;justify-content:space-between;align-items:end;gap:20px}.top h1{font-size:35px;margin:7px 0}.top p,.muted{color:#777}.top select,input{border:1px solid #ddd;background:#fff;border-radius:11px;padding:12px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:25px 0}.stats article,.box{background:#fff;border:1px solid #e8e8ea;border-radius:18px;padding:22px}.stats article span{color:#777;font-size:13px}.stats strong{display:block;font-size:35px;margin-top:12px}.box{margin-top:17px}.box h2{margin:0 0 17px}.day{display:grid;grid-template-columns:100px 1fr 35px;gap:15px;align-items:center;margin:12px 0;font-size:13px}.day em{height:9px;background:#eee;border-radius:100px;overflow:hidden}.day em i{display:block;height:100%;background:#ff6337}.table{overflow:auto}table{width:100%;min-width:720px;border-collapse:collapse}th,td{text-align:left;padding:14px 10px;border-bottom:1px solid #eee;font-size:13px}th{font-size:11px;color:#777}.securityTitle{margin-top:42px}.forms{display:grid;grid-template-columns:1fr 1fr;gap:17px}.forms form{display:grid;gap:14px}.forms label{display:grid;gap:7px;font-size:12px;font-weight:800}.forms input{width:100%}.forms button{border:0;border-radius:11px;padding:13px;background:#ff6337;color:#fff;font-weight:900;cursor:pointer}.alert{margin-top:18px;padding:13px 15px;border-radius:11px}.error{background:#fff0f0;color:#a21818}.success{background:#effaf3;color:#176b38}@media(max-width:760px){header{padding:0 15px}header span{display:none}.wrap{width:calc(100% - 20px);margin-top:22px}.top{flex-direction:column;align-items:stretch}.top h1{font-size:28px}.stats,.forms{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}
