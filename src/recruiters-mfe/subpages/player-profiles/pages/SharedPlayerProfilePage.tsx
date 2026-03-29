import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaCopy, FaUserCircle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import PlayerProfileRadar from "../../../components/PlayerProfileRadar";
import type { RecruiterPublicPlayerProfileResponse } from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import { getRecruiterSportTypeLabel } from "../../../features/recruiters/sportTypes";
import {
  buildPublicPlayerProfilePath,
  resolvePublicPlayerProfilePath,
} from "../playerProfileShare";
import { getPlayerProfileKpis, getPlayerProfileRadarMetrics } from "../playerProfileStats";
import "./SharedPlayerProfilePage.css";

const formatDate = (value?: string | null) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const SharedPlayerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { publicSlug, publicShareId } = useParams<{
    publicSlug?: string;
    publicShareId?: string;
  }>();
  const {
    api: { getPublicPlayerProfileByShareId, getPublicPlayerProfileBySlug },
    feedback,
  } = useRecruitersModule();

  const [data, setData] = useState<RecruiterPublicPlayerProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMissing, setIsMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!publicSlug?.trim() && !publicShareId?.trim()) {
        setData(null);
        setIsMissing(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setIsMissing(false);

      try {
        const response = publicSlug?.trim()
          ? await getPublicPlayerProfileBySlug(publicSlug.trim())
          : await getPublicPlayerProfileByShareId((publicShareId || "").trim());

        if (cancelled) return;

        setData(response);
      } catch (error) {
        if (cancelled) return;

        const message = error instanceof Error ? error.message.toLowerCase() : "";
        setData(null);
        setIsMissing(message.includes("no encontrado") || message.includes("not found"));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [getPublicPlayerProfileByShareId, getPublicPlayerProfileBySlug, publicShareId, publicSlug]);

  useEffect(() => {
    if (!publicShareId || publicSlug) return;
    const canonicalSlug = data?.profile?.publicSlug?.trim();
    if (!canonicalSlug) return;
    navigate(buildPublicPlayerProfilePath(canonicalSlug), { replace: true });
  }, [data?.profile?.publicSlug, navigate, publicShareId, publicSlug]);

  const profile = data?.profile;
  const stats = data?.scoutingStats;
  const videos = data?.videos ?? [];
  const kpis = useMemo(() => getPlayerProfileKpis(stats), [stats]);
  const radarMetrics = useMemo(() => getPlayerProfileRadarMetrics(stats), [stats]);
  const playTypeItems = useMemo(
    () =>
      [...(stats?.playTypeItems ?? [])]
        .filter((item) => (item?.count ?? 0) > 0)
        .sort((left, right) => (right.count ?? 0) - (left.count ?? 0))
        .slice(0, 6),
    [stats?.playTypeItems]
  );

  const publicPath = resolvePublicPlayerProfilePath({
    publicSlug: profile?.publicSlug ?? publicSlug ?? null,
  }) || (publicSlug ? buildPublicPlayerProfilePath(publicSlug) : "");

  const handleCopyLink = async () => {
    if (!publicPath || typeof window === "undefined") return;

    try {
      await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
      feedback.showLoading("Enlace público copiado.");
      window.setTimeout(() => feedback.hideLoading(), 1200);
    } catch {
      feedback.showError("No se pudo copiar el enlace público.");
    }
  };

  if (isLoading) {
    return (
      <section className="shared-player-profile">
        <div className="shared-player-profile__shell">
          <article className="shared-player-profile__panel shared-player-profile__state">
            <span>Cargando perfil</span>
            <h2>Preparando la ficha pública del jugador</h2>
            <p className="shared-player-profile__empty">
              Estamos trayendo la información pública y las estadísticas de scouting.
            </p>
          </article>
        </div>
      </section>
    );
  }

  if (isMissing || !profile) {
    return (
      <section className="shared-player-profile">
        <div className="shared-player-profile__shell">
          <article className="shared-player-profile__panel shared-player-profile__state">
            <span>Perfil no disponible</span>
            <h2>Este player profile no está publicado</h2>
            <p className="shared-player-profile__empty">
              El enlace puede haber cambiado, haber sido desactivado o no existir.
            </p>
            <button
              type="button"
              className="shared-player-profile__back shared-player-profile__back--dark"
              onClick={() => navigate("/")}
            >
              Volver al inicio
            </button>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="shared-player-profile">
      <div className="shared-player-profile__shell">
        <header className="shared-player-profile__hero">
          <div className="shared-player-profile__overlay" />
          <div className="shared-player-profile__hero-content">
            <button
              type="button"
              className="shared-player-profile__back"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft aria-hidden="true" /> Volver
            </button>

            <div className="shared-player-profile__hero-main">
              <div className="shared-player-profile__identity">
                <div className="shared-player-profile__avatar-frame">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName ? `Foto de ${profile.fullName}` : "Foto del jugador"}
                      className="shared-player-profile__avatar"
                    />
                  ) : (
                    <div className="shared-player-profile__avatar shared-player-profile__avatar--fallback">
                      <FaUserCircle aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="shared-player-profile__headline">
                  <span className="shared-player-profile__badge">Perfil público</span>
                  <div>
                    <h1>{profile.fullName || "Jugador"}</h1>
                    <p>
                      {profile.team || "Sin equipo"} ·{" "}
                      {getRecruiterSportTypeLabel(profile.sportType) || "Deporte no definido"}
                    </p>
                  </div>
                  <div className="shared-player-profile__meta">
                    {profile.primaryPosition ? <span>{profile.primaryPosition}</span> : null}
                    {profile.secondaryPosition ? <span>{profile.secondaryPosition}</span> : null}
                    {profile.category ? <span>{profile.category}</span> : null}
                    {profile.city || profile.country ? (
                      <span>{[profile.city, profile.country].filter(Boolean).join(", ")}</span>
                    ) : null}
                    {profile.dominantProfile ? <span>{profile.dominantProfile}</span> : null}
                  </div>
                </div>
              </div>

              <div className="shared-player-profile__actions">
                <button type="button" onClick={handleCopyLink}>
                  <FaCopy aria-hidden="true" /> Copiar enlace
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="shared-player-profile__stats-grid">
          <article>
            <span>Total Videos</span>
            <strong>{kpis.totalVideos}</strong>
            <p>Clips vinculados al perfil público.</p>
          </article>
          <article>
            <span>Goals</span>
            <strong>{kpis.goals}</strong>
            <p>Jugadas clasificadas como gol.</p>
          </article>
          <article>
            <span>Assists</span>
            <strong>{kpis.assists}</strong>
            <p>Acciones registradas como asistencia.</p>
          </article>
          <article>
            <span>Highlights</span>
            <strong>{kpis.highlights}</strong>
            <p>Selección destacada del perfil.</p>
          </article>
        </section>

        <section className="shared-player-profile__content">
          <div className="shared-player-profile__main-column">
            <article className="shared-player-profile__panel">
              <div className="shared-player-profile__panel-header">
                <p>Perfil</p>
                <h2>Resumen del jugador</h2>
              </div>
              <p className="shared-player-profile__bio">
                {profile.bio?.trim() ||
                  "Todavía no hay una biografía pública cargada para este jugador."}
              </p>

              <div className="shared-player-profile__details-grid">
                <article>
                  <span>Equipo</span>
                  <strong>{profile.team || "Sin equipo"}</strong>
                </article>
                <article>
                  <span>Categoría</span>
                  <strong>{profile.category || "Sin categoría"}</strong>
                </article>
                <article>
                  <span>Posición principal</span>
                  <strong>{profile.primaryPosition || "No definida"}</strong>
                </article>
                <article>
                  <span>Perfil dominante</span>
                  <strong>{profile.dominantProfile || "No definido"}</strong>
                </article>
              </div>
            </article>

            <PlayerProfileRadar
              eyebrow="Scouting Radar"
              title="Radar público del jugador"
              caption="Visualización relativa de los KPIs públicos disponibles para este perfil."
              metrics={radarMetrics}
            />

            <article className="shared-player-profile__panel">
              <div className="shared-player-profile__panel-header">
                <p>Clips públicos</p>
                <h2>Videos y metadata disponible</h2>
              </div>

              {videos.length ? (
                <div className="shared-player-profile__videos">
                  {videos.map((video, index) => (
                    <article
                      key={`${video.title || "video"}-${video.recordedAt || index}`}
                      className="shared-player-profile__video-card"
                    >
                      <div className="shared-player-profile__video-thumb">
                        <span>{video.playType || "Clip"}</span>
                      </div>
                      <div className="shared-player-profile__video-copy">
                        <h3>{video.title || `Clip ${index + 1}`}</h3>
                        <p>
                          {[
                            video.publicationStatus === "published" ? "Publicado" : "",
                            formatDate(video.recordedAt),
                          ]
                            .filter(Boolean)
                            .join(" · ") || "Metadata pública disponible"}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="shared-player-profile__empty">
                  Este perfil todavía no tiene clips públicos disponibles.
                </p>
              )}
            </article>
          </div>

          <aside className="shared-player-profile__side-column">
            <article className="shared-player-profile__panel">
              <p>Scouting KPIs</p>
              <h2>Estado editorial</h2>
              <div className="shared-player-profile__details-grid shared-player-profile__details-grid--compact">
                <article>
                  <span>Published</span>
                  <strong>{kpis.publishedVideos}</strong>
                </article>
                <article>
                  <span>Draft</span>
                  <strong>{kpis.draftVideos}</strong>
                </article>
                <article>
                  <span>Archived</span>
                  <strong>{kpis.archivedVideos}</strong>
                </article>
                <article>
                  <span>Bloopers</span>
                  <strong>{kpis.bloopers}</strong>
                </article>
              </div>
            </article>

            <article className="shared-player-profile__panel">
              <div className="shared-player-profile__panel-header">
                <p>Play types</p>
                <h2>Distribución visible</h2>
              </div>
              {playTypeItems.length ? (
                <ul className="shared-player-profile__quick-list">
                  {playTypeItems.map((item) => (
                    <li key={item.playType || "play-type"}>
                      <span>{item.playType || "Play type"}</span>
                      <strong>{item.count ?? 0}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="shared-player-profile__empty">
                  Aún no hay distribución pública de play types para este perfil.
                </p>
              )}
            </article>
          </aside>
        </section>
      </div>
    </section>
  );
};

export default SharedPlayerProfilePage;
