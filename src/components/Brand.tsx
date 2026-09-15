import Link from "next/link";

export default function Brand() {
  return (
    <Link className="brand" href="/" aria-label="visiteCard accueil">
      <span className="brandMark" aria-hidden="true">
        <i />
        <i />
      </span>
      <span className="brandText">
        visite<span>Card</span>
      </span>
    </Link>
  );
}
