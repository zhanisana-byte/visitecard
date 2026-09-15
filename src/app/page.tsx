"use client";

import Link from "next/link";

const socials = [
  { name: "Instagram", icon: "◎", className: "instagram" },
  { name: "Facebook", icon: "f", className: "facebook" },
  { name: "TikTok", icon: "♪", className: "tiktok" },
  { name: "WhatsApp", icon: "◔", className: "whatsapp" },
  { name: "LinkedIn", icon: "in", className: "linkedin" },
  { name: "YouTube", icon: "▶", className: "youtube" },
];

export default function HomePage() {
  return (
    <main className="home">
      <header className="header">
        <div className="headerInner">
          <Link href="/" className="brand" aria-label="VisiteCard">
            <img src="/logo.png" alt="VisiteCard" />
          </Link>

          <div className="headerRight">
            <div className="languages">
              <button className="active">FR</button>
              <span />
              <button>EN</button>
            </div>

            <Link href="/connexion" className="login">
              Connexion
            </Link>

            <Link href="/creer-compte" className="register">
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="glow glowLeft" />
        <div className="glow glowRight" />

        <div className="heroContent">
          <h1>
            Un seul QR code
            <br />
            pour tous vos réseaux sociaux<span>.</span>
          </h1>

          <p>Une carte digitale simple, élégante et toujours à jour.</p>

          <div className="socialGrid">
            {socials.map((social) => (
              <div className="socialCard" key={social.name}>
                <div className={`socialIcon ${social.className}`}>
                  {social.icon}
                </div>
                <strong>{social.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .home {
          min-height: 100vh;
          background: #fff;
          color: #07142c;
          overflow: hidden;
          font-family: Arial, Helvetica, sans-serif;
        }

        .header {
          height: 112px;
          border-bottom: 1px solid #e8e8e8;
          background: rgba(255,255,255,.96);
          position: relative;
          z-index: 10;
        }

        .headerInner {
          width: min(1340px, calc(100% - 80px));
          height: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        .brand {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .brand img {
          display: block;
          width: 285px;
          max-height: 82px;
          object-fit: contain;
          object-position: left center;
        }

        .headerRight {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .languages {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-right: 10px;
        }

        .languages button {
          border: 0;
          background: transparent;
          padding: 5px 0;
          color: #8991a0;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
        }

        .languages button.active {
          color: #ff501e;
        }

        .languages span {
          width: 1px;
          height: 21px;
          background: #bfc4cc;
        }

        .login,
        .register {
          height: 62px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 30px;
          border-radius: 17px;
          font-size: 17px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .login {
          color: #07142c;
          border: 1.5px solid #8c98ae;
          background: #fff;
        }

        .register {
          color: #fff;
          border: 1.5px solid #ff501e;
          background: #ff501e;
          padding-inline: 34px;
        }

        .hero {
          min-height: calc(100vh - 112px);
          position: relative;
          display: flex;
          justify-content: center;
          padding: 108px 24px 90px;
        }

        .heroContent {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1160px;
          text-align: center;
        }

        h1 {
          margin: 0;
          color: #07142c;
          font-size: clamp(54px, 5.1vw, 80px);
          line-height: 1.04;
          letter-spacing: -3.8px;
          font-weight: 900;
        }

        h1 span {
          color: #ff501e;
        }

        .heroContent > p {
          margin: 25px 0 50px;
          color: #7b8495;
          font-size: 25px;
          line-height: 1.4;
          font-weight: 400;
        }

        .socialGrid {
          width: 456px;
          max-width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .socialCard {
          height: 112px;
          border: 1px solid #e1e4e9;
          border-radius: 20px;
          background: rgba(255,255,255,.94);
          box-shadow: 0 7px 22px rgba(15, 28, 55, .035);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .socialIcon {
          width: 43px;
          height: 43px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 24px;
          line-height: 1;
          font-weight: 900;
          font-family: Arial, Helvetica, sans-serif;
        }

        .socialCard strong {
          color: #596274;
          font-size: 13px;
          font-weight: 800;
        }

        .instagram {
          background: linear-gradient(135deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5);
        }

        .facebook {
          background: #1877f2;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 31px;
        }

        .tiktok {
          background: #080808;
        }

        .whatsapp {
          background: #20d466;
        }

        .linkedin {
          background: #0877bd;
          font-size: 18px;
        }

        .youtube {
          background: #ff0000;
          font-size: 17px;
        }

        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(2px);
          pointer-events: none;
        }

        .glowLeft {
          width: 420px;
          height: 420px;
          left: -250px;
          bottom: -190px;
          background: radial-gradient(circle, rgba(255,114,45,.17), rgba(255,114,45,0) 72%);
        }

        .glowRight {
          width: 480px;
          height: 480px;
          right: -285px;
          top: 70px;
          background: radial-gradient(circle, rgba(255,94,69,.13), rgba(255,94,69,0) 72%);
        }

        @media (max-width: 800px) {
          .header {
            height: 92px;
          }

          .headerInner {
            width: calc(100% - 28px);
            gap: 10px;
          }

          .brand img {
            width: 145px;
            max-height: 58px;
          }

          .headerRight {
            gap: 7px;
          }

          .languages {
            display: none;
          }

          .login,
          .register {
            height: 42px;
            border-radius: 12px;
            padding: 0 13px;
            font-size: 12px;
          }

          .register {
            padding-inline: 14px;
          }

          .hero {
            min-height: calc(100vh - 92px);
            padding: 70px 18px 60px;
          }

          h1 {
            font-size: clamp(42px, 12.5vw, 58px);
            line-height: 1.02;
            letter-spacing: -2.5px;
          }

          .heroContent > p {
            margin: 24px auto 38px;
            max-width: 360px;
            font-size: 18px;
            line-height: 1.45;
          }

          .socialGrid {
            width: 320px;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }

          .socialCard {
            height: 91px;
            border-radius: 17px;
            gap: 7px;
          }

          .socialIcon {
            width: 37px;
            height: 37px;
            border-radius: 10px;
            font-size: 20px;
          }

          .facebook {
            font-size: 27px;
          }

          .linkedin {
            font-size: 16px;
          }

          .youtube {
            font-size: 15px;
          }

          .socialCard strong {
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .headerInner {
            width: calc(100% - 20px);
          }

          .brand img {
            width: 112px;
          }

          .login,
          .register {
            height: 38px;
            padding-inline: 9px;
            font-size: 10.5px;
            border-radius: 10px;
          }

          .hero {
            padding-top: 62px;
          }

          h1 {
            font-size: 43px;
          }

          .socialGrid {
            width: 292px;
          }

          .socialCard {
            height: 86px;
          }
        }
      `}</style>
    
      <style jsx global>{`
        html, body {
          overflow-x: hidden !important;
          overflow-y: auto !important;
          height: auto !important;
          min-height: 100% !important;
        }

        body > div,
        #__next,
        main {
          overflow: visible !important;
          height: auto !important;
          max-height: none !important;
        }

        * {
          scrollbar-gutter: auto !important;
        }
      `}</style>

    </main>
  );
}
