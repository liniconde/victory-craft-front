import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type {
  RecruiterFiltersCatalog,
  RecruiterPlayerProfile,
  RecruiterScoutingProfilePayload,
  RecruiterVideoLibraryItem,
} from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import {
  getRecruiterSportTypeLabel,
  normalizeRecruiterSportType,
  RECRUITER_SPORT_TYPES,
  sanitizeRecruiterSportTypes,
} from "../../../features/recruiters/sportTypes";

const emptyForm: RecruiterScoutingProfilePayload = {
  playerProfileId: "",
  publicationStatus: "published",
  title: "",
  sportType: "",
  playType: "",
  tournamentType: "",
  tournamentName: "",
  recordedAt: "",
  notes: "",
  tags: [],
  playerAge: undefined,
  jerseyNumber: undefined,
};

const defaultCatalog: RecruiterFiltersCatalog = {
  sportTypes: [...RECRUITER_SPORT_TYPES],
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
  playerPositions: [],
  playerCategories: [],
  tournaments: [],
  tags: [],
};

const mergeOptions = (preferred: string[] = [], fallback: string[] = []) =>
  Array.from(new Set([...preferred, ...fallback].map((item) => item.trim()).filter(Boolean)));

const requiredFields: Array<keyof RecruiterScoutingProfilePayload> = [
  "playerProfileId",
  "title",
  "sportType",
  "playType",
  "tournamentType",
  "tournamentName",
  "recordedAt",
];

const fieldLabels: Record<string, string> = {
  playerProfileId: "Player profile",
  title: "Titulo",
  sportType: "Deporte",
  playType: "Tipo de jugada",
  tournamentType: "Tipo de torneo",
  tournamentName: "Torneo",
  recordedAt: "Fecha del clip",
};

const RecruiterProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();
  const [searchParams] = useSearchParams();
  const requestedPlayerProfileId = searchParams.get("playerProfileId") || "";
  const {
    api: {
      createScoutingProfile,
      getFiltersCatalog,
      getLibrary,
      getMyPlayerProfile,
      getPlayerProfile,
      getScoutingProfile,
      updateScoutingProfile,
    },
    feedback,
    loading: { trackTask },
  } = useRecruitersModule();

  const [video, setVideo] = useState<RecruiterVideoLibraryItem | null>(null);
  const [form, setForm] = useState<RecruiterScoutingProfilePayload>(emptyForm);
  const [catalog, setCatalog] = useState<RecruiterFiltersCatalog>(defaultCatalog);
  const [tagsInput, setTagsInput] = useState("");
  const [profileExists, setProfileExists] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<RecruiterPlayerProfile | null>(
    null
  );

  useEffect(() => {
    if (!videoId) return;

    let isCancelled = false;

    const load = async () => {
      await trackTask(
        (async () => {
          try {
            const [library, profileResponse, filtersCatalog] = await Promise.all([
              getLibrary(1, 100),
              getScoutingProfile(videoId).catch(() => null),
              getFiltersCatalog().catch(() => defaultCatalog),
            ]);

            if (isCancelled) return;

            setVideo(library.items.find((item) => item._id === videoId) ?? null);
            setCatalog({
              sportTypes: sanitizeRecruiterSportTypes(
                mergeOptions(filtersCatalog.sportTypes, defaultCatalog.sportTypes)
              ),
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

            const playerProfileId =
              profileResponse?.scoutingProfile?.playerProfileId ||
              requestedPlayerProfileId ||
              "";

            let playerProfile: RecruiterPlayerProfile | null = null;
            if (playerProfileId) {
              playerProfile = await getPlayerProfile(playerProfileId).catch(() => null);
            } else {
              playerProfile = await getMyPlayerProfile().catch(() => null);
            }

            if (isCancelled) return;

            setSelectedPlayerProfile(playerProfile);

            if (profileResponse?.scoutingProfile) {
              const profile = profileResponse.scoutingProfile;
              setProfileExists(true);
              setForm({
                playerProfileId: profile.playerProfileId ?? playerProfile?._id ?? "",
                publicationStatus: profile.publicationStatus ?? "published",
                title: profile.title ?? "",
                sportType: normalizeRecruiterSportType(profile.sportType) ?? "",
                playType: profile.playType ?? "",
                tournamentType: profile.tournamentType ?? "",
                tournamentName: profile.tournamentName ?? "",
                recordedAt: profile.recordedAt ?? "",
                notes: profile.notes ?? "",
                tags: profile.tags ?? [],
                playerAge: profile.playerAge,
                jerseyNumber: profile.jerseyNumber,
              });
              setTagsInput((profile.tags ?? []).join(", "));
              return;
            }

            setForm((current) => ({
              ...current,
              playerProfileId: playerProfile?._id ?? requestedPlayerProfileId ?? "",
              sportType:
                normalizeRecruiterSportType(playerProfile?.sportType) ??
                normalizeRecruiterSportType(current.sportType) ??
                "",
            }));
          } catch (error) {
            if (isCancelled) return;
            feedback.showError(
              error instanceof Error ? error.message : "No se pudo cargar el perfil."
            );
          }
        })(),
        "Los sticks están completando la ficha editorial del clip."
      );
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [
    feedback,
    getFiltersCatalog,
    getLibrary,
    getMyPlayerProfile,
    getPlayerProfile,
    getScoutingProfile,
    requestedPlayerProfileId,
    trackTask,
    videoId,
  ]);

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
      const payload: RecruiterScoutingProfilePayload = {
        playerProfileId: form.playerProfileId?.trim(),
        publicationStatus: form.publicationStatus ?? "published",
        title: form.title?.trim(),
        sportType: normalizeRecruiterSportType(form.sportType),
        playType: form.playType?.trim(),
        tournamentType: form.tournamentType?.trim(),
        tournamentName: form.tournamentName?.trim(),
        notes: form.notes?.trim(),
        recordedAt: form.recordedAt
          ? new Date(`${form.recordedAt.slice(0, 10)}T12:00:00.000Z`).toISOString()
          : "",
        tags: tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        playerAge: form.playerAge,
        jerseyNumber: form.jerseyNumber,
      };

      if (profileExists) {
        await updateScoutingProfile(videoId, payload);
      } else {
        await createScoutingProfile(videoId, payload);
      }

      navigate("/scouting/subpages/rankings");
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
          <h2>{profileExists ? "Editar metadata editorial" : "Crear metadata editorial"}</h2>
          <p>
            Esta pantalla solo edita metadata editorial del video. La ficha base del jugador vive
            en `playerProfile` y el ranking solo mostrara videos con `publicationStatus=published`.
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
              <p>Revisa los campos marcados antes de guardar.</p>
            </div>
          </section>
        ) : null}

        <section className="scouting-form__section">
          <div className="scouting-form__section-header">
            <div>
              <p className="scouting-form__eyebrow">Jugador asociado</p>
              <h3>Player profile base</h3>
            </div>
            <p>
              El video debe estar vinculado a un player profile antes de crear o actualizar el
              scouting profile.
            </p>
          </div>

          <div className="scouting-form__grid">
            <article className="scouting-form__field scouting-form__field--placeholder scouting-form__field--full">
              <span>Player profile</span>
              <p>
                {selectedPlayerProfile?.fullName || "Sin player profile vinculado"}
                {selectedPlayerProfile?.primaryPosition
                  ? ` · ${selectedPlayerProfile.primaryPosition}`
                  : ""}
                {selectedPlayerProfile?.team ? ` · ${selectedPlayerProfile.team}` : ""}
              </p>
              {formErrors.playerProfileId ? <small>{formErrors.playerProfileId}</small> : null}
            </article>
          </div>
        </section>

        <section className="scouting-form__section">
          <div className="scouting-form__section-header">
            <div>
              <p className="scouting-form__eyebrow">Publicacion</p>
              <h3>Metadata editorial del video</h3>
            </div>
            <p>
              Aqui definimos el estado de publicacion y el contexto editorial del clip, sin mezclar
              datos base del jugador.
            </p>
          </div>

          <div className="scouting-form__grid">
            <label className="scouting-form__field">
              <span>Estado de publicacion</span>
              <select
                value={form.publicationStatus ?? "published"}
                onChange={(event) =>
                  updateField(
                    "publicationStatus",
                    event.target.value as RecruiterScoutingProfilePayload["publicationStatus"]
                  )
                }
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>

            <label className="scouting-form__field scouting-form__field--full">
              <span>Titulo del video *</span>
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
              <span>Deporte del clip *</span>
              <select
                value={form.sportType ?? ""}
                onChange={(event) =>
                  updateField("sportType", normalizeRecruiterSportType(event.target.value) ?? "")
                }
                aria-invalid={Boolean(formErrors.sportType)}
              >
                <option value="">Selecciona un deporte</option>
                {catalog.sportTypes.map((option) => (
                  <option key={option} value={option}>
                    {getRecruiterSportTypeLabel(option)}
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
              <span>Nombre del torneo *</span>
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

            <label className="scouting-form__field">
              <span>Edad del jugador</span>
              <input
                type="number"
                min="0"
                max="100"
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
              <span>Dorsal</span>
              <input
                type="number"
                min="0"
                max="99"
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

            <label className="scouting-form__field scouting-form__field--full">
              <span>Tags</span>
              <input
                type="text"
                placeholder={
                  catalog.tags.length
                    ? `Ej: ${catalog.tags.slice(0, 4).join(", ")}`
                    : "Ej: transition, finishing, high-pressure"
                }
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
              />
            </label>

            <label className="scouting-form__field scouting-form__field--full">
              <span>Notas editoriales</span>
              <textarea
                rows={5}
                placeholder="Contexto del clip, lectura de la jugada, ejecucion y por que merece entrar al ranking."
                value={form.notes ?? ""}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </label>
          </div>
        </section>

        <div className="scouting-form__actions">
          <button type="submit" disabled={isSaving || !form.playerProfileId?.trim()}>
            {isSaving
              ? "Guardando..."
              : form.publicationStatus === "archived"
                ? "Guardar y retirar del ranking"
                : form.publicationStatus === "draft"
                  ? "Guardar borrador"
                  : "Guardar y publicar"}
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
