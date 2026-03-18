import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import type {
  RecruiterPlayerProfile,
  RecruiterPlayerProfilesCatalog,
  RecruiterPlayerProfileListItem,
  RecruiterPlayerProfilePayload,
} from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import PlayerProfileSearchModal from "../components/PlayerProfileSearchModal";

const emptyCatalog: RecruiterPlayerProfilesCatalog = {
  sportTypes: [],
  positions: [],
  categories: [],
  countries: [],
  cities: [],
};

const fallbackCatalog: RecruiterPlayerProfilesCatalog = {
  sportTypes: ["football", "padel", "tennis", "basketball", "other"],
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
  sportType: profile?.sportType ?? "",
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
      updatePlayerProfile,
    },
    feedback,
  } = useRecruitersModule();

  const [catalog, setCatalog] = useState<RecruiterPlayerProfilesCatalog>(emptyCatalog);
  const [countryOptions, setCountryOptions] = useState<string[]>(fallbackCatalog.countries);
  const [currentProfile, setCurrentProfile] = useState<RecruiterPlayerProfile | null>(null);
  const [form, setForm] = useState<RecruiterPlayerProfilePayload>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileVideosCount, setProfileVideosCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getPlayerProfilesCatalog()
      .then((response) => {
        setCatalog({
          sportTypes: mergeOptions(response.sportTypes, fallbackCatalog.sportTypes),
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
  }, [feedback, getPlayerProfilesCatalog]);

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
    getMyPlayerProfile()
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
  }, [email, feedback, getMyPlayerProfile, isElevated]);

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

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload: RecruiterPlayerProfilePayload = {
        ...form,
        userId: form.userId?.trim() || undefined,
        email: form.email?.trim() || undefined,
        fullName: form.fullName?.trim() || undefined,
        sportType: form.sportType?.trim() || undefined,
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
                  setForm((current) => ({ ...current, sportType: event.target.value }))
                }
              >
                <option value="">Selecciona deporte</option>
                {renderOptions(catalog.sportTypes)}
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
              <span>Avatar URL</span>
              <input
                type="url"
                value={form.avatarUrl ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, avatarUrl: event.target.value }))
                }
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
          <button type="submit" disabled={isSaving || isLoading}>
            {isSaving ? "Guardando..." : currentProfile?._id ? "Actualizar perfil" : "Crear perfil"}
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
