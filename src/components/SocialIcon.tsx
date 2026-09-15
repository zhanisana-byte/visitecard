import { Globe2, Instagram, MessageCircle, Music2 } from "lucide-react";

export type SocialKind = "whatsapp" | "instagram" | "tiktok" | "facebook" | "website";

export default function SocialIcon({ kind }: { kind: SocialKind }) {
  if (kind === "whatsapp") {
    return (
      <span className="socialIcon whatsapp" aria-hidden="true">
        <MessageCircle size={18} strokeWidth={2.6} />
      </span>
    );
  }

  if (kind === "instagram") {
    return (
      <span className="socialIcon instagram" aria-hidden="true">
        <Instagram size={18} strokeWidth={2.6} />
      </span>
    );
  }

  if (kind === "tiktok") {
    return (
      <span className="socialIcon tiktok" aria-hidden="true">
        <Music2 size={18} strokeWidth={2.6} />
      </span>
    );
  }

  if (kind === "facebook") {
    return (
      <span className="socialIcon facebook" aria-hidden="true">
        <b>f</b>
      </span>
    );
  }

  return (
    <span className="socialIcon website" aria-hidden="true">
      <Globe2 size={18} strokeWidth={2.4} />
    </span>
  );
}
