"use client";

import { DragEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/app/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

type Mode = "manual" | "external" | "pdf" | "image" | "video";
type Item = {
  id:string; title_fr:string; title_en:string; description_fr:string; description_en:string;
  visual_type:"none"|"icon"|"image"; image_url:string; icon:string; price:string;
  price_mode:"fixed"|"from"|"range"|"hidden"; currency:string; is_active:boolean;
};
type Category = {
  id:string; title_fr:string; title_en:string; visual_type:"color"|"image"; image_url:string;
  background_color:string; text_color:string; is_active:boolean; items:Item[];
};

const id=()=>crypto.randomUUID();

export default function CataloguePage(){
  const router=useRouter();
  const {lang}=useLanguage();
  const fr=lang==="fr";
  const [card,setCard]=useState<any>(null);
  const [categories,setCategories]=useState<Category[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [uploading,setUploading]=useState(false);
  const [message,setMessage]=useState("");
  const [dragCat,setDragCat]=useState<number|null>(null);
  const [dragItem,setDragItem]=useState<{c:number;i:number}|null>(null);

  useEffect(()=>{void load()},[]);

  const mode:Mode = card?.catalog_mode==="external" ? "external" :
    card?.catalog_mode==="file" && card?.catalog_file_type==="pdf" ? "pdf" :
    card?.catalog_mode==="file" && card?.catalog_file_type==="image" ? "image" :
    card?.catalog_mode==="file" && card?.catalog_file_type==="video" ? "video" : "manual";

  async function load(){
    try{
      const s=getSupabaseBrowser();
      const {data:{user}}=await s.auth.getUser();
      if(!user)return router.replace("/connexion");
      const {data:c,error}=await s.from("cards").select("*").eq("user_id",user.id).order("created_at",{ascending:true}).limit(1).maybeSingle();
      if(error)throw error;
      if(!c||c.entity_type!=="company")return router.replace("/mon-espace");
      setCard(c);
      const {data:cats,error:ce}=await s.from("card_catalog_categories").select("*").eq("card_id",c.id).order("sort_order");
      if(ce)throw ce;
      const ids=(cats||[]).map((x:any)=>x.id);
      let items:any[]=[];
      if(ids.length){
        const {data,error:ie}=await s.from("card_catalog_items").select("*").in("category_id",ids).order("sort_order");
        if(ie)throw ie; items=data||[];
      }
      setCategories((cats||[]).map((x:any)=>({...x,image_url:x.image_url||"",items:items.filter(i=>i.category_id===x.id).map(i=>({...i,description_fr:i.description_fr||"",description_en:i.description_en||"",image_url:i.image_url||"",icon:i.icon||"sparkles",price:i.price==null?"":String(i.price)}))})));
    }catch(e:any){setMessage(e.message||"Erreur")}finally{setLoading(false)}
  }

  function setMode(m:Mode){
    if(m==="manual")setCard({...card,catalog_mode:"manual",catalog_file_type:null});
    else if(m==="external")setCard({...card,catalog_mode:"external",catalog_file_type:null});
    else setCard({...card,catalog_mode:"file",catalog_file_type:m});
  }

  async function upload(file:File,kind:"catalog"|"category"|"item",ci?:number,ii?:number){
    if(!card?.id)return;
    setUploading(true); setMessage("");
    try{
      const s=getSupabaseBrowser();
      const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
      const path=`${card.id}/catalog/${kind}-${Date.now()}-${safe}`;
      const {error}=await s.storage.from("card-assets").upload(path,file,{upsert:true,contentType:file.type});
      if(error)throw error;
      const {data}=s.storage.from("card-assets").getPublicUrl(path);
      if(kind==="catalog")setCard({...card,catalog_file_url:data.publicUrl,catalog_file_name:file.name});
      if(kind==="category"&&ci!==undefined)updateCategory(ci,{image_url:data.publicUrl,visual_type:"image"});
      if(kind==="item"&&ci!==undefined&&ii!==undefined)updateItem(ci,ii,{image_url:data.publicUrl,visual_type:"image"});
    }catch(e:any){setMessage(e.message||"Upload impossible")}finally{setUploading(false)}
  }

  function addCategory(){setCategories(v=>[...v,{id:`new-${id()}`,title_fr:"",title_en:"",visual_type:"color",image_url:"",background_color:"#111827",text_color:"#ffffff",is_active:true,items:[]}])}
  function updateCategory(i:number,p:Partial<Category>){setCategories(v=>v.map((x,n)=>n===i?{...x,...p}:x))}
  function removeCategory(i:number){setCategories(v=>v.filter((_,n)=>n!==i))}
  function addItem(c:number){setCategories(v=>v.map((x,n)=>n!==c?x:{...x,items:[...x.items,{id:`new-${id()}`,title_fr:"",title_en:"",description_fr:"",description_en:"",visual_type:"none",image_url:"",icon:"sparkles",price:"",price_mode:"fixed",currency:card?.catalog_primary_currency||"TND",is_active:true}]}))}
  function updateItem(c:number,i:number,p:Partial<Item>){setCategories(v=>v.map((x,n)=>n!==c?x:{...x,items:x.items.map((y,j)=>j===i?{...y,...p}:y)}))}
  function removeItem(c:number,i:number){setCategories(v=>v.map((x,n)=>n!==c?x:{...x,items:x.items.filter((_,j)=>j!==i)}))}

  function dropCategory(e:DragEvent,at:number){e.preventDefault();if(dragCat===null||dragCat===at)return;setCategories(v=>{const a=[...v];const [m]=a.splice(dragCat,1);a.splice(at,0,m);return a});setDragCat(null)}
  function dropItem(e:DragEvent,c:number,at:number){e.preventDefault();if(!dragItem||dragItem.c!==c||dragItem.i===at)return;setCategories(v=>v.map((x,n)=>{if(n!==c)return x;const a=[...x.items];const [m]=a.splice(dragItem.i,1);a.splice(at,0,m);return {...x,items:a}}));setDragItem(null)}

  async function save(){
    if(!card)return; setSaving(true);setMessage("");
    try{
      const s=getSupabaseBrowser();
      const {error:cardError}=await s.from("cards").update({
        catalog_enabled:!!card.catalog_enabled,catalog_mode:card.catalog_mode||"manual",
        catalog_label_fr:card.catalog_label_fr||"Nos services",catalog_label_en:card.catalog_label_en||"Our services",
        catalog_icon:card.catalog_icon||"grid",catalog_button_color:card.catalog_button_color||"#111827",
        catalog_button_text_color:card.catalog_button_text_color||"#ffffff",
        catalog_primary_currency:card.catalog_primary_currency||"TND",
        catalog_external_url:card.catalog_external_url||null,catalog_file_url:card.catalog_file_url||null,
        catalog_file_type:card.catalog_file_type||null,catalog_file_name:card.catalog_file_name||null
      }).eq("id",card.id); if(cardError)throw cardError;

      const {data:oldCats}=await s.from("card_catalog_categories").select("id").eq("card_id",card.id);
      const keep=new Set<string>();
      for(let ci=0;ci<categories.length;ci++){
        const c=categories[ci]; let cid=c.id;
        const cp={card_id:card.id,title_fr:c.title_fr.trim(),title_en:c.title_en.trim()||c.title_fr.trim(),visual_type:c.visual_type,image_url:c.image_url||null,background_color:c.background_color,text_color:c.text_color,sort_order:ci,is_active:c.is_active,updated_at:new Date().toISOString()};
        if(c.id.startsWith("new-")){const {data,error}=await s.from("card_catalog_categories").insert(cp).select().single();if(error)throw error;cid=data.id}else{const {error}=await s.from("card_catalog_categories").update(cp).eq("id",c.id);if(error)throw error} keep.add(cid);
        const {data:oldItems}=await s.from("card_catalog_items").select("id").eq("category_id",cid);const keepItems=new Set<string>();
        for(let ii=0;ii<c.items.length;ii++){
          const x=c.items[ii];const ip={category_id:cid,title_fr:x.title_fr.trim(),title_en:x.title_en.trim()||x.title_fr.trim(),description_fr:x.description_fr.trim(),description_en:x.description_en.trim()||x.description_fr.trim(),visual_type:x.visual_type,image_url:x.image_url||null,icon:x.icon||"sparkles",price:x.price===""?null:Number(x.price),price_mode:x.price_mode,currency:x.currency||card.catalog_primary_currency||"TND",sort_order:ii,is_active:x.is_active,updated_at:new Date().toISOString()};
          if(x.id.startsWith("new-")){const {data,error}=await s.from("card_catalog_items").insert(ip).select().single();if(error)throw error;keepItems.add(data.id)}else{const {error}=await s.from("card_catalog_items").update(ip).eq("id",x.id);if(error)throw error;keepItems.add(x.id)}
        }
        for(const old of oldItems||[])if(!keepItems.has(old.id))await s.from("card_catalog_items").delete().eq("id",old.id);
      }
      for(const old of oldCats||[])if(!keep.has(old.id))await s.from("card_catalog_categories").delete().eq("id",old.id);
      setMessage(fr?"Catalogue enregistré.":"Catalog saved.");await load();
    }catch(e:any){setMessage(e.message||"Erreur")}finally{setSaving(false)}
  }

  if(loading)return <main className="page"><p>Chargement…</p></main>;
  if(!card)return null;

  const icons=["grid","menu","bag","sparkles","fork","heart","star","book"];

  return <main className="page">
    <header className="hero"><div><span>VISITECARD</span><h1>{fr?"Catalogue":"Catalog"}</h1><p>{fr?"Créez votre menu, catalogue ou liste de prestations.":"Create your menu, catalog or services."}</p></div><label className={`switch ${card.catalog_enabled?"on":""}`}><input type="checkbox" checked={!!card.catalog_enabled} onChange={e=>setCard({...card,catalog_enabled:e.target.checked})}/><i/><b>{card.catalog_enabled?"ON":"OFF"}</b></label></header>

    <section className="panel">
      <div className="panelTitle"><div><small>01</small><h2>{fr?"Bouton public":"Public button"}</h2></div><div className="preview" style={{background:card.catalog_button_color||"#111827",color:card.catalog_button_text_color||"#fff"}}><span>{card.catalog_icon==="fork"?"🍴":card.catalog_icon==="bag"?"🛍️":card.catalog_icon==="heart"?"♥":card.catalog_icon==="star"?"★":card.catalog_icon==="book"?"▤":card.catalog_icon==="sparkles"?"✦":"▦"}</span>{card.catalog_label_fr||"Nos services"}</div></div>
      <div className="two"><label>{fr?"Nom du bouton":"Button name"}<input value={card.catalog_label_fr||""} onChange={e=>setCard({...card,catalog_label_fr:e.target.value,catalog_label_en:e.target.value})}/></label><label>{fr?"Devise":"Currency"}<select value={card.catalog_primary_currency||"TND"} onChange={e=>setCard({...card,catalog_primary_currency:e.target.value})}>{["TND","EUR","USD","GBP","CAD","AED"].map(x=><option key={x}>{x}</option>)}</select></label></div>
      <div className="appearance"><label>{fr?"Fond du bouton":"Button background"}<input type="color" value={card.catalog_button_color||"#111827"} onChange={e=>setCard({...card,catalog_button_color:e.target.value})}/></label><label>{fr?"Texte du bouton":"Button text"}<input type="color" value={card.catalog_button_text_color||"#ffffff"} onChange={e=>setCard({...card,catalog_button_text_color:e.target.value})}/></label><div><b>{fr?"Icône":"Icon"}</b><div className="icons">{icons.map(x=><button className={card.catalog_icon===x?"active":""} key={x} onClick={()=>setCard({...card,catalog_icon:x})}>{x==="fork"?"🍴":x==="bag"?"🛍️":x==="heart"?"♥":x==="star"?"★":x==="book"?"▤":x==="sparkles"?"✦":"▦"}</button>)}</div></div></div>
    </section>

    <section className="panel">
      <div className="panelTitle"><div><small>02</small><h2>{fr?"Contenu du bouton":"Button content"}</h2></div></div>
      <div className="modes">
        {([["manual","▦","Créer avec VisiteCard"],["external","↗","Lien externe"],["pdf","PDF","PDF"],["image","▧","Image"],["video","▶","Vidéo"]] as [Mode,string,string][]).map(([m,ico,label])=><button key={m} className={mode===m?"active":""} onClick={()=>setMode(m)}><i>{ico}</i><strong>{label}</strong></button>)}
      </div>
      {mode==="external"?<label className="wide">{fr?"Lien externe":"External link"}<input type="url" value={card.catalog_external_url||""} onChange={e=>setCard({...card,catalog_external_url:e.target.value})} placeholder="https://..."/></label>:null}
      {["pdf","image","video"].includes(mode)?<div className="uploadBox"><strong>{mode==="pdf"?"PDF":mode==="image"?(fr?"Image":"Image"):(fr?"Vidéo":"Video")}</strong><p>{fr?"Glissez votre fichier ici ou cliquez pour choisir.":"Drop your file here or click to choose."}</p><input type="file" accept={mode==="pdf"?"application/pdf":mode==="image"?"image/jpeg,image/png,image/webp":"video/mp4,video/webm"} onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f,"catalog")}}/>{card.catalog_file_url?<a href={card.catalog_file_url} target="_blank" rel="noreferrer">{card.catalog_file_name||"Voir le fichier"}</a>:null}</div>:null}
    </section>

    {mode==="manual"?<section className="builder">
      <div className="builderHead"><div><small>03</small><h2>{fr?"Catégories":"Categories"}</h2><p>{fr?"Glissez les blocs pour changer leur ordre.":"Drag blocks to reorder."}</p></div><button className="primary" onClick={addCategory}>+ {fr?"Ajouter une catégorie":"Add category"}</button></div>
      {categories.length===0?<button className="empty" onClick={addCategory}><b>+</b><strong>{fr?"Créer ma première catégorie":"Create my first category"}</strong></button>:null}
      {categories.map((c,ci)=><article key={c.id} className="category" draggable onDragStart={()=>setDragCat(ci)} onDragOver={e=>e.preventDefault()} onDrop={e=>dropCategory(e,ci)}>
        <div className="catHero" style={c.visual_type==="image"&&c.image_url?{backgroundImage:`linear-gradient(#0005,#0005),url(${c.image_url})`,color:c.text_color}:{background:c.background_color,color:c.text_color}}>
          <span className="grip">⋮⋮</span><div><small>{fr?"CATÉGORIE":"CATEGORY"} {ci+1}</small><h3>{c.title_fr||"Nouvelle catégorie"}</h3></div><label className="visible"><input type="checkbox" checked={c.is_active} onChange={e=>updateCategory(ci,{is_active:e.target.checked})}/> {fr?"Visible":"Visible"}</label><button className="trash" onClick={()=>removeCategory(ci)}>×</button>
        </div>
        <div className="catBody">
          <div className="two"><label>{fr?"Nom de la catégorie":"Category name"}<input value={c.title_fr} onChange={e=>updateCategory(ci,{title_fr:e.target.value,title_en:e.target.value})}/></label><div><b>{fr?"Arrière-plan":"Background"}</b><div className="seg"><button className={c.visual_type==="color"?"active":""} onClick={()=>updateCategory(ci,{visual_type:"color"})}>{fr?"Couleur":"Color"}</button><button className={c.visual_type==="image"?"active":""} onClick={()=>updateCategory(ci,{visual_type:"image"})}>{fr?"Image":"Image"}</button></div></div></div>
          <div className="appearance">{c.visual_type==="color"?<label>{fr?"Couleur de fond":"Background color"}<input type="color" value={c.background_color} onChange={e=>updateCategory(ci,{background_color:e.target.value})}/></label>:<label>{fr?"Image de fond":"Background image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f,"category",ci)}}/></label>}<label>{fr?"Couleur du texte":"Text color"}<input type="color" value={c.text_color} onChange={e=>updateCategory(ci,{text_color:e.target.value})}/></label></div>
          <div className="servicesHead"><div><h4>{fr?"Produits / Services":"Products / Services"}</h4><span>{c.items.length}</span></div><button onClick={()=>addItem(ci)}>+ {fr?"Ajouter un service":"Add service"}</button></div>
          <div className="services">{c.items.map((x,ii)=><div className="service" key={x.id} draggable onDragStart={()=>setDragItem({c:ci,i:ii})} onDragOver={e=>e.preventDefault()} onDrop={e=>dropItem(e,ci,ii)}>
            <span className="grip dark">⋮⋮</span>
            <label className="photo">{x.image_url?<img src={x.image_url} alt=""/>:<span>＋<small>{fr?"Photo":"Photo"}</small></span>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f,"item",ci,ii)}}/></label>
            <div className="serviceFields"><input className="titleInput" placeholder={fr?"Nom du service / produit":"Product / service name"} value={x.title_fr} onChange={e=>updateItem(ci,ii,{title_fr:e.target.value,title_en:e.target.value})}/><textarea placeholder={fr?"Description":"Description"} value={x.description_fr} onChange={e=>updateItem(ci,ii,{description_fr:e.target.value,description_en:e.target.value})}/><div className="price"><input type="number" min="0" step=".01" placeholder={fr?"Prix":"Price"} value={x.price} onChange={e=>updateItem(ci,ii,{price:e.target.value})}/><select value={x.currency} onChange={e=>updateItem(ci,ii,{currency:e.target.value})}>{["TND","EUR","USD","GBP","CAD","AED"].map(v=><option key={v}>{v}</option>)}</select></div></div>
            <div className="serviceActions"><label><input type="checkbox" checked={x.is_active} onChange={e=>updateItem(ci,ii,{is_active:e.target.checked})}/> {fr?"Visible":"Visible"}</label><button onClick={()=>removeItem(ci,ii)}>Supprimer</button></div>
          </div>)}</div>
          {c.items.length===0?<button className="addInside" onClick={()=>addItem(ci)}>＋ {fr?"Ajouter votre premier service / produit":"Add your first product / service"}</button>:null}
        </div>
      </article>)}
    </section>:null}

    {message?<div className="message">{message}</div>:null}
    <button className="save" disabled={saving||uploading} onClick={save}>{saving?(fr?"Enregistrement…":"Saving…"):(fr?"Enregistrer le catalogue":"Save catalog")}</button>

    <style jsx>{`
      .page{max-width:1320px;margin:auto;padding:48px 54px 110px;color:#111827}.hero{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}.hero span,.panelTitle small,.builderHead small{color:#ff4b2b;font-weight:900;letter-spacing:2px}.hero h1{font-size:48px;margin:8px 0}.hero p,.builderHead p{color:#7b8190;margin:0}.switch{display:flex;align-items:center;gap:10px;padding:9px 14px;border:1px solid #ddd;border-radius:999px}.switch input{display:none}.switch i{width:38px;height:22px;border-radius:99px;background:#ddd;position:relative}.switch i:after{content:"";position:absolute;width:16px;height:16px;background:#fff;border-radius:50%;left:3px;top:3px;transition:.2s}.switch.on i{background:#18b77b}.switch.on i:after{left:19px}.panel,.category{background:#fff;border:1px solid #e6e8ec;border-radius:24px;padding:24px;margin-bottom:22px;box-shadow:0 8px 30px #11182708}.panelTitle,.builderHead{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:22px}.panelTitle h2,.builderHead h2{margin:3px 0;font-size:25px}.preview{display:flex;gap:10px;align-items:center;padding:13px 20px;border-radius:14px;font-weight:900}.two,.appearance{display:grid;grid-template-columns:1fr 1fr;gap:16px}.appearance{grid-template-columns:1fr 1fr 2fr;margin-top:16px}label,b{font-size:13px;font-weight:800}input,select,textarea{width:100%;box-sizing:border-box;border:1px solid #dfe2e7;border-radius:12px;padding:12px;background:#fff;margin-top:7px;font:inherit}input[type=color]{height:46px;padding:5px}.icons,.seg{display:flex;gap:7px;margin-top:7px;flex-wrap:wrap}.icons button,.seg button{border:1px solid #ddd;background:#fff;border-radius:10px;min-width:43px;padding:10px}.icons button.active,.seg button.active{border-color:#111;background:#111;color:#fff}.modes{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.modes button{min-height:105px;border:1px solid #e1e3e8;background:#fafafa;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px}.modes button i{font-style:normal;font-size:22px}.modes button.active{border:2px solid #ff4b2b;background:#fff5f2;color:#d93b21}.wide,.uploadBox{display:block;margin-top:18px}.uploadBox{border:2px dashed #d8dbe1;border-radius:18px;padding:28px;text-align:center}.uploadBox input{max-width:480px}.builder{margin-top:30px}.primary,.servicesHead button{border:0;background:#111;color:#fff;border-radius:13px;padding:13px 18px;font-weight:900}.empty{width:100%;border:2px dashed #d8dbe1;border-radius:22px;padding:42px;background:#fff;color:#555}.empty b{display:block;font-size:34px}.category{padding:0;overflow:hidden}.catHero{min-height:92px;padding:20px;display:flex;align-items:center;gap:15px;background-size:cover;background-position:center}.catHero div{margin-right:auto}.catHero h3{margin:3px 0;font-size:24px}.catHero small{font-weight:900;opacity:.75}.grip{font-size:25px;cursor:grab}.visible{display:flex;align-items:center;gap:7px}.visible input,.serviceActions input{width:auto;margin:0}.trash{border:0;background:#ffffff33;color:inherit;font-size:25px;border-radius:10px;padding:5px 11px}.catBody{padding:22px}.servicesHead{display:flex;justify-content:space-between;align-items:center;margin:26px 0 12px;border-top:1px solid #eee;padding-top:20px}.servicesHead div{display:flex;gap:9px;align-items:center}.servicesHead h4{font-size:19px;margin:0}.servicesHead span{background:#f1f2f4;border-radius:99px;padding:3px 9px;font-weight:900}.service{display:grid;grid-template-columns:auto 92px 1fr 120px;gap:14px;align-items:center;border:1px solid #e8e9ed;border-radius:17px;padding:14px;margin-bottom:10px}.dark{color:#8a909b}.photo{width:92px;height:82px;border:1px dashed #cfd3da;border-radius:13px;overflow:hidden;display:grid;place-items:center;cursor:pointer}.photo input{display:none}.photo img{width:100%;height:100%;object-fit:cover}.photo span{text-align:center;font-size:23px}.photo small{display:block;font-size:10px}.serviceFields{display:grid;grid-template-columns:1fr 1.4fr .8fr;gap:8px}.serviceFields input,.serviceFields textarea,.serviceFields select{margin:0}.price{display:grid;grid-template-columns:1fr 75px;gap:6px}.serviceActions{display:flex;flex-direction:column;gap:12px}.serviceActions label{display:flex;gap:6px;align-items:center}.serviceActions button{border:0;background:#fff0ed;color:#d83d25;border-radius:9px;padding:8px;font-weight:800}.addInside{width:100%;border:1px dashed #cfd3da;background:#fafafa;border-radius:14px;padding:16px;font-weight:800}.message{text-align:center;margin:18px;font-weight:900}.save{position:sticky;bottom:18px;width:100%;border:0;border-radius:15px;background:#ff4b2b;color:#fff;padding:17px;font-size:16px;font-weight:900;box-shadow:0 10px 30px #0002}.save:disabled{opacity:.55}
      @media(max-width:850px){.page{padding:28px 16px 90px}.hero h1{font-size:36px}.modes{grid-template-columns:1fr 1fr}.two,.appearance{grid-template-columns:1fr}.service{grid-template-columns:auto 70px 1fr}.serviceActions{grid-column:2/-1;flex-direction:row}.serviceFields{grid-template-columns:1fr}.photo{width:70px;height:70px}.panelTitle{align-items:flex-start;flex-direction:column}.preview{width:100%;box-sizing:border-box;justify-content:center}}
    `}</style>
  </main>
}
