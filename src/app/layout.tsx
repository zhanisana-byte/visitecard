import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "visiteCard — Un seul QR code pour tous vos réseaux",
  description:
    "Regroupez vos réseaux sociaux, WhatsApp, site web et contacts dans une seule carte digitale.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
