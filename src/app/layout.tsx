import "./globals.css";import {LanguageProvider} from "@/components/LanguageProvider";
export const metadata={title:"VisiteCard",description:"Votre carte digitale et QR code"};
export const viewport={width:"device-width",initialScale:1,maximumScale:1,userScalable:false};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body><LanguageProvider>{children}</LanguageProvider></body></html>}
