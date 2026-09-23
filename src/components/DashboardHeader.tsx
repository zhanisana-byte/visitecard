"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { clearLegacyAuthStorage, getSupabaseBrowser } from "@/app/lib/supabase";

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showCatalogue, setShowCatalogue] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkCompany() {
      try {
        const supabase = getSupabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("cards")
          .select("entity_type")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (mounted) setShowCatalogue(data?.entity_type === "company");
      } catch {
        if (mounted) setShowCatalogue(false);
      }
    }
    checkCompany();
    return () => { mounted = false; };
  }, []);

  const fr = lang === "fr";

  const links = [
    {
      href: "/mon-espace",
      fr: "Accueil",
      en: "Home",
    },
    {
      href: "/mon-espace/statistiques",
      fr: "Statistiques",
      en: "Statistics",
    },
    {
      href: "/mon-espace/avis",
      fr: "Avis",
      en: "Reviews",
    },
    ...(showCatalogue ? [{
      href: "/mon-espace/catalogue",
      fr: "Catalogue",
      en: "Catalog",
    }] : []),
    {
      href: "/mon-espace/profil",
      fr: "Profil",
      en: "Profile",
    },
  ];

  const active = (href: string) => {
    if (href === "/mon-espace") {
      return pathname === "/mon-espace";
    }

    return pathname.startsWith(href);
  };

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const supabase = getSupabaseBrowser();

      await supabase.auth.signOut();
      clearLegacyAuthStorage();

      router.replace("/connexion");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      clearLegacyAuthStorage();
      router.replace("/connexion");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="vc-dashboard-header">
        <div className="vc-dashboard-header-inner">
          {/* LOGO */}
          <Link
            href="/mon-espace"
            className="vc-dashboard-logo"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src="/logo.png"
              alt="VisiteCard"
            />
          </Link>

          {/* MENU DESKTOP */}
          <nav className="vc-dashboard-nav">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active(item.href)
                    ? "vc-dashboard-nav-link vc-active"
                    : "vc-dashboard-nav-link"
                }
              >
                {fr ? item.fr : item.en}
              </Link>
            ))}
          </nav>

          {/* ACTIONS */}
          <div className="vc-dashboard-actions">
            {/* LANGUE */}
            <div className="vc-dashboard-language">
              <button
                type="button"
                className={
                  lang === "fr"
                    ? "vc-lang-button vc-lang-active"
                    : "vc-lang-button"
                }
                onClick={() => setLang("fr")}
              >
                FR
              </button>

              <span>|</span>

              <button
                type="button"
                className={
                  lang === "en"
                    ? "vc-lang-button vc-lang-active"
                    : "vc-lang-button"
                }
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>

            {/* DECONNEXION DESKTOP */}
            <button
              type="button"
              className="vc-dashboard-logout"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut
                ? "..."
                : fr
                  ? "Déconnexion"
                  : "Sign out"}
            </button>

            {/* MENU MOBILE */}
            <button
              type="button"
              className={
                menuOpen
                  ? "vc-dashboard-burger vc-burger-open"
                  : "vc-dashboard-burger"
              }
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={fr ? "Ouvrir le menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* MENU MOBILE OUVERT */}
        {menuOpen && (
          <div className="vc-dashboard-mobile-menu">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active(item.href)
                    ? "vc-mobile-link vc-mobile-active"
                    : "vc-mobile-link"
                }
                onClick={() => setMenuOpen(false)}
              >
                {fr ? item.fr : item.en}
              </Link>
            ))}

            <button
              type="button"
              className="vc-mobile-logout"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut
                ? "..."
                : fr
                  ? "Déconnexion"
                  : "Sign out"}
            </button>
          </div>
        )}
      </header>

      <style jsx global>{`
        /* ==========================================
           VISITECARD - HEADER MON ESPACE
           ========================================== */

        .vc-dashboard-header,
        .vc-dashboard-header * {
          box-sizing: border-box;
        }

        .vc-dashboard-header {
          position: relative;
          z-index: 1000;

          width: 100%;

          background: #ffffff;

          border-bottom: 1px solid #e8ebef;

          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        /* ==========================================
           CONTENEUR
           ========================================== */

        .vc-dashboard-header-inner {
          width: 100%;
          max-width: 1600px;

          min-height: 104px;

          margin: 0 auto;

          padding: 12px 64px;

          display: grid;

          grid-template-columns:
            180px
            minmax(400px, 1fr)
            auto;

          align-items: center;

          gap: 30px;
        }

        /* ==========================================
           LOGO
           ========================================== */

        .vc-dashboard-logo {
          width: 120px;

          display: flex;

          align-items: center;

          justify-content: flex-start;

          text-decoration: none;
        }

        .vc-dashboard-logo img {
          width: 105px;

          max-width: 100%;

          height: auto;

          display: block;

          object-fit: contain;
        }

        /* ==========================================
           NAVIGATION DESKTOP
           ========================================== */

        .vc-dashboard-nav {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;
        }

        .vc-dashboard-nav-link {
          min-height: 48px;

          padding: 0 17px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          border-radius: 13px;

          color: #606978;

          background: transparent;

          text-decoration: none;

          font-size: 15px;

          font-weight: 800;

          line-height: 1;

          white-space: nowrap;

          transition:
            background 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease;
        }

        .vc-dashboard-nav-link:hover {
          color: #ff542d;

          background: #fff5f0;
        }

        .vc-dashboard-nav-link.vc-active {
          color: #ff542d;

          background: #fff0e9;
        }

        /* ==========================================
           PARTIE DROITE
           ========================================== */

        .vc-dashboard-actions {
          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 17px;
        }

        /* ==========================================
           FR / EN
           ========================================== */

        .vc-dashboard-language {
          min-height: 44px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 9px;
        }

        .vc-lang-button {
          margin: 0;

          padding: 5px 2px;

          border: 0;

          outline: none;

          background: transparent;

          color: #9aa0aa;

          font-family: inherit;

          font-size: 14px;

          font-weight: 900;

          line-height: 1;

          cursor: pointer;
        }

        .vc-lang-button:hover {
          color: #ff542d;
        }

        .vc-lang-button.vc-lang-active {
          color: #ff542d;
        }

        .vc-dashboard-language span {
          color: #c7cbd1;

          font-size: 14px;

          font-weight: 400;
        }

        /* ==========================================
           BOUTON DECONNEXION
           ========================================== */

        .vc-dashboard-logout {
          min-height: 48px;

          padding: 0 19px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          border: 1px solid #dfe3e8;

          border-radius: 14px;

          outline: none;

          background: #ffffff;

          color: #606978;

          font-family: inherit;

          font-size: 14px;

          font-weight: 800;

          white-space: nowrap;

          cursor: pointer;

          box-shadow:
            0 1px 2px rgba(15, 23, 42, 0.02);

          transition:
            color 0.18s ease,
            background 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .vc-dashboard-logout:hover {
          color: #ff542d;

          border-color: #ffb9a6;

          background: #fff7f4;

          box-shadow:
            0 5px 16px rgba(255, 84, 45, 0.08);
        }

        .vc-dashboard-logout:disabled {
          opacity: 0.55;

          cursor: wait;
        }

        /* ==========================================
           BURGER
           ========================================== */

        .vc-dashboard-burger {
          width: 44px;

          height: 44px;

          padding: 0;

          display: none;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 5px;

          border: 1px solid #e0e4e9;

          border-radius: 12px;

          background: #ffffff;

          cursor: pointer;
        }

        .vc-dashboard-burger span {
          width: 19px;

          height: 2px;

          display: block;

          border-radius: 20px;

          background: #17202c;

          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .vc-dashboard-burger.vc-burger-open
          span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .vc-dashboard-burger.vc-burger-open
          span:nth-child(2) {
          opacity: 0;
        }

        .vc-dashboard-burger.vc-burger-open
          span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* ==========================================
           MENU MOBILE
           ========================================== */

        .vc-dashboard-mobile-menu {
          display: none;
        }

        /* ==========================================
           TABLETTE
           ========================================== */

        @media (max-width: 1050px) {
          .vc-dashboard-header-inner {
            padding-left: 30px;

            padding-right: 30px;

            grid-template-columns:
              140px
              1fr
              auto;

            gap: 18px;
          }

          .vc-dashboard-nav {
            gap: 3px;
          }

          .vc-dashboard-nav-link {
            padding-left: 11px;

            padding-right: 11px;

            font-size: 14px;
          }

          .vc-dashboard-actions {
            gap: 11px;
          }

          .vc-dashboard-logout {
            padding-left: 14px;

            padding-right: 14px;
          }
        }

        /* ==========================================
           MOBILE
           ========================================== */

        @media (max-width: 760px) {
          .vc-dashboard-header-inner {
            min-height: 78px;

            padding: 9px 15px;

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;
          }

          .vc-dashboard-logo {
            width: auto;
          }

          .vc-dashboard-logo img {
            width: 86px;
          }

          .vc-dashboard-nav {
            display: none;
          }

          .vc-dashboard-actions {
            margin-left: auto;

            gap: 10px;
          }

          .vc-dashboard-language {
            gap: 6px;
          }

          .vc-lang-button {
            font-size: 12px;
          }

          .vc-dashboard-language span {
            font-size: 11px;
          }

          .vc-dashboard-logout {
            display: none;
          }

          .vc-dashboard-burger {
            display: flex;
          }

          .vc-dashboard-mobile-menu {
            width: 100%;

            padding: 8px 14px 15px;

            display: grid;

            gap: 5px;

            border-top: 1px solid #f0f1f3;

            background: #ffffff;

            box-shadow:
              0 12px 30px rgba(15, 23, 42, 0.06);
          }

          .vc-mobile-link {
            width: 100%;

            min-height: 48px;

            padding: 0 15px;

            display: flex;

            align-items: center;

            border-radius: 12px;

            color: #626a78;

            background: transparent;

            text-decoration: none;

            font-size: 14px;

            font-weight: 800;
          }

          .vc-mobile-link.vc-mobile-active {
            color: #ff542d;

            background: #fff0e9;
          }

          .vc-mobile-logout {
            width: 100%;

            min-height: 48px;

            margin-top: 4px;

            padding: 0 15px;

            display: flex;

            align-items: center;

            border: 1px solid #eceef1;

            border-radius: 12px;

            background: #ffffff;

            color: #ff542d;

            font-family: inherit;

            font-size: 14px;

            font-weight: 800;

            cursor: pointer;
          }

          .vc-mobile-logout:hover {
            background: #fff6f2;
          }
        }

        /* ==========================================
           PETIT MOBILE
           ========================================== */

        @media (max-width: 390px) {
          .vc-dashboard-header-inner {
            padding-left: 11px;

            padding-right: 11px;
          }

          .vc-dashboard-logo img {
            width: 78px;
          }

          .vc-dashboard-actions {
            gap: 7px;
          }

          .vc-dashboard-language {
            gap: 4px;
          }

          .vc-dashboard-burger {
            width: 41px;

            height: 41px;
          }
        }
      `}</style>
    </>
  );
}
