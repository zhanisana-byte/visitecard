"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LinkedCompany = { id: string; position_title: string; company_card_id: string; company_name: string; company_slug: string | null; company_photo_url: string | null };
type User = {
  id: string; email: string; name: string; created_at: string; card_id: string | null; card_slug: string | null;
  entity_type: "profile" | "company"; job_title: string; company: string; photo_url: string | null; is_public: boolean; linked_companies: LinkedCompany[];
};
type Tab = "all" | "profile" | "company";
type Modal = "add" | "edit" | "password" | "links" | "siteShare" | null;

function isValidEmail(value: string) {
  const email = value.trim();
  if (!email) return false;
  if (/[^\x00-\x7F]/.test(email)) return false;
  if (email.toLowerCase().includes("xn--")) return false;
  return /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(email);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [days, setDays] = useState("30");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [current, setCurrent] = useState<User | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formType, setFormType] = useState<"profile" | "company">("profile");
  const [siteTitle, setSiteTitle] = useState("VisiteCard — Votre carte de visite digitale");
  const [siteDescription, setSiteDescription] = useState("Regroupez vos coordonnées, réseaux sociaux et liens professionnels dans une seule carte digitale.");
  const [siteImage, setSiteImage] = useState("");

  async function loadUsers() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Chargement impossible.");
      setUsers(data.users || []);
    } catch (e: any) { setError(e?.message || "Chargement impossible."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadUsers(); }, []);
  useEffect(() => { setPage(1); }, [tab, days, search, perPage]);

  const isToday = (date: string) => new Date(date).toDateString() === new Date().toDateString();
  const profiles = users.filter(u => u.entity_type === "profile");
  const companies = users.filter(u => u.entity_type === "company");
  const profilesToday = profiles.filter(u => isToday(u.created_at)).length;
  const companiesToday = companies.filter(u => isToday(u.created_at)).length;
  const linksTotal = profiles.reduce((sum, u) => sum + u.linked_companies.length, 0);

  const filtered = useMemo(() => users.filter(u => {
    if (tab !== "all" && u.entity_type !== tab) return false;
    if (days !== "all" && Date.now() - new Date(u.created_at).getTime() > Number(days) * 86400000) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${u.name} ${u.email} ${u.job_title} ${u.company}`.toLowerCase().includes(q);
  }), [users, tab, days, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  function openAdd(type: "profile" | "company" = "profile") { setCurrent(null); setFormName(""); setFormEmail(""); setFormPassword(""); setFormType(type); setModal("add"); setError(""); setSuccess(""); }
  function openEdit(u: User) { setCurrent(u); setFormName(u.name); setFormEmail(u.email); setModal("edit"); setError(""); }
  function openPassword(u: User) { setCurrent(u); setFormPassword(""); setModal("password"); setError(""); }
  function openLinks(u: User) { setCurrent(u); setModal("links"); }
  function closeModal() { if (!actionLoading) { setModal(null); setCurrent(null); setFormPassword(""); } }

  async function createUser() {
    const cleanEmail = formEmail.trim();
    if (!cleanEmail) return setError("E-mail obligatoire.");
    if (!isValidEmail(cleanEmail)) return setError("Adresse e-mail incorrecte. Vérifiez chaque lettre.");
    if (formPassword.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    setActionLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: formName.trim(), email: cleanEmail, password: formPassword, entity_type: formType }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error || "Création impossible.");
      setModal(null); setSuccess(formType === "profile" ? "Profil créé avec succès." : "Société créée avec succès."); await loadUsers();
    } catch (e: any) { setError(e?.message || "Création impossible."); } finally { setActionLoading(false); }
  }

  async function updateUser(payload: Record<string, string>, message: string) {
    if (!current) return;
    setActionLoading(true); setError("");
    try {
      const r = await fetch(`/api/admin/users/${current.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error || "Modification impossible.");
      setModal(null); setSuccess(message); await loadUsers();
    } catch (e: any) { setError(e?.message || "Modification impossible."); } finally { setActionLoading(false); }
  }

  async function saveEdit() {
    if (!current) return;
    const cleanEmail = formEmail.trim();
    if (!cleanEmail) return setError("E-mail obligatoire.");
    if (!isValidEmail(cleanEmail)) return setError("Adresse e-mail incorrecte. Vérifiez chaque lettre.");
    await updateUser(
      { name: formName.trim(), email: cleanEmail },
      "Compte modifié avec succès. Le QR code reste inchangé."
    );
  }

  async function deleteUser(u: User) {
    if (!window.confirm(`Supprimer définitivement ${u.email} ?`)) return;
    setActionLoading(true); setError("");
    try {
      const r = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" }); const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Suppression impossible."); setSuccess("Compte supprimé."); await loadUsers();
    } catch (e: any) { setError(e?.message || "Suppression impossible."); } finally { setActionLoading(false); }
  }

  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }

  return <main className="admin">
    <header><div className="brand"><img src="/logo.png" alt="VisiteCard"/><span>Admin</span></div><button onClick={logout}>Déconnexion</button></header>
    <div className="wrap">
      <section className="hero"><div><small>ADMINISTRATION</small><h1>Tableau de bord</h1><p>Profils, sociétés et comptes VisiteCard.</p></div><div className="heroActions"><button onClick={()=>{setModal("siteShare");setError("");setSuccess("")}}>Partage du site</button><select value={days} onChange={e=>setDays(e.target.value)}><option value="7">7 jours</option><option value="30">30 jours</option><option value="90">90 jours</option><option value="all">Toute la période</option></select><button className="primary" onClick={()=>openAdd(tab === "company" ? "company" : "profile")}>+ Ajouter</button></div></section>
      {error && <div className="alert error">{error}</div>}{success && <div className="alert success">{success}</div>}
      <section className="stats">
        <article><span>Total comptes</span><strong>{users.length}</strong><em>{users.filter(u=>isToday(u.created_at)).length} aujourd’hui</em></article>
        <article className="violet"><span>Profils</span><strong>{profiles.length}</strong><em>+ {profilesToday} aujourd’hui</em></article>
        <article className="blue"><span>Sociétés</span><strong>{companies.length}</strong><em>+ {companiesToday} aujourd’hui</em></article>
        <article className="green"><span>Sociétés liées</span><strong>{linksTotal}</strong><em>liaisons profil ↔ société</em></article>
      </section>
      <section className="panel">
        <div className="tabs"><button className={tab==="all"?"active":""} onClick={()=>setTab("all")}>Tous <b>{users.length}</b></button><button className={tab==="profile"?"active":""} onClick={()=>setTab("profile")}>Profils <b>{profiles.length}</b></button><button className={tab==="company"?"active":""} onClick={()=>setTab("company")}>Sociétés <b>{companies.length}</b></button></div>
        <div className="toolbar"><div><h2>{tab === "profile" ? "Profils inscrits" : tab === "company" ? "Sociétés inscrites" : "Tous les inscrits"}</h2><span>{filtered.length} résultat(s)</span></div><input type="search" placeholder="Rechercher nom, e-mail, activité..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        {loading ? <div className="empty">Chargement...</div> : <div className="tableWrap"><table><thead><tr><th>Compte</th><th>Type</th><th>E-mail</th><th>Inscription</th><th>État</th><th>Sociétés liées</th><th>Actions</th></tr></thead><tbody>{rows.map(u=><tr key={u.id}><td><div className="identity">{u.photo_url?<img src={u.photo_url} alt=""/>:<div className="avatar">{(u.name||u.email).slice(0,1).toUpperCase()}</div>}<div><strong>{u.name||"Sans nom"}</strong><span>{u.entity_type==="profile" ? u.job_title||"Profil" : u.job_title||u.company||"Société"}</span></div></div></td><td><span className={`type ${u.entity_type}`}>{u.entity_type==="profile"?"Profil":"Société"}</span></td><td className="email">{u.email}</td><td>{new Date(u.created_at).toLocaleDateString("fr-FR")}<small>{new Date(u.created_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</small></td><td><span className={u.is_public?"status public":"status private"}>{u.is_public?"Publique":"Privée"}</span></td><td>{u.entity_type==="profile"?<button className="linkCount" onClick={()=>openLinks(u)}>{u.linked_companies.length} société{u.linked_companies.length!==1?"s":""}</button>:<span className="muted">—</span>}</td><td><div className="actions">{u.card_slug&&<a href={`/${u.card_slug}`} target="_blank" rel="noreferrer">Voir</a>}<button onClick={()=>openEdit(u)}>Modifier</button><button onClick={()=>openPassword(u)}>Mot de passe</button><button className="danger" disabled={actionLoading} onClick={()=>deleteUser(u)}>Supprimer</button></div></td></tr>)}{rows.length===0&&<tr><td colSpan={7} className="empty">Aucun résultat.</td></tr>}</tbody></table></div>}
        <div className="pagination"><span>{filtered.length ? (page-1)*perPage+1 : 0}–{Math.min(page*perPage,filtered.length)} sur {filtered.length}</span><div><select value={perPage} onChange={e=>setPerPage(Number(e.target.value))}><option value={10}>10 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option></select><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>‹</button><b>{page} / {totalPages}</b><button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>›</button></div></div>
      </section>
    </div>
    {modal&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)closeModal()}}><div className="modal"><button className="close" onClick={closeModal}>×</button>{modal==="siteShare"&&<><small>RÉFÉRENCEMENT & PARTAGE</small><h3>Aperçu de visitecard.com</h3><p className="modalText">Ces informations servent à l’aperçu du lien principal VisiteCard sur Facebook, WhatsApp, Messenger, LinkedIn et autres plateformes.</p><label>Titre du site<input value={siteTitle} onChange={e=>setSiteTitle(e.target.value)} maxLength={70} placeholder="VisiteCard — Votre carte de visite digitale"/></label><label>Description<textarea value={siteDescription} onChange={e=>setSiteDescription(e.target.value)} maxLength={180} placeholder="Description affichée lors du partage..."/></label><label>Image de partage<input value={siteImage} onChange={e=>setSiteImage(e.target.value)} placeholder="https://.../image.jpg"/></label><p className="modalText">Format conseillé : <b>1200 × 630 px</b>. Utilisez une URL publique HTTPS.</p><div className="sharePreview">{siteImage?<img src={siteImage} alt="Aperçu de partage"/>:<div className="shareImageEmpty">1200 × 630</div>}<div><small>VISITECARD.COM</small><strong>{siteTitle||"Titre du site"}</strong><span>{siteDescription||"Description du site"}</span></div></div><button className="save" onClick={()=>{setSuccess("Interface prête. Pour enregistrer réellement ces valeurs et les appliquer aux métadonnées de visitecard.com, connectez ce formulaire à votre route de paramètres du site.");setModal(null)}}>Enregistrer</button></>}{modal==="add"&&<><small>NOUVEAU COMPTE</small><h3>Ajouter {formType==="profile"?"un profil":"une société"}</h3><div className="typeChoice"><button className={formType==="profile"?"chosen":""} onClick={()=>setFormType("profile")}>Profil</button><button className={formType==="company"?"chosen":""} onClick={()=>setFormType("company")}>Société</button></div><label>Nom<input value={formName} onChange={e=>setFormName(e.target.value)}/></label><label>E-mail<input type="email" value={formEmail} onChange={e=>setFormEmail(e.target.value)}/></label><label>Mot de passe<input type="password" value={formPassword} onChange={e=>setFormPassword(e.target.value)} placeholder="8 caractères minimum"/></label><button className="save" disabled={actionLoading} onClick={createUser}>{actionLoading?"Création...":"Créer le compte"}</button></>}
      {modal==="edit"&&current&&<><small>COMPTE</small><h3>Modifier {current.entity_type==="profile"?"le profil":"la société"}</h3><label>Nom<input value={formName} onChange={e=>setFormName(e.target.value)}/></label><label>E-mail de connexion<input type="text" inputMode="email" autoComplete="email" value={formEmail} onChange={e=>setFormEmail(e.target.value)}/></label><p className="modalText">La modification de l’e-mail ne change ni le QR code ni l’URL publique de la carte.</p><button className="save" disabled={actionLoading} onClick={saveEdit}>{actionLoading?"Enregistrement...":"Enregistrer"}</button></>}
      {modal==="password"&&current&&<><small>SÉCURITÉ</small><h3>Nouveau mot de passe</h3><p className="modalText">{current.name||current.email}<br/><b>{current.email}</b></p><label>Nouveau mot de passe<input type="password" value={formPassword} onChange={e=>setFormPassword(e.target.value)} placeholder="8 caractères minimum"/></label><button className="save" disabled={actionLoading||formPassword.length<8} onClick={()=>updateUser({password:formPassword},"Mot de passe modifié avec succès.")}>{actionLoading?"Modification...":"Modifier le mot de passe"}</button></>}
      {modal==="links"&&current&&<><small>PROFIL</small><h3>Sociétés liées à {current.name||"ce profil"}</h3><div className="linkedList">{current.linked_companies.map(c=><div className="linked" key={c.id}>{c.company_photo_url?<img src={c.company_photo_url} alt=""/>:<div className="companyIcon">S</div>}<div><strong>{c.company_name}</strong><span>{c.position_title||"Société liée"}</span></div>{c.company_slug&&<a href={`/${c.company_slug}`} target="_blank" rel="noreferrer">Voir ↗</a>}</div>)}{current.linked_companies.length===0&&<div className="emptyMini">Aucune société liée à ce profil.</div>}</div></>}
      {error&&<div className="modalError">{error}</div>}</div></div>}
    <style jsx>{`
      *{box-sizing:border-box}.admin{display:block!important;min-height:100vh!important;height:auto!important;background:#f6f7fb;color:#151823;font-family:Arial,sans-serif;padding:0!important;margin:0!important;align-items:initial!important;justify-content:initial!important;place-items:initial!important}header{height:72px;background:#fff;border-bottom:1px solid #e8eaf0;display:flex;align-items:center;justify-content:space-between;padding:0 max(24px,calc((100vw - 1440px)/2));position:sticky;top:0;z-index:10}.brand{display:flex;align-items:center;gap:12px}.brand img{width:150px;max-height:42px;object-fit:contain}.brand span{font-size:11px;font-weight:900;background:#171b27;color:#fff;padding:6px 9px;border-radius:8px}header>button{border:1px solid #e1e4eb;background:#fff;padding:10px 14px;border-radius:10px;font-weight:700;cursor:pointer}.wrap{display:block!important;width:100%;max-width:1440px;margin:0 auto!important;padding:28px 24px 60px!important;min-height:0!important;height:auto!important;transform:none!important}.hero{display:flex!important;position:relative!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;justify-content:space-between;gap:20px;align-items:flex-end;transform:none!important}.hero small,.modal small{color:#6d4aff;font-weight:900;letter-spacing:.18em}.hero h1{font-size:34px;margin:7px 0}.hero p{margin:0;color:#747986}.heroActions{display:flex;gap:10px}.heroActions select,.heroActions button{height:42px;border-radius:10px;border:1px solid #dfe2ea;background:#fff;padding:0 14px}.primary,.save{background:#6d4aff!important;color:#fff!important;border-color:#6d4aff!important;font-weight:800;cursor:pointer}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:28px 0}.stats article{background:#fff;border:1px solid #e7e9ef;border-radius:17px;padding:20px;display:flex;flex-direction:column;gap:8px}.stats span{font-size:13px;color:#777d89;font-weight:700}.stats strong{font-size:32px}.stats em{font-size:12px;font-style:normal;color:#838896}.stats .violet{border-top:3px solid #6d4aff}.stats .blue{border-top:3px solid #2b7fff}.stats .green{border-top:3px solid #20a46b}.alert{padding:12px 15px;border-radius:11px;margin-top:18px;font-size:13px;font-weight:700}.alert.error,.modalError{background:#fff0f1;color:#b42332}.alert.success{background:#eafaf2;color:#137a4c}.panel{background:#fff;border:1px solid #e6e8ef;border-radius:18px;overflow:hidden}.tabs{display:flex;border-bottom:1px solid #e9ebf1;padding:0 20px}.tabs button{border:0;background:transparent;padding:17px 16px;color:#747986;font-weight:800;cursor:pointer;border-bottom:2px solid transparent}.tabs button.active{color:#6d4aff;border-color:#6d4aff}.tabs b{background:#f0efff;border-radius:20px;padding:3px 7px;margin-left:5px;font-size:11px}.toolbar{display:flex;align-items:center;justify-content:space-between;padding:20px}.toolbar h2{margin:0 0 4px;font-size:18px}.toolbar span{font-size:12px;color:#858a96}.toolbar input{width:min(390px,45vw);height:42px;border:1px solid #dfe2e9;border-radius:11px;padding:0 13px;outline:none}.tableWrap{overflow:auto;border-top:1px solid #eef0f4}table{width:100%;border-collapse:collapse;min-width:1100px}th{text-align:left;background:#fafbfc;color:#737987;font-size:11px;text-transform:uppercase;letter-spacing:.05em;padding:12px 14px}td{padding:14px;border-top:1px solid #eff1f5;font-size:13px;vertical-align:middle}.identity{display:flex;align-items:center;gap:10px;min-width:190px}.identity img,.avatar{width:38px;height:38px;border-radius:50%;object-fit:cover}.avatar{display:grid;place-items:center;background:#efedff;color:#6d4aff;font-weight:900}.identity div div{display:flex;flex-direction:column}.identity strong{display:block}.identity span,td small{display:block;color:#8a8f99;font-size:11px;margin-top:3px}.type,.status{display:inline-flex;padding:5px 8px;border-radius:20px;font-size:11px;font-weight:800}.type.profile{background:#f0edff;color:#6845e8}.type.company{background:#eaf3ff;color:#1e6bc9}.status.public{background:#e8f8ef;color:#18774c}.status.private{background:#f0f1f3;color:#70757e}.email{max-width:210px;overflow:hidden;text-overflow:ellipsis}.linkCount{border:0;background:#f1efff;color:#6744db;padding:7px 9px;border-radius:9px;font-weight:800;cursor:pointer}.muted{color:#aaa}.actions{display:flex;gap:6px;white-space:nowrap}.actions a,.actions button{border:1px solid #e0e3e9;background:#fff;color:#343844;padding:7px 9px;border-radius:8px;text-decoration:none;font-size:11px;font-weight:700;cursor:pointer}.actions .danger{color:#b52635}.empty{text-align:center!important;padding:50px!important;color:#858a95}.pagination{display:flex;justify-content:space-between;align-items:center;padding:15px 20px;border-top:1px solid #eef0f4;font-size:12px;color:#777}.pagination>div{display:flex;align-items:center;gap:8px}.pagination select,.pagination button{height:34px;border:1px solid #dfe2e9;background:#fff;border-radius:8px;padding:0 9px}.overlay{position:fixed;inset:0;background:rgba(10,13,20,.55);z-index:50;display:grid;place-items:center;padding:20px}.modal{width:min(520px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:26px;position:relative;box-shadow:0 25px 80px rgba(0,0,0,.25)}.close{position:absolute;right:16px;top:13px;border:0;background:#f3f4f6;width:34px;height:34px;border-radius:50%;font-size:22px;cursor:pointer}.modal h3{font-size:23px;margin:7px 0 20px}.modal label{display:block;font-size:12px;font-weight:800;margin:13px 0}.modal label input{display:block;width:100%;height:44px;border:1px solid #dfe2e9;border-radius:10px;padding:0 12px;margin-top:7px}.modal label textarea{display:block;width:100%;min-height:100px;resize:vertical;border:1px solid #dfe2e9;border-radius:10px;padding:12px;margin-top:7px;font:inherit}.sharePreview{border:1px solid #e2e5ec;border-radius:14px;overflow:hidden;margin:18px 0;background:#f8f9fb}.sharePreview>img,.shareImageEmpty{width:100%;aspect-ratio:1200/630;object-fit:cover;background:#eef0f4}.shareImageEmpty{display:grid;place-items:center;color:#9499a4;font-weight:800}.sharePreview>div:last-child{padding:12px}.sharePreview small,.sharePreview strong,.sharePreview span{display:block}.sharePreview strong{font-size:15px;margin:5px 0}.sharePreview span{font-size:12px;color:#747986;line-height:1.45}.save{width:100%;height:45px;border:0;border-radius:11px;margin-top:10px}.typeChoice{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}.typeChoice button{height:42px;border:1px solid #dddfe7;background:#fff;border-radius:10px;font-weight:800}.typeChoice .chosen{border-color:#6d4aff;background:#f1efff;color:#6d4aff}.modalText{color:#777;font-size:13px;line-height:1.6}.linkedList{display:flex;flex-direction:column;gap:9px}.linked{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:11px;border:1px solid #e8eaf0;padding:10px;border-radius:12px}.linked img,.companyIcon{width:42px;height:42px;border-radius:10px;object-fit:cover}.companyIcon{display:grid;place-items:center;background:#eef0ff;color:#6d4aff;font-weight:900}.linked strong,.linked span{display:block}.linked span{font-size:11px;color:#858a95;margin-top:4px}.linked a{font-size:11px;color:#6d4aff;text-decoration:none;font-weight:800}.emptyMini{text-align:center;padding:30px;color:#888}.modalError{margin-top:12px;padding:10px;border-radius:9px;font-size:12px}.error{color:#b42332}
      @media(max-width:900px){.stats{grid-template-columns:1fr 1fr}.hero{align-items:flex-start;flex-direction:column}.toolbar{align-items:flex-start;gap:12px;flex-direction:column}.toolbar input{width:100%}}
      @media(max-width:560px){header{padding:0 15px}.brand img{width:120px}.wrap{padding:20px 12px 40px!important}.stats{grid-template-columns:1fr 1fr;gap:8px}.stats article{padding:14px}.stats strong{font-size:25px}.hero h1{font-size:28px}.heroActions{width:100%}.heroActions select,.heroActions button{flex:1}.tabs{overflow:auto;padding:0 8px}.pagination{gap:10px;align-items:flex-start;flex-direction:column}}
    `}</style>
  </main>;
}
