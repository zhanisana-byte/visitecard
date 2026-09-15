"use client";

import Link from "next/link";

const socials = [
  {
    name: "Instagram",
    icon: "◎",
    background:
      "linear-gradient(135deg,#feda75 0%,#fa7e1e 25%,#d62976 50%,#962fbf 75%,#4f5bd5 100%)",
  },
  {
    name: "Facebook",
    icon: "f",
    background: "#1877F2",
  },
  {
    name: "TikTok",
    icon: "♪",
    background: "#050505",
  },
  {
    name: "WhatsApp",
    icon: "◔",
    background: "#20D466",
  },
  {
    name: "LinkedIn",
    icon: "in",
    background: "#0877BD",
  },
  {
    name: "YouTube",
    icon: "▶",
    background: "#FF0000",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        margin: 0,
        padding: 0,
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        background: "#ffffff",
        color: "#06142d",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      <header
        style={{
          width: "100%",
          height: "118px",
          background: "#ffffff",
          borderBottom: "1px solid #e8ebef",
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 20,
        }}
      >
        <div
          className="vc-header-inner"
          style={{
            width: "calc(100% - 120px)",
            maxWidth: "1320px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img
              className="vc-logo"
              src="/logo.png"
              alt="VisiteCard"
              style={{
                display: "block",
                width: "290px",
                height: "78px",
                objectFit: "contain",
                objectPosition: "left center",
              }}
            />
          </Link>

          <div
            className="vc-header-right"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              className="vc-languages"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "13px",
                marginRight: "12px",
              }}
            >
              <button
                type="button"
                style={{
                  appearance: "none",
                  border: 0,
                  background: "transparent",
                  color: "#ff501e",
                  fontSize: "18px",
                  fontWeight: 800,
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                FR
              </button>

              <span style={{ color: "#b7bdc8" }}>|</span>

              <button
                type="button"
                style={{
                  appearance: "none",
                  border: 0,
                  background: "transparent",
                  color: "#8991a0",
                  fontSize: "18px",
                  fontWeight: 800,
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                EN
              </button>
            </div>

            <Link
              className="vc-login"
              href="/connexion"
              style={{
                height: "64px",
                minWidth: "155px",
                padding: "0 28px",
                border: "1.5px solid #8d99ad",
                borderRadius: "18px",
                background: "#ffffff",
                color: "#07142c",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "17px",
                fontWeight: 800,
                boxSizing: "border-box",
              }}
            >
              Connexion
            </Link>

            <Link
              className="vc-register"
              href="/creer-compte"
              style={{
                height: "64px",
                minWidth: "205px",
                padding: "0 30px",
                border: "1.5px solid #ff501e",
                borderRadius: "18px",
                background: "#ff501e",
                color: "#ffffff",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "17px",
                fontWeight: 800,
                boxSizing: "border-box",
              }}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <section
        className="vc-hero"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "calc(100vh - 118px - 100px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "105px 30px 85px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            right: "-320px",
            top: "40px",
            background:
              "radial-gradient(circle, rgba(255,93,55,.14) 0%, rgba(255,93,55,.06) 45%, rgba(255,93,55,0) 72%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            left: "-300px",
            bottom: "-230px",
            background:
              "radial-gradient(circle, rgba(255,116,48,.15) 0%, rgba(255,116,48,.05) 46%, rgba(255,116,48,0) 72%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: "1250px",
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h1
            className="vc-title"
            style={{
              width: "100%",
              maxWidth: "1100px",
              margin: 0,
              padding: 0,
              textAlign: "center",
              color: "#06142d",
              fontSize: "clamp(48px, 4.2vw, 66px)",
              lineHeight: 1.06,
              letterSpacing: "-3px",
              fontWeight: 900,
            }}
          >
            <span className="vc-title-line">Un seul QR code</span>

            <span className="vc-title-line">
              pour tous vos réseaux sociaux
              <span style={{ color: "#ff501e" }}>.</span>
            </span>
          </h1>

          <p
            className="vc-subtitle"
            style={{
              margin: "26px 0 0",
              padding: 0,
              textAlign: "center",
              color: "#7d8698",
              fontSize: "22px",
              lineHeight: 1.4,
              fontWeight: 400,
            }}
          >
            Une carte digitale simple, élégante et toujours à jour.
          </p>

          <div
            className="vc-social-grid"
            style={{
              width: "455px",
              maxWidth: "100%",
              marginTop: "48px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
            }}
          >
            {socials.map((social) => (
              <div
                key={social.name}
                className="vc-social-card"
                style={{
                  height: "108px",
                  border: "1px solid #dfe3e9",
                  borderRadius: "20px",
                  background: "#ffffff",
                  boxShadow: "0 8px 24px rgba(10,25,50,.035)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "9px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  className="vc-social-icon"
                  style={{
                    width: "43px",
                    height: "43px",
                    borderRadius: "12px",
                    background: social.background,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize:
                      social.name === "Facebook"
                        ? "30px"
                        : social.name === "LinkedIn"
                        ? "17px"
                        : "21px",
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {social.icon}
                </div>

                <span
                  style={{
                    color: "#596274",
                    fontSize: "13px",
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {social.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        style={{
          width: "100%",
          padding: "25px 20px 28px",
          boxSizing: "border-box",
          borderTop: "1px solid #eceef1",
          background: "#ffffff",
          textAlign: "center",
          color: "#8a92a1",
          fontSize: "13px",
          lineHeight: 1.8,
        }}
      >
        <div>
          <Link
            href="/conditions-generales"
            style={{
              color: "#687182",
              textDecoration: "none",
            }}
          >
            Conditions générales
          </Link>

          <span
            style={{
              margin: "0 10px",
              color: "#c5c9d0",
            }}
          >
            ·
          </span>

          <Link
            href="/confidentialite"
            style={{
              color: "#687182",
              textDecoration: "none",
            }}
          >
            Confidentialité
          </Link>

          <span
            style={{
              margin: "0 10px",
              color: "#c5c9d0",
            }}
          >
            ·
          </span>

          <span>© 2026 VisiteCard</span>
        </div>

        <div
          style={{
            marginTop: "2px",
            fontSize: "12px",
            color: "#a0a6b1",
          }}
        >
          Un projet de Sana Zhani
        </div>
      </footer>

      <style jsx global>{`
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-height: 100% !important;
        }

        body {
          overflow-x: hidden !important;
        }

        .vc-title-line {
          display: block;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .vc-header-inner {
            width: calc(100% - 30px) !important;
          }

          .vc-logo {
            width: 145px !important;
            height: 60px !important;
          }

          .vc-header-right {
            gap: 8px !important;
          }

          .vc-languages {
            display: none !important;
          }

          .vc-login {
            min-width: 0 !important;
            height: 44px !important;
            padding: 0 15px !important;
            border-radius: 12px !important;
            font-size: 13px !important;
          }

          .vc-register {
            min-width: 0 !important;
            height: 44px !important;
            padding: 0 16px !important;
            border-radius: 12px !important;
            font-size: 13px !important;
          }

          .vc-hero {
            padding-top: 75px !important;
          }

          .vc-title {
            max-width: 700px !important;
            font-size: 46px !important;
            letter-spacing: -2px !important;
          }

          .vc-title-line {
            white-space: normal !important;
          }
        }

        @media (max-width: 600px) {
          header {
            height: 88px !important;
          }

          .vc-header-inner {
            width: calc(100% - 20px) !important;
          }

          .vc-logo {
            width: 108px !important;
            height: 48px !important;
          }

          .vc-login {
            height: 38px !important;
            padding: 0 9px !important;
            font-size: 10.5px !important;
            border-radius: 10px !important;
          }

          .vc-register {
            height: 38px !important;
            padding: 0 10px !important;
            font-size: 10.5px !important;
            border-radius: 10px !important;
          }

          .vc-hero {
            min-height: auto !important;
            padding: 60px 18px 65px !important;
          }

          .vc-title {
            max-width: 400px !important;
            font-size: 37px !important;
            line-height: 1.05 !important;
            letter-spacing: -1.5px !important;
          }

          .vc-subtitle {
            max-width: 340px !important;
            margin-top: 22px !important;
            font-size: 17px !important;
          }

          .vc-social-grid {
            width: 294px !important;
            margin-top: 36px !important;
            gap: 10px !important;
          }

          .vc-social-card {
            height: 88px !important;
            border-radius: 16px !important;
            gap: 7px !important;
          }

          .vc-social-icon {
            width: 37px !important;
            height: 37px !important;
            border-radius: 10px !important;
          }
        }

        @media (max-width: 390px) {
          .vc-logo {
            width: 95px !important;
          }

          .vc-login {
            padding: 0 7px !important;
            font-size: 10px !important;
          }

          .vc-register {
            padding: 0 8px !important;
            font-size: 10px !important;
          }

          .vc-title {
            font-size: 34px !important;
          }
        }
      `}</style>
    </main>
  );
}
