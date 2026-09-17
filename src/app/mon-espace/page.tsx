"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ExternalLink, Link2, Plus, UserRound, X } from "lucide-react";
import { getSupabaseBrowser } from "@/app/lib/supabase";

type EntityType = "profile" | "company";
type Card = { id:string; slug:string; full_name:string; job_title?:string; company?:string; photo_url?:string; entity_type?:EntityType; is_public?:boolean };
type Relation = { id:string; profile_card_id:string; company_card_id:string; position_title?:string; status_label?:string; company?:Card };

function slugify(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,36)}

export default function MonEspaceHome(){
  const router=useRouter();
  const [cards,setCards]=useState<Card[]>([]); const [allCompanies,setAllCompanies]=useState<Card[]>([]); const [relations,setRelations]=useState<Relation[]>([]);
  const [loading,setLoading]=useState(true); const [tab,setTab]=useState<EntityType>("profile");
  const [createType,setCreateType]=useState<EntityType|null>(null); const [name,setName]=useState(""); const [job,setJob]=useState("");
  const [linkProfile,setLinkProfile]=useState<Card|null>(null); const [companyId,setCompanyId]=useState(""); const [position,setPosition]=useState("");
  const [error,setError]=useState("");

  async function load(){
    setLoading(true); setError(""); const s=getSupabaseBrowser(); const {data:a}=await s.auth.getUser();
    if(!a.user){router.replace("/connexion");return}
    const {data,error:e}=await s.from("cards").select("id,slug,full_name,job_title,company,photo_url,entity_type,is_public").eq("user_id",a.user.id).order("created_at",{ascending:true});
    if(e){setError(e.message);setLoading(false);return} setCards((data||[]) as Card[]);
    const {data:publicCompanies}=await s.from("cards").select("id,slug,full_name,job_title,company,photo_url,entity_type,is_public").eq("entity_type","company").eq("is_public",true).order("full_name",{ascending:true}); setAllCompanies((publicCompanies||[]) as Card[]);
    const profileIds=(data||[]).filter((x:any)=>(x.entity_type||"profile")==="profile").map((x:any)=>x.id);
    if(profileIds.length){
      const {data:r}=await s.from("profile_company_links").select("id,profile_card_id,company_card_id,position_title,status_label").in("profile_card_id",profileIds);
      const rel=(r||[]) as Relation[]; const ids=[...new Set(rel.map(x=>x.company_card_id))];
      let map=new Map<string,Card>(); if(ids.length){const {data:cs}=await s.from("cards").select("id,slug,full_name,job_title,company,photo_url,entity_type,is_public").in("id",ids); map=new Map(((cs||[]) as Card[]).map(c=>[c.id,c]));}
      setRelations(rel.map(x=>({...x,company:map.get(x.company_card_id)})));
    } else setRelations([]);
    setLoading(false);
  }
  useEffect(()=>{load()},[]);

  const profiles=useMemo(()=>cards.filter(c=>(c.entity_type||"profile")==="profile"),[cards]);
  const companies=useMemo(()=>cards.filter(c=>c.entity_type==="company"),[cards]);
  const shown=tab==="profile"?profiles:companies;

  async function create(){
    if(!createType||!name.trim())return; const s=getSupabaseBrowser(); const {data:a}=await s.auth.getUser(); if(!a.user)return;
    const base=slugify(name)|| (createType==="profile"?"profil":"societe"); const slug=`${base}-${crypto.randomUUID().slice(0,6)}`;
    const payload:any={user_id:a.user.id,slug,full_name:name.trim(),job_title:createType==="profile"?job.trim():"",company:createType==="company"?name.trim():"",entity_type:createType,is_public:true,show_qr:true,show_email:true,show_phone:true,show_address:true,show_reviews:true,theme:"dark",language:"fr",primary_color:"#6d4aff",background_color:"#071522",social_links:[],custom_links:[]};
    const {data,error:e}=await s.from("cards").insert(payload).select("id").single(); if(e){setError(e.message);return} setCreateType(null);setName("");setJob(""); router.push(`/mon-espace/carte?id=${data.id}`);
  }

  async function linkCompany(){
    if(!linkProfile||!companyId)return; const s=getSupabaseBrowser(); const {error:e}=await s.from("profile_company_links").upsert({profile_card_id:linkProfile.id,company_card_id:companyId,position_title:position.trim(),status_label:""},{onConflict:"profile_card_id,company_card_id"});
    if(e){setError(e.message);return} setLinkProfile(null);setCompanyId("");setPosition(""); await load();
  }

  return <main className="vcHub">
    <section className="vcHubHero"><div><span className="vcEyebrow">VisiteCard</span><h1>Mes profils & sociétés</h1><p>Un seul compte pour votre profil personnel et toutes les sociétés que vous gérez.</p></div><div className="vcHubActions"><button onClick={()=>setCreateType("profile")}><UserRound size={18}/> Créer un profil</button><button className="primary" onClick={()=>setCreateType("company")}><Building2 size={18}/> Créer une société</button></div></section>
    <div className="vcTabs"><button className={tab==="profile"?"active":""} onClick={()=>setTab("profile")}>Profils <b>{profiles.length}</b></button><button className={tab==="company"?"active":""} onClick={()=>setTab("company")}>Sociétés <b>{companies.length}</b></button></div>
    {error&&<div className="vcHubError">{error}</div>}
    {loading?<div className="vcEmpty">Chargement…</div>:shown.length===0?<div className="vcEmpty"><div>{tab==="profile"?<UserRound/>:<Building2/>}</div><h2>{tab==="profile"?"Créez votre profil personnel":"Ajoutez votre première société"}</h2><p>{tab==="profile"?"Nom, prénom, profession, coordonnées et réseaux sociaux personnels.":"Chaque société possède sa propre page, ses réseaux, son QR code et ses statistiques."}</p><button onClick={()=>setCreateType(tab)}><Plus size={18}/> Créer maintenant</button></div>:
      <div className="vcEntityGrid">{shown.map(c=><article className="vcEntityCard" key={c.id}><div className="vcEntityTop"><div className="vcEntityAvatar">{c.photo_url?<img src={c.photo_url} alt=""/>:tab==="profile"?<UserRound/>:<Building2/>}</div><div><span className="vcType">{tab==="profile"?"PROFIL":"SOCIÉTÉ"}</span><h2>{c.full_name}</h2><p>{c.job_title||c.company||(tab==="profile"?"Profil personnel":"Page société")}</p></div></div>
      {tab==="profile"&&<div className="vcCompanies"><div className="vcCompaniesHead"><strong>Mes sociétés</strong><button onClick={()=>setLinkProfile(c)}><Link2 size={15}/> Lier une société</button></div>{relations.filter(r=>r.profile_card_id===c.id).length?relations.filter(r=>r.profile_card_id===c.id).map(r=><div className="vcCompanyMini" key={r.id}><span>{r.company?.photo_url?<img src={r.company.photo_url} alt=""/>:<Building2 size={17}/>}</span><div><b>{r.company?.full_name||"Société"}</b><small>{r.position_title||"Membre"}</small></div>{r.company?.slug&&<Link href={`/${r.company.slug}`} target="_blank"><ExternalLink size={15}/></Link>}</div>):<p className="vcNoCompany">Aucune société liée.</p>}</div>}
      <div className="vcEntityFoot"><Link href={`/mon-espace/carte?id=${c.id}`}>Modifier</Link><Link href={`/${c.slug}`} target="_blank">Voir la page <ExternalLink size={14}/></Link></div></article>)}</div>}

    {createType&&<div className="vcModalBg"><div className="vcModal"><button className="close" onClick={()=>setCreateType(null)}><X/></button><div className="vcModalIcon">{createType==="profile"?<UserRound/>:<Building2/>}</div><h2>{createType==="profile"?"Créer un profil":"Créer une société"}</h2><p>{createType==="profile"?"Un seul profil personnel peut ensuite être lié à une ou plusieurs sociétés.":"La société aura sa propre page publique et ses propres réseaux sociaux."}</p><label>{createType==="profile"?"Nom et prénom":"Nom de la société"}<input value={name} onChange={e=>setName(e.target.value)} autoFocus/></label>{createType==="profile"&&<label>Profession / titre<input value={job} onChange={e=>setJob(e.target.value)} placeholder="Ex. Entrepreneur, Directeur…"/></label>}<button className="submit" onClick={create}>Créer et personnaliser</button></div></div>}

    {linkProfile&&<div className="vcModalBg"><div className="vcModal"><button className="close" onClick={()=>setLinkProfile(null)}><X/></button><div className="vcModalIcon"><Link2/></div><h2>Lier une société</h2><p>La société n’est pas dupliquée : vous faites appel à sa page VisiteCard existante.</p><label>Société<select value={companyId} onChange={e=>setCompanyId(e.target.value)}><option value="">Choisir…</option>{allCompanies.map(c=><option value={c.id} key={c.id}>{c.full_name}{companies.some(x=>x.id===c.id)?" — ma société":""}</option>)}</select></label><label>Votre poste / statut<input value={position} onChange={e=>setPosition(e.target.value)} placeholder="Fondateur, Gérant, Directeur…"/></label><button className="submit" disabled={!companyId} onClick={linkCompany}>Lier à {linkProfile.full_name}</button><button className="secondary" onClick={()=>{setLinkProfile(null);setCreateType("company")}}>+ Créer une nouvelle société</button></div></div>}
  </main>
}
