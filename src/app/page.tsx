"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "fr" | "en";

const content = {
  fr: {
    title: "Un seul QR code pour tous vos réseaux sociaux.",
    subtitle: "Une carte digitale simple, élégante et toujours à jour.",
    login: "Connexion",
    signup: "Créer un compte",
    project: "Projet par Sana Zhani",
    terms: "Conditions générales d’utilisation",
  },
  en: {
    title: "One QR code for all your social networks.",
    subtitle: "A simple, elegant digital card that is always up to date.",
    login: "Login",
    signup: "Create account",
    project: "Project by Sana Zhani",
    terms: "Terms of use",
  },
};

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.7" r="1.15" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.2-1.5 1.5-1.5h1.7V4a16 16 0 0 0-2.3-.1c-2.4 0-4 1.4-4 4V10H7.8v3h2.7v8h3.1Z" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.2 3c.4 2.5 1.9 4 4.3 4.2V10c-1.5.1-2.7-.3-4.3-1.3v4.9c0 6.2-6.8 8.2-9.5 3.7-1.8-2.8-.7-7.8 4.9-8v2.7c-.4.1-.9.2-1.4.4-1.3.5-2.1 1.3-1.9 2.9.4 2.9 5.8 3.7 5.4-1.9V3h2.5Z" fill="currentColor" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11.7A8 8 0 0 1 8.2 18.8L4 20l1.2-4.1A8 8 0 1 1 20 11.7Z" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="9" width="3" height="11" rx="1" fill="currentColor" />
      <circle cx="5.5" cy="5.5" r="1.7" fill="currentColor" />
      <path d="M10 9h3v1.5c.8-1 1.9-1.8 3.5-1.8 2.8 0 3.2 2 3.2 4.6V20h-3v-5.5c0-1.3 0-2.9-1.8-2.9-1.8 0-2 1.4-2 2.9V20h-3V9Z" fill="currentColor" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12s0-3.4-.4-5a2.3 2.3 0 0 0-1.7-1.7C17.3 4.9 12 4.9 12 4.9s-5.3 0-6.9.4A2.3 2.3 0 0 0 3.4 7C3 8.6 3 12 3 12s0 3.4.4 5a2.3 2.3 0 0 0 1.7 1.7c1.6.4 6.9.4 6.9.4s5.3 0 6.9-.4a2.3 2.3 0 0 0 1.7-1.7c.4-1.6.4-5 .4-5Z" fill="currentColor" />
      <path d="m10 15 5-3-5-3v6Z" fill="#fff" />
    </svg>
  );
}

const socials = [
  { label: "Instagram", className: "instagram", icon: <InstagramIcon /> },
  { label: "Facebook", className: "facebook", icon: <FacebookIcon /> },
  { label: "TikTok", className: "tiktok", icon: <TikTokIcon /> },
  { label: "WhatsApp", className: "whatsapp", icon: <WhatsAppIcon /> },
  { label: "LinkedIn", className: "linkedin", icon: <LinkedInIcon /> },
  { label: "YouTube", className: "youtube", icon: <YouTubeIcon /> },
];

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const savedLang = localStorage.getItem("visitecard_lang");
    if (savedLang === "fr" || savedLang === "en") setLang(savedLang);
  }, []);

  function setLanguage(value: Lang) {
    setLang(value);
    localStorage.setItem("visitecard_lang", value);
  }

  const t = content[lang];

  return (
    <main className="page">
      <header className="header">
        <div className="headerInner">
          <Link href="/" className="logoLink" aria-label="VisiteCard.com">
            <img
              src="/logo-visitecard.png.png"
              alt="VisiteCard.com"
              className="logo"
            />
          </Link>

          <div className="headerActions">
            <div className="langSwitch">
              <button
                type="button"
                className={lang === "fr" ? "active" : ""}
                onClick={() => setLanguage("fr")}
              >
                FR
              </button>
              <span>/</span>
              <button
                type="button"
                className={lang === "en" ? "active" : ""}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
            </div>

            <Link href="/connexion" className="btn btnLogin">
              {t.login}
            </Link>

            <Link href="/creer-compte" className="btn btnSignup">
              {t.signup}
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="glow" />

        <div className="heroContent">
          <h1>{t.title}</h1>

          <p>{t.subtitle}</p>

          <div className="socialGrid">
            {socials.map((item) => (
              <div className="socialCard" key={item.label}>
                <span className={`socialIcon ${item.className}`}>
                  {item.icon}
                </span>
                <span className="socialName">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>{t.project}</span>
        <span className="dot">•</span>
        <Link href="/conditions-generales">{t.terms}</Link>
      </footer>

      <style jsx>{`
        :global(html),
        :global(body) {
          margin: 0;
          padding: 0;
          width: 100%;
          min-width: 0;
          overflow-x: hidden;
          background: #fbfaf8;
        }

        :global(*) {
          box-sizing: border-box;
        }

        .page {
          width: 100%;
          min-height: 100dvh;
          display: grid;
          grid-template-rows: auto 1fr auto;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 50% 42%,
              rgba(255, 82, 40, 0.08),
              transparent 30%
            ),
            #fbfaf8;
          color: #111;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .header {
          width: 100%;
          border-bottom: 1px solid #ece9e6;
          background: rgba(255, 255, 255, 0.84);
          backdrop-filter: blur(14px);
        }

        .headerInner {
          width: min(1220px, calc(100% - 32px));
          min-height: 92px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
        }

        .logoLink {
          width: 155px;
          height: 70px;
          flex: 0 0 155px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          overflow: hidden;
          text-decoration: none;
        }

        .logo {
          display: block;
          width: 155px;
          height: auto;
          max-height: 68px;
          object-fit: contain;
          object-position: left center;
          image-rendering: auto;
        }

        .headerActions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 9px;
          min-width: 0;
        }

        .langSwitch {
          min-height: 42px;
          padding: 0 11px;
          display: flex;
          align-items: center;
          gap: 5px;
          border: 1px solid #dedbd8;
          border-radius: 15px;
          background: #fff;
        }

        .langSwitch button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #7c8289;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .langSwitch button.active {
          color: #ff5228;
        }

        .langSwitch span {
          color: #aaa6a1;
          font-size: 11px;
        }

        .btn {
          min-height: 44px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease;
        }

        .btnLogin {
          border: 1px solid #ff5228;
          background: #fff;
          color: #ff5228;
        }

        .btnLogin:hover {
          background: #fff4ef;
          transform: translateY(-1px);
        }

        .btnSignup {
          border: 1px solid #ff5228;
          background: #ff5228;
          color: #fff;
          box-shadow: 0 9px 22px rgba(255, 82, 40, 0.19);
        }

        .btnSignup:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(255, 82, 40, 0.24);
        }

        .hero {
          min-width: 0;
          padding: 74px 18px 82px;
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .glow {
          position: absolute;
          width: min(620px, 82vw);
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 82, 40, 0.1),
            rgba(255, 82, 40, 0.025) 45%,
            transparent 70%
          );
          pointer-events: none;
        }

        .heroContent {
          width: min(920px, 100%);
          min-width: 0;
          position: relative;
          z-index: 1;
          text-align: center;
        }

        h1 {
          max-width: 860px;
          margin: 0 auto;
          font-size: clamp(46px, 7.2vw, 82px);
          line-height: 0.98;
          letter-spacing: -0.062em;
          font-weight: 950;
          color: #111;
        }

        p {
          max-width: 620px;
          margin: 22px auto 0;
          color: #777d86;
          font-size: clamp(15px, 1.8vw, 19px);
          line-height: 1.6;
        }

        .socialGrid {
          width: min(760px, 100%);
          margin: 38px auto 0;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .socialCard {
          width: 100%;
          min-height: 132px;
          padding: 18px 14px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 8px;
          border: 1px solid #e6e3e0;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 10px 30px rgba(20, 16, 13, 0.035);
        }

        .socialIcon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #fff;
        }

        .socialIcon :global(svg) {
          width: 29px;
          height: 29px;
        }

        .socialName {
          color: #5f6570;
          font-size: 13px;
          font-weight: 800;
        }

        .instagram {
          background: linear-gradient(
            135deg,
            #f9ce34,
            #ee2a7b 55%,
            #6228d7
          );
        }

        .facebook {
          background: #1877f2;
        }

        .tiktok {
          background: #111;
        }

        .whatsapp {
          background: #25d366;
        }

        .linkedin {
          background: #0a66c2;
        }

        .youtube {
          background: #f00;
        }

        .footer {
          width: min(1220px, calc(100% - 32px));
          margin: 0 auto;
          padding: 18px 0 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          color: #858b93;
          font-size: 11px;
          text-align: center;
        }

        .footer a {
          color: inherit;
          text-decoration: none;
          font-weight: 800;
        }

        .footer a:hover {
          color: #ff5228;
        }

        .dot {
          opacity: 0.35;
        }

        @media (max-width: 760px) {
          .headerInner {
            width: calc(100% - 22px);
            min-height: 76px;
            gap: 9px;
          }

          .logoLink {
            width: 110px;
            height: 54px;
            flex-basis: 110px;
          }

          .logo {
            width: 110px;
            max-height: 52px;
          }

          .headerActions {
            gap: 6px;
          }

          .langSwitch {
            min-height: 37px;
            padding: 0 8px;
          }

          .btn {
            min-height: 39px;
            padding: 0 11px;
            font-size: 10px;
          }

          .hero {
            padding: 56px 12px 64px;
          }

          h1 {
            font-size: clamp(38px, 11vw, 56px);
            line-height: 1;
            letter-spacing: -0.055em;
          }

          .socialGrid {
            width: 100%;
            margin-top: 30px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .socialCard {
            min-width: 0;
            min-height: 112px;
            padding: 15px 10px;
          }

          .socialIcon {
            width: 48px;
            height: 48px;
          }

          .socialName {
            font-size: 12px;
          }

          .footer {
            width: calc(100% - 24px);
          }
        }

        @media (max-width: 520px) {
          .langSwitch {
            display: none;
          }

          .logoLink {
            width: 88px;
            height: 48px;
            flex-basis: 88px;
          }

          .logo {
            width: 88px;
            max-height: 46px;
          }
        }

        @media (max-width: 420px) {
          .headerInner {
            width: calc(100% - 16px);
          }

          .logoLink {
            width: 72px;
            flex-basis: 72px;
          }

          .logo {
            width: 72px;
          }

          .btn {
            padding: 0 8px;
            font-size: 9px;
          }

          .footer {
            flex-direction: column;
            gap: 4px;
          }

          .dot {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
