import { ChevronRight, UserPlus } from "lucide-react";
import QrVisual from "./QrVisual";
import SocialIcon, { type SocialKind } from "./SocialIcon";

const socials: Array<{ kind: SocialKind; label: string }> = [
  { kind: "whatsapp", label: "WhatsApp" },
  { kind: "instagram", label: "Instagram" },
  { kind: "tiktok", label: "TikTok" },
  { kind: "facebook", label: "Facebook" },
  { kind: "website", label: "Site web" },
];

export default function PhonePreview() {
  return (
    <div className="previewScene" aria-label="Aperçu d'une carte de visite digitale">
      <div className="orbit orbitOne" />
      <div className="orbit orbitTwo" />
      <div className="floatingBadge floatWhatsapp"><SocialIcon kind="whatsapp" /></div>
      <div className="floatingBadge floatInstagram"><SocialIcon kind="instagram" /></div>
      <div className="floatingBadge floatTiktok"><SocialIcon kind="tiktok" /></div>
      <div className="floatingBadge floatFacebook"><SocialIcon kind="facebook" /></div>

      <div className="phone">
        <div className="phoneTop"><span /></div>
        <div className="phoneScreen">
          <div className="profileCover">
            <span className="coverCircle one" />
            <span className="coverCircle two" />
          </div>
          <div className="avatar">SZ</div>
          <h2>Sana Zhani</h2>
          <p>Fondatrice · Digital</p>

          <div className="socialList">
            {socials.map((social) => (
              <div className="socialRow" key={social.kind}>
                <SocialIcon kind={social.kind} />
                <strong>{social.label}</strong>
                <ChevronRight size={16} />
              </div>
            ))}
          </div>

          <div className="contactButton">
            <UserPlus size={17} />
            Ajouter au contact
          </div>
        </div>
      </div>

      <div className="qrFloat">
        <QrVisual />
      </div>
    </div>
  );
}
