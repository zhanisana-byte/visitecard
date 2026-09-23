import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

function db() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error("Configuration Supabase admin manquante.");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
async function allowed(){const c=await cookies();return verifyAdminSession(c.get(ADMIN_COOKIE)?.value)}

export async function GET(){
  try{
    if(!(await allowed())) return NextResponse.json({error:"Accès refusé."},{status:403});
    const s=db();
    const {data:subs,error}=await s.from("subscriptions").select("*").order("created_at",{ascending:false});
    if(error)throw error;
    const {data:cards,error:ce}=await s.from("cards").select("id,user_id,full_name,company,email,phone,entity_type,slug");
    if(ce)throw ce;
    const byId=new Map((cards||[]).map((c:any)=>[c.id,c]));
    const rows=(subs||[]).map((x:any)=>({...x,card:byId.get(x.card_id)||null,included_via:byId.get(x.included_via_card_id)||null}));
    return NextResponse.json({subscriptions:rows});
  }catch(e:any){return NextResponse.json({error:e.message||"Erreur"},{status:500})}
}

export async function PATCH(req:Request){
  try{
    if(!(await allowed())) return NextResponse.json({error:"Accès refusé."},{status:403});
    const body=await req.json(); if(!body.id)return NextResponse.json({error:"ID manquant."},{status:400});
    const allowedFields=["status","plan_code","currency","price_ht","tax_rate","start_date","end_date","startup_months","auto_renew","referrer_name","referrer_code","payment_method","payment_reference","included_via_card_id","notes"];
    const patch:any={updated_at:new Date().toISOString()};
    for(const k of allowedFields) if(Object.prototype.hasOwnProperty.call(body,k)) patch[k]=body[k]||null;
    if(typeof body.price_ht==="number")patch.price_ht=body.price_ht;
    if(typeof body.tax_rate==="number")patch.tax_rate=body.tax_rate;
    if(typeof body.startup_months==="number")patch.startup_months=body.startup_months;
    if(typeof body.auto_renew==="boolean")patch.auto_renew=body.auto_renew;
    const s=db(); const {data,error}=await s.from("subscriptions").update(patch).eq("id",body.id).select().single();
    if(error)throw error; return NextResponse.json({subscription:data});
  }catch(e:any){return NextResponse.json({error:e.message||"Erreur"},{status:500})}
}
