"use client";
import { useState } from "react";

import PublicHeader from "@/components/PublicHeader";
import { useLanguage } from "@/components/LanguageProvider";

type SocialType =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "linkedin"
  | "youtube";

const socials: { type: SocialType; label: string }[] = [
  { type: "instagram", label: "Instagram" },
  { type: "facebook", label: "Facebook" },
  { type: "tiktok", label: "TikTok" },
  { type: "whatsapp", label: "WhatsApp" },
  { type: "linkedin", label: "LinkedIn" },
  { type: "youtube", label: "YouTube" },
];

function SocialLogo({ type }: { type: SocialType }) {
  if (type === "instagram") {
    return (
      <div className="logoBox instagram">
        <svg viewBox="0 0 24 24">
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
        </svg>
      </div>
    );
  }

  if (type === "facebook") {
    return (
      <div className="logoBox facebook">
        <svg viewBox="0 0 24 24">
          <path
            fill="white"
            d="M14.2 21v-8h2.7l.4-3h-3.1V8.1c0-.9.2-1.5 1.6-1.5h1.7V4a23 23 0 0 0-2.4-.1c-2.4 0-4.1 1.5-4.1 4.1v2H8.2v3H11v8h3.2Z"
          />
        </svg>
      </div>
    );
  }

  if (type === "tiktok") {
    return (
      <div className="logoBox tiktok">
        <svg viewBox="0 0 24 24">
          <path
            fill="white"
            d="M14.3 3c.4 2.5 1.9 4 4.4 4.2V10a7.4 7.4 0 0 1-4.4-1.3v4.9c0 3.9-2.6 6.4-5.7 6.4a5.3 5.3 0 0 1-5.2-5.4c0-3.4 2.5-5.2 6.3-5.3V12c-.5 0-1 .2-1.5.4-1.3.5-2.1 1.4-1.9 2.9.4 2.9 5.8 3.7 5.4-1.9V3h2.6Z"
          />
        </svg>
      </div>
    );
  }

  if (type === "whatsapp") {
    return (
      <div className="logoBox whatsapp">
        <svg viewBox="0 0 24 24">
          <path
            fill="white"
            d="M12 3a8.8 8.8 0 0 0-7.6 13.2L3.2 21l4.9-1.3A8.8 8.8 0 1 0 12 3Zm0 15.7a6.9 6.9 0 0 1-3.5-1l-.3-.2-2.9.8.8-2.8-.2-.3A6.9 6.9 0 1 1 12 18.7Zm3.8-5.2c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a5.6 5.6 0 0 1-1.7-1 6.3 6.3 0 0 1-1.2-1.5c-.1-.2 0-.4.1-.5l.4-.5.2-.4c.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z"
          />
        </svg>
      </div>
    );
  }

  if (type === "linkedin") {
    return (
      <div className="logoBox linkedin">
        <svg viewBox="0 0 24 24">
          <path
            fill="white"
            d="M6.5 8.2H3.4V21h3.1V8.2ZM5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm4 5.2V21h3.1v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2.1 1.9 2.1 3.4V21h3.1v-7c0-3.4-.7-6-4.7-6a4.1 4.1 0 0 0-3.7 2h-.1V8.2H9Z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="logoBox youtube">
      <svg viewBox="0 0 24 24">
        <path
          fill="white"
          d="M21.6 7.1a2.8 2.8 0 0 0-2-2C17.9 4.6 12 4.6 12 4.6s-5.9 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.9 2.8 2.8 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.9ZM10 15.3V8.7l5.6 3.3-5.6 3.3Z"
        />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const [contactOpen, setContactOpen] = useState(false);
  const { lang } = useLanguage();
  const fr = lang === "fr";

  return (
    <main className="vcHome">
      <PublicHeader />

      <section className="vcHero">
        <div className="vcHeroContent">
          <h1>
            {fr ? (
              <>
                Un seul QR code
                <br />
                pour tous vos Réseaux
                <br className="desktopBreak" />{" "}
                Sociaux<span>.</span>
              </>
            ) : (
              <>
                One QR code
                <br />
                for all your social
                <br className="desktopBreak" />
                networks<span>.</span>
              </>
            )}
          </h1>

          <p>
            {fr
              ? "Une carte digitale simple, élégante et toujours à jour."
              : "A simple, elegant digital card that is always up to date."}
          </p>

          <div className="vcSocialGrid">
            {socials.map((social) => (
              <div className="vcSocialCard" key={social.type}>
                <SocialLogo type={social.type} />
                <strong>{social.label}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="vcFooter">
        <a href="/conditions-generales">
          {fr ? "Conditions générales" : "Terms & Conditions"}
        </a>

        <button
          type="button"
          className="vcContactTrigger"
          onClick={() => setContactOpen(true)}
        >
          {fr ? "Contact" : "Contact"}
        </button>

        <span>© 2026 VisiteCard</span>

        <small>
          {fr ? "Un projet de Sana Zhani" : "A project by Sana Zhani"}
        </small>
      </footer>

      {contactOpen && (
        <div
          className="vcContactOverlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setContactOpen(false);
          }}
        >
          <div
            className="vcContactModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
          >
            <button
              type="button"
              className="vcContactClose"
              onClick={() => setContactOpen(false)}
              aria-label={fr ? "Fermer" : "Close"}
            >
              ×
            </button>

            <h2 id="contact-title">
              {fr ? "Nous contacter" : "Contact us"}
            </h2>
            <p className="vcContactIntro">
              {fr
                ? "Une question ? Une suggestion ? Nous sommes là pour vous aider !"
                : "A question? A suggestion? We are here to help!"}
            </p>

            <div className="vcContactOption">
              <div className="vcContactRoundIcon vcMailIcon">✉</div>
              <div className="vcContactInfo">
                <strong>{fr ? "Par e-mail" : "By email"}</strong>
                <span>zhanisana@gmail.com</span>
              </div>
              <a className="vcContactAction vcMailAction" href="mailto:zhanisana@gmail.com">
                {fr ? "Envoyer un e-mail" : "Send an email"}
              </a>
            </div>

            <div className="vcContactOption">
              <div className="vcContactRoundIcon vcWhatsappIcon" aria-hidden="true">
                <svg viewBox="0 0 32 32" className="vcWhatsappSvg">
                  <path
                    fill="currentColor"
                    d="M16.02 3.2A12.62 12.62 0 0 0 5.3 22.48L3.5 29l6.68-1.75a12.62 12.62 0 1 0 5.84-24.05Zm0 22.94c-1.82 0-3.6-.48-5.16-1.38l-.37-.22-3.96 1.04 1.06-3.86-.24-.4a10.28 10.28 0 1 1 8.67 4.82Zm5.64-7.7c-.31-.16-1.83-.9-2.12-1-.28-.1-.49-.16-.69.16-.21.31-.8 1-.98 1.2-.18.21-.36.23-.67.08-.31-.16-1.3-.48-2.48-1.53a9.31 9.31 0 0 1-1.72-2.14c-.18-.31-.02-.48.14-.64.14-.14.31-.36.46-.54.16-.18.21-.31.31-.52.1-.2.05-.39-.03-.54-.08-.16-.7-1.68-.95-2.3-.25-.6-.51-.52-.7-.53h-.6c-.2 0-.54.08-.82.39-.28.31-1.08 1.05-1.08 2.56s1.1 2.97 1.26 3.18c.15.21 2.16 3.3 5.23 4.63.73.31 1.3.5 1.75.64.73.23 1.4.2 1.93.12.59-.09 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.08-.13-.29-.21-.6-.36Z"
                  />
                </svg>
              </div>
              <div className="vcContactInfo">
                <strong>{fr ? "Par WhatsApp" : "By WhatsApp"}</strong>
                <span>+216 20 121 521</span>
              </div>
              <a
                className="vcContactAction vcWhatsappAction"
                href="https://wa.me/21620121521"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 32 32" className="vcWhatsappBtnSvg" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M16.02 3.2A12.62 12.62 0 0 0 5.3 22.48L3.5 29l6.68-1.75a12.62 12.62 0 1 0 5.84-24.05Zm0 22.94c-1.82 0-3.6-.48-5.16-1.38l-.37-.22-3.96 1.04 1.06-3.86-.24-.4a10.28 10.28 0 1 1 8.67 4.82Zm5.64-7.7c-.31-.16-1.83-.9-2.12-1-.28-.1-.49-.16-.69.16-.21.31-.8 1-.98 1.2-.18.21-.36.23-.67.08-.31-.16-1.3-.48-2.48-1.53a9.31 9.31 0 0 1-1.72-2.14c-.18-.31-.02-.48.14-.64.14-.14.31-.36.46-.54.16-.18.21-.31.31-.52.1-.2.05-.39-.03-.54-.08-.16-.7-1.68-.95-2.3-.25-.6-.51-.52-.7-.53h-.6c-.2 0-.54.08-.82.39-.28.31-1.08 1.05-1.08 2.56s1.1 2.97 1.26 3.18c.15.21 2.16 3.3 5.23 4.63.73.31 1.3.5 1.75.64.73.23 1.4.2 1.93.12.59-.09 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.08-.13-.29-.21-.6-.36Z"
                  />
                </svg>
                {fr ? "Ouvrir WhatsApp" : "Open WhatsApp"}
              </a>
            </div>

            <p className="vcContactBottom">
              {fr ? "Nous vous répondons rapidement !" : "We reply quickly!"}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .vcHome {
          width: 100%;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          background: #ffffff;
          color: #081526;
        }

        .vcHero {
          flex: 1;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 70px 20px 52px;
        }

        .vcHeroContent {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          text-align: center;
        }

        .vcHeroContent h1 {
          margin: 0;
          color: #081526;
          font-size: clamp(48px, 5.2vw, 72px);
          font-weight: 900;
          line-height: 0.98;
          letter-spacing: -0.055em;
        }

        .vcHeroContent h1 span {
          color: #ff6437;
        }

        .vcHeroContent > p {
          margin: 26px auto 40px;
          color: #68717d;
          font-size: 18px;
          line-height: 1.5;
        }

        .vcSocialGrid {
          width: min(570px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .vcSocialCard {
          min-height: 126px;
          padding: 18px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 1px solid #e4e8ed;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 10px 32px rgba(15, 23, 42, 0.055);
        }

        .vcSocialCard strong {
          color: #111c2a;
          font-size: 14px;
          font-weight: 800;
        }

        .vcSocialCard :global(.logoBox) {
          width: 52px !important;
          height: 52px !important;
          flex: 0 0 52px;
          display: grid !important;
          place-items: center !important;
          overflow: hidden;
          border-radius: 15px;
        }

        .vcSocialCard :global(.logoBox svg) {
          width: 29px !important;
          height: 29px !important;
          display: block !important;
        }

        .vcSocialCard :global(.instagram) {
          background: linear-gradient(
            135deg,
            #f9ce34 0%,
            #ee2a7b 48%,
            #6228d7 100%
          ) !important;
        }

        .vcSocialCard :global(.facebook) {
          background: #1877f2 !important;
        }

        .vcSocialCard :global(.tiktok) {
          background: #111111 !important;
        }

        .vcSocialCard :global(.whatsapp) {
          background: #25d366 !important;
        }

        .vcSocialCard :global(.linkedin) {
          background: #0a66c2 !important;
        }

        .vcSocialCard :global(.youtube) {
          background: #ff0000 !important;
        }

        .vcContactTrigger {
          appearance: none;
          border: 0;
          background: transparent;
          padding: 0;
          color: #78808a;
          font: inherit;
          cursor: pointer;
        }

        .vcContactTrigger:hover {
          color: #ff6437;
        }

        .vcContactOverlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(8, 21, 38, 0.68);
          backdrop-filter: blur(3px);
        }

        .vcContactModal {
          position: relative;
          width: min(100%, 560px);
          padding: 30px 26px 24px;
          border: 1px solid #e7ebef;
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 28px 80px rgba(8, 21, 38, 0.28);
          color: #081526;
          animation: vcContactIn 0.2s ease-out;
        }

        @keyframes vcContactIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .vcContactClose {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: #f1f3f5;
          color: #081526;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
        }

        .vcContactModal h2 {
          margin: 0;
          text-align: center;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -0.5px;
        }

        .vcContactIntro {
          max-width: 360px;
          margin: 8px auto 22px;
          color: #667085;
          text-align: center;
          font-size: 14px;
          line-height: 1.45;
        }

        .vcContactOption {
          display: grid;
          grid-template-columns: 52px minmax(0, 1fr) auto;
          align-items: center;
          gap: 14px;
          margin-top: 12px;
          padding: 15px 14px;
          border: 1px solid #e6eaf0;
          border-radius: 20px;
        }

        .vcContactRoundIcon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          font-size: 22px;
          font-weight: 900;
        }

        .vcMailIcon {
          background: #ffe4df;
          color: #ff5636;
        }

        .vcWhatsappIcon {
          background: #dcfce7;
          color: #16b956;
        }

        .vcContactInfo {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .vcContactInfo strong {
          font-size: 15px;
          font-weight: 900;
        }

        .vcContactInfo span {
          overflow-wrap: anywhere;
          color: #667085;
          font-size: 13px;
        }

        .vcContactAction {
          min-height: 42px;
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: #fff !important;
          text-decoration: none !important;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .vcMailAction {
          background: linear-gradient(135deg, #ff7a45, #ff3b30);
        }

        .vcWhatsappAction {
          background: #22c55e;
        }

        .vcContactBottom {
          margin: 20px 0 0;
          text-align: center;
          color: #667085;
          font-size: 13px;
        }

        .vcFooter {
          width: 100%;
          min-height: 70px;
          padding: 18px 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          border-top: 1px solid #edf0f3;
          color: #78808a;
          font-size: 12px;
        }

        .vcFooter a {
          color: inherit;
          text-decoration: none;
        }

        .vcFooter a:hover {
          color: #ff6437;
        }

        .vcFooter small {
          font-size: 12px;
        }

        @media (max-width: 700px) {
          .vcHero {
            padding: 45px 15px 38px;
          }

          .vcHeroContent h1 {
            font-size: clamp(38px, 11.5vw, 52px);
            line-height: 1.01;
          }

          .desktopBreak {
            display: none;
          }

          .vcHeroContent > p {
            max-width: 340px;
            margin: 21px auto 30px;
            font-size: 15px;
          }

          .vcSocialGrid {
            width: min(100%, 400px);
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .vcSocialCard {
            min-height: 108px;
            padding: 14px 8px;
            gap: 9px;
            border-radius: 17px;
          }

          .vcSocialCard :global(.logoBox) {
            width: 46px !important;
            height: 46px !important;
            flex-basis: 46px;
            border-radius: 13px;
          }

          .vcSocialCard :global(.logoBox svg) {
            width: 26px !important;
            height: 26px !important;
          }

          .vcContactModal {
            padding: 28px 16px 20px;
            border-radius: 20px;
          }

          .vcContactModal h2 {
            font-size: 23px;
          }

          .vcContactOption {
            grid-template-columns: 46px minmax(0, 1fr);
            gap: 11px;
            padding: 13px;
          }

          .vcContactRoundIcon {
            width: 44px;
            height: 44px;
          }

          .vcContactAction {
            grid-column: 1 / -1;
            width: 100%;
          }

          .vcFooter {
            min-height: auto;
            padding: 21px 15px;
            flex-direction: column;
            gap: 7px;
          }
        }

        @media (max-width: 380px) {
          .vcHero {
            padding-left: 12px;
            padding-right: 12px;
          }

          .vcHeroContent h1 {
            font-size: 36px;
          }

          .vcSocialCard {
            min-height: 101px;
          }
        }

        /* Accueil plus compact : les 6 réseaux restent visibles plus facilement au premier écran */
        @media (min-width: 769px) {
          .vcHeader {
            min-height: 92px;
            padding-top: 12px;
            padding-bottom: 12px;
          }

          .vcHero {
            padding-top: 48px;
            padding-bottom: 42px;
          }

          .vcHero h1 {
            margin-bottom: 16px;
          }

          .vcSubtitle {
            margin-bottom: 34px;
          }

          .vcSocialGrid {
            gap: 14px;
          }
        }

        .vcWhatsappSvg {
          width: 29px;
          height: 29px;
          display: block;
        }

        .vcWhatsappBtnSvg {
          width: 17px;
          height: 17px;
          display: block;
          flex: 0 0 auto;
        }

        .vcWhatsappAction {
          gap: 7px;
        }
      `}</style>
    </main>
  );
}
