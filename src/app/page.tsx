"use client";

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

        <div className="vcContact">
          <span className="vcContactLabel">
            {fr ? "Nous contacter" : "Contact us"}
          </span>

          <div className="vcContactLinks">
            <a
              className="vcContactBtn"
              href="mailto:zhanisana@gmail.com"
              aria-label={fr ? "Nous contacter par e-mail" : "Contact us by email"}
            >
              <span className="vcContactIcon">✉</span>
              <span>zhanisana@gmail.com</span>
            </a>

            <a
              className="vcContactBtn"
              href="https://wa.me/21620121521"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={fr ? "Nous contacter sur WhatsApp" : "Contact us on WhatsApp"}
            >
              <span className="vcContactIcon">◉</span>
              <span>+216 20 121 521</span>
            </a>
          </div>
        </div>

        <span>© 2026 VisiteCard</span>

        <small>
          {fr ? "Un projet de Sana Zhani" : "A project by Sana Zhani"}
        </small>
      </footer>

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

        .vcFooter {
          width: 100%;
          padding: 24px 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 18px 28px;
          border-top: 1px solid #edf0f3;
          color: #78808a;
          font-size: 12px;
          background: #ffffff;
        }

        .vcFooter a {
          color: inherit;
          text-decoration: none;
        }

        .vcFooter > a:hover {
          color: #ff6437;
        }

        .vcFooter small {
          font-size: 12px;
        }

        .vcContact {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 8px 7px 14px;
          border: 1px solid #e7ebef;
          border-radius: 999px;
          background: #f8fafc;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
        }

        .vcContactLabel {
          color: #081526;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .vcContactLinks {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .vcContactBtn {
          min-height: 34px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 999px;
          background: #ffffff;
          border: 1px solid #e4e8ed;
          color: #344054 !important;
          font-size: 11px;
          font-weight: 700;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .vcContactBtn:hover {
          transform: translateY(-1px);
          border-color: #ff6437;
          box-shadow: 0 5px 16px rgba(15, 23, 42, 0.07);
        }

        .vcContactIcon {
          color: #ff6437;
          font-size: 14px;
          line-height: 1;
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

          .vcFooter {
            min-height: auto;
            padding: 22px 15px 26px;
            flex-direction: column;
            gap: 10px;
          }

          .vcContact {
            width: min(100%, 390px);
            padding: 10px;
            flex-direction: column;
            border-radius: 20px;
          }

          .vcContactLinks {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr;
            gap: 7px;
          }

          .vcContactBtn {
            width: 100%;
            min-height: 40px;
            padding: 0 10px;
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
      `}</style>
    </main>
  );
}
