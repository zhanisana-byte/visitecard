"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseBrowser } from "../../lib/supabase";
import { useLanguage } from "@/components/LanguageProvider";

type Plan = "free" | "pro";

export default function ProfilPage() {
  const { lang } = useLanguage();
  const fr = lang === "fr";

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<Plan>("free");
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isPro = plan === "pro";

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = getSupabaseBrowser();

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        if (!user) {
          window.location.href = "/connexion";
          return;
        }

        setEmail(user.email || "");

        const rawPlan = String(
          user.app_metadata?.plan ||
            user.user_metadata?.plan ||
            user.app_metadata?.account_type ||
            user.user_metadata?.account_type ||
            "free"
        ).toLowerCase();

        setPlan(rawPlan === "pro" ? "pro" : "free");

        const expiration =
          user.app_metadata?.plan_expires_at ||
          user.user_metadata?.plan_expires_at ||
          user.app_metadata?.pro_expires_at ||
          user.user_metadata?.pro_expires_at ||
          null;

        setPlanExpiresAt(
          typeof expiration === "string" ? expiration : null
        );
      } catch (x: any) {
        setError(
          x?.message ||
            (fr
              ? "Impossible de charger votre profil."
              : "Unable to load your profile.")
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [fr]);

  async function changeEmail(e: FormEvent) {
    e.preventDefault();

    setMsg("");
    setError("");

    try {
      const supabase = getSupabaseBrowser();

      const { error } = await supabase.auth.updateUser({
        email,
      });

      if (error) {
        throw error;
      }

      setMsg(
        fr
          ? "Demande de modification envoyée. Vérifiez votre e-mail si une confirmation est demandée."
          : "Update request sent. Check your email if confirmation is required."
      );
    } catch (x: any) {
      setError(
        x?.message ||
          (fr
            ? "Impossible de modifier l'adresse e-mail."
            : "Unable to update email address.")
      );
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();

    setMsg("");
    setError("");

    if (newPassword.length < 6) {
      setError(
        fr
          ? "Le mot de passe doit contenir au moins 6 caractères."
          : "Password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirm) {
      setError(
        fr
          ? "Les mots de passe ne correspondent pas."
          : "Passwords do not match."
      );
      return;
    }

    try {
      const supabase = getSupabaseBrowser();

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setNewPassword("");
      setConfirm("");

      setMsg(
        fr
          ? "Mot de passe modifié."
          : "Password updated."
      );
    } catch (x: any) {
      setError(
        x?.message ||
          (fr
            ? "Impossible de modifier le mot de passe."
            : "Unable to update password.")
      );
    }
  }

  function requestPro() {
    const subject = encodeURIComponent(
      fr
        ? "Passage à VisiteCard Pro"
        : "Upgrade to VisiteCard Pro"
    );

    const body = encodeURIComponent(
      fr
        ? `Bonjour,

Je souhaite passer mon compte VisiteCard à l'offre Pro à 29 € / an.

Compte : ${email}

Merci.`
        : `Hello,

I would like to upgrade my VisiteCard account to the Pro plan at €29 / year.

Account: ${email}

Thank you.`
    );

    window.location.href = `mailto:zhanisana@gmail.com?subject=${subject}&body=${body}`;
  }

  async function logout() {
    setError("");
    setMsg("");

    try {
      const supabase = getSupabaseBrowser();

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.replace("/connexion");
    } catch (x: any) {
      setError(
        x?.message ||
          (fr
            ? "Erreur lors de la déconnexion."
            : "An error occurred while signing out.")
      );
    }
  }

  function formatExpiration(value: string) {
    try {
      return new Date(value).toLocaleDateString(
        fr ? "fr-FR" : "en-US",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    } catch {
      return value;
    }
  }

  return (
    <main className="dashBody profilePage">
      <div className="pageTitle">
        <span>VISITECARD</span>

        <h1>{fr ? "Mon profil" : "My profile"}</h1>

        <p>
          {fr
            ? "Gérez votre compte, votre abonnement et vos informations de connexion."
            : "Manage your account, subscription and sign-in information."}
        </p>
      </div>

      {error ? (
        <div className="notice">
          {error}
        </div>
      ) : null}

      {msg ? (
        <div className="vcSuccess">
          {msg}
        </div>
      ) : null}

      <section className="subscriptionSection">
        <div className="subscriptionHeading">
          <div>
            <span className="sectionEyebrow">
              {fr ? "ABONNEMENT" : "SUBSCRIPTION"}
            </span>

            <h2>
              {fr ? "Mon abonnement" : "My subscription"}
            </h2>
          </div>

          {!loading && (
            <span
              className={`currentPlanBadge ${
                isPro ? "pro" : "free"
              }`}
            >
              {isPro
                ? fr
                  ? "COMPTE PRO"
                  : "PRO ACCOUNT"
                : fr
                  ? "COMPTE GRATUIT"
                  : "FREE ACCOUNT"}
            </span>
          )}
        </div>

        <div className="plansGrid">
          <article
            className={`planCard freePlan ${
              !isPro ? "current" : ""
            }`}
          >
            {!isPro && !loading ? (
              <div className="currentRibbon">
                {fr ? "Votre offre actuelle" : "Your current plan"}
              </div>
            ) : null}

            <div className="planTop">
              <div className="planIcon freeIcon">
                <UserIcon />
              </div>

              <div>
                <span className="planName">
                  VisiteCard
                </span>

                <h3>
                  {fr ? "Gratuit" : "Free"}
                </h3>
              </div>
            </div>

            <div className="price">
              <strong>0 €</strong>

              <span>
                / {fr ? "an" : "year"}
              </span>
            </div>

            <p className="planDescription">
              {fr
                ? "Votre compte VisiteCard pour créer et partager votre présence digitale."
                : "Your VisiteCard account to create and share your digital presence."}
            </p>

            <div className="planStatus">
              <CheckIcon />

              <span>
                {!isPro
                  ? fr
                    ? "Compte actif"
                    : "Active account"
                  : fr
                    ? "Inclus dans votre compte Pro"
                    : "Included in your Pro account"}
              </span>
            </div>
          </article>

          <article
            className={`planCard proPlan ${
              isPro ? "current" : ""
            }`}
          >
            {isPro && !loading ? (
              <div className="currentRibbon proRibbon">
                {fr ? "Votre offre actuelle" : "Your current plan"}
              </div>
            ) : null}

            <div className="proGlow" />

            <div className="planTop">
              <div className="planIcon proIcon">
                <CrownIcon />
              </div>

              <div>
                <span className="planName proLabel">
                  VisiteCard
                </span>

                <h3>Pro</h3>
              </div>

              <span className="proBadge">
                PRO
              </span>
            </div>

            <div className="price proPrice">
              <strong>29 €</strong>

              <span>
                / {fr ? "an" : "year"}
              </span>
            </div>

            <div className="monthlyPrice">
              {fr
                ? "Soit seulement 2,42 € / mois"
                : "Only €2.42 / month"}
            </div>

            <p className="planDescription">
              {fr
                ? "Passez à VisiteCard Pro avec un abonnement annuel simple."
                : "Upgrade to VisiteCard Pro with a simple annual subscription."}
            </p>

            {isPro ? (
              <div className="proActiveBox">
                <div>
                  <CheckCircleIcon />

                  <span>
                    {fr
                      ? "Votre compte Pro est actif"
                      : "Your Pro account is active"}
                  </span>
                </div>

                {planExpiresAt ? (
                  <small>
                    {fr
                      ? `Valable jusqu'au ${formatExpiration(
                          planExpiresAt
                        )}`
                      : `Valid until ${formatExpiration(
                          planExpiresAt
                        )}`}
                  </small>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                className="proButton"
                onClick={requestPro}
              >
                <CrownSmallIcon />

                {fr
                  ? "Passer au Pro — 29 € / an"
                  : "Upgrade to Pro — €29 / year"}

                <ArrowIcon />
              </button>
            )}

            <div className="billingInfo">
              <LockIcon />

              <span>
                {fr
                  ? "Abonnement annuel"
                  : "Annual subscription"}
              </span>
            </div>
          </article>
        </div>
      </section>

      <div className="accountTitle">
        <span>
          {fr
            ? "INFORMATIONS DU COMPTE"
            : "ACCOUNT INFORMATION"}
        </span>

        <h2>
          {fr
            ? "Sécurité et connexion"
            : "Security and sign-in"}
        </h2>
      </div>

      <div className="profileGrid">
        <form
          className="panel accountPanel"
          onSubmit={changeEmail}
        >
          <div className="panelHeading">
            <div className="panelIcon">
              <MailIcon />
            </div>

            <div>
              <h2>
                {fr
                  ? "Adresse e-mail"
                  : "Email address"}
              </h2>

              <p>
                {fr
                  ? "L'adresse utilisée pour vous connecter."
                  : "The address used to sign in."}
              </p>
            </div>
          </div>

          <label>
            {fr ? "E-mail" : "Email"}

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </label>

          <button
            className="smallBtn"
            type="submit"
          >
            {fr
              ? "Modifier mon e-mail"
              : "Update email"}
          </button>
        </form>

        <form
          className="panel accountPanel"
          onSubmit={changePassword}
        >
          <div className="panelHeading">
            <div className="panelIcon">
              <KeyIcon />
            </div>

            <div>
              <h2>
                {fr
                  ? "Mot de passe"
                  : "Password"}
              </h2>

              <p>
                {fr
                  ? "Modifiez le mot de passe de votre compte."
                  : "Change your account password."}
              </p>
            </div>
          </div>

          <label>
            {fr
              ? "Nouveau mot de passe"
              : "New password"}

            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              autoComplete="new-password"
            />
          </label>

          <label>
            {fr ? "Confirmer" : "Confirm"}

            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) =>
                setConfirm(e.target.value)
              }
              autoComplete="new-password"
            />
          </label>

          <button
            className="smallBtn"
            type="submit"
          >
            {fr
              ? "Modifier le mot de passe"
              : "Update password"}
          </button>
        </form>
      </div>

      <div className="panel vcLogoutPanel">
        <div className="logoutContent">
          <div className="logoutIcon">
            <LogoutIcon />
          </div>

          <div>
            <h2>
              {fr
                ? "Déconnexion"
                : "Sign out"}
            </h2>

            <p>
              {fr
                ? "Déconnectez-vous de votre espace VisiteCard."
                : "Sign out of your VisiteCard space."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
        >
          {fr
            ? "Déconnexion"
            : "Sign out"}
        </button>
      </div>

      <style jsx>{`
        .profilePage {
          max-width: 1180px;
        }

        .vcSuccess {
          padding: 14px 16px;
          border-radius: 14px;
          margin-top: 18px;
          background: #ecfdf3;
          color: #087a42;
        }

        .subscriptionSection {
          margin-top: 32px;
        }

        .subscriptionHeading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .sectionEyebrow,
        .accountTitle > span {
          color: #ff501e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.13em;
        }

        .subscriptionHeading h2,
        .accountTitle h2 {
          margin: 6px 0 0;
          color: #07162e;
          font-size: 24px;
          letter-spacing: -0.5px;
        }

        .currentPlanBadge {
          padding: 9px 13px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.07em;
        }

        .currentPlanBadge.free {
          background: #eef1f5;
          color: #667085;
        }

        .currentPlanBadge.pro {
          background: #fff0ea;
          color: #ff501e;
        }

        .plansGrid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 18px;
        }

        .planCard {
          position: relative;
          min-height: 330px;
          padding: 28px;
          border: 1px solid #e3e7ed;
          border-radius: 26px;
          background: #ffffff;
          overflow: hidden;
        }

        .planCard.current {
          border-color: #ffbba7;
        }

        .proPlan {
          border-color: #ffd4c7;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(255, 80, 30, 0.13),
              transparent 38%
            ),
            linear-gradient(
              145deg,
              #ffffff 0%,
              #fffaf7 100%
            );
        }

        .proGlow {
          position: absolute;
          width: 170px;
          height: 170px;
          right: -70px;
          top: -85px;
          border-radius: 50%;
          background: rgba(255, 80, 30, 0.1);
          filter: blur(8px);
          pointer-events: none;
        }

        .currentRibbon {
          position: absolute;
          top: 0;
          right: 24px;
          padding: 7px 12px;
          border-radius: 0 0 10px 10px;
          background: #eef1f5;
          color: #626d7e;
          font-size: 9px;
          font-weight: 900;
        }

        .currentRibbon.proRibbon {
          background: #ff501e;
          color: #ffffff;
        }

        .planTop {
          position: relative;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .planIcon {
          width: 50px;
          height: 50px;
          flex: 0 0 50px;
          display: grid;
          place-items: center;
          border-radius: 16px;
        }

        .planIcon :global(svg) {
          width: 24px;
          height: 24px;
        }

        .freeIcon {
          background: #f1f3f6;
          color: #667085;
        }

        .proIcon {
          background: #fff0ea;
          color: #ff501e;
        }

        .planName {
          display: block;
          color: #8993a1;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .proLabel {
          color: #ff501e;
        }

        .planTop h3 {
          margin: 2px 0 0;
          color: #07162e;
          font-size: 24px;
        }

        .proBadge {
          margin-left: auto;
          padding: 7px 10px;
          border-radius: 9px;
          background: #07162e;
          color: #ffffff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .price {
          display: flex;
          align-items: baseline;
          gap: 7px;
          margin-top: 30px;
        }

        .price strong {
          color: #07162e;
          font-size: 42px;
          line-height: 1;
          letter-spacing: -2px;
        }

        .price span {
          color: #8b94a3;
          font-size: 13px;
          font-weight: 700;
        }

        .proPrice strong {
          color: #ff501e;
          font-size: 48px;
        }

        .monthlyPrice {
          display: inline-flex;
          margin-top: 10px;
          padding: 7px 10px;
          border-radius: 9px;
          background: #fff0ea;
          color: #d84419;
          font-size: 10px;
          font-weight: 900;
        }

        .planDescription {
          max-width: 460px;
          margin: 20px 0 0;
          color: #7c8799;
          font-size: 13px;
          line-height: 1.55;
        }

        .planStatus {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 25px;
          color: #485568;
          font-size: 12px;
          font-weight: 800;
        }

        .planStatus :global(svg) {
          width: 17px;
          height: 17px;
          color: #18a561;
        }

        .proButton {
          width: 100%;
          min-height: 54px;
          margin-top: 24px;
          padding: 0 18px;
          border: 0;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #ff501e;
          color: #ffffff;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 13px 30px rgba(255, 80, 30, 0.2);
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease;
        }

        .proButton:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 36px rgba(255, 80, 30, 0.25);
        }

        .proButton :global(svg) {
          width: 18px;
          height: 18px;
        }

        .proButton :global(svg:last-child) {
          margin-left: auto;
        }

        .billingInfo {
          margin-top: 13px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          color: #929baa;
          font-size: 10px;
          font-weight: 700;
        }

        .billingInfo :global(svg) {
          width: 13px;
          height: 13px;
        }

        .proActiveBox {
          margin-top: 24px;
          padding: 15px;
          border: 1px solid #b8ecd0;
          border-radius: 15px;
          background: #effcf5;
          color: #087a42;
        }

        .proActiveBox > div {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12px;
          font-weight: 900;
        }

        .proActiveBox :global(svg) {
          width: 19px;
          height: 19px;
        }

        .proActiveBox small {
          display: block;
          margin-top: 6px;
          padding-left: 28px;
          color: #4e8065;
          font-size: 10px;
        }

        .accountTitle {
          margin-top: 42px;
        }

        .profileGrid {
          margin-top: 18px;
        }

        .accountPanel {
          min-height: 100%;
        }

        .panelHeading {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .panelHeading h2 {
          font-size: 19px;
        }

        .panelHeading p {
          margin: 5px 0 0;
          color: #8b94a3;
          font-size: 11px;
        }

        .panelIcon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #fff1ec;
          color: #ff501e;
        }

        .panelIcon :global(svg) {
          width: 20px;
          height: 20px;
        }

        .vcLogoutPanel {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .logoutContent {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logoutIcon {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #f2f4f7;
          color: #596579;
        }

        .logoutIcon :global(svg) {
          width: 20px;
          height: 20px;
        }

        .vcLogoutPanel h2 {
          margin: 0;
          font-size: 18px;
        }

        .vcLogoutPanel p {
          margin: 6px 0 0;
          color: #7c8799;
          font-size: 12px;
        }

        .vcLogoutPanel button {
          border: 0;
          background: #111827;
          color: #ffffff;
          padding: 13px 18px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .vcLogoutPanel button:hover {
          opacity: 0.9;
        }

        @media (max-width: 800px) {
          .plansGrid {
            grid-template-columns: 1fr;
          }

          .subscriptionHeading {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 600px) {
          .subscriptionSection {
            margin-top: 24px;
          }

          .subscriptionHeading h2,
          .accountTitle h2 {
            font-size: 21px;
          }

          .planCard {
            min-height: auto;
            padding: 21px;
            border-radius: 20px;
          }

          .currentRibbon {
            right: 16px;
          }

          .planIcon {
            width: 45px;
            height: 45px;
            flex-basis: 45px;
          }

          .price {
            margin-top: 24px;
          }

          .price strong {
            font-size: 38px;
          }

          .proPrice strong {
            font-size: 43px;
          }

          .proButton {
            min-height: 52px;
            padding: 0 14px;
            font-size: 12px;
          }

          .accountTitle {
            margin-top: 32px;
          }

          .vcLogoutPanel {
            align-items: stretch;
            flex-direction: column;
          }

          .logoutContent {
            align-items: flex-start;
          }

          .vcLogoutPanel button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 7 4 4 5-7 5 7 4-4-2 11H5L3 7Z" />
      <path d="M5 18h14" />
    </svg>
  );
}

function CrownSmallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 8 4 4 4-7 4 7 4-4-2 10H6L4 8Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8" />
      <path d="m16 7 2 2" />
      <path d="m18 5 2 2" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
    </svg>
  );
}
