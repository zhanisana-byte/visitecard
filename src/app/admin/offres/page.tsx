"use client";

import { useEffect, useState } from "react";

type Offer = {
  id: string;
  name: string;
  code: string;
  entity_type: "profile" | "company" | "bundle";
  profile_count: number;
  company_count: number;
  duration_value: number;
  duration_unit: "day" | "month" | "year";
  price_tnd: number | null;
  price_eur: number | null;
  promo_enabled: boolean;
  promo_price_tnd: number | null;
  promo_price_eur: number | null;
  promo_start_at: string | null;
  promo_end_at: string | null;
  is_active: boolean;
  sort_order: number;
};

type Settings = {
  id?: string;
  startup_offer_enabled: boolean;
  startup_duration_value: number;
  startup_duration_unit: "day" | "month";
  payment_agent_enabled: boolean;
  payment_bank_enabled: boolean;
  payment_online_enabled: boolean;
};

const emptyOffer: Partial<Offer> = {
  name: "",
  code: "",
  entity_type: "profile",
  profile_count: 1,
  company_count: 0,
  duration_value: 1,
  duration_unit: "year",
  price_tnd: 0,
  price_eur: 0,
  promo_enabled: false,
  promo_price_tnd: null,
  promo_price_eur: null,
  promo_start_at: null,
  promo_end_at: null,
  is_active: true,
  sort_order: 0,
};

function dateInput(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<Settings>({
    startup_offer_enabled: true,
    startup_duration_value: 2,
    startup_duration_unit: "month",
    payment_agent_enabled: true,
    payment_bank_enabled: true,
    payment_online_enabled: false,
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingOffer, setSavingOffer] = useState<string | null>(
    null
  );
  const [creating, setCreating] = useState(false);
  const [newOffer, setNewOffer] =
    useState<Partial<Offer>>(emptyOffer);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const r = await fetch("/api/admin/offers", {
        cache: "no-store",
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || "Erreur de chargement.");
      }

      setOffers(d.offers || []);

      if (d.settings) {
        setSettings(d.settings);
      }
    } catch (e: any) {
      setError(e.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateOffer(
    id: string,
    field: keyof Offer,
    value: any
  ) {
    setOffers((current) =>
      current.map((offer) =>
        offer.id === id
          ? {
              ...offer,
              [field]: value,
            }
          : offer
      )
    );
  }

  async function saveSettings() {
    setSavingSettings(true);
    setError("");
    setSuccess("");

    try {
      const r = await fetch("/api/admin/offers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "settings",
          ...settings,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(
          d.error || "Enregistrement impossible."
        );
      }

      if (d.settings) {
        setSettings(d.settings);
      }

      setSuccess("Règles générales enregistrées.");
    } catch (e: any) {
      setError(e.message || "Erreur.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function saveOffer(offer: Offer) {
    setSavingOffer(offer.id);
    setError("");
    setSuccess("");

    try {
      const r = await fetch("/api/admin/offers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "offer",
          ...offer,
          promo_start_at: offer.promo_start_at || null,
          promo_end_at: offer.promo_end_at || null,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(
          d.error || "Enregistrement impossible."
        );
      }

      setOffers((current) =>
        current.map((x) =>
          x.id === offer.id ? d.offer : x
        )
      );

      setSuccess(`Offre "${offer.name}" enregistrée.`);
    } catch (e: any) {
      setError(e.message || "Erreur.");
    } finally {
      setSavingOffer(null);
    }
  }

  async function createOffer() {
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const r = await fetch("/api/admin/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_offer",
          ...newOffer,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(
          d.error || "Création impossible."
        );
      }

      setOffers((current) => [...current, d.offer]);
      setNewOffer({ ...emptyOffer });
      setSuccess("Nouvelle offre créée.");
    } catch (e: any) {
      setError(e.message || "Erreur.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="loading">Chargement...</div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #f6f7fb;
            padding: 40px;
            font-family: Arial, sans-serif;
          }

          .loading {
            max-width: 1400px;
            margin: auto;
            background: white;
            padding: 40px;
            border-radius: 20px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="topbar">
        <a href="/admin">← Tableau de bord</a>

        <strong>VisiteCard · Offres & Tarifs</strong>

        <a href="/admin/abonnements">
          Abonnements
        </a>
      </header>

      <div className="container">
        <section className="hero">
          <div>
            <span>ADMINISTRATION</span>
            <h1>Offres & Tarifs</h1>
            <p>
              Gérez les périodes gratuites, les tarifs,
              promotions et moyens de paiement.
            </p>
          </div>
        </section>

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {success && (
          <div className="message success">
            {success}
          </div>
        )}

        <section className="panel">
          <div className="panelTitle">
            <div>
              <h2>Offre de démarrage</h2>
              <p>
                Cette règle sera appliquée aux nouveaux
                comptes.
              </p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={
                  settings.startup_offer_enabled
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    startup_offer_enabled:
                      e.target.checked,
                  })
                }
              />
              <span />
            </label>
          </div>

          <div className="grid">
            <label>
              <span>Durée gratuite</span>

              <input
                type="number"
                min="1"
                value={
                  settings.startup_duration_value
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    startup_duration_value:
                      Number(e.target.value),
                  })
                }
              />
            </label>

            <label>
              <span>Unité</span>

              <select
                value={
                  settings.startup_duration_unit
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    startup_duration_unit:
                      e.target.value as
                        | "day"
                        | "month",
                  })
                }
              >
                <option value="day">
                  Jour(s)
                </option>

                <option value="month">
                  Mois
                </option>
              </select>
            </label>
          </div>

          <div className="paymentGrid">
            <label className="check">
              <input
                type="checkbox"
                checked={
                  settings.payment_agent_enabled
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payment_agent_enabled:
                      e.target.checked,
                  })
                }
              />

              <div>
                <strong>
                  Paiement auprès d’un agent
                </strong>
                <small>
                  Espèces auprès d’un agent
                  VisiteCard
                </small>
              </div>
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={
                  settings.payment_bank_enabled
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payment_bank_enabled:
                      e.target.checked,
                  })
                }
              />

              <div>
                <strong>
                  Virement bancaire
                </strong>
                <small>
                  Paiement avec référence VC
                </small>
              </div>
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={
                  settings.payment_online_enabled
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payment_online_enabled:
                      e.target.checked,
                  })
                }
              />

              <div>
                <strong>
                  Paiement en ligne
                </strong>
                <small>
                  À activer lorsque disponible
                </small>
              </div>
            </label>
          </div>

          <div className="actions">
            <button
              className="primary"
              onClick={saveSettings}
              disabled={savingSettings}
            >
              {savingSettings
                ? "Enregistrement..."
                : "Enregistrer les règles"}
            </button>
          </div>
        </section>

        <section className="sectionHeader">
          <div>
            <h2>Tarifs</h2>
            <p>
              Profil, société et packs combinés.
            </p>
          </div>
        </section>

        <div className="offers">
          {offers.map((offer) => (
            <section
              className="offer"
              key={offer.id}
            >
              <div className="offerHead">
                <div>
                  <input
                    className="offerName"
                    value={offer.name}
                    onChange={(e) =>
                      updateOffer(
                        offer.id,
                        "name",
                        e.target.value
                      )
                    }
                  />

                  <code>{offer.code}</code>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={offer.is_active}
                    onChange={(e) =>
                      updateOffer(
                        offer.id,
                        "is_active",
                        e.target.checked
                      )
                    }
                  />
                  <span />
                </label>
              </div>

              <div className="grid four">
                <label>
                  <span>Type</span>

                  <select
                    value={offer.entity_type}
                    onChange={(e) =>
                      updateOffer(
                        offer.id,
                        "entity_type",
                        e.target.value
                      )
                    }
                  >
                    <option value="profile">
                      Profil
                    </option>

                    <option value="company">
                      Société
                    </option>

                    <option value="bundle">
                      Pack
                    </option>
                  </select>
                </label>

                <label>
                  <span>Durée</span>

                  <input
                    type="number"
                    min="1"
                    value={
                      offer.duration_value
                    }
                    onChange={(e) =>
                      updateOffer(
                        offer.id,
                        "duration_value",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>

                <label>
                  <span>Unité</span>

                  <select
                    value={
                      offer.duration_unit
                    }
                    onChange={(e) =>
                      updateOffer(
                        offer.id,
                        "duration_unit",
                        e.target.value
                      )
                    }
                  >
                    <option value="day">
                      Jour(s)
                    </option>

                    <option value="month">
                      Mois
                    </option>

                    <option value="year">
                      Année(s)
                    </option>
                  </select>
                </label>

                <label>
                  <span>Ordre</span>

                  <input
                    type="number"
                    value={offer.sort_order}
                    onChange={(e) =>
                      updateOffer(
                        offer.id,
                        "sort_order",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>
              </div>

              {offer.entity_type ===
                "bundle" && (
                <div className="grid">
                  <label>
                    <span>
                      Nombre de profils
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        offer.profile_count
                      }
                      onChange={(e) =>
                        updateOffer(
                          offer.id,
                          "profile_count",
                          Number(
                            e.target.value
                          )
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      Nombre de sociétés
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        offer.company_count
                      }
                      onChange={(e) =>
                        updateOffer(
                          offer.id,
                          "company_count",
                          Number(
                            e.target.value
                          )
                        )
                      }
                    />
                  </label>
                </div>
              )}

              <div className="prices">
                <div>
                  <span>Prix DT</span>

                  <div className="priceInput">
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={
                        offer.price_tnd ?? ""
                      }
                      onChange={(e) =>
                        updateOffer(
                          offer.id,
                          "price_tnd",
                          e.target.value === ""
                            ? null
                            : Number(
                                e.target.value
                              )
                        )
                      }
                    />

                    <b>DT</b>
                  </div>
                </div>

                <div>
                  <span>Prix €</span>

                  <div className="priceInput">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        offer.price_eur ?? ""
                      }
                      onChange={(e) =>
                        updateOffer(
                          offer.id,
                          "price_eur",
                          e.target.value === ""
                            ? null
                            : Number(
                                e.target.value
                              )
                        )
                      }
                    />

                    <b>€</b>
                  </div>
                </div>
              </div>

              <div className="promo">
                <label className="promoToggle">
                  <input
                    type="checkbox"
                    checked={
                      offer.promo_enabled
                    }
                    onChange={(e) =>
                      updateOffer(
                        offer.id,
                        "promo_enabled",
                        e.target.checked
                      )
                    }
                  />

                  <strong>
                    Promotion
                  </strong>
                </label>

                {offer.promo_enabled && (
                  <>
                    <div className="grid">
                      <label>
                        <span>
                          Prix promo DT
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={
                            offer.promo_price_tnd ??
                            ""
                          }
                          onChange={(e) =>
                            updateOffer(
                              offer.id,
                              "promo_price_tnd",
                              e.target.value ===
                                ""
                                ? null
                                : Number(
                                    e.target
                                      .value
                                  )
                            )
                          }
                        />
                      </label>

                      <label>
                        <span>
                          Prix promo €
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            offer.promo_price_eur ??
                            ""
                          }
                          onChange={(e) =>
                            updateOffer(
                              offer.id,
                              "promo_price_eur",
                              e.target.value ===
                                ""
                                ? null
                                : Number(
                                    e.target
                                      .value
                                  )
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="grid">
                      <label>
                        <span>
                          Début promotion
                        </span>

                        <input
                          type="date"
                          value={dateInput(
                            offer.promo_start_at
                          )}
                          onChange={(e) =>
                            updateOffer(
                              offer.id,
                              "promo_start_at",
                              e.target.value
                                ? new Date(
                                    `${e.target.value}T00:00:00`
                                  ).toISOString()
                                : null
                            )
                          }
                        />
                      </label>

                      <label>
                        <span>
                          Fin promotion
                        </span>

                        <input
                          type="date"
                          value={dateInput(
                            offer.promo_end_at
                          )}
                          onChange={(e) =>
                            updateOffer(
                              offer.id,
                              "promo_end_at",
                              e.target.value
                                ? new Date(
                                    `${e.target.value}T23:59:59`
                                  ).toISOString()
                                : null
                            )
                          }
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="actions">
                <button
                  className="primary"
                  disabled={
                    savingOffer === offer.id
                  }
                  onClick={() =>
                    saveOffer(offer)
                  }
                >
                  {savingOffer === offer.id
                    ? "Enregistrement..."
                    : "Enregistrer"}
                </button>
              </div>
            </section>
          ))}
        </div>

        <section className="panel newOffer">
          <div className="panelTitle">
            <div>
              <h2>Ajouter une offre</h2>
              <p>
                Créez un nouveau tarif sans
                modifier le code.
              </p>
            </div>
          </div>

          <div className="grid">
            <label>
              <span>Nom</span>

              <input
                placeholder="Ex. Profil + 2 sociétés"
                value={newOffer.name || ""}
                onChange={(e) =>
                  setNewOffer({
                    ...newOffer,
                    name: e.target.value,
                  })
                }
              />
            </label>

            <label>
              <span>Code</span>

              <input
                placeholder="PROFILE_2_COMPANIES"
                value={newOffer.code || ""}
                onChange={(e) =>
                  setNewOffer({
                    ...newOffer,
                    code: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <div className="grid four">
            <label>
              <span>Type</span>

              <select
                value={
                  newOffer.entity_type ||
                  "profile"
                }
                onChange={(e) =>
                  setNewOffer({
                    ...newOffer,
                    entity_type:
                      e.target.value as any,
                  })
                }
              >
                <option value="profile">
                  Profil
                </option>

                <option value="company">
                  Société
                </option>

                <option value="bundle">
                  Pack
                </option>
              </select>
            </label>

            <label>
              <span>Durée</span>

              <input
                type="number"
                min="1"
                value={
                  newOffer.duration_value || 1
                }
                onChange={(e) =>
                  setNewOffer({
                    ...newOffer,
                    duration_value: Number(
                      e.target.value
                    ),
                  })
                }
              />
            </label>

            <label>
              <span>Unité</span>

              <select
                value={
                  newOffer.duration_unit ||
                  "year"
                }
                onChange={(e) =>
                  setNewOffer({
                    ...newOffer,
                    duration_unit:
                      e.target.value as any,
                  })
                }
              >
                <option value="day">
                  Jour(s)
                </option>

                <option value="month">
                  Mois
                </option>

                <option value="year">
                  Année(s)
                </option>
              </select>
            </label>

            <label>
              <span>Ordre</span>

              <input
                type="number"
                value={
                  newOffer.sort_order || 0
                }
                onChange={(e) =>
                  setNewOffer({
                    ...newOffer,
                    sort_order: Number(
                      e.target.value
                    ),
                  })
                }
              />
            </label>
          </div>

          {newOffer.entity_type ===
            "bundle" && (
            <div className="grid">
              <label>
                <span>Profils inclus</span>

                <input
                  type="number"
                  min="0"
                  value={
                    newOffer.profile_count || 0
                  }
                  onChange={(e) =>
                    setNewOffer({
                      ...newOffer,
                      profile_count: Number(
                        e.target.value
                      ),
                    })
                  }
                />
              </label>

              <label>
                <span>Sociétés incluses</span>

                <input
                  type="number"
                  min="0"
                  value={
                    newOffer.company_count || 0
                  }
                  onChange={(e) =>
                    setNewOffer({
                      ...newOffer,
                      company_count: Number(
                        e.target.value
                      ),
                    })
                  }
                />
              </label>
            </div>
          )}

          <div className="grid">
            <label>
              <span>Prix DT</span>

              <input
                type="number"
                min="0"
                step="0.001"
                value={
                  newOffer.price_tnd ?? ""
                }
                onChange={(e) =>
                  setNewOffer({
                    ...newOffer,
                    price_tnd:
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
              />
            </label>

            <label>
              <span>Prix €</span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  newOffer.price_eur ?? ""
                }
                onChange={(e) =>
                  setNewOffer({
                    ...newOffer,
                    price_eur:
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          ),
                  })
                }
              />
            </label>
          </div>

          <div className="actions">
            <button
              className="primary"
              onClick={createOffer}
              disabled={creating}
            >
              {creating
                ? "Création..."
                : "Créer l’offre"}
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f6f7fb;
          color: #151515;
          font-family: Arial, sans-serif;
        }

        .topbar {
          height: 66px;
          background: #111;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .topbar a {
          color: white;
          text-decoration: none;
          font-size: 14px;
        }

        .container {
          max-width: 1400px;
          margin: auto;
          padding: 34px 24px 80px;
        }

        .hero {
          background: #111;
          color: white;
          border-radius: 24px;
          padding: 38px;
          margin-bottom: 24px;
        }

        .hero span {
          font-size: 12px;
          letter-spacing: 2px;
          color: #ff7a18;
          font-weight: 800;
        }

        .hero h1 {
          font-size: 36px;
          margin: 10px 0 8px;
        }

        .hero p {
          margin: 0;
          color: #bbb;
        }

        .message {
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .error {
          background: #fee2e2;
          color: #991b1b;
        }

        .success {
          background: #dcfce7;
          color: #166534;
        }

        .panel,
        .offer {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 20px;
          padding: 26px;
          margin-bottom: 22px;
          box-shadow: 0 6px 22px
            rgba(0, 0, 0, 0.035);
        }

        .panelTitle,
        .offerHead,
        .sectionHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .panelTitle h2,
        .sectionHeader h2 {
          margin: 0 0 6px;
        }

        .panelTitle p,
        .sectionHeader p {
          margin: 0;
          color: #777;
        }

        .sectionHeader {
          margin: 38px 0 18px;
        }

        .grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 22px;
        }

        .grid.four {
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
        }

        label > span,
        .prices > div > span {
          display: block;
          font-size: 12px;
          font-weight: 800;
          color: #666;
          margin-bottom: 7px;
        }

        input,
        select {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 11px;
          padding: 12px 13px;
          background: white;
          font-size: 14px;
          outline: none;
        }

        input:focus,
        select:focus {
          border-color: #111;
        }

        .offerName {
          border: none;
          padding: 0;
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .offerHead code {
          font-size: 11px;
          background: #f1f1f1;
          padding: 5px 8px;
          border-radius: 6px;
        }

        .prices {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 22px;
        }

        .priceInput {
          position: relative;
        }

        .priceInput input {
          padding-right: 55px;
          font-size: 20px;
          font-weight: 800;
        }

        .priceInput b {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
        }

        .promo {
          background: #fafafa;
          border-radius: 14px;
          padding: 18px;
          margin-top: 22px;
        }

        .promoToggle {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .promoToggle input {
          width: auto;
        }

        .paymentGrid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 24px;
        }

        .check {
          border: 1px solid #e3e3e3;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }

        .check input {
          width: auto;
          margin-top: 3px;
        }

        .check strong {
          display: block;
          margin-bottom: 5px;
        }

        .check small {
          color: #777;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 22px;
        }

        button {
          border: none;
          cursor: pointer;
          border-radius: 11px;
          padding: 12px 18px;
          font-weight: 800;
        }

        button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .primary {
          background: #111;
          color: white;
        }

        .switch {
          position: relative;
          width: 48px;
          height: 27px;
          flex: 0 0 auto;
        }

        .switch input {
          display: none;
        }

        .switch span {
          position: absolute;
          inset: 0;
          background: #d2d2d2;
          border-radius: 30px;
          cursor: pointer;
          transition: 0.2s;
        }

        .switch span:before {
          content: "";
          position: absolute;
          width: 21px;
          height: 21px;
          left: 3px;
          top: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.2s;
          box-shadow: 0 1px 4px
            rgba(0, 0, 0, 0.25);
        }

        .switch input:checked + span {
          background: #ff7a18;
        }

        .switch
          input:checked
          + span:before {
          transform: translateX(21px);
        }

        .newOffer {
          margin-top: 36px;
          border: 2px dashed #ddd;
        }

        @media (max-width: 900px) {
          .grid,
          .grid.four,
          .prices,
          .paymentGrid {
            grid-template-columns: 1fr;
          }

          .topbar {
            padding: 0 16px;
          }

          .topbar strong {
            font-size: 13px;
          }

          .container {
            padding: 20px 14px 60px;
          }

          .hero {
            padding: 26px 22px;
          }

          .hero h1 {
            font-size: 28px;
          }

          .panel,
          .offer {
            padding: 20px;
          }

          .panelTitle,
          .offerHead {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}
