"use client";

import Link from "next/link";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="17.4" cy="6.8" r="1.15" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.8 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H8.2V13h2.6v8h3z"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M15.4 3c.3 1.8 1.4 3.3 3.1 4.1.8.4 1.6.5 2.5.5v3.3c-1.9 0-3.7-.6-5.2-1.7v6.2c0 3.1-2.5 5.6-5.6 5.6a5.6 5.6 0 0 1 0-11.2c.4 0 .8 0 1.2.1v3.4a2.3 2.3 0 1 0 1.1 2v-12.3h2.9z"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a9.8 9.8 0 0 0-8.4 14.9L2 22l5.3-1.5A10 10 0 1 0 12 2zm0 17.9a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.9.9-3-.2-.3A7.9 7.9 0 1 1 12 19.9zm4.4-5.9c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.3.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 5 4.3 1.8.8 2.5.8 3.4.7 1-.2 1.4-.7 1.6-1.3.2-.6.2-1.1.1-1.3-.1-.1-.3-.2-.5-.3z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.5 8.4H3.2V19h3.3V8.4zM4.8 3A1.9 1.9 0 1 0 4.8 6.8 1.9 1.9 0 0 0 4.8 3zM19.8 12.9c0-3.2-1.7-4.8-4-4.8-1.9 0-2.7 1-3.2 1.7V8.4H9.3V19h3.3v-5.2c0-1.4.3-2.8 2-2.8 1.7 0 1.7 1.6 1.7 2.9V19h3.3l.2-6.1z"
      />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 7.2a2.8 2.8 0 0 0-2-2C18.2 4.7 12 4.7 12 4.7s-6.2 0-8 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.5 12 29 29 0 0 0 2 16.8a2.8 2.8 0 0 0 2 2c1.8.5 8 .5 8 .5s6.2 0 8-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.8 29 29 0 0 0-.5-4.8z"
      />
      <path fill="#ff0000" d="M10 15.4V8.6l6 3.4-6 3.4z" />
    </svg>
  );
}

const socials = [
  {
    name: "Instagram",
    className: "instagram",
    icon: <InstagramIcon />,
  },
  {
    name: "Facebook",
    className: "facebook",
    icon: <FacebookIcon />,
  },
  {
    name: "TikTok",
    className: "tiktok",
    icon: <TikTokIcon />,
  },
  {
    name: "WhatsApp",
    className: "whatsapp",
    icon: <WhatsAppIcon />,
  },
  {
    name: "LinkedIn",
    className: "linkedin",
    icon: <LinkedInIcon />,
  },
  {
    name: "YouTube",
    className: "youtube",
    icon: <YouTubeIcon />,
  },
];

export default function HomePage() {
  return (
    <main className="home">
      <header className="header">
        <div className="headerInner">
          <Link href="/" className="logoLink">
            <img
              src="/logo.png"
              alt="VisiteCard"
              className="logo"
            />
          </Link>

          <div className="headerRight">
            <div className="languages">
              <button className="lang active" type="button">
                FR
              </button>

              <span className="separator">|</span>

              <button className="lang" type="button">
                EN
              </button>
            </div>

            <Link href="/connexion" className="loginButton">
              Connexion
            </Link>

            <Link href="/creer-compte" className="registerButton">
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="glow glowRight" />
        <div className="glow glowLeft" />

        <div className="heroContent">
          <h1 className="title">
            <span>Un seul QR code</span>

            <span>
              pour tous vos réseaux sociaux
              <b>.</b>
            </span>
          </h1>

          <p className="subtitle">
            Une carte digitale simple, élégante et toujours à jour.
          </p>

          <div className="socialGrid">
            {socials.map((social) => (
              <div className="socialCard" key={social.name}>
                <div className={`socialIcon ${social.className}`}>
                  {social.icon}
                </div>

                <span>{social.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>
          <Link href="/conditions-generales">
            Conditions générales
          </Link>

          <span className="footerDot">·</span>

          <span>© 2026 VisiteCard</span>
        </div>

        <p>Un projet de Sana Zhani</p>
      </footer>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          overflow-x: hidden;
        }

        body {
          background: #ffffff;
          color: #06142d;
          font-family: Arial, Helvetica, sans-serif;
        }

        .home {
          width: 100%;
          min-height: 100vh;

          display: flex;
          flex-direction: column;

          background: #ffffff;
          overflow-x: hidden;
        }

        /* HEADER */

        .header {
          position: relative;
          z-index: 20;

          width: 100%;
          height: 118px;

          flex-shrink: 0;

          display: flex;
          align-items: center;

          background: #ffffff;
          border-bottom: 1px solid #e8ebef;
        }

        .headerInner {
          width: calc(100% - 120px);
          max-width: 1400px;
          height: 100%;

          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;
        }

        .logoLink {
          display: flex;
          align-items: center;
          justify-content: flex-start;

          flex-shrink: 0;
        }

        .logo {
          display: block;

          width: 155px;
          height: 80px;

          object-fit: contain;
          object-position: left center;
        }

        .headerRight {
          display: flex;
          align-items: center;
          justify-content: flex-end;

          gap: 18px;
        }

        .languages {
          display: flex;
          align-items: center;

          gap: 11px;
          margin-right: 5px;
        }

        .lang {
          margin: 0;
          padding: 0;

          border: 0;
          background: transparent;

          color: #8991a0;

          font-size: 17px;
          font-weight: 800;

          cursor: pointer;
        }

        .lang.active {
          color: #ff501e;
        }

        .separator {
          color: #c0c5cd;
        }

        .loginButton,
        .registerButton {
          height: 62px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0 29px;

          border-radius: 18px;

          font-size: 16px;
          font-weight: 800;

          text-decoration: none;
          white-space: nowrap;
        }

        .loginButton {
          min-width: 158px;

          color: #06142d;

          background: #ffffff;
          border: 1.5px solid #94a0b3;
        }

        .registerButton {
          min-width: 218px;

          color: #ffffff;

          background: #ff501e;
          border: 1.5px solid #ff501e;
        }

        /* HERO */

        .hero {
          position: relative;

          width: 100%;
          flex: 1;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 60px 25px 65px;

          overflow: hidden;
        }

        .heroContent {
          position: relative;
          z-index: 2;

          width: 100%;
          max-width: 1200px;

          margin: 0 auto;

          display: flex;
          flex-direction: column;
          align-items: center;

          text-align: center;
        }

        .title {
          width: 100%;
          max-width: 1050px;

          margin: 0;

          color: #06142d;

          font-size: clamp(43px, 3.8vw, 59px);
          line-height: 1.08;
          letter-spacing: -2.4px;
          font-weight: 900;

          text-align: center;
        }

        .title span {
          display: block;
        }

        .title b {
          color: #ff501e;
        }

        .subtitle {
          margin: 24px 0 0;

          color: #7d8698;

          font-size: 20px;
          line-height: 1.45;
          font-weight: 400;
        }

        /* SOCIALS */

        .socialGrid {
          width: 390px;
          max-width: 100%;

          margin-top: 36px;

          display: grid;
          grid-template-columns: repeat(3, 1fr);

          gap: 10px;
        }

        .socialCard {
          height: 86px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 7px;

          background: rgba(255, 255, 255, 0.96);

          border: 1px solid #dfe3e9;
          border-radius: 15px;

          box-shadow: 0 5px 16px rgba(10, 25, 50, 0.03);
        }

        .socialCard > span {
          color: #596274;

          font-size: 11px;
          line-height: 1;
          font-weight: 800;
        }

        .socialIcon {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color: #ffffff;

          overflow: hidden;
        }

        .socialIcon svg {
          display: block;

          width: 23px;
          height: 23px;
        }

        .instagram {
          background:
            radial-gradient(
              circle at 30% 105%,
              #fdf497 0%,
              #fdf497 5%,
              #fd5949 45%,
              #d6249f 60%,
              #285aeb 90%
            );
        }

        .facebook {
          background: #1877f2;
        }

        .facebook svg {
          width: 28px;
          height: 28px;
        }

        .tiktok {
          background: #050505;
        }

        .whatsapp {
          background: #25d366;
        }

        .linkedin {
          background: #0a66c2;
        }

        .youtube {
          background: #ff0000;
        }

        .youtube svg {
          width: 25px;
          height: 25px;
        }

        /* DECORATION */

        .glow {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;
        }

        .glowRight {
          width: 490px;
          height: 490px;

          right: -305px;
          top: 45px;

          background: radial-gradient(
            circle,
            rgba(255, 93, 55, 0.12) 0%,
            rgba(255, 93, 55, 0.05) 45%,
            rgba(255, 93, 55, 0) 72%
          );
        }

        .glowLeft {
          width: 470px;
          height: 470px;

          left: -300px;
          bottom: -225px;

          background: radial-gradient(
            circle,
            rgba(255, 116, 48, 0.13) 0%,
            rgba(255, 116, 48, 0.05) 46%,
            rgba(255, 116, 48, 0) 72%
          );
        }

        /* FOOTER */

        .footer {
          width: 100%;

          flex-shrink: 0;

          padding: 16px 20px 18px;

          background: #ffffff;

          border-top: 1px solid #eceef1;

          color: #8a92a1;

          text-align: center;

          font-size: 11px;
          line-height: 1.6;
        }

        .footer > div {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          flex-wrap: wrap;
        }

        .footer a {
          color: #687182;

          font-weight: 600;

          text-decoration: none;
        }

        .footerDot {
          color: #c5c9d0;
        }

        .footer p {
          margin: 1px 0 0;

          color: #a0a6b1;

          font-size: 10.5px;
        }

        /* TABLET */

        @media (max-width: 900px) {
          .header {
            height: 98px;
          }

          .headerInner {
            width: calc(100% - 40px);
          }

          .logo {
            width: 130px;
            height: 65px;
          }

          .headerRight {
            gap: 9px;
          }

          .loginButton,
          .registerButton {
            height: 49px;

            padding: 0 18px;

            border-radius: 14px;

            font-size: 14px;
          }

          .loginButton {
            min-width: 118px;
          }

          .registerButton {
            min-width: 165px;
          }

          .title {
            max-width: 760px;

            font-size: 45px;
          }
        }

        /* MOBILE */

        @media (max-width: 600px) {
          .header {
            height: 76px;
          }

          .headerInner {
            width: 100%;

            padding: 0 11px;

            gap: 6px;
          }

          .logo {
            width: 88px;
            height: 48px;
          }

          .languages {
            display: none;
          }

          .headerRight {
            gap: 6px;
          }

          .loginButton,
          .registerButton {
            min-width: 0;

            height: 37px;

            padding: 0 9px;

            border-radius: 10px;

            font-size: 10.5px;
          }

          .hero {
            padding: 48px 16px 55px;

            align-items: flex-start;
          }

          .title {
            max-width: 390px;

            font-size: 33px;
            line-height: 1.07;
            letter-spacing: -1.4px;
          }

          .title span {
            display: inline;
          }

          .title span:first-child::after {
            content: " ";
          }

          .subtitle {
            max-width: 330px;

            margin-top: 20px;

            font-size: 15px;
            line-height: 1.45;
          }

          .socialGrid {
            width: 260px;

            margin-top: 29px;

            gap: 7px;
          }

          .socialCard {
            height: 70px;

            gap: 5px;

            border-radius: 12px;
          }

          .socialIcon {
            width: 29px;
            height: 29px;

            border-radius: 8px;
          }

          .socialIcon svg {
            width: 19px;
            height: 19px;
          }

          .facebook svg {
            width: 23px;
            height: 23px;
          }

          .socialCard > span {
            font-size: 9px;
          }

          .footer {
            padding: 14px 12px 16px;

            font-size: 10px;
          }

          .footer p {
            font-size: 9.5px;
          }
        }

        @media (max-width: 380px) {
          .logo {
            width: 78px;
          }

          .loginButton,
          .registerButton {
            padding: 0 7px;

            font-size: 9.5px;
          }

          .title {
            font-size: 30px;
          }

          .socialGrid {
            width: 248px;
          }
        }
      `}</style>
    </main>
  );
}
