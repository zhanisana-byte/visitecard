"use client";

import Link from "next/link";

export default function ConditionsGeneralesPage() {
  return (
    <main className="page">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brandMark">V</span>
          <span className="brandText">
            visite<span>Card</span>
          </span>
        </Link>

        <Link href="/" className="backButton">
          Retour
        </Link>
      </header>

      <section className="content">
        <div className="heading">
          <span>VISITECARD</span>
          <h1>Conditions générales d’utilisation</h1>
          <p>Dernière mise à jour : 15 septembre 2026</p>
        </div>

        <article className="card">
          <section>
            <h2>1. Objet</h2>
            <p>
              VisiteCard permet à ses utilisateurs de créer une carte digitale
              accessible par lien et QR code afin de présenter leurs coordonnées,
              réseaux sociaux, liens professionnels et autres informations qu’ils
              choisissent de rendre publiques.
            </p>
          </section>

          <section>
            <h2>2. Création d’un compte</h2>
            <p>
              L’utilisateur est responsable des informations fournies lors de la
              création de son compte ainsi que de la confidentialité de ses
              identifiants de connexion.
            </p>
          </section>

          <section>
            <h2>3. Contenu publié</h2>
            <p>
              L’utilisateur reste responsable des textes, images, liens, logos,
              coordonnées et autres contenus publiés sur sa carte. Il s’engage à
              ne pas publier de contenu illégal, trompeur, portant atteinte aux
              droits d’un tiers ou contraire aux bonnes pratiques d’utilisation
              du service.
            </p>
          </section>

          <section>
            <h2>4. Liens et QR codes</h2>
            <p>
              Chaque carte possède un lien public et peut disposer d’un QR code
              permettant d’accéder à cette carte. VisiteCard peut faire évoluer
              les modalités techniques de génération ou de redirection des QR
              codes afin d’assurer le fonctionnement et les statistiques du
              service.
            </p>
          </section>

          <section>
            <h2>5. Avis</h2>
            <p>
              Lorsque la fonction Avis est activée, des visiteurs peuvent déposer
              une note et un commentaire. Le titulaire de la carte peut choisir
              d’afficher, masquer ou supprimer les avis liés à sa carte.
            </p>
          </section>

          <section>
            <h2>6. Statistiques</h2>
            <p>
              VisiteCard peut enregistrer des données techniques nécessaires au
              fonctionnement des statistiques, notamment le nombre de scans d’un
              QR code et la date de ces scans.
            </p>
          </section>

          <section>
            <h2>7. Disponibilité du service</h2>
            <p>
              VisiteCard s’efforce d’assurer une disponibilité continue du
              service. Des interruptions temporaires peuvent toutefois intervenir
              pour maintenance, mise à jour ou raison technique.
            </p>
          </section>

          <section>
            <h2>8. Utilisation interdite</h2>
            <p>
              Il est interdit d’utiliser VisiteCard à des fins frauduleuses,
              malveillantes, illicites, de harcèlement, d’usurpation d’identité ou
              pour diffuser des contenus portant atteinte aux droits d’autrui.
            </p>
          </section>

          <section>
            <h2>9. Suspension ou suppression</h2>
            <p>
              Un compte ou une carte peut être suspendu ou supprimé en cas
              d’utilisation abusive, de violation des présentes conditions ou de
              risque pour la sécurité ou le bon fonctionnement du service.
            </p>
          </section>

          <section>
            <h2>10. Évolution du service</h2>
            <p>
              VisiteCard peut ajouter, modifier ou supprimer certaines
              fonctionnalités. Les présentes conditions peuvent également être
              mises à jour lorsque le service évolue.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              Pour toute question concernant VisiteCard ou les présentes
              conditions, l’utilisateur peut contacter l’équipe depuis les
              coordonnées communiquées sur le site.
            </p>
          </section>
        </article>

        <footer className="footer">
          Projet par <strong>Sana Zhani</strong>
        </footer>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100dvh;
          background: #f8f7f5;
          color: #111;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .topbar {
          width: min(1100px, calc(100% - 36px));
          min-height: 76px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #111;
          text-decoration: none;
          font-weight: 900;
        }

        .brandMark {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #ff5228;
          color: #fff;
        }

        .brandText {
          font-size: 19px;
          letter-spacing: -0.04em;
        }

        .brandText span {
          color: #ff5228;
        }

        .backButton {
          min-height: 40px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 11px;
          background: #fff;
          color: #111;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        }

        .content {
          width: min(900px, calc(100% - 36px));
          margin: auto;
          padding: 50px 0 70px;
        }

        .heading {
          text-align: center;
        }

        .heading > span {
          color: #ff5228;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .heading h1 {
          margin: 12px auto 0;
          max-width: 760px;
          font-size: clamp(38px, 6vw, 62px);
          line-height: 1;
          letter-spacing: -0.055em;
        }

        .heading p {
          margin: 14px 0 0;
          color: #858b94;
          font-size: 13px;
        }

        .card {
          margin-top: 38px;
          padding: 34px;
          border: 1px solid #e4e2df;
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 18px 50px rgba(25, 20, 17, 0.035);
        }

        .card section + section {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid #eeeeeb;
        }

        .card h2 {
          margin: 0;
          font-size: 18px;
          letter-spacing: -0.02em;
        }

        .card p {
          margin: 10px 0 0;
          color: #666d76;
          font-size: 14px;
          line-height: 1.75;
        }

        .footer {
          padding: 28px 0 0;
          text-align: center;
          color: #90959c;
          font-size: 12px;
        }

        .footer strong {
          color: #111;
        }

        @media (max-width: 640px) {
          .topbar {
            width: calc(100% - 24px);
            min-height: 68px;
          }

          .content {
            width: calc(100% - 24px);
            padding-top: 36px;
          }

          .card {
            padding: 22px 18px;
            border-radius: 18px;
          }
        }
      `}</style>
    </main>
  );
}
