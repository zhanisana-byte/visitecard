"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Company = {
  id: string;
  slug: string;
  full_name: string | null;
  job_title: string | null;
  company: string | null;
  bio: string | null;
  photo_url: string | null;
  cover_url: string | null;
  address: string | null;
  website: string | null;
  entity_type: string | null;
  is_public: boolean | null;
};

type ProfileCompanyLink = {
  id: string;
  profile_card_id: string;
  company_card_id: string;
  position_title: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type LinkedCompany = ProfileCompanyLink & {
  companyData: Company | null;
};

type Props = {
  profileCardId: string;
  language?: "fr" | "en";
};

export default function ProfileCompaniesEditor({
  profileCardId,
  language = "fr",
}: Props) {
  const isEnglish = language === "en";

  const [linkedCompanies, setLinkedCompanies] = useState<LinkedCompany[]>([]);
  const [results, setResults] = useState<Company[]>([]);

  const [query, setQuery] = useState("");
  const [positionTitle, setPositionTitle] = useState("");

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [loadingLinks, setLoadingLinks] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [removingId, setRemovingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const text = useMemo(
    () => ({
      title: isEnglish ? "My companies" : "Mes sociétés",
      subtitle: isEnglish
        ? "Link your profile to companies that already exist on VisiteCard."
        : "Liez votre profil aux sociétés déjà présentes sur VisiteCard.",

      addCompany: isEnglish ? "Add a company" : "Ajouter une société",

      searchLabel: isEnglish
        ? "Search for a company"
        : "Rechercher une société",

      searchPlaceholder: isEnglish
        ? "Company name..."
        : "Nom de la société...",

      position: isEnglish ? "Position / title" : "Poste / titre",

      positionPlaceholder: isEnglish
        ? "Example: Managing Director"
        : "Exemple : Directeur général",

      add: isEnglish ? "Add" : "Ajouter",
      adding: isEnglish ? "Adding..." : "Ajout...",

      noResult: isEnglish
        ? "No company found."
        : "Aucune société trouvée.",

      minimum: isEnglish
        ? "Enter at least 2 characters."
        : "Saisissez au moins 2 caractères.",

      linked: isEnglish
        ? "Companies linked to my profile"
        : "Sociétés liées à mon profil",

      noneLinked: isEnglish
        ? "No company linked yet."
        : "Aucune société liée pour le moment.",

      remove: isEnglish ? "Remove" : "Retirer",

      view: isEnglish ? "View page" : "Voir la page",

      alreadyLinked: isEnglish
        ? "This company is already linked to your profile."
        : "Cette société est déjà liée à votre profil.",

      added: isEnglish
        ? "Company added to your profile."
        : "Société ajoutée à votre profil.",

      removed: isEnglish
        ? "Company removed from your profile."
        : "Société retirée de votre profil.",

      selectCompany: isEnglish
        ? "Select a company."
        : "Sélectionnez une société.",

      enterPosition: isEnglish
        ? "Enter your position in this company."
        : "Indiquez votre poste dans cette société.",

      loading: isEnglish ? "Loading..." : "Chargement...",
    }),
    [isEnglish]
  );

  /*
   * ==========================================================
   * CHARGER LES SOCIÉTÉS DÉJÀ LIÉES
   * ==========================================================
   */

  const loadLinkedCompanies = useCallback(async () => {
    if (!profileCardId) {
      setLoadingLinks(false);
      return;
    }

    try {
      setLoadingLinks(true);
      setError("");

      const { data: links, error: linksError } = await supabase
        .from("profile_company_links")
        .select(
          `
            id,
            profile_card_id,
            company_card_id,
            position_title,
            created_at,
            updated_at
          `
        )
        .eq("profile_card_id", profileCardId)
        .order("created_at", { ascending: true });

      if (linksError) {
        throw linksError;
      }

      const cleanLinks = (links || []) as ProfileCompanyLink[];

      if (cleanLinks.length === 0) {
        setLinkedCompanies([]);
        return;
      }

      const companyIds = cleanLinks.map((item) => item.company_card_id);

      const { data: companies, error: companiesError } = await supabase
        .from("cards")
        .select(
          `
            id,
            slug,
            full_name,
            job_title,
            company,
            bio,
            photo_url,
            cover_url,
            address,
            website,
            entity_type,
            is_public
          `
        )
        .in("id", companyIds)
        .eq("entity_type", "company");

      if (companiesError) {
        throw companiesError;
      }

      const companyList = (companies || []) as Company[];

      const merged: LinkedCompany[] = cleanLinks.map((link) => ({
        ...link,
        companyData:
          companyList.find((company) => company.id === link.company_card_id) ||
          null,
      }));

      setLinkedCompanies(merged);
    } catch (err: any) {
      console.error("loadLinkedCompanies:", err);

      setError(
        err?.message ||
          (isEnglish
            ? "Unable to load companies."
            : "Impossible de charger les sociétés.")
      );
    } finally {
      setLoadingLinks(false);
    }
  }, [profileCardId, isEnglish]);

  useEffect(() => {
    loadLinkedCompanies();
  }, [loadLinkedCompanies]);

  /*
   * ==========================================================
   * RECHERCHE
   * ==========================================================
   *
   * IMPORTANT :
   * on recherche UNIQUEMENT une société existante.
   *
   * Aucun bouton de création de société ici.
   * ==========================================================
   */

  useEffect(() => {
    const cleanQuery = query.trim();

    if (selectedCompany && cleanQuery === getCompanyName(selectedCompany)) {
      return;
    }

    if (cleanQuery.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSearching(true);
        setError("");

        /*
         * Votre table utilise full_name.
         *
         * Pour les anciennes cartes société :
         * full_name = "Tawa Voyage"
         * full_name = "Edream"
         * etc.
         */

        const { data, error: searchError } = await supabase
          .from("cards")
          .select(
            `
              id,
              slug,
              full_name,
              job_title,
              company,
              bio,
              photo_url,
              cover_url,
              address,
              website,
              entity_type,
              is_public
            `
          )
          .eq("entity_type", "company")
          .eq("is_public", true)
          .ilike("full_name", `%${cleanQuery}%`)
          .order("full_name", { ascending: true })
          .limit(12);

        if (searchError) {
          throw searchError;
        }

        const linkedIds = new Set(
          linkedCompanies.map((item) => item.company_card_id)
        );

        const filtered = ((data || []) as Company[]).filter(
          (company) => !linkedIds.has(company.id)
        );

        setResults(filtered);
      } catch (err: any) {
        console.error("company search:", err);

        setError(
          err?.message ||
            (isEnglish
              ? "Unable to search companies."
              : "Impossible de rechercher les sociétés.")
        );
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query, selectedCompany, linkedCompanies, isEnglish]);

  /*
   * ==========================================================
   * SÉLECTIONNER UNE SOCIÉTÉ
   * ==========================================================
   */

  function selectCompany(company: Company) {
    setSelectedCompany(company);
    setQuery(getCompanyName(company));
    setResults([]);
    setError("");
    setSuccess("");
  }

  function clearSelectedCompany() {
    setSelectedCompany(null);
    setQuery("");
    setResults([]);
    setPositionTitle("");
    setError("");
    setSuccess("");
  }

  /*
   * ==========================================================
   * AJOUTER LA LIAISON
   * ==========================================================
   */

  async function addCompany() {
    setError("");
    setSuccess("");

    if (!selectedCompany) {
      setError(text.selectCompany);
      return;
    }

    const cleanPosition = positionTitle.trim();

    if (!cleanPosition) {
      setError(text.enterPosition);
      return;
    }

    const alreadyExists = linkedCompanies.some(
      (item) => item.company_card_id === selectedCompany.id
    );

    if (alreadyExists) {
      setError(text.alreadyLinked);
      return;
    }

    try {
      setSaving(true);

      const { error: insertError } = await supabase
        .from("profile_company_links")
        .insert({
          profile_card_id: profileCardId,
          company_card_id: selectedCompany.id,
          position_title: cleanPosition,
        });

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error(text.alreadyLinked);
        }

        throw insertError;
      }

      setSelectedCompany(null);
      setQuery("");
      setPositionTitle("");
      setResults([]);

      setSuccess(text.added);

      await loadLinkedCompanies();
    } catch (err: any) {
      console.error("addCompany:", err);

      setError(
        err?.message ||
          (isEnglish
            ? "Unable to add this company."
            : "Impossible d'ajouter cette société.")
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ==========================================================
   * MODIFIER LE POSTE DIRECTEMENT
   * ==========================================================
   */

  async function updatePosition(linkId: string, value: string) {
    const cleanValue = value.trim();

    if (!cleanValue) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const { error: updateError } = await supabase
        .from("profile_company_links")
        .update({
          position_title: cleanValue,
        })
        .eq("id", linkId);

      if (updateError) {
        throw updateError;
      }

      setLinkedCompanies((current) =>
        current.map((item) =>
          item.id === linkId
            ? {
                ...item,
                position_title: cleanValue,
              }
            : item
        )
      );
    } catch (err: any) {
      console.error("updatePosition:", err);

      setError(
        err?.message ||
          (isEnglish
            ? "Unable to update the position."
            : "Impossible de modifier le poste.")
      );
    }
  }

  /*
   * ==========================================================
   * RETIRER UNE LIAISON
   * ==========================================================
   */

  async function removeCompany(linkId: string) {
    try {
      setRemovingId(linkId);
      setError("");
      setSuccess("");

      const { error: deleteError } = await supabase
        .from("profile_company_links")
        .delete()
        .eq("id", linkId);

      if (deleteError) {
        throw deleteError;
      }

      setLinkedCompanies((current) =>
        current.filter((item) => item.id !== linkId)
      );

      setSuccess(text.removed);
    } catch (err: any) {
      console.error("removeCompany:", err);

      setError(
        err?.message ||
          (isEnglish
            ? "Unable to remove this company."
            : "Impossible de retirer cette société.")
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="companiesEditor">
      {/* =====================================================
          TITRE
      ====================================================== */}

      <div className="sectionHeading">
        <div>
          <span className="eyebrow">
            {isEnglish ? "COMPANIES" : "SOCIÉTÉS"}
          </span>

          <h2>{text.title}</h2>

          <p>{text.subtitle}</p>
        </div>

        <div className="sectionIcon">
          <BuildingIcon />
        </div>
      </div>

      {/* =====================================================
          AJOUTER UNE SOCIÉTÉ
      ====================================================== */}

      <div className="addBox">
        <div className="addTitle">
          <div className="smallIcon">
            <PlusIcon />
          </div>

          <strong>{text.addCompany}</strong>
        </div>

        <div className="searchBlock">
          <label>{text.searchLabel}</label>

          <div
            className={`searchInputWrap ${
              selectedCompany ? "selected" : ""
            }`}
          >
            <SearchIcon />

            <input
              type="text"
              value={query}
              placeholder={text.searchPlaceholder}
              autoComplete="off"
              onChange={(e) => {
                setQuery(e.target.value);

                if (selectedCompany) {
                  setSelectedCompany(null);
                }

                setSuccess("");
              }}
            />

            {searching && <span className="spinner" />}

            {(query || selectedCompany) && !searching && (
              <button
                type="button"
                className="clearButton"
                onClick={clearSelectedCompany}
                aria-label="Effacer"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {/* Résultats */}

          {!selectedCompany && query.trim().length >= 2 && (
            <div className="results">
              {searching ? (
                <div className="resultState">
                  {text.loading}
                </div>
              ) : results.length > 0 ? (
                results.map((company) => (
                  <button
                    type="button"
                    key={company.id}
                    className="resultItem"
                    onClick={() => selectCompany(company)}
                  >
                    <CompanyAvatar company={company} />

                    <div className="resultInfo">
                      <strong>{getCompanyName(company)}</strong>

                      {company.job_title && (
                        <span>{company.job_title}</span>
                      )}

                      {company.address && (
                        <small>
                          <PinIcon />
                          {company.address}
                        </small>
                      )}
                    </div>

                    <div className="selectArrow">
                      <ChevronRightIcon />
                    </div>
                  </button>
                ))
              ) : (
                <div className="resultState">
                  {text.noResult}
                </div>
              )}
            </div>
          )}

          {/* Société sélectionnée */}

          {selectedCompany && (
            <div className="selectedCompany">
              <CompanyAvatar company={selectedCompany} />

              <div className="selectedCompanyInfo">
                <span>
                  {isEnglish
                    ? "Selected company"
                    : "Société sélectionnée"}
                </span>

                <strong>
                  {getCompanyName(selectedCompany)}
                </strong>

                {selectedCompany.address && (
                  <small>
                    <PinIcon />
                    {selectedCompany.address}
                  </small>
                )}
              </div>

              <CheckIcon />
            </div>
          )}
        </div>

        {/* Poste */}

        <div className="positionBlock">
          <label>{text.position}</label>

          <div className="positionInput">
            <BriefcaseIcon />

            <input
              type="text"
              value={positionTitle}
              placeholder={text.positionPlaceholder}
              onChange={(e) => {
                setPositionTitle(e.target.value);
                setSuccess("");
              }}
            />
          </div>
        </div>

        <button
          type="button"
          className="addButton"
          disabled={saving || !selectedCompany}
          onClick={addCompany}
        >
          {saving ? (
            text.adding
          ) : (
            <>
              <PlusIcon />
              {text.add}
            </>
          )}
        </button>
      </div>

      {/* =====================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <div className="message errorMessage">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="message successMessage">
          <CheckCircleIcon />
          <span>{success}</span>
        </div>
      )}

      {/* =====================================================
          SOCIÉTÉS LIÉES
      ====================================================== */}

      <div className="linkedSection">
        <div className="linkedHeader">
          <div>
            <span className="linkedEyebrow">
              {text.linked}
            </span>

            <strong>
              {linkedCompanies.length}
              {linkedCompanies.length > 0 && (
                <span className="countText">
                  {isEnglish
                    ? linkedCompanies.length === 1
                      ? " company"
                      : " companies"
                    : linkedCompanies.length === 1
                    ? " société"
                    : " sociétés"}
                </span>
              )}
            </strong>
          </div>
        </div>

        {loadingLinks ? (
          <div className="emptyState">
            <span className="largeSpinner" />
            <p>{text.loading}</p>
          </div>
        ) : linkedCompanies.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">
              <BuildingIcon />
            </div>

            <strong>{text.noneLinked}</strong>

            <p>
              {isEnglish
                ? "Search for a company above to add it to your profile."
                : "Recherchez une société ci-dessus pour l'ajouter à votre profil."}
            </p>
          </div>
        ) : (
          <div className="companyList">
            {linkedCompanies.map((link) => {
              const company = link.companyData;

              if (!company) {
                return null;
              }

              return (
                <LinkedCompanyCard
                  key={link.id}
                  link={link}
                  company={company}
                  isEnglish={isEnglish}
                  removing={removingId === link.id}
                  onRemove={() => removeCompany(link.id)}
                  onPositionSave={(value) =>
                    updatePosition(link.id, value)
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .companiesEditor {
          width: 100%;
          margin-top: 24px;
          padding: 26px;
          border: 1px solid var(--vc-border, #e6e8ee);
          border-radius: 24px;
          background: var(--vc-card, #ffffff);
          box-shadow: 0 12px 40px rgba(16, 24, 40, 0.05);
        }

        .sectionHeading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .eyebrow {
          display: block;
          margin-bottom: 6px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.4px;
          color: #6d4aff;
        }

        .sectionHeading h2 {
          margin: 0;
          font-size: 23px;
          line-height: 1.15;
          letter-spacing: -0.6px;
          color: var(--vc-title, #111827);
        }

        .sectionHeading p {
          max-width: 540px;
          margin: 8px 0 0;
          font-size: 13px;
          line-height: 1.55;
          color: var(--vc-muted, #7b8190);
        }

        .sectionIcon {
          flex: 0 0 auto;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(109, 74, 255, 0.1);
          color: #6d4aff;
        }

        .addBox {
          padding: 20px;
          border: 1px solid var(--vc-border, #e7e9ef);
          border-radius: 19px;
          background: var(--vc-soft, #fafafe);
        }

        .addTitle {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          font-size: 14px;
          color: var(--vc-title, #1a1f2e);
        }

        .smallIcon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #6d4aff;
          color: white;
        }

        .searchBlock {
          position: relative;
          margin-bottom: 15px;
        }

        .searchBlock > label,
        .positionBlock > label {
          display: block;
          margin-bottom: 7px;
          font-size: 12px;
          font-weight: 800;
          color: var(--vc-label, #353b4b);
        }

        .searchInputWrap,
        .positionInput {
          min-height: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 13px;
          border: 1.5px solid var(--vc-border, #e1e4eb);
          border-radius: 13px;
          background: var(--vc-input, #fff);
          color: #8a91a0;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .searchInputWrap:focus-within,
        .positionInput:focus-within {
          border-color: #6d4aff;
          box-shadow: 0 0 0 4px rgba(109, 74, 255, 0.08);
        }

        .searchInputWrap.selected {
          border-color: rgba(109, 74, 255, 0.5);
        }

        .searchInputWrap input,
        .positionInput input {
          min-width: 0;
          flex: 1;
          height: 46px;
          padding: 0;
          outline: none;
          border: 0;
          background: transparent;
          font-size: 14px;
          color: var(--vc-title, #171c2b);
        }

        .searchInputWrap input::placeholder,
        .positionInput input::placeholder {
          color: #a1a6b2;
        }

        .clearButton {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #8a91a0;
          cursor: pointer;
        }

        .clearButton:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .spinner,
        .largeSpinner {
          display: block;
          border-radius: 50%;
          border: 2px solid rgba(109, 74, 255, 0.18);
          border-top-color: #6d4aff;
          animation: spin 0.7s linear infinite;
        }

        .spinner {
          width: 17px;
          height: 17px;
        }

        .largeSpinner {
          width: 25px;
          height: 25px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .results {
          position: absolute;
          z-index: 30;
          top: calc(100% + 7px);
          left: 0;
          right: 0;
          max-height: 330px;
          overflow-y: auto;
          padding: 7px;
          border: 1px solid var(--vc-border, #e3e5eb);
          border-radius: 15px;
          background: var(--vc-card, #fff);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
        }

        .resultItem {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px;
          border: 0;
          border-radius: 11px;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .resultItem:hover {
          background: rgba(109, 74, 255, 0.06);
        }

        .resultInfo {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .resultInfo strong {
          overflow: hidden;
          font-size: 13px;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--vc-title, #171c2b);
        }

        .resultInfo span {
          font-size: 11px;
          color: var(--vc-muted, #7d8494);
        }

        .resultInfo small,
        .selectedCompanyInfo small {
          display: flex;
          align-items: center;
          gap: 4px;
          overflow: hidden;
          font-size: 10px;
          color: var(--vc-muted, #969ba7);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .selectArrow {
          color: #a0a5b0;
        }

        .resultState {
          padding: 17px 12px;
          text-align: center;
          font-size: 12px;
          color: var(--vc-muted, #858b99);
        }

        .selectedCompany {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
          padding: 11px;
          border: 1px solid rgba(109, 74, 255, 0.18);
          border-radius: 13px;
          background: rgba(109, 74, 255, 0.055);
          color: #6d4aff;
        }

        .selectedCompanyInfo {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .selectedCompanyInfo > span {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: #8c7bdd;
        }

        .selectedCompanyInfo strong {
          overflow: hidden;
          font-size: 13px;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--vc-title, #171c2b);
        }

        .positionBlock {
          margin-bottom: 15px;
        }

        .addButton {
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 20px;
          border: 0;
          border-radius: 12px;
          background: #6d4aff;
          box-shadow: 0 8px 20px rgba(109, 74, 255, 0.2);
          font-size: 13px;
          font-weight: 900;
          color: white;
          cursor: pointer;
        }

        .addButton:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 13px;
          padding: 11px 13px;
          border-radius: 11px;
          font-size: 12px;
          line-height: 1.4;
        }

        .errorMessage {
          border: 1px solid #ffd1d1;
          background: #fff3f3;
          color: #c83737;
        }

        .successMessage {
          border: 1px solid #c9f0d8;
          background: #f1fff6;
          color: #27824b;
        }

        .linkedSection {
          margin-top: 26px;
        }

        .linkedHeader {
          margin-bottom: 12px;
        }

        .linkedHeader > div {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
        }

        .linkedEyebrow {
          font-size: 12px;
          font-weight: 900;
          color: var(--vc-title, #2c3242);
        }

        .linkedHeader strong {
          font-size: 13px;
          color: #6d4aff;
        }

        .countText {
          font-weight: 700;
        }

        .companyList {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .emptyState {
          min-height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 25px;
          border: 1px dashed var(--vc-border, #dfe2e9);
          border-radius: 17px;
          text-align: center;
          background: var(--vc-soft, #fbfbfd);
        }

        .emptyIcon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 9px;
          border-radius: 13px;
          background: rgba(109, 74, 255, 0.08);
          color: #6d4aff;
        }

        .emptyState strong {
          font-size: 13px;
          color: var(--vc-title, #303646);
        }

        .emptyState p {
          max-width: 380px;
          margin: 5px 0 0;
          font-size: 11px;
          line-height: 1.5;
          color: var(--vc-muted, #8a909e);
        }

        @media (max-width: 650px) {
          .companiesEditor {
            padding: 18px;
            border-radius: 19px;
          }

          .sectionHeading h2 {
            font-size: 20px;
          }

          .sectionIcon {
            width: 40px;
            height: 40px;
          }

          .addBox {
            padding: 15px;
          }

          .addButton {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

/*
 * ============================================================
 * CARTE D'UNE SOCIÉTÉ DÉJÀ LIÉE
 * ============================================================
 */

function LinkedCompanyCard({
  link,
  company,
  isEnglish,
  removing,
  onRemove,
  onPositionSave,
}: {
  link: LinkedCompany;
  company: Company;
  isEnglish: boolean;
  removing: boolean;
  onRemove: () => void;
  onPositionSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [position, setPosition] = useState(link.position_title || "");

  useEffect(() => {
    setPosition(link.position_title || "");
  }, [link.position_title]);

  function savePosition() {
    const clean = position.trim();

    if (!clean) {
      setPosition(link.position_title || "");
      setEditing(false);
      return;
    }

    onPositionSave(clean);
    setEditing(false);
  }

  return (
    <article className="linkedCard">
      <CompanyAvatar company={company} />

      <div className="linkedInfo">
        <div className="companyName">
          {getCompanyName(company)}
        </div>

        {editing ? (
          <div className="editPosition">
            <input
              autoFocus
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  savePosition();
                }

                if (e.key === "Escape") {
                  setPosition(link.position_title || "");
                  setEditing(false);
                }
              }}
            />

            <button type="button" onClick={savePosition}>
              <CheckIcon />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="positionLabel"
            onClick={() => setEditing(true)}
          >
            <BriefcaseIcon />
            <span>
              {link.position_title ||
                (isEnglish ? "Add position" : "Ajouter un poste")}
            </span>
            <EditIcon />
          </button>
        )}

        {company.address && (
          <div className="companyAddress">
            <PinIcon />
            <span>{company.address}</span>
          </div>
        )}
      </div>

      <div className="linkedActions">
        <a
          href={`/${company.slug}`}
          target="_blank"
          rel="noreferrer"
          className="viewButton"
        >
          <EyeIcon />
          <span>{isEnglish ? "View" : "Voir"}</span>
        </a>

        <button
          type="button"
          className="removeButton"
          disabled={removing}
          onClick={onRemove}
          title={isEnglish ? "Remove" : "Retirer"}
        >
          {removing ? <span className="miniSpinner" /> : <TrashIcon />}
        </button>
      </div>

      <style jsx>{`
        .linkedCard {
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 82px;
          padding: 12px;
          border: 1px solid var(--vc-border, #e4e6ec);
          border-radius: 15px;
          background: var(--vc-card, #fff);
        }

        .linkedInfo {
          min-width: 0;
          flex: 1;
        }

        .companyName {
          overflow: hidden;
          margin-bottom: 5px;
          font-size: 14px;
          font-weight: 900;
          color: var(--vc-title, #181d2c);
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .positionLabel {
          max-width: 100%;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0;
          border: 0;
          background: transparent;
          font-size: 11px;
          font-weight: 800;
          color: #6d4aff;
          cursor: pointer;
        }

        .positionLabel span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .companyAddress {
          max-width: 420px;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 5px;
          font-size: 10px;
          color: var(--vc-muted, #9197a4);
        }

        .companyAddress span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .editPosition {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .editPosition input {
          width: min(270px, 100%);
          height: 32px;
          padding: 0 9px;
          outline: none;
          border: 1px solid #6d4aff;
          border-radius: 8px;
          background: var(--vc-input, #fff);
          font-size: 11px;
          color: var(--vc-title, #171c2b);
        }

        .editPosition button {
          width: 31px;
          height: 31px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 0;
          border-radius: 8px;
          background: #6d4aff;
          color: white;
          cursor: pointer;
        }

        .linkedActions {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .viewButton {
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0 10px;
          border: 1px solid var(--vc-border, #e0e3e9);
          border-radius: 9px;
          background: var(--vc-soft, #fafafd);
          font-size: 10px;
          font-weight: 800;
          text-decoration: none;
          color: var(--vc-title, #434958);
        }

        .removeButton {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid #ffd9d9;
          border-radius: 9px;
          background: #fff7f7;
          color: #e15454;
          cursor: pointer;
        }

        .removeButton:disabled {
          opacity: 0.5;
          cursor: wait;
        }

        .miniSpinner {
          width: 14px;
          height: 14px;
          display: block;
          border: 2px solid rgba(225, 84, 84, 0.2);
          border-top-color: #e15454;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 600px) {
          .linkedCard {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .linkedInfo {
            width: calc(100% - 65px);
          }

          .linkedActions {
            width: 100%;
            padding-left: 61px;
          }

          .viewButton {
            flex: 1;
          }
        }
      `}</style>
    </article>
  );
}

/*
 * ============================================================
 * AVATAR SOCIÉTÉ
 * ============================================================
 */

function CompanyAvatar({ company }: { company: Company }) {
  const name = getCompanyName(company);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div className="companyAvatar">
      {company.photo_url ? (
        <img src={company.photo_url} alt={name} />
      ) : (
        <span>{initials || "S"}</span>
      )}

      <style jsx>{`
        .companyAvatar {
          flex: 0 0 auto;
          width: 49px;
          height: 49px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(109, 74, 255, 0.14);
          border-radius: 13px;
          background: linear-gradient(
            135deg,
            rgba(109, 74, 255, 0.12),
            rgba(255, 101, 65, 0.08)
          );
          font-size: 14px;
          font-weight: 900;
          color: #6d4aff;
        }

        .companyAvatar img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}

function getCompanyName(company: Company) {
  return (
    company.full_name?.trim() ||
    company.company?.trim() ||
    "Société"
  );
}

/*
 * ============================================================
 * ICONS
 * ============================================================
 */

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m20 20-4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 9h2a1 1 0 0 1 1 1v11M8 7h5M8 11h5M8 15h5M2 21h20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="7"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 9v4M12 17h.01M10.3 4.4 2.8 17.5A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.5L13.7 4.4a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m8 12 2.5 2.5L16 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
