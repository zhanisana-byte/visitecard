"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/app/lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

type Item = {
  id: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  visual_type: "none" | "icon" | "image";
  image_url: string;
  icon: string;
  price: string;
  price_mode: "fixed" | "from" | "range" | "hidden";
  currency: string;
  secondary_price: string;
  secondary_currency: string;
  is_active: boolean;
};

type Category = {
  id: string;
  title_fr: string;
  title_en: string;
  visual_type: "color" | "image";
  image_url: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  items: Item[];
};

const uid = () => crypto.randomUUID();

export default function CataloguePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const fr = lang === "fr";
  const [card, setCard] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace("/connexion");

      const { data: c, error } = await supabase.from("cards").select("*").eq("user_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (error) throw error;
      if (!c || c.entity_type !== "company") return router.replace("/mon-espace");
      setCard(c);

      const { data: cats, error: ce } = await supabase.from("card_catalog_categories").select("*").eq("card_id", c.id).order("sort_order");
      if (ce) throw ce;
      const ids = (cats || []).map(x => x.id);
      let items:any[] = [];
      if (ids.length) {
        const { data, error: ie } = await supabase.from("card_catalog_items").select("*").in("category_id", ids).order("sort_order");
        if (ie) throw ie;
        items = data || [];
      }
      setCategories((cats || []).map((x:any) => ({
        ...x,
        image_url: x.image_url || "",
        items: items.filter(i => i.category_id === x.id).map(i => ({
          ...i,
          description_fr: i.description_fr || "", description_en: i.description_en || "",
          image_url: i.image_url || "", icon: i.icon || "sparkles",
          price: i.price == null ? "" : String(i.price),
          secondary_price: i.secondary_price == null ? "" : String(i.secondary_price),
          secondary_currency: i.secondary_currency || ""
        }))
      })));
    } catch (e:any) {
      setMessage(e.message || "Erreur");
    } finally { setLoading(false); }
  }

  function addCategory() {
    setCategories(v => [...v, {id:`new-${uid()}`,title_fr:"",title_en:"",visual_type:"color",image_url:"",background_color:"#f4f4f5",text_color:"#111827",is_active:true,items:[]}]);
  }
  function updateCategory(i:number, patch:Partial<Category>) { setCategories(v => v.map((x,n)=>n===i?{...x,...patch}:x)); }
  function removeCategory(i:number) { setCategories(v => v.filter((_,n)=>n!==i)); }
  function moveCategory(i:number,d:-1|1){setCategories(v=>{const a=[...v],j=i+d;if(j<0||j>=a.length)return v;[a[i],a[j]]=[a[j],a[i]];return a})}
  function addItem(ci:number){setCategories(v=>v.map((c,n)=>n!==ci?c:{...c,items:[...c.items,{id:`new-${uid()}`,title_fr:"",title_en:"",description_fr:"",description_en:"",visual_type:"icon",image_url:"",icon:"sparkles",price:"",price_mode:"fixed",currency:card?.catalog_primary_currency||"TND",secondary_price:"",secondary_currency:card?.catalog_secondary_currency||"",is_active:true}]}))}
  function updateItem(ci:number,ii:number,patch:Partial<Item>){setCategories(v=>v.map((c,n)=>n!==ci?c:{...c,items:c.items.map((x,j)=>j===ii?{...x,...patch}:x)}))}
  function removeItem(ci:number,ii:number){setCategories(v=>v.map((c,n)=>n!==ci?c:{...c,items:c.items.filter((_,j)=>j!==ii)}))}
  function moveItem(ci:number,ii:number,d:-1|1){setCategories(v=>v.map((c,n)=>{if(n!==ci)return c;const a=[...c.items],j=ii+d;if(j<0||j>=a.length)return c;[a[ii],a[j]]=[a[j],a[ii]];return {...c,items:a}}))}

  async function save() {
    if (!card) return;
    setSaving(true); setMessage("");
    try {
      const supabase=getSupabaseBrowser();
      const { error: cardError } = await supabase.from("cards").update({
        catalog_enabled: !!card.catalog_enabled,
        catalog_mode: card.catalog_mode || "manual",
        catalog_label_fr: card.catalog_label_fr || "Nos services",
        catalog_label_en: card.catalog_label_en || "Our services",
        catalog_primary_currency: card.catalog_primary_currency || "TND"
      }).eq("id",card.id);
      if(cardError) throw cardError;

      const {data:oldCats}=await supabase.from("card_catalog_categories").select("id").eq("card_id",card.id);
      const keep=new Set<string>();
      for(let ci=0;ci<categories.length;ci++){
        const c=categories[ci]; let categoryId=c.id;
        const payload={card_id:card.id,title_fr:c.title_fr.trim(),title_en:c.title_en.trim(),visual_type:c.visual_type,image_url:c.image_url||null,background_color:c.background_color,text_color:c.text_color,sort_order:ci,is_active:c.is_active,updated_at:new Date().toISOString()};
        if(c.id.startsWith("new-")){
          const {data,error}=await supabase.from("card_catalog_categories").insert(payload).select().single(); if(error)throw error; categoryId=data.id;
        } else {
          const {error}=await supabase.from("card_catalog_categories").update(payload).eq("id",c.id); if(error)throw error;
        }
        keep.add(categoryId);
        const {data:oldItems}=await supabase.from("card_catalog_items").select("id").eq("category_id",categoryId);
        const keepItems=new Set<string>();
        for(let ii=0;ii<c.items.length;ii++){
          const x=c.items[ii];
          const ip={category_id:categoryId,title_fr:x.title_fr.trim(),title_en:x.title_en.trim(),description_fr:x.description_fr.trim(),description_en:x.description_en.trim(),visual_type:x.visual_type,image_url:x.image_url||null,icon:x.icon||"sparkles",price:x.price===""?null:Number(x.price),price_mode:x.price_mode,currency:x.currency||card.catalog_primary_currency||"TND",secondary_price:x.secondary_price===""?null:Number(x.secondary_price),secondary_currency:x.secondary_currency||null,sort_order:ii,is_active:x.is_active,updated_at:new Date().toISOString()};
          if(x.id.startsWith("new-")){const {data,error}=await supabase.from("card_catalog_items").insert(ip).select().single();if(error)throw error;keepItems.add(data.id)}
          else {const {error}=await supabase.from("card_catalog_items").update(ip).eq("id",x.id);if(error)throw error;keepItems.add(x.id)}
        }
        for(const old of oldItems||[]) if(!keepItems.has(old.id)) await supabase.from("card_catalog_items").delete().eq("id",old.id);
      }
      for(const old of oldCats||[]) if(!keep.has(old.id)) await supabase.from("card_catalog_categories").delete().eq("id",old.id);
      setMessage(fr?"Catalogue enregistré.":"Catalog saved."); await load();
    } catch(e:any){setMessage(e.message||"Erreur");} finally{setSaving(false)}
  }

  if(loading) return <main className="catalogPage"><p>{fr?"Chargement…":"Loading…"}</p></main>;
  if(!card) return null;

  return <main className="catalogPage">
    <div className="head"><div><span>VISITECARD</span><h1>{fr?"Mon catalogue":"My catalog"}</h1><p>{fr?"Gérez ici vos catégories, produits, services et prix.":"Manage categories, products, services and prices here."}</p></div>
      <label className="onoff"><input type="checkbox" checked={!!card.catalog_enabled} onChange={e=>setCard({...card,catalog_enabled:e.target.checked})}/><b>{card.catalog_enabled?"ON":"OFF"}</b></label>
    </div>

    <section className="settings">
      <label>{fr?"Nom du bouton public":"Public button label"}<input value={fr?(card.catalog_label_fr||""):(card.catalog_label_en||"")} onChange={e=>setCard({...card,[fr?"catalog_label_fr":"catalog_label_en"]:e.target.value})}/></label>
      <label>{fr?"Devise principale":"Primary currency"}<select value={card.catalog_primary_currency||"TND"} onChange={e=>setCard({...card,catalog_primary_currency:e.target.value})}><option>TND</option><option>EUR</option><option>USD</option><option>GBP</option><option>CAD</option><option>AED</option></select></label>
    </section>

    <div className="bar"><h2>{fr?"Catégories":"Categories"}</h2><button onClick={addCategory}>+ {fr?"Ajouter une catégorie":"Add category"}</button></div>
    {categories.length===0?<div className="empty">{fr?"Aucune catégorie. Cliquez sur « Ajouter une catégorie ».":"No category yet."}</div>:null}

    <div className="categories">{categories.map((c,ci)=><section className="category" key={c.id}>
      <div className="categoryTop"><div className="order"><button onClick={()=>moveCategory(ci,-1)}>↑</button><button onClick={()=>moveCategory(ci,1)}>↓</button></div><strong>{c.title_fr||`${fr?"Catégorie":"Category"} ${ci+1}`}</strong><label><input type="checkbox" checked={c.is_active} onChange={e=>updateCategory(ci,{is_active:e.target.checked})}/> {fr?"Visible":"Visible"}</label><button className="danger" onClick={()=>removeCategory(ci)}>{fr?"Supprimer":"Delete"}</button></div>
      <div className="grid"><label>Titre FR<input value={c.title_fr} onChange={e=>updateCategory(ci,{title_fr:e.target.value})}/></label><label>Title EN<input value={c.title_en} onChange={e=>updateCategory(ci,{title_en:e.target.value})}/></label><label>{fr?"Fond":"Background"}<input type="color" value={c.background_color} onChange={e=>updateCategory(ci,{background_color:e.target.value})}/></label><label>{fr?"Texte":"Text"}<input type="color" value={c.text_color} onChange={e=>updateCategory(ci,{text_color:e.target.value})}/></label></div>
      <div className="itemsHead"><h3>{fr?"Produits / Services":"Products / Services"}</h3><button onClick={()=>addItem(ci)}>+ {fr?"Ajouter":"Add"}</button></div>
      {c.items.map((x,ii)=><div className="item" key={x.id}>
        <div className="itemOrder"><button onClick={()=>moveItem(ci,ii,-1)}>↑</button><button onClick={()=>moveItem(ci,ii,1)}>↓</button></div>
        <input placeholder="Titre FR" value={x.title_fr} onChange={e=>updateItem(ci,ii,{title_fr:e.target.value})}/>
        <input placeholder="Title EN" value={x.title_en} onChange={e=>updateItem(ci,ii,{title_en:e.target.value})}/>
        <input placeholder={fr?"Description FR":"Description"} value={x.description_fr} onChange={e=>updateItem(ci,ii,{description_fr:e.target.value})}/>
        <input type="number" min="0" step="0.01" placeholder={fr?"Prix":"Price"} value={x.price} onChange={e=>updateItem(ci,ii,{price:e.target.value})}/>
        <select value={x.currency} onChange={e=>updateItem(ci,ii,{currency:e.target.value})}><option>TND</option><option>EUR</option><option>USD</option><option>GBP</option><option>CAD</option><option>AED</option></select>
        <label className="visible"><input type="checkbox" checked={x.is_active} onChange={e=>updateItem(ci,ii,{is_active:e.target.checked})}/> {fr?"Visible":"Visible"}</label>
        <button className="danger" onClick={()=>removeItem(ci,ii)}>×</button>
      </div>)}
    </section>)}</div>

    {message?<p className="message">{message}</p>:null}
    <button className="save" disabled={saving} onClick={save}>{saving?(fr?"Enregistrement…":"Saving…"):(fr?"Enregistrer le catalogue":"Save catalog")}</button>

    <style jsx>{`
      .catalogPage{max-width:1380px;margin:0 auto;padding:52px 64px 100px;color:#111}
      .head{display:flex;justify-content:space-between;gap:30px;align-items:center}.head span{font-size:13px;font-weight:900;letter-spacing:2px;color:#ff4b2b}.head h1{font-size:48px;margin:12px 0}.head p{color:#777}
      .onoff{display:flex;align-items:center;gap:10px;border:1px solid #ddd;border-radius:999px;padding:10px 16px}.onoff input{width:20px;height:20px}
      .settings,.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.settings{background:#fff;border:1px solid #e8e8e8;border-radius:22px;padding:22px;margin:28px 0}
      label{font-weight:700;font-size:13px}input,select{width:100%;box-sizing:border-box;border:1px solid #ddd;border-radius:12px;padding:12px;margin-top:7px;background:#fff}
      .bar,.categoryTop,.itemsHead{display:flex;align-items:center;justify-content:space-between;gap:12px}.bar{margin:28px 0 14px}.bar button,.itemsHead button{background:#111;color:#fff;border:0;border-radius:12px;padding:12px 16px;font-weight:800}
      .category{background:#fff;border:1px solid #e5e5e5;border-radius:22px;padding:20px;margin-bottom:18px}.categoryTop{border-bottom:1px solid #eee;padding-bottom:14px;margin-bottom:16px}.categoryTop strong{font-size:19px;margin-right:auto}.categoryTop label{display:flex;align-items:center;gap:7px}.categoryTop label input,.visible input{width:auto;margin:0}
      .order,.itemOrder{display:flex;gap:5px}.order button,.itemOrder button{border:1px solid #ddd;background:#fff;border-radius:8px;padding:6px 9px}.danger{border:0;background:#fff0ed;color:#d63c24;border-radius:10px;padding:9px 12px;font-weight:800}
      .itemsHead{margin-top:22px}.item{display:grid;grid-template-columns:auto 1fr 1fr 1.4fr .55fr .55fr auto auto;gap:8px;align-items:end;padding:10px 0;border-top:1px solid #f0f0f0}.item input,.item select{margin:0}.visible{display:flex;gap:5px;align-items:center;padding:12px 4px}
      .empty{border:1px dashed #ccc;border-radius:18px;padding:30px;text-align:center;color:#777}.save{position:sticky;bottom:18px;width:100%;margin-top:24px;border:0;border-radius:15px;background:#ff4b2b;color:#fff;padding:17px;font-size:16px;font-weight:900;box-shadow:0 8px 28px #0002}.message{text-align:center;font-weight:800}
      @media(max-width:900px){.catalogPage{padding:28px 18px 90px}.head h1{font-size:36px}.settings,.grid{grid-template-columns:1fr}.item{grid-template-columns:1fr 1fr}.itemOrder{grid-column:1/-1}}
    `}</style>
  </main>;
}
