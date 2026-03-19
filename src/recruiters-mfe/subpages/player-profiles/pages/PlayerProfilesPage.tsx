import React, { useEffect, useMemo, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import PlayerCard from "../../../../components/playerCard/playerCard";
import type {
  RecruiterPlayerProfile,
  RecruiterPlayerProfilesCatalog,
  RecruiterPlayerProfileListItem,
  RecruiterPlayerProfilePayload,
} from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import PlayerProfileSearchModal from "../components/PlayerProfileSearchModal";
import {
  getRecruiterSportTypeLabel,
  normalizeRecruiterSportType,
  RECRUITER_SPORT_TYPES,
  sanitizeRecruiterSportTypes,
} from "../../../features/recruiters/sportTypes";

const emptyCatalog: RecruiterPlayerProfilesCatalog = {
  sportTypes: [],
  positions: [],
  categories: [],
  countries: [],
  cities: [],
};

const fallbackCatalog: RecruiterPlayerProfilesCatalog = {
  sportTypes: [...RECRUITER_SPORT_TYPES],
  positions: [
    "Goalkeeper",
    "Center back",
    "Full back",
    "Midfielder",
    "Winger",
    "Forward",
    "Point guard",
    "Shooting guard",
    "Center",
  ],
  categories: ["U13", "U15", "U17", "U19", "Senior", "Professional"],
  countries: [],
  cities: [],
};

const mergeOptions = (preferred: string[] = [], fallback: string[] = []) =>
  Array.from(new Set([...preferred, ...fallback].map((item) => item.trim()).filter(Boolean)));

const COUNTRIES_ENDPOINT = "https://restcountries.com/v3.1/all?fields=name,cca2";

const emptyForm: RecruiterPlayerProfilePayload = {
  fullName: "",
  sportType: "",
  primaryPosition: "",
  secondaryPosition: "",
  team: "",
  category: "",
  country: "",
  city: "",
  birthDate: "",
  dominantProfile: "",
  bio: "",
  avatarUrl: "",
  status: "active",
  email: "",
  userId: "",
};

const mapProfileToForm = (
  profile?: RecruiterPlayerProfile | null
): RecruiterPlayerProfilePayload => ({
  userId: profile?.userId ?? "",
  email: profile?.email ?? "",
  fullName: profile?.fullName ?? "",
  sportType: normalizeRecruiterSportType(profile?.sportType) ?? "",
  primaryPosition: profile?.primaryPosition ?? "",
  secondaryPosition: profile?.secondaryPosition ?? "",
  team: profile?.team ?? "",
  category: profile?.category ?? "",
  country: profile?.country ?? "",
  city: profile?.city ?? "",
  birthDate: profile?.birthDate ? profile.birthDate.slice(0, 10) : "",
  dominantProfile: profile?.dominantProfile ?? "",
  bio: profile?.bio ?? "",
  avatarUrl: profile?.avatarUrl ?? "",
  status: profile?.status ?? "active",
});

const PlayerProfilesPage: React.FC = () => {
  const navigate = useNavigate();
  const { actualRole, email } = useAuth();
  const isElevated = actualRole === "admin" || actualRole === "recruiter";
  const {
    api: {
      createPlayerProfile,
      getMyPlayerProfile,
      getPlayerProfile,
      getPlayerProfileVideos,
      getPlayerProfilesCatalog,
      uploadPlayerAvatar,
      updatePlayerProfile,
    },
    feedback,
    loading: { trackTask },
  } = useRecruitersModule();

  const [catalog, setCatalog] = useState<RecruiterPlayerProfilesCatalog>(emptyCatalog);
  const [countryOptions, setCountryOptions] = useState<string[]>(fallbackCatalog.countries);
  const [currentProfile, setCurrentProfile] = useState<RecruiterPlayerProfile | null>(null);
  const [form, setForm] = useState<RecruiterPlayerProfilePayload>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileVideosCount, setProfileVideosCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlternativeCard, setShowAlternativeCard] = useState(false);

  useEffect(() => {
    trackTask(
      getPlayerProfilesCatalog(),
      "Los sticks están ordenando el catálogo de player profiles."
    )
      .then((response) => {
        setCatalog({
          sportTypes: sanitizeRecruiterSportTypes(
            mergeOptions(response.sportTypes, fallbackCatalog.sportTypes)
          ),
          positions: mergeOptions(response.positions, fallbackCatalog.positions),
          categories: mergeOptions(response.categories, fallbackCatalog.categories),
          countries: mergeOptions(response.countries, fallbackCatalog.countries),
          cities: mergeOptions(response.cities, fallbackCatalog.cities),
        });
      })
      .catch((error) => {
        setCatalog(fallbackCatalog);
        feedback.showError(
          error instanceof Error ? error.message : "No se pudo cargar el catálogo."
        );
      });
  }, [feedback, getPlayerProfilesCatalog, trackTask]);

  useEffect(() => {
    let cancelled = false;

    fetch(COUNTRIES_ENDPOINT)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Countries request failed with status ${response.status}`);
        }

        return (await response.json()) as Array<{ name?: { common?: string } }>;
      })
      .then((countries) => {
        if (cancelled) return;

        const normalized = countries
          .map((item) => item.name?.common?.trim() || "")
          .filter(Boolean)
          .sort((left, right) => left.localeCompare(right));

        setCountryOptions(
          normalized.length ? normalized : mergeOptions(catalog.countries, fallbackCatalog.countries)
        );
      })
      .catch(() => {
        if (cancelled) return;
        setCountryOptions(mergeOptions(catalog.countries, fallbackCatalog.countries));
      });

    return () => {
      cancelled = true;
    };
  }, [catalog.countries]);

  useEffect(() => {
    setIsLoading(true);
    trackTask(getMyPlayerProfile(), "Los sticks están preparando la ficha del jugador.")
      .then((profile) => {
        setCurrentProfile(profile);
        setForm(mapProfileToForm(profile));
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "";
        if (message.toLowerCase().includes("no encontrado")) {
          setCurrentProfile(null);
          setForm({
            ...emptyForm,
            email: isElevated ? "" : email || "",
          });
          return;
        }

        feedback.showError(message || "No se pudo cargar el player profile.");
      })
      .finally(() => setIsLoading(false));
  }, [email, feedback, getMyPlayerProfile, isElevated, trackTask]);

  useEffect(() => {
    if (!currentProfile?._id) {
      setProfileVideosCount(0);
      return;
    }

    getPlayerProfileVideos(currentProfile._id, 1, 1)
      .then((response) => {
        setProfileVideosCount(response.pagination.total);
      })
      .catch(() => {
        setProfileVideosCount(0);
      });
  }, [currentProfile?._id, getPlayerProfileVideos]);

  const renderOptions = (values: string[]) =>
    values.map((value) => (
      <option key={value} value={value}>
        {value}
      </option>
    ));

  const title = useMemo(() => {
    if (currentProfile?._id) return "Editar player profile";
    return "Crear player profile";
  }, [currentProfile?._id]);

  const profileCardVisible = Boolean(currentProfile?._id || form.fullName?.trim());
  const avatarPreview = form.avatarUrl?.trim() || currentProfile?.avatarUrl || "";

  const handleAvatarSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      feedback.showError("Selecciona un archivo de imagen válido.");
      event.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const scope = currentProfile?._id
        ? `player-profiles/${currentProfile._id}`
        : "player-profiles/drafts";
      const upload = await uploadPlayerAvatar(file, scope);
      setForm((current) => ({ ...current, avatarUrl: upload.avatarUrl }));
    } catch (error) {
      feedback.showError(
        error instanceof Error ? error.message : "No se pudo subir la foto del jugador."
      );
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload: RecruiterPlayerProfilePayload = {
        ...form,
        userId: form.userId?.trim() || undefined,
        email: form.email?.trim() || undefined,
        fullName: form.fullName?.trim() || undefined,
        sportType: normalizeRecruiterSportType(form.sportType),
        primaryPosition: form.primaryPosition?.trim() || undefined,
        secondaryPosition: form.secondaryPosition?.trim() || undefined,
        team: form.team?.trim() || undefined,
        category: form.category?.trim() || undefined,
        country: form.country?.trim() || undefined,
        city: form.city?.trim() || undefined,
        birthDate: form.birthDate
          ? new Date(`${form.birthDate}T12:00:00.000Z`).toISOString()
          : undefined,
        dominantProfile: form.dominantProfile?.trim() || undefined,
        bio: form.bio?.trim() || undefined,
        avatarUrl: form.avatarUrl?.trim() || undefined,
        status: form.status || undefined,
      };

      const profile = currentProfile?._id
        ? await updatePlayerProfile(currentProfile._id, payload)
        : await createPlayerProfile(payload);

      setCurrentProfile(profile);
      setForm(mapProfileToForm(profile));
    } catch (error) {
      feedback.showError(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const loadSelectedProfile = async (profile: RecruiterPlayerProfileListItem) => {
    try {
      const detail = await getPlayerProfile(profile._id);
      setCurrentProfile(detail);
      setForm(mapProfileToForm(detail));
    } catch (error) {
      feedback.showError(
        error instanceof Error ? error.message : "No se pudo cargar el player profile."
      );
    }
  };

  return (
    <section className="recruiters-dashboard">
      <header className="recruiters-dashboard__hero">
        <div>
          <p className="recruiters-dashboard__eyebrow">Player Profiles</p>
          <h2>{title}</h2>
          <p>
            Este perfil base representa al jugador y luego se reutiliza al vincular videos y
            completar metadata de scouting.
          </p>
        </div>
        <aside className="recruiters-dashboard__stats">
          <span>Videos vinculados</span>
          <strong>{profileVideosCount}</strong>
          <p>{currentProfile?.fullName || "Sin perfil seleccionado"}</p>
        </aside>
      </header>

      <section className="recruiters-dashboard__cards">
        <article>
          <h3>Mi perfil</h3>
          <p>Como jugador gestionas tu propia ficha y luego usas tus videos desde scouting library.</p>
          <button type="button" onClick={() => navigate("/scouting/subpages/library")}>
            Ir a library
          </button>
        </article>
        {isElevated ? (
          <article>
            <h3>Búsqueda global</h3>
            <p>Como admin o recruiter puedes buscar perfiles existentes o crear perfiles para terceros.</p>
            <button type="button" onClick={() => setIsModalOpen(true)}>
              Buscar jugador
            </button>
          </article>
        ) : null}
      </section>

      {profileCardVisible ? (
        <>
          <section className="player-profile-display-toggle">
            <div>
              <p className="player-profile-display-toggle__eyebrow">Visualización</p>
              <h3>Comparar estilos de ficha</h3>
            </div>
            <button
              type="button"
              className={`player-profile-display-toggle__button ${
                showAlternativeCard ? "is-active" : ""
              }`}
              onClick={() => setShowAlternativeCard((current) => !current)}
            >
              {showAlternativeCard ? "Ocultar card alternativa" : "Mostrar card alternativa"}
            </button>
          </section>

          {showAlternativeCard ? (
            <PlayerCard
              fullName={form.fullName}
              primaryPosition={form.primaryPosition}
              secondaryPosition={form.secondaryPosition}
              country={form.country}
              team={form.team}
              category={form.category}
              dominantProfile={form.dominantProfile}
              sportType={form.sportType}
              avatarUrl={avatarPreview}
              status={form.status}
              profileVideosCount={profileVideosCount}
            />
          ) : (
            <section className="player-profile-card">
              <div className="player-profile-card__media">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={form.fullName ? `Foto de ${form.fullName}` : "Foto del jugador"}
                    className="player-profile-card__avatar"
                  />
                ) : (
                  <div className="player-profile-card__avatar player-profile-card__avatar--fallback">
                    <FaUserCircle aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="player-profile-card__body">
                <div>
                  <p className="player-profile-card__eyebrow">Ficha actual</p>
                  <h3>{form.fullName || "Jugador sin nombre"}</h3>
                  <p className="player-profile-card__subtitle">
                    {form.team || "Sin equipo"} ·{" "}
                    {getRecruiterSportTypeLabel(form.sportType) || "Sin deporte"} ·{" "}
                    {form.category || "Sin categoría"}
                  </p>
                </div>

                <div className="player-profile-card__stats">
                  <article>
                    <span>Posición</span>
                    <strong>{form.primaryPosition || "N/D"}</strong>
                  </article>
                  <article>
                    <span>Secundaria</span>
                    <strong>{form.secondaryPosition || "N/D"}</strong>
                  </article>
                  <article>
                    <span>Perfil</span>
                    <strong>{form.dominantProfile || "N/D"}</strong>
                  </article>
                  <article>
                    <span>Ubicación</span>
                    <strong>{[form.city, form.country].filter(Boolean).join(", ") || "N/D"}</strong>
                  </article>
                </div>

                <div className="player-profile-card__footer">
                  <div>
                    <span>Estado</span>
                    <strong>{form.status || "active"}</strong>
                  </div>
                  <div>
                    <span>Videos vinculados</span>
                    <strong>{profileVideosCount}</strong>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      ) : null}

      <form className="scouting-form" onSubmit={saveProfile}>
        <section className="scouting-form__section">
          <div className="scouting-form__section-header">
            <div>
              <p className="scouting-form__eyebrow">Identidad</p>
              <h3>Ficha del jugador</h3>
            </div>
            <p>Este bloque define el perfil base que luego podrás asociar a uno o varios videos.</p>
          </div>

          <div className="scouting-form__grid">
            {isElevated ? (
              <>
                <label className="scouting-form__field">
                  <span>User ID</span>
                  <input
                    type="text"
                    value={form.userId ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, userId: event.target.value }))
                    }
                  />
                </label>
                <label className="scouting-form__field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </label>
              </>
            ) : null}

            <label className="scouting-form__field">
              <span>Nombre completo</span>
              <input
                type="text"
                value={form.fullName ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fullName: event.target.value }))
                }
              />
            </label>

            <label className="scouting-form__field">
              <span>Deporte</span>
              <select
                value={form.sportType ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sportType: normalizeRecruiterSportType(event.target.value) ?? "",
                  }))
                }
              >
                <option value="">Selecciona deporte</option>
                {catalog.sportTypes.map((value) => (
                  <option key={value} value={value}>
                    {getRecruiterSportTypeLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="scouting-form__field">
              <span>Posición principal</span>
              <select
                value={form.primaryPosition ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, primaryPosition: event.target.value }))
                }
              >
                <option value="">Selecciona posición</option>
                {renderOptions(catalog.positions)}
              </select>
            </label>

            <label className="scouting-form__field">
              <span>Posición secundaria</span>
              <select
                value={form.secondaryPosition ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, secondaryPosition: event.target.value }))
                }
              >
                <option value="">Opcional</option>
                {renderOptions(catalog.positions)}
              </select>
            </label>

            <label className="scouting-form__field">
              <span>Equipo</span>
              <input
                type="text"
                value={form.team ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, team: event.target.value }))
                }
              />
            </label>

            <label className="scouting-form__field">
              <span>Categoría</span>
              <select
                value={form.category ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
              >
                <option value="">Selecciona categoría</option>
                {renderOptions(catalog.categories)}
              </select>
            </label>

            <label className="scouting-form__field">
              <span>País</span>
              <select
                value={form.country ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, country: event.target.value }))
                }
              >
                <option value="">Selecciona país</option>
                {renderOptions(countryOptions)}
              </select>
            </label>

            <label className="scouting-form__field">
              <span>Ciudad</span>
              <input
                type="text"
                value={form.city ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, city: event.target.value }))
                }
                placeholder="Ej: Madrid"
              />
            </label>

            <label className="scouting-form__field">
              <span>Fecha de nacimiento</span>
              <input
                type="date"
                value={form.birthDate ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, birthDate: event.target.value }))
                }
              />
            </label>

            <label className="scouting-form__field">
              <span>Perfil dominante</span>
              <input
                type="text"
                value={form.dominantProfile ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dominantProfile: event.target.value }))
                }
              />
            </label>

            <label className="scouting-form__field">
              <span>Foto del jugador</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarSelected}
                disabled={isUploadingAvatar}
              />
              <small className="player-profile-upload__hint">
                Opcional. Se sube a S3 y se guarda su `avatarUrl` en el perfil.
              </small>
            </label>

            <article className="scouting-form__field scouting-form__field--placeholder">
              <span>Vista previa del avatar</span>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={form.fullName ? `Avatar de ${form.fullName}` : "Avatar del jugador"}
                  className="player-profile-upload__preview"
                />
              ) : (
                <div className="player-profile-upload__empty">
                  <FaUserCircle aria-hidden="true" />
                </div>
              )}
              <p>
                {isUploadingAvatar
                  ? "Subiendo foto..."
                  : avatarPreview
                    ? "La foto quedará visible en la ficha del jugador."
                    : "Si no subes una foto, mostraremos una silueta por defecto."}
              </p>
            </article>

            <label className="scouting-form__field scouting-form__field--full">
              <span>Avatar URL</span>
              <input
                type="url"
                value={form.avatarUrl ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, avatarUrl: event.target.value }))
                }
                placeholder="Se completa automáticamente al subir una foto"
              />
            </label>

            <label className="scouting-form__field">
              <span>Estado</span>
              <select
                value={form.status ?? "active"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as RecruiterPlayerProfilePayload["status"],
                  }))
                }
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>

            <label className="scouting-form__field scouting-form__field--full">
              <span>Bio</span>
              <textarea
                rows={4}
                value={form.bio ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, bio: event.target.value }))
                }
              />
            </label>
          </div>
        </section>

        <div className="scouting-form__actions">
          <button type="submit" disabled={isSaving || isLoading || isUploadingAvatar}>
            {isUploadingAvatar
              ? "Subiendo foto..."
              : isSaving
                ? "Guardando..."
                : currentProfile?._id
                  ? "Actualizar perfil"
                  : "Crear perfil"}
          </button>
          {isElevated ? (
            <button
              type="button"
              onClick={() => {
                setCurrentProfile(null);
                setForm(emptyForm);
              }}
            >
              Nuevo perfil
            </button>
          ) : null}
        </div>
      </form>

      <PlayerProfileSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={loadSelectedProfile}
      />
    </section>
  );
};

export default PlayerProfilesPage;
