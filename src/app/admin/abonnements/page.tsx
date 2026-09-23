"use client";

import { useEffect, useMemo, useState } from "react";

type CardInfo = {
  id: string; full_name?: string; company?: string; email?: string; phone?: string;
  entity_type?: "profile"|"company"; slug?: string;
};
type Subscription = {
  id:string; user_id:string; card_id:string; account_type:"profile"|"company";
  status:"startup"|"active"|"included"|"pending"|"expired"|"cancelled";
  plan_code:string; currency:string; price_ht:number; tax_rate:number;
  start_date:string; end_date:string|null; startup_months:number; auto_renew:boolean;
  referrer_name:string|null; referrer_code:string|null; payment_method:string|null;
  payment_reference:string|null; included_via_card_id:string|null; notes:string|null;
  card:CardInfo|null; included_via:CardInfo|null;
};
const labels:any={startup:"Démarrage",active:"Actif",included:"Inclus",pending:"En attente",expired:"Expiré",cancelled:"Annulé"};
const money=(n:number,c:string)=>new Intl.NumberFormat("fr-FR",{style:"currency",currency:c||"TND"}).format(Number(n||0));
const date=(v?:string|null)=>v?new Intl.DateTimeFormat("fr-FR").format(new Date(v)):"—";

export default function AdminSubscriptionsPage(){
  const [items,setItems]=useState<Subscription[]>([]);
  const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [q,setQ]=useState(""); const [currency,setCurrency]=useState("all"); const [status,setStatus]=useState("all");
  const [type,setType]=useState("all"); const [current,setCurrent]=useState<Subscription|null>(null);
  const [form,setForm]=useState<any>({}); const [saving,setSaving]=useState(false);

  async function load(){
    setLoading(true);setError("");
    try{const r=await fetch("/api/admin/subscriptions",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Erreur");setItems(d.subscriptions||[])}
    catch(e:any){setError(e.message||"Erreur de chargement")}finally{setLoading(false)}
  }
  useEffect(()=>{load()},[]);

  const rows=useMemo(()=>items.filter(s=>{
    if(currency!=="all"&&s.currency!==currency)return false;
    if(status!=="all"&&s.status!==status)return false;
    if(type!=="all"&&s.account_type!==type)return false;
    const x=q.trim().toLowerCase(); if(!x)return true;
    return `${s.card?.full_name||""} ${s.card?.company||""} ${s.card?.email||""} ${s.referrer_name||""} ${s.referrer_code||""}`.toLowerCase().includes(x);
  }),[items,q,currency,status,type]);

  const active=items.filter(x=>x.status==="active").length;
  const startup=items.filter(x=>x.status==="startup").length;
  const included=items.filter(x=>x.status==="included").length;
  const soon=items.filter(x=>x.end_date&&["active","startup"].includes(x.status)&&new Date(x.end_date).getTime()-Date.now()<=30*86400000&&new Date(x.end_date).getTime()>=Date.now()).length;
  const caTND=items.filter(x=>x.currency==="TND"&&x.status==="active").reduce((a,b)=>a+Number(b.price_ht||0),0);
  const caEUR=items.filter(x=>x.currency==="EUR"&&x.status==="active").reduce((a,b)=>a+Number(b.price_ht||0),0);

  function edit(s:Subscription){setCurrent(s);setForm({...s})}
  async function save(){
    if(!current)return;setSaving(true);setError("");
    try{
      const r=await fetch("/api/admin/subscriptions",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        id:current.id,status:form.status,plan_code:form.plan_code,currency:form.currency,
        price_ht:Number(form.price_ht||0),tax_rate:Number(form.tax_rate||0),start_date:form.start_date||null,
        end_date:form.end_date||null,startup_months:Number(form.startup_months||0),auto_renew:!!form.auto_renew,
        referrer_name:form.referrer_name||null,referrer_code:form.referrer_code||null,
        payment_method:form.payment_method||null,payment_reference:form.payment_reference||null,notes:form.notes||null
      })});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"Enregistrement impossible");
      setCurrent(null);await load();
    }catch(e:any){setError(e.message)}finally{setSaving(false)}
  }

  return <main className="admin">
    <header><a href="/admin">← Tableau de bord</a><strong>VisiteCard · Abonnements</strong><a href="/admin">Clients</a></header>
    <div className="wrap">
      <section className="hero"><div><small>ADMINISTRATION</small><h1>Abonnements</h1><p>Suivez les offres démarrage, abonnements, échéances et apporteurs.</p></div></section>
      {error&&<div className="error">{error}</div>}
      <section className="stats">
        <article><span>Actifs</span><strong>{active}</strong></article>
        <article><span>Offre démarrage</span><strong>{startup}</strong></article>
        <article><span>Profils inclus</span><strong>{included}</strong></article>
        <article><span>Expire ≤ 30 jours</span><strong>{soon}</strong></article>
        <article className="money"><span>CA abonnements TND</span><strong>{money(caTND,"TND")}</strong></article>
        <article className="money"><span>CA abonnements EUR</span><strong>{money(caEUR,"EUR")}</strong></article>
      </section>
      <section className="panel">
        <div className="filters">
          <input placeholder="Nom, société, e-mail, commercial..." value={q} onChange={e=>setQ(e.target.value)}/>
          <select value={type} onChange={e=>setType(e.target.value)}><option value="all">Tous les types</option><option value="company">Sociétés</option><option value="profile">Profils</option></select>
          <select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Tous les statuts</option>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{String(v)}</option>)}</select>
          <select value={currency} onChange={e=>setCurrency(e.target.value)}><option value="all">Toutes devises</option><option value="TND">TND</option><option value="EUR">EUR</option></select>
        </div>
        {loading?<div className="empty">Chargement...</div>:<div className="table"><table><thead><tr><th>Client</th><th>Type</th><th>Offre</th><th>Tarif HT</th><th>Statut</th><th>Début</th><th>Fin</th><th>Apporteur</th><th></th></tr></thead>
          <tbody>{rows.map(s=><tr key={s.id}>
            <td><b>{s.card?.company||s.card?.full_name||"Sans nom"}</b><small>{s.card?.email||"—"}</small></td>
            <td>{s.account_type==="company"?"Société":"Profil"}</td><td>{s.plan_code}</td><td>{money(s.price_ht,s.currency)}</td>
            <td><span className={`badge ${s.status}`}>{labels[s.status]}</span></td><td>{date(s.start_date)}</td><td>{date(s.end_date)}</td>
            <td>{s.referrer_name||s.referrer_code||"—"}</td><td><button onClick={()=>edit(s)}>Fiche</button></td>
          </tr>)}</tbody></table>{!rows.length&&<div className="empty">Aucun abonnement.</div>}</div>}
      </section>
    </div>
    {current&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setCurrent(null)}}><div className="modal">
      <button className="close" onClick={()=>setCurrent(null)}>×</button><small>FICHE ABONNEMENT</small>
      <h2>{current.card?.company||current.card?.full_name||"Client"}</h2>
      <div className="contact"><b>{current.card?.email||"—"}</b><span>{current.card?.phone||""}</span></div>
      <div className="grid">
        <label>Statut<select value={form.status||""} onChange={e=>setForm({...form,status:e.target.value})}>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{String(v)}</option>)}</select></label>
        <label>Offre<input value={form.plan_code||""} onChange={e=>setForm({...form,plan_code:e.target.value})}/></label>
        <label>Devise<select value={form.currency||"TND"} onChange={e=>setForm({...form,currency:e.target.value})}><option>TND</option><option>EUR</option></select></label>
        <label>Tarif HT<input type="number" step="0.01" value={form.price_ht??0} onChange={e=>setForm({...form,price_ht:e.target.value})}/></label>
        <label>TVA %<input type="number" step="0.01" value={form.tax_rate??0} onChange={e=>setForm({...form,tax_rate:e.target.value})}/></label>
        <label>Mois démarrage<input type="number" value={form.startup_months??2} onChange={e=>setForm({...form,startup_months:e.target.value})}/></label>
        <label>Date début<input type="date" value={form.start_date||""} onChange={e=>setForm({...form,start_date:e.target.value})}/></label>
        <label>Date fin<input type="date" value={form.end_date||""} onChange={e=>setForm({...form,end_date:e.target.value})}/></label>
        <label>Commercial / apporteur<input value={form.referrer_name||""} onChange={e=>setForm({...form,referrer_name:e.target.value})}/></label>
        <label>Code commercial<input value={form.referrer_code||""} onChange={e=>setForm({...form,referrer_code:e.target.value})}/></label>
        <label>Mode paiement<input value={form.payment_method||""} onChange={e=>setForm({...form,payment_method:e.target.value})}/></label>
        <label>Référence paiement<input value={form.payment_reference||""} onChange={e=>setForm({...form,payment_reference:e.target.value})}/></label>
      </div>
      <label className="check"><input type="checkbox" checked={!!form.auto_renew} onChange={e=>setForm({...form,auto_renew:e.target.checked})}/> Renouvellement automatique</label>
      <label>Notes<textarea value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
      <button className="save" disabled={saving} onClick={save}>{saving?"Enregistrement...":"Enregistrer l’abonnement"}</button>
    </div></div>}
    <style jsx>{`
      *{box-sizing:border-box}.admin{min-height:100vh;background:#f6f7fb;color:#171923;font-family:Arial,sans-serif}header{height:68px;background:#fff;border-bottom:1px solid #e7e9ef;display:flex;align-items:center;justify-content:space-between;padding:0 max(20px,calc((100vw - 1440px)/2))}header a{color:#5f42d8;text-decoration:none;font-weight:800;font-size:13px}.wrap{max-width:1440px;margin:auto;padding:30px 22px 60px}.hero small,.modal>small{color:#6d4aff;font-weight:900;letter-spacing:.16em}.hero h1{font-size:34px;margin:7px 0}.hero p{color:#777d89;margin:0}.stats{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin:25px 0}.stats article{background:#fff;border:1px solid #e5e8ef;border-radius:16px;padding:17px}.stats span{display:block;color:#777d89;font-size:12px;font-weight:700}.stats strong{display:block;font-size:25px;margin-top:9px}.stats .money{border-top:3px solid #6d4aff}.panel{background:#fff;border:1px solid #e5e8ef;border-radius:18px;overflow:hidden}.filters{display:grid;grid-template-columns:2fr repeat(3,1fr);gap:9px;padding:17px}.filters input,.filters select,.modal input,.modal select,.modal textarea{width:100%;border:1px solid #dfe2e9;border-radius:10px;background:#fff;padding:11px;font:inherit}.table{overflow:auto}table{width:100%;border-collapse:collapse;min-width:1050px}th{text-align:left;background:#fafbfc;padding:12px;font-size:11px;color:#777;text-transform:uppercase}td{padding:13px 12px;border-top:1px solid #eef0f4;font-size:13px}td small{display:block;color:#9296a0;margin-top:4px}td button{border:1px solid #dedfea;background:#fff;border-radius:8px;padding:7px 11px;color:#5f42d8;font-weight:800;cursor:pointer}.badge{padding:5px 8px;border-radius:20px;font-size:11px;font-weight:900;background:#eee}.badge.active{background:#e7f8ef;color:#16734a}.badge.startup{background:#f0edff;color:#6041d4}.badge.included{background:#e9f4ff;color:#1767ad}.badge.expired{background:#fff0f0;color:#b12635}.empty{padding:45px;text-align:center;color:#888}.error{background:#fff0f0;color:#ad2433;padding:11px;border-radius:10px;margin:15px 0}.overlay{position:fixed;inset:0;background:rgba(10,12,18,.58);z-index:50;display:grid;place-items:center;padding:20px}.modal{width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:20px;padding:25px;position:relative}.close{position:absolute;right:15px;top:13px;border:0;background:#f1f2f5;width:34px;height:34px;border-radius:50%;font-size:22px}.modal h2{margin:7px 0}.contact{display:flex;gap:12px;color:#777;font-size:13px;margin-bottom:18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}.modal label{display:block;font-size:12px;font-weight:800;margin:8px 0}.modal label input,.modal label select,.modal label textarea{display:block;margin-top:6px}.modal textarea{min-height:85px;resize:vertical}.check{display:flex!important;align-items:center;gap:8px}.check input{width:auto!important;margin:0!important}.save{width:100%;height:45px;border:0;border-radius:11px;background:#6d4aff;color:#fff;font-weight:900;margin-top:12px}.save:disabled{opacity:.6}@media(max-width:1050px){.stats{grid-template-columns:repeat(3,1fr)}}@media(max-width:700px){.wrap{padding:20px 12px}.stats{grid-template-columns:1fr 1fr}.filters,.grid{grid-template-columns:1fr}.hero h1{font-size:28px}.contact{flex-direction:column}}
    `}</style>
  </main>
}
