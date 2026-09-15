"use client";

import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import { useLanguage } from "@/components/LanguageProvider";

type SocialType =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "linkedin"
  | "youtube";

const socials: Array<{
  type: SocialType;
  label: string;
}> = [
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
      <span className="iconBox instagram">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="17.4" cy="6.7" r="1.15" fill="currentColor" />
        </svg>
      </span>
    );
  }

  if (type === "facebook") {
    return (
      <span className="iconBox facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M13.8 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V4a21 21 0 0 0-2.4-.1c-2.4 0-4.1 1.5-4.1 4.1v2H7.8v3h2.7v8h3.3Z"
          />
        </svg>
      </span>
    );
  }

  if (type === "tiktok") {
    return (
      <span className="iconBox tiktok">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.2 3c.4 2.5 1.9 4 4.4 4.2V10a7.4 7.4 0 0 1-4.4-1.3v4.9c0 3.9-2.6 6.4-5.7 6.4a5.3 5.3 0 0 1-5.2-5.4c0-3.4 2.5-5.2 6.3-5.3V12c-.5 0-1 .2-1.5.4-1.3.5-2.1 1.4-1.9 2.9.4 2.9 5.8 3.7 5.4-1.9V3h2.6Z"
          />
        </svg>
      </span>
    );
  }

  if (type === "whatsapp") {
    return (
      <span className="iconBox whatsapp">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3a8.7 8.7 0 0 0-7.5 13.1L3.3 21l5-1.3A8.7 8.7 0 1 0 12 3Zm0 15.7a7 7 0 0 1-3.6-1l-.3-.2-2.9.8.8-2.8-.2-.3A7 7 0 1 1 12 18.7Zm3.8-5.2c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a5.7 5.7 0 0 1-1.7-1 6.2 6.2 0 0 1-1.2-1.5c-.1-.2 0-.4.1-.5l.4-.5.2-.4c.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z"
          />
        </svg>
      </span>
    );
  }

  if (type === "linkedin") {
    return (
      <span className="iconBox linkedin">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M6.5 8.2H3.4V21h3.1V8.2ZM5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm4 5.2V21h3.1v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2.1 1.9 2.1 3.4V21h3.1v-7c0-3.4-.7-6-4.7-6a4.1 4.1 0 0 0-3.7 2h-.1V8.2H9Z"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="iconBox youtube">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.6 7.1a2.8 2.8 0 0 0-2-2C17.9 4.6 12 4.6 12 4.6s-5.9 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.9 2.8 2.8 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.9ZM10 15.2V8.8l5.5 3.2-5.5 3.2Z"
        />
      </svg>
    </span>
  );
}

export default function HomePage() {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  return (
    <main className="homePage">
      <PublicHeader />

      <section className="homeHero">
        <div className="homeContent">
          <h1>
            {fr ? (
              <>
                Un seul QR code
                <br />
                pour tous vos réseaux sociaux
                <span className="orange">.</span>
              </>
            ) : (
              <>
                One QR code
                <br />
                for all your social networks
                <span className="orange">.</span>
              </>
            )}
          </h1>

          <p>
            {fr
              ? "Une carte digitale simple, élégante et toujours à jour."
              : "A simple, elegant digital card that is always up to date."}
          </p>

          <div className="socialGrid">
            {socials.map((social) => (
              <div className="socialCard" key={social.type}>
                <SocialLogo type={social.type} />
                <strong>{social.label}</strong>
              </div>
            ))}
          </div>

          <Link href="/creer-compte" className="startButton">
            {fr ? "Créer ma carte gratuitement" : "Create my card for free"}
          </Link>
        </div>
      </section>

      <footer className="homeFooter">
        <Link href="/conditions-generales">
          {fr ? "Conditions générales" : "Terms & Conditions"}
        </Link>

        <span>© 2026 VisiteCard</span>

        <small>
          {fr ? "Un projet de Sana Zhani" : "A project by Sana Zhani"}
        </small>
      </footer>

      <style jsx>{`
        .homePage {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          color: #0c1725;
        }

        .homeHero {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 68px 20px 55px;
        }

        .homeContent {
          width: 100%;
          max-width: 930px;
          text-align: center;
        }

        h1 {
          margin: 0;
          font-size: clamp(42px, 5.1vw, 68px);
          line-height: 0.99;
          letter-spacing: -0.055em;
          font-weight: 900;
        }

        .orange {
          color: #ff6537;
        }

        p {
          margin: 24px auto 38px;
          color: #6e7681;
          font-size: 18px;
          line-height: 1.5;
        }

        .socialGrid {
          width: min(520px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .socialCard {
          min-height: 116px;
          padding: 18px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 11px;
          border: 1px solid #e8ebef;
          border-radius: 20px;
          background: #fff;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.045);
        }

        .socialCard strong {
          font-size: 14px;
          color: #17202b;
        }

        .iconBox {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #fff;
        }

        .iconBox svg {
          width: 27px;
          height: 27px;
          display: block;
        }

        .instagram {
          background: linear-gradient(
            135deg,
            #f9ce34 0%,
            #ee2a7b 45%,
            #6228d7 100%
          );
        }

        .facebook {
          background: #1877f2;
        }

        .tiktok {
          background: #111111;
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

        .startButton {
          min-height: 52px;
          margin-top: 32px;
          padding: 0 25px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #ff6537;
          color: #fff;
          text-decoration: none;
          font-size: 15px;
          font-weight: 900;
          box-shadow: 0 12px 28px rgba(255, 101, 55, 0.2);
        }

        .homeFooter {
          min-height: 74px;
          padding: 18px 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          border-top: 1px solid #eef0f2;
          color: #7a818a;
          font-size: 12px;
        }

        .homeFooter a {
          color: inherit;
          text-decoration: none;
        }

        .homeFooter small {
          font-size: inherit;
        }

        @media (max-width: 700px) {
          .homeHero {
            padding: 48px 16px 38px;
          }

          h1 {
            font-size: clamp(37px, 11vw, 52px);
            line-height: 1.02;
          }

          p {
            max-width: 330px;
            margin: 20px auto 30px;
            font-size: 15px;
          }

          .socialGrid {
            width: 100%;
            max-width: 390px;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .socialCard {
            min-height: 105px;
            border-radius: 17px;
          }

          .iconBox {
            width: 45px;
            height: 45px;
            border-radius: 13px;
          }

          .iconBox svg {
            width: 25px;
            height: 25px;
          }

          .startButton {
            width: min(100%, 390px);
          }

          .homeFooter {
            padding: 22px 15px;
            flex-direction: column;
            gap: 7px;
          }
        }

        @media (max-width: 380px) {
          h1 {
            font-size: 35px;
          }

          .socialCard {
            min-height: 98px;
          }
        }
      `}</style>
    </main>
  );
}
