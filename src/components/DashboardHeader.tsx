"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  {
    label: "Accueil",
    href: "/espace",
  },
  {
    label: "Statistiques",
    href: "/statistiques",
  },
  {
    label: "Avis",
    href: "/avis",
  },
  {
    label: "Aperçu",
    href: "/apercu",
  },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const [lang, setLang] = useState<"FR" | "EN">("FR");

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "VisiteCard",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Lien copié");
      }
    } catch {
      return;
    }
  };

  const isActive = (href: string) => {
    if (href === "/espace") {
      return pathname === "/espace";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <Link href="/espace" className="dashboard-logo">
            <img src="/logo.png" alt="VisiteCard" />
          </Link>

          <nav className="dashboard-nav">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`dashboard-nav-item ${
                    active ? "dashboard-nav-item-active" : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="dashboard-actions">
            <div className="dashboard-language">
              <button
                type="button"
                className={lang === "FR" ? "language-active" : ""}
                onClick={() => setLang("FR")}
              >
                FR
              </button>

              <span>/</span>

              <button
                type="button"
                className={lang === "EN" ? "language-active" : ""}
                onClick={() => setLang("EN")}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              className="dashboard-share"
              onClick={handleShare}
              aria-label="Partager"
              title="Partager"
            >
              <svg
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.6" y1="10.7" x2="15.4" y2="6.3" />
                <line x1="8.6" y1="13.3" x2="15.4" y2="17.7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <style jsx global>{`
        .dashboard-header {
          width: 100%;
          height: 92px;
          background: rgba(255, 255, 255, 0.97);
          border-bottom: 1px solid #e8e8e8;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-sizing: border-box;
        }

        .dashboard-header-inner {
          width: calc(100% - 64px);
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .dashboard-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          text-decoration: none;
        }

        .dashboard-logo img {
          display: block;
          width: 170px;
          height: 58px;
          object-fit: contain;
          object-position: left center;
        }

        .dashboard-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-left: auto;
        }

        .dashboard-nav-item {
          height: 48px;
          padding: 0 21px;
          border: 1px solid #e0e2e6;
          border-radius: 15px;
          background: #ffffff;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          color: #10131a;
          text-decoration: none;
          font-size: 15px;
          line-height: 1;
          font-weight: 750;

          white-space: nowrap;

          transition:
            border-color 0.18s ease,
            background 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease;
        }

        .dashboard-nav-item:hover {
          border-color: #ff5128;
          color: #ff5128;
          transform: translateY(-1px);
        }

        .dashboard-nav-item-active {
          border-color: #ff5128;
          background: #fff8f5;
          color: #ff5128;
        }

        .dashboard-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .dashboard-language {
          height: 42px;
          padding: 0 12px;
          border: 1px solid #e0e2e6;
          border-radius: 13px;
          display: flex;
          align-items: center;
          gap: 7px;
          background: #ffffff;
        }

        .dashboard-language button {
          border: 0;
          padding: 0;
          margin: 0;
          background: transparent;
          color: #949aa5;
          font-size: 12px;
          line-height: 1;
          font-weight: 800;
          cursor: pointer;
        }

        .dashboard-language span {
          color: #c7cbd1;
          font-size: 11px;
        }

        .dashboard-language .language-active {
          color: #ff5128;
        }

        .dashboard-share {
          width: 44px;
          height: 44px;
          padding: 0;
          border: 1px solid #e0e2e6;
          border-radius: 13px;
          background: #ffffff;
          color: #151922;

          display: flex;
          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition:
            color 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .dashboard-share:hover {
          color: #ff5128;
          border-color: #ff5128;
          background: #fff8f5;
        }

        @media (max-width: 1000px) {
          .dashboard-header-inner {
            width: calc(100% - 30px);
            gap: 14px;
          }

          .dashboard-logo img {
            width: 135px;
          }

          .dashboard-nav {
            gap: 7px;
          }

          .dashboard-nav-item {
            height: 44px;
            padding: 0 14px;
            font-size: 13px;
          }

          .dashboard-language {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .dashboard-header {
            height: auto;
            min-height: 78px;
            padding: 11px 0;
            overflow: hidden;
          }

          .dashboard-header-inner {
            width: 100%;
            max-width: none;
            padding-left: 15px;
            padding-right: 0;
            gap: 9px;
            margin: 0;
          }

          .dashboard-logo {
            position: sticky;
            left: 0;
            z-index: 5;
            background: #ffffff;
            padding-right: 5px;
          }

          .dashboard-logo img {
            width: 103px;
            height: 50px;
          }

          .dashboard-nav {
            margin: 0;
            justify-content: flex-start;
            gap: 7px;

            overflow-x: auto;
            overflow-y: hidden;

            padding: 3px 4px 5px;

            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;

            flex: 1;
          }

          .dashboard-nav::-webkit-scrollbar {
            display: none;
          }

          .dashboard-nav-item {
            flex: 0 0 auto;
            height: 42px;
            padding: 0 13px;
            border-radius: 13px;
            font-size: 12px;
          }

          .dashboard-actions {
            flex: 0 0 auto;
            padding-right: 12px;
          }

          .dashboard-language {
            display: none;
          }

          .dashboard-share {
            width: 42px;
            height: 42px;
            border-radius: 13px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-header-inner {
            padding-left: 10px;
            gap: 6px;
          }

          .dashboard-logo {
            padding-right: 2px;
          }

          .dashboard-logo img {
            width: 91px;
            height: 45px;
          }

          .dashboard-nav {
            gap: 6px;
          }

          .dashboard-nav-item {
            height: 39px;
            padding: 0 11px;
            border-radius: 12px;
            font-size: 11px;
          }

          .dashboard-actions {
            padding-right: 9px;
          }

          .dashboard-share {
            width: 39px;
            height: 39px;
            border-radius: 12px;
          }

          .dashboard-share svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </>
  );
}
