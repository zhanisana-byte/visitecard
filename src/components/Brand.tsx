import Link from "next/link";

export default function Brand() {
  return (
    <Link href="/" className="brand" aria-label="VisiteCard - Accueil">
      <img src="/Logo2.png" alt="VisiteCard.com" />
    </Link>
  );
}
