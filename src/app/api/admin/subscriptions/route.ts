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
    const {data:cards,error:ce}=await s.from("cards").select("id,user_id,full_name,company,email,phone,entity_type,slug,created_at").order("created_at",{ascending:false});
    if(ce)throw ce;

    const byId=new Map((cards||[]).map((c:any)=>[c.id,c]));
    const subscribedCardIds=new Set((subs||[]).map((x:any)=>x.card_id).filter(Boolean));

    // Abonnements réellement enregistrés.
    const subscriptionRows=(subs||[]).map((x:any)=>({
      ...x,
      card:byId.get(x.card_id)||null,
      included_via:byId.get(x.included_via_card_id)||null,
      is_missing:false,
    }));

    // Clients qui existent dans VisiteCard mais qui n'ont encore aucune ligne
    // dans `subscriptions`. On les retourne aussi afin qu'ils soient toujours
    // visibles dans l'administration et puissent être configurés en un clic.
    const missingRows=(cards||[])
      .filter((card:any)=>!subscribedCardIds.has(card.id))
      .map((card:any)=>({
        id:`missing:${card.id}`,
        user_id:card.user_id,
        card_id:card.id,
        account_type:card.entity_type==="profile"?"profile":"company",
        status:"pending",
        plan_code:"PRO",
        currency:"TND",
        price_ht:0,
        tax_rate:0,
        start_date:"",
        end_date:null,
        startup_months:0,
        auto_renew:false,
        referrer_name:null,
        referrer_code:null,
        payment_method:null,
        payment_reference:null,
        included_via_card_id:null,
        notes:null,
        created_at:card.created_at,
        updated_at:null,
        card,
        included_via:null,
        is_missing:true,
      }));

    return NextResponse.json({subscriptions:[...missingRows,...subscriptionRows]});
  }catch(e:any){return NextResponse.json({error:e.message||"Erreur"},{status:500})}
}

export async function POST(req:Request){
  try{
    if(!(await allowed())) return NextResponse.json({error:"Accès refusé."},{status:403});
    const body=await req.json();
    if(!body.card_id) return NextResponse.json({error:"Client manquant."},{status:400});

    const s=db();
    const {data:card,error:cardError}=await s
      .from("cards")
      .select("id,user_id,entity_type")
      .eq("id",body.card_id)
      .single();
    if(cardError)throw cardError;

    const {data:existing,error:existingError}=await s
      .from("subscriptions")
      .select("id")
      .eq("card_id",card.id)
      .limit(1);
    if(existingError)throw existingError;
    if(existing&&existing.length) return NextResponse.json({error:"Ce client possède déjà un abonnement."},{status:409});

    const allowedStatus=new Set(["startup","active","included","pending","expired","cancelled"]);
    const status=allowedStatus.has(body.status)?body.status:"pending";
    const today=new Date().toISOString().slice(0,10);
    const payload:any={
      user_id:card.user_id,
      card_id:card.id,
      account_type:card.entity_type==="profile"?"profile":"company",
      status,
      plan_code:String(body.plan_code||"PRO"),
      currency:String(body.currency||"TND"),
      price_ht:Number(body.price_ht||0),
      tax_rate:Number(body.tax_rate||0),
      start_date:body.start_date||today,
      end_date:body.end_date||null,
      startup_months:Number(body.startup_months||0),
      auto_renew:!!body.auto_renew,
      referrer_name:body.referrer_name||null,
      referrer_code:body.referrer_code||null,
      payment_method:body.payment_method||null,
      payment_reference:body.payment_reference||null,
      included_via_card_id:body.included_via_card_id||null,
      notes:body.notes||null,
    };

    const {data,error}=await s.from("subscriptions").insert(payload).select().single();
    if(error)throw error;
    return NextResponse.json({subscription:data},{status:201});
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
