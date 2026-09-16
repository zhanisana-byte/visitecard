export type SocialKind =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "linkedin"
  | "youtube"
  | "website";

type Props = {
  kind: SocialKind;
  size?: number;
  className?: string;
};

export default function SocialIcon({
  kind,
  size = 24,
  className = "",
}: Props) {
  const icons: Record<SocialKind, string> = {
    instagram: "◎",
    facebook: "f",
    tiktok: "♪",
    whatsapp: "☎",
    linkedin: "in",
    youtube: "▶",
    website: "↗",
  };

  return (
    <span
      className={`socialIcon socialIcon-${kind} ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(14, size * 0.65),
        fontWeight: 800,
        lineHeight: 1,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {icons[kind]}
    </span>
  );
}
