"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

type Review = { id:string; reviewer_name?:string; reviewer_phone?:string; rating:number; comment?:string; created_at:string; status?:string };

export default function AvisPage(){
  const {lang}=useLanguage(); const fr=lang==="fr";
  const [rows,setRows]=useState<Review[]>([]); const [loading,setLoading]=useState(true);
  async function load(){try{const s=getSupabaseBrowser();const{data:a}=await s.auth.getUser();if(!a.user)return;const{data:c}=await s.from("cards").select("id").eq("user_id",a.user.id).maybeSingle();if(!c)return;const{data}=await s.from("card_reviews").select("id,reviewer_name,reviewer_phone,rating,comment,created_at,status").eq("card_id",c.id).order("created_at",{ascending:false});setRows((data||[]) as Review[])}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  async function remove(id:string){if(!window.confirm(fr?"Supprimer cet avis ?":"Delete this review?"))return;const s=getSupabaseBrowser();await s.from("card_reviews").delete().eq("id",id);setRows(v=>v.filter(x=>x.id!==id))}
  return <main className="dashBody"><div className="pageTitle"><span>VISITECARD</span><h1>{fr?"Avis":"Reviews"}</h1><p>{fr?"Consultez les avis reçus sur votre carte publique.":"View the reviews received on your public card."}</p></div>
    <div className="vcReviews">{loading?<div className="panel">…</div>:rows.length===0?<div className="panel vcEmpty">{fr?"Aucun avis pour le moment.":"No reviews yet."}</div>:rows.map(r=><article className="panel vcReview" key={r.id}><div className="vcReviewTop"><div><strong>{r.reviewer_name|| (fr?"Visiteur":"Visitor")}</strong><span>{"★".repeat(Math.max(0,Math.min(5,Number(r.rating)||0)))}</span></div><button onClick={()=>remove(r.id)}>{fr?"Supprimer":"Delete"}</button></div>{r.comment?<p>{r.comment}</p>:null}<small>{new Date(r.created_at).toLocaleDateString(fr?"fr-FR":"en-US")}</small></article>)}</div>
    <style jsx>{`.vcReviews{display:grid;gap:14px;margin-top:30px}.vcReviewTop{display:flex;justify-content:space-between;gap:16px}.vcReviewTop>div{display:flex;align-items:center;gap:12px}.vcReviewTop span{color:#ffb000}.vcReviewTop button{border:0;background:#fff0ed;color:#b93619;border-radius:10px;padding:8px 11px;font-weight:800;cursor:pointer}.vcReview p{line-height:1.55;color:#4f596c}.vcReview small,.vcEmpty{color:#7c8799}@media(max-width:520px){.vcReviewTop>div{align-items:flex-start;flex-direction:column;gap:5px}}`}</style>
  </main>
}
