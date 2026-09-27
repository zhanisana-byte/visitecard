"use client";

import { useEffect, useState } from "react";

type Bank = {
  id: string;
  label: string | null;
  beneficiary_name: string;
  bank_name: string;
  currency: "TND" | "EUR";
  rib: string | null;
  iban: string | null;
  bic_swift: string | null;
  instructions_fr: string | null;
  instructions_en: string | null;
  is_active: boolean;
};

type Agent = {
  id: string;
  name: string;
  commercial_code: string | null;
  country_code: string;
  country_name: string;
  region: string | null;
  city: string | null;
  whatsapp: string | null;
  phone: string | null;
  is_active: boolean;
};

const emptyBank = {
  label: "",
  beneficiary_name: "Sana Zhani",
  bank_name: "",
  currency: "TND",
  rib: "",
  iban: "",
  bic_swift: "",
  instructions_fr: "",
  instructions_en: "",
  is_active: true,
};

const emptyAgent = {
  name: "",
  commercial_code: "",
  country_code: "TN",
  country_name: "Tunisie",
  region: "",
  city: "",
  whatsapp: "",
  phone: "",
  is_active: true,
};

export default function PaymentSettingsPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bank, setBank] = useState<any>(emptyBank);
  const [agent, setAgent] = useState<any>(emptyAgent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);

    try {
      const r = await fetch("/api/admin/payment-settings", {
        cache: "no-store",
      });

      const d = await r.json();

      if (!r.ok) throw new Error(d.error);

      setBanks(d.banks || []);
      setAgents(d.agents || []);
    } catch (e: any) {
      setError(e.message || "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createBank() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const r = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bank",
          ...bank,
        }),
      });

      const d = await r.json();

      if (!r.ok) throw new Error(d.error);

      setBanks((x) => [...x, d.bank]);
      setBank({ ...emptyBank });
      setMessage("Compte bancaire ajouté.");
    } catch (e: any) {
      setError(e.message || "Erreur.");
    } finally {
      setSaving(false);
    }
  }

  async function saveBank(item: Bank) {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const r = await fetch("/api/admin/payment-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bank",
          ...item,
        }),
      });

      const d = await r.json();

      if (!r.ok) throw new Error(d.error);

      setBanks((current) =>
        current.map((x) => (x.id === item.id ? d.bank : x))
      );

      setMessage("Compte bancaire enregistré.");
    } catch (e: any) {
      setError(e.message || "Erreur.");
    } finally {
      setSaving(false);
    }
  }

  async function createAgent() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const r = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "agent",
          ...agent,
        }),
      });

      const d = await r.json();

      if (!r.ok) throw new Error(d.error);

      setAgents((x) => [...x, d.agent]);
      setAgent({ ...emptyAgent });
      setMessage("Agent ajouté.");
    } catch (e: any) {
      setError(e.message || "Erreur.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAgent(item: Agent) {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const r = await fetch("/api/admin/payment-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "agent",
          ...item,
        }),
      });

      const d = await r.json();

      if (!r.ok) throw new Error(d.error);

      setAgents((current) =>
        current.map((x) => (x.id === item.id ? d.agent : x))
      );

      setMessage("Agent enregistré.");
    } catch (e: any) {
      setError(e.message || "Erreur.");
    } finally {
      setSaving(false);
    }
  }

  function updateBank(id: string, key: keyof Bank, value: any) {
    setBanks((current) =>
      current.map((x) =>
        x.id === id ? { ...x, [key]: value } : x
      )
    );
  }

  function updateAgent(id: string, key: keyof Agent, value: any) {
    setAgents((current) =>
      current.map((x) =>
        x.id === id ? { ...x, [key]: value } : x
      )
    );
  }

  if (loading) {
    return <main className="loading">Chargement...</main>;
  }

  return (
    <main className="page">
      <header>
        <a href="/admin">← Admin</a>
        <strong>Paramètres de paiement</strong>
        <a href="/admin/offres">Offres & Tarifs</a>
      </header>

      <div className="container">
        <div className="hero">
          <span>VISITECARD ADMIN</span>
          <h1>Paiements</h1>
          <p>
            Configurez vos virements bancaires et vos agents
            commerciaux.
          </p>
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <div className="title">
          <div>
            <h2>Comptes bancaires</h2>
            <p>Vous pouvez utiliser un compte différent par devise.</p>
          </div>
        </div>

        {banks.map((item) => (
          <section className="card" key={item.id}>
            <div className="cardHead">
              <div>
                <strong>{item.bank_name || "Compte bancaire"}</strong>
                <span className="badge">{item.currency}</span>
              </div>

              <label className="toggle">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(e) =>
                    updateBank(item.id, "is_active", e.target.checked)
                  }
                />
                Actif
              </label>
            </div>

            <div className="grid">
              <Field
                label="Nom affiché"
                value={item.beneficiary_name}
                onChange={(v) =>
                  updateBank(item.id, "beneficiary_name", v)
                }
              />

              <Field
                label="Banque"
                value={item.bank_name}
                onChange={(v) => updateBank(item.id, "bank_name", v)}
              />

              <label>
                <span>Devise</span>
                <select
                  value={item.currency}
                  onChange={(e) =>
                    updateBank(item.id, "currency", e.target.value)
                  }
                >
                  <option value="TND">DT / TND</option>
                  <option value="EUR">EUR / €</option>
                </select>
              </label>

              <Field
                label="Libellé"
                value={item.label || ""}
                onChange={(v) => updateBank(item.id, "label", v)}
              />

              <Field
                label="RIB"
                value={item.rib || ""}
                onChange={(v) => updateBank(item.id, "rib", v)}
              />

              <Field
                label="IBAN"
                value={item.iban || ""}
                onChange={(v) => updateBank(item.id, "iban", v)}
              />

              <Field
                label="SWIFT / BIC"
                value={item.bic_swift || ""}
                onChange={(v) => updateBank(item.id, "bic_swift", v)}
              />
            </div>

            <div className="actions">
              <button onClick={() => saveBank(item)} disabled={saving}>
                Enregistrer
              </button>
            </div>
          </section>
        ))}

        <section className="card dashed">
          <h3>Ajouter un compte bancaire</h3>

          <div className="grid">
            <Field
              label="Nom affiché"
              value={bank.beneficiary_name}
              onChange={(v) =>
                setBank({ ...bank, beneficiary_name: v })
              }
            />

            <Field
              label="Banque"
              value={bank.bank_name}
              onChange={(v) => setBank({ ...bank, bank_name: v })}
            />

            <label>
              <span>Devise</span>
              <select
                value={bank.currency}
                onChange={(e) =>
                  setBank({ ...bank, currency: e.target.value })
                }
              >
                <option value="TND">DT / TND</option>
                <option value="EUR">EUR / €</option>
              </select>
            </label>

            <Field
              label="RIB"
              value={bank.rib}
              onChange={(v) => setBank({ ...bank, rib: v })}
            />

            <Field
              label="IBAN"
              value={bank.iban}
              onChange={(v) => setBank({ ...bank, iban: v })}
            />

            <Field
              label="SWIFT / BIC"
              value={bank.bic_swift}
              onChange={(v) => setBank({ ...bank, bic_swift: v })}
            />
          </div>

          <div className="actions">
            <button onClick={createBank} disabled={saving}>
              Ajouter le compte
            </button>
          </div>
        </section>

        <div className="title agentsTitle">
          <div>
            <h2>Agents & Commerciaux</h2>
            <p>
              Les clients pourront choisir un agent selon leur pays
              et leur région.
            </p>
          </div>
        </div>

        {agents.map((item) => (
          <section className="card" key={item.id}>
            <div className="cardHead">
              <div>
                <strong>{item.name}</strong>
                {item.commercial_code && (
                  <span className="badge">
                    {item.commercial_code}
                  </span>
                )}
              </div>

              <label className="toggle">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(e) =>
                    updateAgent(item.id, "is_active", e.target.checked)
                  }
                />
                Actif
              </label>
            </div>

            <div className="grid three">
              <Field
                label="Nom"
                value={item.name}
                onChange={(v) => updateAgent(item.id, "name", v)}
              />

              <Field
                label="Code commercial"
                value={item.commercial_code || ""}
                onChange={(v) =>
                  updateAgent(item.id, "commercial_code", v)
                }
              />

              <Field
                label="Code pays"
                value={item.country_code}
                onChange={(v) =>
                  updateAgent(item.id, "country_code", v)
                }
              />

              <Field
                label="Pays"
                value={item.country_name}
                onChange={(v) =>
                  updateAgent(item.id, "country_name", v)
                }
              />

              <Field
                label="Région"
                value={item.region || ""}
                onChange={(v) => updateAgent(item.id, "region", v)}
              />

              <Field
                label="Ville"
                value={item.city || ""}
                onChange={(v) => updateAgent(item.id, "city", v)}
              />

              <Field
                label="WhatsApp"
                value={item.whatsapp || ""}
                onChange={(v) => updateAgent(item.id, "whatsapp", v)}
              />

              <Field
                label="Téléphone"
                value={item.phone || ""}
                onChange={(v) => updateAgent(item.id, "phone", v)}
              />
            </div>

            <div className="actions">
              <button onClick={() => saveAgent(item)} disabled={saving}>
                Enregistrer
              </button>
            </div>
          </section>
        ))}

        <section className="card dashed">
          <h3>Ajouter un agent</h3>

          <div className="grid three">
            <Field
              label="Nom"
              value={agent.name}
              onChange={(v) => setAgent({ ...agent, name: v })}
            />

            <Field
              label="Code commercial"
              value={agent.commercial_code}
              onChange={(v) =>
                setAgent({ ...agent, commercial_code: v })
              }
            />

            <Field
              label="Code pays"
              value={agent.country_code}
              onChange={(v) =>
                setAgent({ ...agent, country_code: v })
              }
            />

            <Field
              label="Pays"
              value={agent.country_name}
              onChange={(v) =>
                setAgent({ ...agent, country_name: v })
              }
            />

            <Field
              label="Région"
              value={agent.region}
              onChange={(v) => setAgent({ ...agent, region: v })}
            />

            <Field
              label="Ville"
              value={agent.city}
              onChange={(v) => setAgent({ ...agent, city: v })}
            />

            <Field
              label="WhatsApp"
              value={agent.whatsapp}
              onChange={(v) => setAgent({ ...agent, whatsapp: v })}
            />

            <Field
              label="Téléphone"
              value={agent.phone}
              onChange={(v) => setAgent({ ...agent, phone: v })}
            />
          </div>

          <div className="actions">
            <button onClick={createAgent} disabled={saving}>
              Ajouter l’agent
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page,
        .loading {
          min-height: 100vh;
          background: #f6f7fb;
          color: #171717;
          font-family: Arial, sans-serif;
        }

        header {
          height: 66px;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
        }

        header a {
          color: #fff;
          text-decoration: none;
          font-size: 14px;
        }

        .container {
          max-width: 1350px;
          margin: auto;
          padding: 32px 22px 80px;
        }

        .hero {
          background: #111;
          color: white;
          padding: 34px;
          border-radius: 22px;
        }

        .hero span {
          color: #ff7a18;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .hero h1 {
          margin: 10px 0 8px;
          font-size: 34px;
        }

        .hero p {
          margin: 0;
          color: #bbb;
        }

        .title {
          margin: 34px 0 16px;
        }

        .title h2 {
          margin: 0 0 5px;
        }

        .title p {
          margin: 0;
          color: #777;
        }

        .agentsTitle {
          margin-top: 55px;
        }

        .card {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 18px;
        }

        .dashed {
          border: 2px dashed #ddd;
        }

        .cardHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }

        .cardHead strong {
          font-size: 18px;
        }

        .badge {
          display: inline-block;
          background: #fff0e5;
          color: #c94e00;
          margin-left: 9px;
          padding: 5px 9px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 900;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .three {
          grid-template-columns: repeat(3, 1fr);
        }

        label span {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 800;
          color: #666;
        }

        input,
        select {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 12px;
          outline: none;
          background: white;
        }

        input:focus,
        select:focus {
          border-color: #111;
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 700;
        }

        .toggle input {
          width: auto;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        button {
          border: 0;
          background: #111;
          color: white;
          border-radius: 10px;
          padding: 12px 18px;
          font-weight: 800;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.5;
        }

        .success,
        .error {
          margin-top: 18px;
          padding: 13px 16px;
          border-radius: 10px;
          font-weight: 700;
        }

        .success {
          background: #dcfce7;
          color: #166534;
        }

        .error {
          background: #fee2e2;
          color: #991b1b;
        }

        @media (max-width: 850px) {
          .grid,
          .three {
            grid-template-columns: 1fr;
          }

          header {
            padding: 0 15px;
          }

          .container {
            padding: 20px 13px 60px;
          }

          .hero {
            padding: 25px 20px;
          }
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
