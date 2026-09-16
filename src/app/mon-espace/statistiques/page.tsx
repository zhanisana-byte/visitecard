"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

type Stats = { views: number; reviews: number; rating: number; links: number };

export default function StatistiquesPage() {
  const { lang } = useLanguage();
  const fr = lang === "fr";
  const [stats, setStats] = useState<Stats>({ views: 0, reviews: 0, rating: 0, links: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const s = getSupabaseBrowser();
        const { data: auth } = await s.auth.getUser();
        if (!auth.user) return;
        const { data: card } = await s.from("cards").select("id,social_links,custom_links,views").eq("user_id", auth.user.id).maybeSingle();
        if (!card) return;
        const { data: reviews } = await s.from("card_reviews").select("rating").eq("card_id", card.id).eq("status", "published");
        const rows = reviews || [];
        const rating = rows.length ? rows.reduce((n: number, x: any) => n + Number(x.rating || 0), 0) / rows.length : 0;
        setStats({
          views: Number((card as any).views || 0),
          reviews: rows.length,
          rating,
          links: (Array.isArray((card as any).social_links) ? (card as any).social_links.length : 0) + (Array.isArray((card as any).custom_links) ? (card as any).custom_links.length : 0),
        });
      } finally { setLoading(false); }
    })();
  }, []);

  return <main className="dashBody"><div className="pageTitle"><span>VISITECARD</span><h1>{fr ? "Statistiques" : "Statistics"}</h1><p>{fr ? "Suivez les principaux indicateurs de votre carte digitale." : "Track the main indicators of your digital card."}</p></div>
    <div className="vcStatsGrid">
      <div className="panel vcStat"><small>{fr ? "Vues" : "Views"}</small><strong>{loading ? "…" : stats.views}</strong></div>
      <div className="panel vcStat"><small>{fr ? "Avis publiés" : "Published reviews"}</small><strong>{loading ? "…" : stats.reviews}</strong></div>
      <div className="panel vcStat"><small>{fr ? "Note moyenne" : "Average rating"}</small><strong>{loading ? "…" : stats.rating ? stats.rating.toFixed(1) : "—"}</strong></div>
      <div className="panel vcStat"><small>{fr ? "Liens actifs" : "Active links"}</small><strong>{loading ? "…" : stats.links}</strong></div>
    </div>
    <style jsx>{`.vcStatsGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:30px}.vcStat{min-height:150px;display:flex;flex-direction:column;justify-content:space-between}.vcStat small{color:#7c8799;font-weight:800}.vcStat strong{font-size:42px;letter-spacing:-2px}@media(max-width:850px){.vcStatsGrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.vcStatsGrid{grid-template-columns:1fr 1fr;gap:10px}.vcStat{min-height:120px;padding:18px}.vcStat strong{font-size:32px}}`}</style>
  </main>;
}
