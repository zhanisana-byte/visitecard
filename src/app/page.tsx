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
        overflow: "hidden",
        background: "#ffffff",
        color: "#06142d",
        fontFamily:
          'Inter, Arial, Helvetica, sans-serif',
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "13px",
                marginRight: "12px",
                fontSize: "18px",
                fontWeight: 800,
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

              <span
                style={{
                  color: "#b7bdc8",
                  fontWeight: 400,
                }}
              >
                |
              </span>

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
        style={{
          position: "relative",
          width: "100%",
          minHeight: "calc(100vh - 118px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "120px 30px 80px",
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
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: 0,
              padding: 0,
              textAlign: "center",
              color: "#06142d",
              fontSize: "clamp(58px, 5.2vw, 80px)",
              lineHeight: 1.04,
              letterSpacing: "-4px",
              fontWeight: 900,
            }}
          >
            <span
              style={{
                display: "block",
                whiteSpace: "nowrap",
              }}
            >
              Un seul QR code
            </span>

            <span
              style={{
                display: "block",
                whiteSpace: "nowrap",
              }}
            >
              pour tous vos réseaux sociaux
              <span style={{ color: "#ff501e" }}>.</span>
            </span>
          </h1>

          <p
            style={{
              margin: "26px 0 0",
              padding: 0,
              textAlign: "center",
              color: "#7d8698",
              fontSize: "25px",
              lineHeight: 1.4,
              fontWeight: 400,
            }}
          >
            Une carte digitale simple, élégante et toujours à jour.
          </p>

          <div
            style={{
              width: "455px",
              maxWidth: "100%",
              marginTop: "54px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
            }}
          >
            {socials.map((social) => (
              <div
                key={social.name}
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

        @media (max-width: 900px) {
          header > div {
            width: calc(100% - 30px) !important;
          }

          header img {
            width: 150px !important;
            height: 60px !important;
          }

          header > div > div {
            gap: 8px !important;
          }

          header > div > div > div {
            display: none !important;
          }

          header a[href="/connexion"] {
            min-width: 0 !important;
            height: 44px !important;
            padding: 0 15px !important;
            border-radius: 12px !important;
            font-size: 13px !important;
          }

          header a[href="/creer-compte"] {
            min-width: 0 !important;
            height: 44px !important;
            padding: 0 16px !important;
            border-radius: 12px !important;
            font-size: 13px !important;
          }

          section {
            padding-top: 75px !important;
          }

          h1 {
            font-size: 50px !important;
            letter-spacing: -2.5px !important;
          }

          h1 > span {
            white-space: normal !important;
          }
        }

        @media (max-width: 600px) {
          header {
            height: 88px !important;
          }

          header img {
            width: 112px !important;
            height: 48px !important;
          }

          header a[href="/connexion"] {
            height: 38px !important;
            padding: 0 9px !important;
            font-size: 11px !important;
            border-radius: 10px !important;
          }

          header a[href="/creer-compte"] {
            height: 38px !important;
            padding: 0 10px !important;
            font-size: 11px !important;
            border-radius: 10px !important;
          }

          section {
            min-height: calc(100vh - 88px) !important;
            padding: 65px 18px 50px !important;
          }

          h1 {
            max-width: 430px !important;
            font-size: 43px !important;
            line-height: 1.03 !important;
            letter-spacing: -2px !important;
          }

          p {
            max-width: 350px !important;
            margin-top: 23px !important;
            font-size: 18px !important;
          }

          section > div:last-child > div:last-child {
            width: 300px !important;
            margin-top: 38px !important;
            gap: 10px !important;
          }
        }

        @media (max-width: 390px) {
          header img {
            width: 98px !important;
          }

          header a[href="/connexion"] {
            padding: 0 7px !important;
            font-size: 10px !important;
          }

          header a[href="/creer-compte"] {
            padding: 0 8px !important;
            font-size: 10px !important;
          }

          h1 {
            font-size: 39px !important;
          }
        }
      `}</style>
    </main>
  );
}
