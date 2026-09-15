"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { getSupabaseBrowser } from "@/app/lib/supabase";

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fr = lang === "fr";

  const links = [
    {
      href: "/mon-espace",
      label: fr ? "Accueil" : "Home",
    },
    {
      href: "/mon-espace/statistiques",
      label: fr ? "Statistiques" : "Statistics",
    },
    {
      href: "/mon-espace/avis",
      label: fr ? "Avis" : "Reviews",
    },
    {
      href: "/mon-espace/profil",
      label: fr ? "Profil" : "Profile",
    },
  ];

  function isActive(href: string) {
    if (href === "/mon-espace") {
      return pathname === "/mon-espace";
    }

    return pathname.startsWith(href);
  }

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const supabase = getSupabaseBrowser();

      await supabase.auth.signOut();

      router.replace("/connexion");
      router.refresh();
    } catch (error) {
      console.error(error);
      router.replace("/connexion");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header className="dashboardHeader">
        <div className="dashboardHeaderInner">
          <Link
            href="/mon-espace"
            className="dashboardLogo"
            onClick={() => setMenuOpen(false)}
          >
            <img src="/logo.png" alt="VisiteCard" />
          </Link>

          <nav className="desktopNav">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "active" : ""}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="dashboardActions">
            <div className="languageSwitch">
              <button
                type="button"
                className={lang === "fr" ? "active" : ""}
                onClick={() => setLang("fr")}
              >
                FR
              </button>

              <span>|</span>

              <button
                type="button"
                className={lang === "en" ? "active" : ""}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              className="logoutButton"
              onClick={logout}
              disabled={loggingOut}
            >
              {loggingOut
                ? "..."
                : fr
                  ? "Déconnexion"
                  : "Sign out"}
            </button>

            <button
              type="button"
              className={`mobileMenuButton ${
                menuOpen ? "open" : ""
              }`}
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={fr ? "Ouvrir le menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobileNav">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              className="mobileLogout"
              onClick={logout}
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

      <style jsx>{`
        .dashboardHeader {
          position: relative;
          z-index: 100;
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #e8ebef;
        }

        .dashboardHeaderInner {
          width: 100%;
          min-height: 104px;
          padding: 14px 64px;
          display: grid;
          grid-template-columns: 190px 1fr auto;
          align-items: center;
          gap: 30px;
        }

        .dashboardLogo {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          width: fit-content;
          text-decoration: none;
        }

        .dashboardLogo img {
          display: block;
          width: 112px;
          height: auto;
          object-fit: contain;
        }

        .desktopNav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .desktopNav a {
          min-height: 48px;
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          color: #646b78;
          text-decoration: none;
          font-size: 15px;
          font-weight: 800;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .desktopNav a:hover {
          color: #ff542d;
          background: #fff6f2;
        }

        .desktopNav a.active {
          color: #ff542d;
          background: #fff0e9;
        }

        .dashboardActions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
        }

        .languageSwitch {
          display: flex;
          align-items: center;
          gap: 10px;
          white-space: nowrap;
        }

        .languageSwitch button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #9aa0aa;
          font-family: inherit;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .languageSwitch button.active {
          color: #ff542d;
        }

        .languageSwitch span {
          color: #c7cbd1;
          font-size: 14px;
        }

        .logoutButton {
          min-height: 48px;
          padding: 0 18px;
          border: 1px solid #dfe3e8;
          border-radius: 14px;
          background: #ffffff;
          color: #596170;
          font-family: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            color 0.2s ease,
            background 0.2s ease;
        }

        .logoutButton:hover {
          border-color: #ff542d;
          background: #fff7f4;
          color: #ff542d;
        }

        .logoutButton:disabled,
        .mobileLogout:disabled {
          cursor: wait;
          opacity: 0.6;
        }

        .mobileMenuButton {
          width: 44px;
          height: 44px;
          padding: 0;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 1px solid #e1e5ea;
          border-radius: 12px;
          background: #ffffff;
          cursor: pointer;
        }

        .mobileMenuButton span {
          width: 19px;
          height: 2px;
          display: block;
          border-radius: 10px;
          background: #17202c;
          transition: 0.2s ease;
        }

        .mobileMenuButton.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .mobileMenuButton.open span:nth-child(2) {
          opacity: 0;
        }

        .mobileMenuButton.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        .mobileNav {
          display: none;
        }

        @media (max-width: 980px) {
          .dashboardHeaderInner {
            padding: 13px 28px;
            grid-template-columns: 140px 1fr auto;
          }

          .desktopNav a {
            padding: 0 10px;
            font-size: 14px;
          }

          .logoutButton {
            padding: 0 13px;
          }
        }

        @media (max-width: 760px) {
          .dashboardHeaderInner {
            min-height: 78px;
            padding: 10px 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .dashboardLogo img {
            width: 86px;
          }

          .desktopNav {
            display: none;
          }

          .dashboardActions {
            gap: 11px;
          }

          .languageSwitch {
            gap: 6px;
          }

          .languageSwitch button {
            font-size: 12px;
          }

          .languageSwitch span {
            font-size: 11px;
          }

          .logoutButton {
            display: none;
          }

          .mobileMenuButton {
            display: flex;
          }

          .mobileNav {
            padding: 8px 15px 15px;
            display: grid;
            gap: 5px;
            border-top: 1px solid #f0f1f3;
            background: #ffffff;
          }

          .mobileNav a,
          .mobileLogout {
            width: 100%;
            min-height: 48px;
            padding: 0 15px;
            display: flex;
            align-items: center;
            border: 0;
            border-radius: 12px;
            background: transparent;
            color: #5f6672;
            text-decoration: none;
            text-align: left;
            font-family: inherit;
            font-size: 14px;
            font-weight: 800;
          }

          .mobileNav a.active {
            color: #ff542d;
            background: #fff0e9;
          }

          .mobileLogout {
            margin-top: 5px;
            border: 1px solid #eceef1;
            color: #ff542d;
            cursor: pointer;
          }
        }

        @media (max-width: 390px) {
          .dashboardHeaderInner {
            padding-left: 11px;
            padding-right: 11px;
          }

          .dashboardLogo img {
            width: 78px;
          }

          .dashboardActions {
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
}
