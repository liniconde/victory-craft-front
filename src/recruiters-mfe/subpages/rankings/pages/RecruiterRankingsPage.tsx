import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  RecruiterFiltersCatalog,
  RecruiterRankingItem,
  RecruiterRankingsQuery,
} from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import RecruitersVideoPlayer from "../../../components/RecruitersVideoPlayer";
import {
  getRecruiterSportTypeLabel,
  normalizeRecruiterSportType,
  sanitizeRecruiterSportTypes,
} from "../../../features/recruiters/sportTypes";

const VIDEO_PRELOAD_COUNT = 4;
const MAX_PRELOADED_VIDEOS = 10;
const preloadedRankingVideos = new Map<string, HTMLVideoElement>();

const emptyCatalog: RecruiterFiltersCatalog = {
  sportTypes: [],
  playTypes: [],
  tournamentTypes: [],
  countries: [],
  cities: [],
  playerPositions: [],
  playerCategories: [],
  tournaments: [],
  tags: [],
};

const getPlayableUrl = (item: RecruiterRankingItem | null | undefined) =>
  item?.video.playbackUrl || item?.video.videoUrl || "";

const disposePreloadedVideo = (url: string) => {
  const cached = preloadedRankingVideos.get(url);
  if (!cached) return;

  cached.pause();
  cached.removeAttribute("src");
  cached.load();
  preloadedRankingVideos.delete(url);
};

const warmRankingVideo = (url: string) => {
  if (!url || preloadedRankingVideos.has(url)) return;

  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = url;
  video.load();
  preloadedRankingVideos.set(url, video);

  if (preloadedRankingVideos.size > MAX_PRELOADED_VIDEOS) {
    const oldestUrl = preloadedRankingVideos.keys().next().value;
    if (oldestUrl) disposePreloadedVideo(oldestUrl);
  }
};

const requestIdle = (callback: () => void): number => {
  const scheduler = window as Window & {
    requestIdleCallback?: (cb: IdleRequestCallback) => number;
  };

  if (typeof scheduler.requestIdleCallback === "function") {
    return scheduler.requestIdleCallback(() => callback());
  }

  return window.setTimeout(callback, 120);
};

const cancelIdle = (id: number) => {
  const scheduler = window as Window & {
    cancelIdleCallback?: (idleId: number) => void;
  };

  if (typeof scheduler.cancelIdleCallback === "function") {
    scheduler.cancelIdleCallback(id);
    return;
  }

  window.clearTimeout(id);
};

const RecruiterRankingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    api: { getFiltersCatalog, getRankings, voteVideo },
    feedback,
    loading: { trackTask },
  } = useRecruitersModule();

  const [catalog, setCatalog] = useState<RecruiterFiltersCatalog>(emptyCatalog);
  const [items, setItems] = useState<RecruiterRankingItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [query, setQuery] = useState<RecruiterRankingsQuery>({
    sortBy: "score",
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 12,
  });

  useEffect(() => {
    trackTask(getFiltersCatalog(), "Los sticks están afinando los filtros del ranking.")
      .then((response) =>
        setCatalog({
          ...response,
          sportTypes: sanitizeRecruiterSportTypes(response.sportTypes),
        })
      )
      .catch((error) => {
        feedback.showError(
          error instanceof Error ? error.message : "No se pudo cargar el catálogo."
        );
      });
  }, [feedback, getFiltersCatalog, trackTask]);

  useEffect(() => {
    trackTask(
      getRankings(query),
      "Los sticks están reordenando el ranking mientras llegan los clips."
    )
      .then((response) => {
        setItems(response.items);
        setPagination(response.pagination);
        setSelectedVideoId((current) => {
          if (response.items.some((item) => item.video._id === current)) return current;
          return response.items[0]?.video._id ?? "";
        });
      })
      .catch((error) => {
        feedback.showError(error instanceof Error ? error.message : "No se pudo cargar el ranking.");
      });
  }, [feedback, getRankings, query, trackTask]);

  const selectedItem = useMemo(
    () => items.find((item) => item.video._id === selectedVideoId) ?? items[0] ?? null,
    [items, selectedVideoId]
  );

  const playableUrl = getPlayableUrl(selectedItem);

  const renderOptions = (values: string[]) =>
    values.map((value) => (
      <option key={value} value={value}>
        {value}
      </option>
    ));

  const updateVote = async (videoId: string, value: -1 | 0 | 1) => {
    try {
      await voteVideo(videoId, value);
      const response = await getRankings(query);
      setItems(response.items);
      setPagination(response.pagination);
      setSelectedVideoId(videoId);
    } catch (error) {
      feedback.showError(error instanceof Error ? error.message : "No se pudo votar.");
    }
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    videoId: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedVideoId(videoId);
    }
  };

  const handleVoteClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
    videoId: string,
    value: -1 | 0 | 1
  ) => {
    event.stopPropagation();
    await updateVote(videoId, value);
  };

  const topThree = items.slice(0, 3);

  useEffect(() => {
    if (!items.length) return;

    const selectedIndex = items.findIndex((item) => item.video._id === selectedVideoId);
    const startIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const prioritizedUrls = items
      .slice(startIndex, startIndex + VIDEO_PRELOAD_COUNT)
      .map((item) => getPlayableUrl(item))
      .filter(Boolean);

    const warmUp = () => {
      prioritizedUrls.forEach(warmRankingVideo);
    };

    const idleId = requestIdle(warmUp);
    return () => cancelIdle(idleId);
  }, [items, selectedVideoId]);

  return (
    <section className="recruiters-dashboard recruiters-board">
      <header className="recruiters-dashboard__hero">
        <div>
          <p className="recruiters-dashboard__eyebrow">Scouting Board</p>
          <h2>Panel editorial de reclutamiento</h2>
          <p>
            El orden ya viene resuelto por backend: score descendente y, en empate, clips mas
            recientes primero. Este board representa solo videos publicados en el ranking publico.
          </p>
        </div>
        <div className="recruiters-dashboard__stats">
          <strong>{pagination.total}</strong>
          <span>videos publicados</span>
        </div>
      </header>

      <section className="recruiters-board__summary">
        <article>
          <span>Orden actual</span>
          <strong>Score desc + reciente desc</strong>
        </article>
        <article>
          <span>Página</span>
          <strong>
            {pagination.page}/{pagination.totalPages}
          </strong>
        </article>
        <article>
          <span>Filtros activos</span>
          <strong>
            {
              Object.values(query).filter(
                (value) =>
                  value !== undefined &&
                  value !== null &&
                  !(typeof value === "string" && value.trim() === "")
              ).length
            }
          </strong>
        </article>
      </section>

      <section className="recruiters-board__top">
        {topThree.map((item, index) => (
          <button
            key={item.video._id}
            type="button"
            className={`recruiters-board__top-card recruiters-board__top-card--rank-${
              index + 1
            } ${
              selectedItem?.video._id === item.video._id ? "is-active" : ""
            }`}
            onClick={() => setSelectedVideoId(item.video._id)}
          >
            <div className="recruiters-board__top-card-rank">
              <span>Top {index + 1}</span>
            </div>
            <div className="recruiters-board__top-card-main">
              <h3>{item.scoutingProfile?.title || item.video.s3Key}</h3>
              <p>
                {item.playerProfile?.fullName || "Jugador"} ·{" "}
                {item.playerProfile?.primaryPosition || "Posicion"}
              </p>
            </div>
            <div className="recruiters-board__top-card-stats">
              <article>
                <span>Score</span>
                <strong>{item.ranking.score}</strong>
              </article>
              <article>
                <span>Net votes</span>
                <strong>{item.ranking.netVotes}</strong>
              </article>
            </div>
          </button>
        ))}
      </section>

      <div className="recruiters-board__layout">
        <aside className="recruiters-board__filters recruiters-dashboard__table">
          <div className="recruiters-dashboard__table-header recruiters-dashboard__table-header--stack">
            <h3>Filtros</h3>
            <span>Refina el board sin salir de scouting</span>
          </div>

          <div className="recruiters-board__filters-grid">
            <label>
              <span>Buscar</span>
              <input
                type="text"
                value={query.searchTerm ?? ""}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    searchTerm: event.target.value,
                    page: 1,
                  }))
                }
                placeholder="Jugador, torneo o notas"
              />
            </label>

            <label>
              <span>Deporte</span>
              <select
                value={query.sportType ?? ""}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    sportType: normalizeRecruiterSportType(event.target.value) ?? "",
                    page: 1,
                  }))
                }
              >
                <option value="">Todos</option>
                {catalog.sportTypes.map((value) => (
                  <option key={value} value={value}>
                    {getRecruiterSportTypeLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Jugada</span>
              <select
                value={query.playType ?? ""}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    playType: event.target.value,
                    page: 1,
                  }))
                }
              >
                <option value="">Todas</option>
                {renderOptions(catalog.playTypes)}
              </select>
            </label>

            <label>
              <span>Torneo</span>
              <select
                value={query.tournamentType ?? ""}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    tournamentType: event.target.value,
                    page: 1,
                  }))
                }
              >
                <option value="">Todos</option>
                {renderOptions(catalog.tournamentTypes)}
              </select>
            </label>

            <label>
              <span>País</span>
              <select
                value={query.country ?? ""}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    country: event.target.value,
                    page: 1,
                  }))
                }
              >
                <option value="">Todos</option>
                {renderOptions(catalog.countries)}
              </select>
            </label>

            <label>
              <span>Ciudad</span>
              <select
                value={query.city ?? ""}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    city: event.target.value,
                    page: 1,
                  }))
                }
              >
                <option value="">Todas</option>
                {renderOptions(catalog.cities)}
              </select>
            </label>

            <label>
              <span>Posición</span>
              <select
                value={query.playerPosition ?? ""}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    playerPosition: event.target.value,
                    page: 1,
                  }))
                }
              >
                <option value="">Todas</option>
                {renderOptions(catalog.playerPositions)}
              </select>
            </label>

            <label>
              <span>Categoría</span>
              <select
                value={query.playerCategory ?? ""}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    playerCategory: event.target.value,
                    page: 1,
                  }))
                }
              >
                <option value="">Todas</option>
                {renderOptions(catalog.playerCategories)}
              </select>
            </label>

            <label>
              <span>Orden</span>
              <select
                value={query.sortBy ?? "score"}
                onChange={(event) =>
                  setQuery((current) => ({
                    ...current,
                    sortBy: event.target.value as RecruiterRankingsQuery["sortBy"],
                    page: 1,
                  }))
                }
              >
                <option value="score">Score</option>
                <option value="recent">Recientes</option>
                <option value="upvotes">Upvotes</option>
              </select>
            </label>

          </div>
        </aside>

        <aside className="recruiters-board__preview recruiters-dashboard__table">
          <div className="recruiters-dashboard__table-header recruiters-dashboard__table-header--stack">
            <h3>Preview</h3>
          </div>

          {selectedItem ? (
            <div className="recruiters-board__preview-body">
              <div className="recruiters-board__preview-player">
                {playableUrl ? (
                  <RecruitersVideoPlayer
                    key={selectedVideoId || playableUrl}
                    src={playableUrl}
                    message="Los sticks están jugando mientras preparamos el preview del ranking."
                    autoPlay
                    muted
                    loop
                    preload="auto"
                  />
                ) : (
                  <div className="recruiters-board__preview-empty">Sin preview</div>
                )}
              </div>

              <div className="recruiters-board__preview-copy">
                <strong>{selectedItem.scoutingProfile?.title || selectedItem.video.s3Key}</strong>
                <p>
                  {selectedItem.playerProfile?.fullName || "Jugador"} ·{" "}
                  {selectedItem.playerProfile?.team || "Equipo"} ·{" "}
                  {selectedItem.scoutingProfile?.tournamentName || "Torneo"}
                </p>
                <p>{selectedItem.scoutingProfile?.notes || "Sin notas editoriales."}</p>
              </div>

              <div className="recruiters-board__preview-stats">
                <article>
                  <span>Score</span>
                  <strong>{selectedItem.ranking.score}</strong>
                </article>
                <article>
                  <span>Net votes</span>
                  <strong>{selectedItem.ranking.netVotes}</strong>
                </article>
                <article>
                  <span>Reciente</span>
                  <strong>
                    {selectedItem.video.createdAt
                      ? new Date(selectedItem.video.createdAt).toLocaleDateString()
                      : selectedItem.video.uploadedAt
                        ? new Date(selectedItem.video.uploadedAt).toLocaleDateString()
                        : "s/f"}
                  </strong>
                </article>
              </div>

              <div className="scouting-video-card__votes">
                <button
                  type="button"
                  className={selectedItem.myVote === 1 ? "is-active" : ""}
                  onClick={() => updateVote(selectedItem.video._id, 1)}
                >
                  ▲ {selectedItem.ranking.upvotes}
                </button>
                <button
                  type="button"
                  className={selectedItem.myVote === -1 ? "is-negative is-active" : "is-negative"}
                  onClick={() => updateVote(selectedItem.video._id, -1)}
                >
                  ▼ {selectedItem.ranking.downvotes}
                </button>
                <button type="button" onClick={() => updateVote(selectedItem.video._id, 0)}>
                  Neutralizar
                </button>
              </div>

              {selectedItem.playerProfile ? (
                <section className="recruiters-board__player-profile">
                  <span>Player profile asociado</span>
                  <strong>{selectedItem.playerProfile.fullName || "Sin nombre"}</strong>
                  <p>
                    {selectedItem.playerProfile.team || "Sin equipo"} ·{" "}
                    {getRecruiterSportTypeLabel(selectedItem.playerProfile.sportType) ||
                      "Sin deporte"}{" "}
                    ·{" "}
                    {selectedItem.playerProfile.category || "Sin categoría"}
                  </p>
                </section>
              ) : null}

              <div className="scouting-form__actions">
                <button
                  type="button"
                  onClick={() => navigate(`/scouting/subpages/video/${selectedItem.video._id}`)}
                >
                  Abrir recruiter view
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/scouting/subpages/profile/${selectedItem.video._id}`)}
                >
                  Editar metadata
                </button>
              </div>
            </div>
          ) : (
            <p>No hay clips para mostrar.</p>
          )}
        </aside>

        <section className="recruiters-board__list recruiters-dashboard__table">
          <div className="recruiters-dashboard__table-header">
            <h3>Ranking editorial</h3>
            <span>
              Página {pagination.page} de {pagination.totalPages}
            </span>
          </div>

          <div className="recruiters-board__list-body">
            {items.map((item, index) => {
              const isActive = item.video._id === selectedItem?.video._id;
              const absoluteRank = (pagination.page - 1) * pagination.limit + index + 1;

              return (
                <article
                  key={item.video._id}
                  className={`recruiters-board__row ${isActive ? "is-active" : ""}`}
                  onClick={() => setSelectedVideoId(item.video._id)}
                  onKeyDown={(event) => handleRowKeyDown(event, item.video._id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="recruiters-board__row-rank">#{absoluteRank}</div>
                  <div className="recruiters-board__row-main">
                    <div className="recruiters-board__row-header">
                      <strong>{item.scoutingProfile?.title || item.video.s3Key}</strong>
                      <span>{item.ranking.score} pts</span>
                    </div>
                    <p>
                      {item.playerProfile?.fullName || "Jugador"} ·{" "}
                      {item.playerProfile?.primaryPosition || "Posicion"} ·{" "}
                      {item.playerProfile?.country || "Pais"} · {item.playerProfile?.city || "Ciudad"}
                    </p>
                    <div className="recruiters-board__chips">
                      <span>
                        {getRecruiterSportTypeLabel(
                          item.scoutingProfile?.sportType || item.video.sportType
                        ) || "sport"}
                      </span>
                      <span>{item.scoutingProfile?.playType || "play type"}</span>
                      <span>{item.scoutingProfile?.tournamentType || "torneo"}</span>
                    </div>
                  </div>
                  <div className="recruiters-board__row-meta">
                    <small>{item.ranking.upvotes} ▲</small>
                    <small>{item.ranking.downvotes} ▼</small>
                    <small>{item.ranking.netVotes} netos</small>
                    <div className="recruiters-board__row-votes">
                      <button
                        type="button"
                        className={item.myVote === 1 ? "is-active" : ""}
                        onClick={(event) => handleVoteClick(event, item.video._id, 1)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className={item.myVote === -1 ? "is-negative is-active" : "is-negative"}
                        onClick={(event) => handleVoteClick(event, item.video._id, -1)}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={(event) => handleVoteClick(event, item.video._id, 0)}
                      >
                        0
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="scouting-form__actions">
            <button
              type="button"
              onClick={() =>
                setQuery((current) => ({
                  ...current,
                  page: Math.max(1, (current.page ?? 1) - 1),
                }))
              }
              disabled={pagination.page <= 1}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() =>
                setQuery((current) => ({
                  ...current,
                  page: Math.min(pagination.totalPages, (current.page ?? 1) + 1),
                }))
              }
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};

export default RecruiterRankingsPage;
