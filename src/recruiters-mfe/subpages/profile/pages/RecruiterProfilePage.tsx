import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type {
  RecruiterFiltersCatalog,
  RecruiterScoutingProfilePayload,
  RecruiterVideoLibraryItem,
} from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";

const emptyForm: RecruiterScoutingProfilePayload = {
  title: "",
  sportType: "",
  playType: "",
  tournamentType: "",
  playerName: "",
  playerAge: undefined,
  playerPosition: "",
  playerTeam: "",
  playerCategory: "",
  jerseyNumber: undefined,
  dominantProfile: "",
  country: "",
  city: "",
  tournamentName: "",
  notes: "",
  tags: [],
  recordedAt: "",
};

const defaultCatalog: RecruiterFiltersCatalog = {
  sportTypes: ["Football", "Futsal", "Basketball", "Baseball", "Volleyball", "Tennis"],
  playTypes: [
    "Goal",
    "Assist",
    "Dribble",
    "Save",
    "Defense",
    "Free kick",
    "Skill move",
    "Highlight",
    "Blooper",
  ],
  tournamentTypes: ["League", "Cup", "Friendly", "Tryout", "Showcase", "Youth tournament"],
  countries: [],
  cities: [],
  playerPositions: [
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
  playerCategories: ["U13", "U15", "U17", "U20", "Senior", "Professional"],
  tournaments: [],
  tags: [],
};

const dominantProfileOptions = [
  "Right foot",
  "Left foot",
  "Both feet",
  "Right hand",
  "Left hand",
  "Ambidextrous",
];

const mergeOptions = (preferred: string[] = [], fallback: string[] = []) =>
  Array.from(new Set([...preferred, ...fallback].map((item) => item.trim()).filter(Boolean)));

const COUNTRIES_ENDPOINT = "https://restcountries.com/v3.1/all?fields=name,cca2";
const requiredFields: Array<keyof RecruiterScoutingProfilePayload> = [
  "title",
  "sportType",
  "playType",
  "tournamentType",
  "playerName",
  "playerPosition",
  "playerTeam",
  "playerCategory",
  "dominantProfile",
  "country",
  "city",
  "tournamentName",
  "recordedAt",
];

const fieldLabels: Record<string, string> = {
  title: "Título",
  sportType: "Deporte",
  playType: "Tipo de jugada",
  tournamentType: "Tipo de torneo",
  playerName: "Nombre del jugador",
  playerPosition: "Posición",
  playerTeam: "Equipo",
  playerCategory: "Categoría",
  dominantProfile: "Perfil dominante",
  country: "País",
  city: "Ciudad",
  tournamentName: "Torneo",
  recordedAt: "Fecha del clip",
};

const RecruiterProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();
  const {
    api: {
      createScoutingProfile,
      getFiltersCatalog,
      getLibrary,
      getScoutingProfile,
      updateScoutingProfile,
    },
    feedback,
  } = useRecruitersModule();
  const [video, setVideo] = useState<RecruiterVideoLibraryItem | null>(null);
  const [form, setForm] = useState<RecruiterScoutingProfilePayload>(emptyForm);
  const [catalog, setCatalog] = useState<RecruiterFiltersCatalog>(defaultCatalog);
  const [countryOptions, setCountryOptions] = useState<string[]>(defaultCatalog.countries);
  const [tagsInput, setTagsInput] = useState("");
  const [profileExists, setProfileExists] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!videoId) return;

    Promise.all([
      getLibrary(1, 100),
      getScoutingProfile(videoId).catch(() => null),
      getFiltersCatalog().catch(() => defaultCatalog),
    ])
      .then(([library, profileResponse, filtersCatalog]) => {
        setVideo(library.items.find((item) => item._id === videoId) ?? null);
        setCatalog({
          sportTypes: mergeOptions(filtersCatalog.sportTypes, defaultCatalog.sportTypes),
          playTypes: mergeOptions(filtersCatalog.playTypes, defaultCatalog.playTypes),
          tournamentTypes: mergeOptions(
            filtersCatalog.tournamentTypes,
            defaultCatalog.tournamentTypes
          ),
          countries: mergeOptions(filtersCatalog.countries, defaultCatalog.countries),
          cities: mergeOptions(filtersCatalog.cities, defaultCatalog.cities),
          playerPositions: mergeOptions(
            filtersCatalog.playerPositions,
            defaultCatalog.playerPositions
          ),
          playerCategories: mergeOptions(
            filtersCatalog.playerCategories,
            defaultCatalog.playerCategories
          ),
          tournaments: mergeOptions(filtersCatalog.tournaments, defaultCatalog.tournaments),
          tags: mergeOptions(filtersCatalog.tags, defaultCatalog.tags),
        });

        if (profileResponse?.scoutingProfile) {
          const profile = profileResponse.scoutingProfile;
          setProfileExists(true);
          setForm({
            title: profile.title ?? "",
            sportType: profile.sportType ?? "",
            playType: profile.playType ?? "",
            tournamentType: profile.tournamentType ?? "",
            playerName: profile.playerName ?? "",
            playerAge: profile.playerAge,
            playerPosition: profile.playerPosition ?? "",
            playerTeam: profile.playerTeam ?? "",
            playerCategory: profile.playerCategory ?? "",
            jerseyNumber: profile.jerseyNumber,
            dominantProfile: profile.dominantProfile ?? "",
            country: profile.country ?? "",
            city: profile.city ?? "",
            tournamentName: profile.tournamentName ?? "",
            notes: profile.notes ?? "",
            tags: profile.tags ?? [],
            recordedAt: profile.recordedAt ?? "",
          });
          setTagsInput((profile.tags ?? []).join(", "));
        }
      })
      .catch((error) => {
        feedback.showError(error instanceof Error ? error.message : "No se pudo cargar el perfil.");
      });
  }, [feedback, getFiltersCatalog, getLibrary, getScoutingProfile, videoId]);

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
          normalized.length ? normalized : mergeOptions(catalog.countries, defaultCatalog.countries)
        );
      })
      .catch(() => {
        if (cancelled) return;
        setCountryOptions(mergeOptions(catalog.countries, defaultCatalog.countries));
      });

    return () => {
      cancelled = true;
    };
  }, [catalog.countries]);

  const updateField = <K extends keyof RecruiterScoutingProfilePayload>(
    key: K,
    value: RecruiterScoutingProfilePayload[K]
  ) => {
    setFormErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      const value = form[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        nextErrors[field] = `${fieldLabels[field]} es obligatorio.`;
      }
    });

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!videoId) return;
    if (!validateForm()) {
      feedback.showError("Completa los campos obligatorios antes de guardar.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title?.trim(),
        sportType: form.sportType?.trim(),
        playType: form.playType?.trim(),
        tournamentType: form.tournamentType?.trim(),
        playerName: form.playerName?.trim(),
        playerPosition: form.playerPosition?.trim(),
        playerTeam: form.playerTeam?.trim(),
        playerCategory: form.playerCategory?.trim(),
        dominantProfile: form.dominantProfile?.trim(),
        country: form.country?.trim(),
        city: form.city?.trim(),
        tournamentName: form.tournamentName?.trim(),
        notes: form.notes?.trim(),
        recordedAt: form.recordedAt
          ? new Date(`${form.recordedAt.slice(0, 10)}T12:00:00.000Z`).toISOString()
          : "",
        tags: tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean),
      };

      if (profileExists) {
        await updateScoutingProfile(videoId, payload);
      } else {
        await createScoutingProfile(videoId, payload);
      }

      navigate(`/scouting/subpages/video/${videoId}`);
    } catch (error) {
      feedback.showError(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="recruiters-dashboard">
      <header className="recruiters-dashboard__hero">
        <div>
          <p className="recruiters-dashboard__eyebrow">Scouting Profile</p>
          <h2>{profileExists ? "Editar" : "Crear"} perfil de scouting</h2>
          <p>
            Convertimos un video de library en una ficha evaluable para recruiters, con datos
            estructurados y consistencia editorial.
          </p>
        </div>
        <aside className="recruiters-dashboard__stats">
          <span>Video seleccionado</span>
          <strong>{video ? "Listo" : "Pendiente"}</strong>
          <p>{video?.s3Key || "Vuelve a scouting library y elige un clip para editarlo."}</p>
        </aside>
      </header>

      <form className="scouting-form" onSubmit={save}>
        {Object.keys(formErrors).length ? (
          <section className="scouting-form__section scouting-form__section--alert">
            <div className="scouting-form__alert">
              <strong>Faltan campos obligatorios</strong>
              <p>Revisa los campos marcados antes de guardar el profile.</p>
            </div>
          </section>
        ) : null}
        <section className="scouting-form__section">
          <div className="scouting-form__section-header">
            <div>
              <p className="scouting-form__eyebrow">Contexto del clip</p>
              <h3>Clasificación deportiva</h3>
            </div>
            <p>Usa opciones normalizadas para que el ranking y los filtros queden consistentes.</p>
          </div>

          <div className="scouting-form__grid">
            <label className="scouting-form__field scouting-form__field--full">
              <span>Título editorial *</span>
              <input
                type="text"
                placeholder="Ej: Gol de volea en semifinal sub-17"
                value={form.title ?? ""}
                onChange={(event) => updateField("title", event.target.value)}
                aria-invalid={Boolean(formErrors.title)}
              />
              {formErrors.title ? <small>{formErrors.title}</small> : null}
            </label>

            <label className="scouting-form__field">
              <span>Deporte *</span>
              <select
                value={form.sportType ?? ""}
                onChange={(event) => updateField("sportType", event.target.value)}
                aria-invalid={Boolean(formErrors.sportType)}
              >
                <option value="">Selecciona un deporte</option>
                {catalog.sportTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formErrors.sportType ? <small>{formErrors.sportType}</small> : null}
            </label>

            <label className="scouting-form__field">
              <span>Tipo de jugada *</span>
              <select
                value={form.playType ?? ""}
                onChange={(event) => updateField("playType", event.target.value)}
                aria-invalid={Boolean(formErrors.playType)}
              >
                <option value="">Selecciona una jugada</option>
                {catalog.playTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formErrors.playType ? <small>{formErrors.playType}</small> : null}
            </label>

            <label className="scouting-form__field">
              <span>Tipo de torneo *</span>
              <select
                value={form.tournamentType ?? ""}
                onChange={(event) => updateField("tournamentType", event.target.value)}
                aria-invalid={Boolean(formErrors.tournamentType)}
              >
                <option value="">Selecciona un formato</option>
                {catalog.tournamentTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formErrors.tournamentType ? <small>{formErrors.tournamentType}</small> : null}
            </label>

            <label className="scouting-form__field">
              <span>Torneo *</span>
              <input
                list="scouting-tournaments"
                type="text"
                placeholder="Nombre del torneo"
                value={form.tournamentName ?? ""}
                onChange={(event) => updateField("tournamentName", event.target.value)}
                aria-invalid={Boolean(formErrors.tournamentName)}
              />
              <datalist id="scouting-tournaments">
                {catalog.tournaments.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              {formErrors.tournamentName ? <small>{formErrors.tournamentName}</small> : null}
            </label>

            <label className="scouting-form__field">
              <span>Fecha del clip *</span>
              <input
                type="date"
                value={form.recordedAt ? form.recordedAt.slice(0, 10) : ""}
                onChange={(event) => updateField("recordedAt", event.target.value)}
                aria-invalid={Boolean(formErrors.recordedAt)}
              />
              {formErrors.recordedAt ? <small>{formErrors.recordedAt}</small> : null}
            </label>
          </div>
        </section>

        <section className="scouting-form__section">
          <div className="scouting-form__section-header">
            <div>
              <p className="scouting-form__eyebrow">Jugador</p>
              <h3>Perfil del atleta</h3>
            </div>
            <p>Los campos aquí ayudan a que los recruiters filtren y comparen talento más rápido.</p>
          </div>

          <div className="scouting-form__grid">
            <label className="scouting-form__field">
              <span>Nombre del jugador *</span>
              <input
                type="text"
                placeholder="Nombre completo"
                value={form.playerName ?? ""}
                onChange={(event) => updateField("playerName", event.target.value)}
                aria-invalid={Boolean(formErrors.playerName)}
              />
              {formErrors.playerName ? <small>{formErrors.playerName}</small> : null}
            </label>

            <label className="scouting-form__field">
              <span>Posición *</span>
              <select
                value={form.playerPosition ?? ""}
                onChange={(event) => updateField("playerPosition", event.target.value)}
                aria-invalid={Boolean(formErrors.playerPosition)}
              >
                <option value="">Selecciona una posición</option>
                {catalog.playerPositions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formErrors.playerPosition ? <small>{formErrors.playerPosition}</small> : null}
            </label>

            <label className="scouting-form__field">
              <span>Equipo *</span>
              <input
                type="text"
                placeholder="Club o academia"
                value={form.playerTeam ?? ""}
                onChange={(event) => updateField("playerTeam", event.target.value)}
                aria-invalid={Boolean(formErrors.playerTeam)}
              />
              {formErrors.playerTeam ? <small>{formErrors.playerTeam}</small> : null}
            </label>

            <label className="scouting-form__field">
              <span>Categoría *</span>
              <select
                value={form.playerCategory ?? ""}
                onChange={(event) => updateField("playerCategory", event.target.value)}
                aria-invalid={Boolean(formErrors.playerCategory)}
              >
                <option value="">Selecciona categoría</option>
                {catalog.playerCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formErrors.playerCategory ? <small>{formErrors.playerCategory}</small> : null}
            </label>

            <label className="scouting-form__field">
              <span>Edad</span>
              <input
                type="number"
                min="0"
                placeholder="Ej: 17"
                value={form.playerAge ?? ""}
                onChange={(event) =>
                  updateField(
                    "playerAge",
                    event.target.value ? Number(event.target.value) : undefined
                  )
                }
              />
            </label>

            <label className="scouting-form__field">
              <span>Número de camiseta</span>
              <input
                type="number"
                min="0"
                placeholder="Ej: 10"
                value={form.jerseyNumber ?? ""}
                onChange={(event) =>
                  updateField(
                    "jerseyNumber",
                    event.target.value ? Number(event.target.value) : undefined
                  )
                }
              />
            </label>

            <label className="scouting-form__field">
              <span>Perfil dominante *</span>
              <select
                value={form.dominantProfile ?? ""}
                onChange={(event) => updateField("dominantProfile", event.target.value)}
                aria-invalid={Boolean(formErrors.dominantProfile)}
              >
                <option value="">Selecciona perfil dominante</option>
                {dominantProfileOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formErrors.dominantProfile ? <small>{formErrors.dominantProfile}</small> : null}
            </label>
          </div>
        </section>

        <section className="scouting-form__section">
          <div className="scouting-form__section-header">
            <div>
              <p className="scouting-form__eyebrow">Ubicación y notas</p>
              <h3>Contexto de observación</h3>
            </div>
            <p>Completa la procedencia del clip y añade señales útiles para el filtrado editorial.</p>
          </div>

          <div className="scouting-form__grid">
            <label className="scouting-form__field">
              <span>País *</span>
              <select
                value={form.country ?? ""}
                onChange={(event) => updateField("country", event.target.value)}
                aria-invalid={Boolean(formErrors.country)}
              >
                <option value="">Selecciona un país</option>
                {countryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {formErrors.country ? <small>{formErrors.country}</small> : null}
            </label>

            <label className="scouting-form__field">
              <span>Ciudad *</span>
              <input
                type="text"
                placeholder="Ej: Madrid"
                value={form.city ?? ""}
                onChange={(event) => updateField("city", event.target.value)}
                aria-invalid={Boolean(formErrors.city)}
              />
              {formErrors.city ? <small>{formErrors.city}</small> : null}
            </label>

            <label className="scouting-form__field scouting-form__field--full">
              <span>Tags</span>
              <input
                type="text"
                placeholder={
                  catalog.tags.length
                    ? `Ej: ${catalog.tags.slice(0, 4).join(", ")}`
                    : "Ej: left-footed, high-pressure, semifinal"
                }
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
              />
            </label>

            <label className="scouting-form__field scouting-form__field--full">
              <span>Notas de scouting</span>
              <textarea
                rows={5}
                placeholder="Resume por qué este clip merece atención: contexto, ejecución, toma de decisión, impacto."
                value={form.notes ?? ""}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </label>
          </div>
        </section>

        <div className="scouting-form__actions">
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Guardando..." : profileExists ? "Actualizar" : "Crear"}
          </button>
          <button type="button" onClick={() => navigate("/scouting/subpages/library")}>
            Volver a library
          </button>
        </div>
      </form>
    </section>
  );
};

export default RecruiterProfilePage;
