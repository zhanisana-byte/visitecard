"use client";

import Link from "next/link";

const socials = [
  {
    name: "Instagram",
    icon: "◎",
    background:
      "linear-gradient(135deg,#feda75 0%,#fa7e1e 25%,#d62976 50%,#962fbf 75%,#4f5bd5 100%)",
  },
  {
    name: "Facebook",
    icon: "f",
    background: "#1877F2",
  },
  {
    name: "TikTok",
    icon: "♪",
    background: "#050505",
  },
  {
    name: "WhatsApp",
    icon: "◔",
    background: "#20D466",
  },
  {
    name: "LinkedIn",
    icon: "in",
    background: "#0877BD",
  },
  {
    name: "YouTube",
    icon: "▶",
    background: "#FF0000",
  },
];

export default function HomePage() {
  return (
    <main className="home">
      <header className="header">
        <div className="headerInner">
          <Link href="/" className="logoLink">
            <img
              src="/logo-visitecard.png.png"
              alt="VisiteCard"
              className="logo"
            />
          </Link>

          <div className="headerRight">
            <div className="languages">
              <button type="button" className="lang active">
                FR
              </button>

              <span>|</span>

              <button type="button" className="lang">
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
              <strong>.</strong>
            </span>
          </h1>

          <p className="subtitle">
            Une carte digitale simple, élégante et toujours à jour.
          </p>

          <div className="socialGrid">
            {socials.map((social) => (
              <div className="socialCard" key={social.name}>
                <div
                  className="socialIcon"
                  style={{
                    background: social.background,
                  }}
                >
                  <span
                    className={
                      social.name === "Facebook"
                        ? "facebookIcon"
                        : social.name === "LinkedIn"
                          ? "linkedinIcon"
                          : ""
                    }
                  >
                    {social.icon}
                  </span>
                </div>

                <span className="socialName">{social.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footerFirst">
          <Link href="/conditions-generales">Conditions générales</Link>

          <span className="footerSeparator">·</span>

          <span>© 2026 VisiteCard</span>
        </div>

        <div className="project">Un projet de Sana Zhani</div>
      </footer>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          overflow-x: hidden;
        }

        body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          background: #ffffff;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font-family: inherit;
        }

        .home {
          position: relative;
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;

          display: flex;
          flex-direction: column;

          overflow: hidden;

          background: #ffffff;
          color: #06142d;
        }

        /* =========================
           HEADER
        ========================= */

        .header {
          position: relative;
          z-index: 20;

          flex: 0 0 auto;

          width: 100%;
          height: 118px;

          display: flex;
          align-items: center;

          background: rgba(255, 255, 255, 0.98);
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
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;

          flex-shrink: 0;

          text-decoration: none;
        }

        .logo {
          display: block;

          width: 155px;
          height: 78px;

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

          gap: 12px;

          margin-right: 7px;

          color: #b8bec9;
        }

        .lang {
          appearance: none;

          margin: 0;
          padding: 0;

          border: 0;
          outline: 0;

          background: transparent;

          color: #8991a0;

          font-size: 17px;
          font-weight: 800;

          cursor: pointer;
        }

        .lang.active {
          color: #ff501e;
        }

        .loginButton,
        .registerButton {
          height: 62px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 0 29px;

          border-radius: 18px;

          text-decoration: none;

          font-size: 16px;
          font-weight: 800;

          white-space: nowrap;

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease;
        }

        .loginButton {
          min-width: 158px;

          color: #07142c;

          background: #ffffff;

          border: 1.5px solid #94a0b3;
        }

        .registerButton {
          min-width: 218px;

          color: #ffffff;

          background: #ff501e;

          border: 1.5px solid #ff501e;
        }

        .loginButton:hover,
        .registerButton:hover {
          transform: translateY(-1px);
        }

        .registerButton:hover {
          background: #f34518;

          box-shadow: 0 10px 24px rgba(255, 80, 30, 0.18);
        }

        /* =========================
           HERO
        ========================= */

        .hero {
          position: relative;

          flex: 1 0 auto;

          width: 100%;

          min-height: 650px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 72px 30px 80px;

          overflow: hidden;
        }

        .heroContent {
          position: relative;
          z-index: 2;

          width: 100%;
          max-width: 1250px;

          margin: 0 auto;

          display: flex;
          flex-direction: column;
          align-items: center;

          text-align: center;
        }

        .title {
          width: 100%;
          max-width: 1100px;

          margin: 0;

          color: #06142d;

          font-size: clamp(46px, 4.1vw, 64px);
          line-height: 1.08;
          letter-spacing: -2.8px;
          font-weight: 900;

          text-align: center;
        }

        .title span {
          display: block;
        }

        .title strong {
          color: #ff501e;
          font-weight: 900;
        }

        .subtitle {
          margin: 25px 0 0;

          color: #7d8698;

          font-size: 21px;
          line-height: 1.45;
          font-weight: 400;

          text-align: center;
        }

        /* =========================
           SOCIAL
        ========================= */

        .socialGrid {
          width: 470px;
          max-width: 100%;

          margin-top: 45px;

          display: grid;
          grid-template-columns: repeat(3, 1fr);

          gap: 14px;
        }

        .socialCard {
          height: 108px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 9px;

          background: rgba(255, 255, 255, 0.92);

          border: 1px solid #dfe3e9;
          border-radius: 19px;

          box-shadow: 0 8px 24px rgba(10, 25, 50, 0.035);
        }

        .socialIcon {
          width: 43px;
          height: 43px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          color: #ffffff;

          font-size: 21px;
          font-weight: 900;
          line-height: 1;
        }

        .facebookIcon {
          font-size: 30px;
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 800;
        }

        .linkedinIcon {
          font-size: 16px;
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 900;
        }

        .socialName {
          color: #596274;

          font-size: 13px;
          line-height: 1;
          font-weight: 800;
        }

        /* =========================
           DECORATION
        ========================= */

        .glow {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;
        }

        .glowRight {
          width: 520px;
          height: 520px;

          right: -320px;
          top: 50px;

          background: radial-gradient(
            circle,
            rgba(255, 93, 55, 0.13) 0%,
            rgba(255, 93, 55, 0.055) 45%,
            rgba(255, 93, 55, 0) 72%
          );
        }

        .glowLeft {
          width: 500px;
          height: 500px;

          left: -310px;
          bottom: -230px;

          background: radial-gradient(
            circle,
            rgba(255, 116, 48, 0.14) 0%,
            rgba(255, 116, 48, 0.05) 46%,
            rgba(255, 116, 48, 0) 72%
          );
        }

        /* =========================
           FOOTER
        ========================= */

        .footer {
          position: relative;
          z-index: 10;

          flex: 0 0 auto;

          width: 100%;

          padding: 20px 20px 22px;

          background: #ffffff;

          border-top: 1px solid #eceef1;

          color: #8a92a1;

          text-align: center;

          font-size: 12px;
          line-height: 1.7;
        }

        .footerFirst {
          display: flex;
          align-items: center;
          justify-content: center;

          flex-wrap: wrap;

          gap: 8px;
        }

        .footer a {
          color: #687182;

          text-decoration: none;

          font-weight: 600;
        }

        .footer a:hover {
          color: #ff501e;
        }

        .footerSeparator {
          color: #c5c9d0;
        }

        .project {
          margin-top: 1px;

          color: #a0a6b1;

          font-size: 11px;
        }

        /* =========================
           TABLET
        ========================= */

        @media (max-width: 900px) {
          .header {
            height: 100px;
          }

          .headerInner {
            width: calc(100% - 40px);
          }

          .logo {
            width: 135px;
            height: 65px;
          }

          .headerRight {
            gap: 10px;
          }

          .languages {
            margin-right: 2px;
          }

          .loginButton,
          .registerButton {
            height: 50px;

            padding: 0 19px;

            border-radius: 14px;

            font-size: 14px;
          }

          .loginButton {
            min-width: 120px;
          }

          .registerButton {
            min-width: 170px;
          }

          .hero {
            min-height: 610px;

            padding-top: 70px;
            padding-bottom: 70px;
          }

          .title {
            max-width: 750px;

            font-size: 47px;
            letter-spacing: -2px;
          }

          .subtitle {
            font-size: 19px;
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 600px) {
          html,
          body {
            overflow-x: hidden !important;
          }

          .home {
            overflow-x: hidden;
            overflow-y: visible;
          }

          .header {
            height: 82px;
          }

          .headerInner {
            width: 100%;

            padding: 0 13px;

            gap: 7px;
          }

          .logo {
            width: 92px;
            height: 50px;
          }

          .headerRight {
            gap: 6px;
          }

          .languages {
            display: none;
          }

          .loginButton,
          .registerButton {
            height: 38px;

            min-width: 0;

            padding: 0 10px;

            border-radius: 11px;

            font-size: 11px;
          }

          .registerButton {
            padding-left: 11px;
            padding-right: 11px;
          }

          .hero {
            min-height: 0;

            padding: 60px 17px 65px;

            align-items: flex-start;
          }

          .heroContent {
            max-width: 100%;
          }

          .title {
            max-width: 390px;

            font-size: 36px;
            line-height: 1.06;
            letter-spacing: -1.5px;
          }

          .title span {
            display: inline;
          }

          .title span:first-child::after {
            content: " ";
          }

          .subtitle {
            max-width: 340px;

            margin-top: 22px;

            font-size: 16px;
            line-height: 1.5;
          }

          .socialGrid {
            width: 295px;

            margin-top: 35px;

            gap: 9px;
          }

          .socialCard {
            height: 88px;

            gap: 7px;

            border-radius: 15px;
          }

          .socialIcon {
            width: 37px;
            height: 37px;

            border-radius: 10px;

            font-size: 18px;
          }

          .facebookIcon {
            font-size: 26px;
          }

          .linkedinIcon {
            font-size: 14px;
          }

          .socialName {
            font-size: 11px;
          }

          .glowRight {
            width: 330px;
            height: 330px;

            right: -235px;
          }

          .glowLeft {
            width: 320px;
            height: 320px;

            left: -230px;
            bottom: -100px;
          }

          .footer {
            padding: 18px 15px 20px;

            font-size: 11px;
          }

          .project {
            font-size: 10.5px;
          }
        }

        @media (max-width: 390px) {
          .headerInner {
            padding: 0 10px;
          }

          .logo {
            width: 82px;
          }

          .loginButton,
          .registerButton {
            height: 36px;

            padding-left: 8px;
            padding-right: 8px;

            font-size: 10px;
          }

          .title {
            font-size: 33px;
          }

          .subtitle {
            font-size: 15px;
          }

          .socialGrid {
            width: 280px;
          }

          .socialCard {
            height: 84px;
          }
        }
      `}</style>
    </main>
  );
}
