"use client";

import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import SocialIcon, { type SocialKind } from "@/components/SocialIcon";
import { useLanguage } from "@/components/LanguageProvider";

const socials: Array<{
  kind: SocialKind;
  label: string;
}> = [
  {
    kind: "instagram",
    label: "Instagram",
  },
  {
    kind: "facebook",
    label: "Facebook",
  },
  {
    kind: "tiktok",
    label: "TikTok",
  },
  {
    kind: "whatsapp",
    label: "WhatsApp",
  },
  {
    kind: "linkedin",
    label: "LinkedIn",
  },
  {
    kind: "youtube",
    label: "YouTube",
  },
];

export default function HomePage() {
  const { lang } = useLanguage();

  const isFrench = lang === "fr";

  return (
    <main className="site">
      <PublicHeader />

      <section className="hero">
        <div className="heroInner">
          <h1>
            {isFrench ? (
              <>
                Un seul QR code
                <br />
                pour tous vos réseaux sociaux
                <span>.</span>
              </>
            ) : (
              <>
                One QR code
                <br />
                for all your social networks
                <span>.</span>
              </>
            )}
          </h1>

          <p>
            {isFrench
              ? "Une carte digitale simple, élégante et toujours à jour."
              : "A simple, elegant digital card that is always up to date."}
          </p>

          <div className="socialGrid">
            {socials.map((social) => (
              <div
                className={`socialCard socialCard-${social.kind}`}
                key={social.kind}
              >
                <SocialIcon
                  kind={social.kind}
                  size={32}
                />

                <b>{social.label}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="siteFooter">
        <Link href="/conditions-generales">
          {isFrench
            ? "Conditions générales"
            : "Terms & Conditions"}
        </Link>

        <span>© 2026 VisiteCard</span>

        <small>
          {isFrench
            ? "Un projet de Sana Zhani"
            : "A project by Sana Zhani"}
        </small>
      </footer>
    </main>
  );
}
