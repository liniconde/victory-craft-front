import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  RecruiterFiltersCatalog,
  RecruiterRankingItem,
  RecruiterRankingsQuery,
} from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";

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

const RecruiterRankingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    api: { getFiltersCatalog, getRankings, voteVideo },
    feedback,
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
    getFiltersCatalog()
      .then(setCatalog)
      .catch((error) => {
        feedback.showError(
          error instanceof Error ? error.message : "No se pudo cargar el catálogo."
        );
      });
  }, [feedback, getFiltersCatalog]);

  useEffect(() => {
    getRankings(query)
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
  }, [feedback, getRankings, query]);

  const selectedItem = useMemo(
    () => items.find((item) => item.video._id === selectedVideoId) ?? items[0] ?? null,
    [items, selectedVideoId]
  );

  const playableUrl =
    selectedItem?.video.playbackUrl || selectedItem?.video.videoUrl || "";

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

  return (
    <section className="recruiters-dashboard recruiters-board">
      <header className="recruiters-dashboard__hero">
        <div>
          <p className="recruiters-dashboard__eyebrow">Scouting Board</p>
          <h2>Panel editorial de reclutamiento</h2>
          <p>
            El orden ya viene resuelto por backend: score descendente y, en empate,
            clips más recientes primero. Aquí trabajamos el board encima de esa jerarquía.
          </p>
        </div>
        <div className="recruiters-dashboard__stats">
          <strong>{pagination.total}</strong>
          <span>clips evaluables</span>
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
            className={`recruiters-board__top-card ${
              selectedItem?.video._id === item.video._id ? "is-active" : ""
            }`}
            onClick={() => setSelectedVideoId(item.video._id)}
          >
            <span className="recruiters-board__top-rank">Top {index + 1}</span>
            <strong>{item.scoutingProfile?.title || item.video.s3Key}</strong>
            <p>
              {item.scoutingProfile?.playerName || "Jugador"} ·{" "}
              {item.scoutingProfile?.playerPosition || "Posición"}
            </p>
            <small>
              {item.ranking.score} pts · {item.ranking.netVotes} netos
            </small>
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
                    sportType: event.target.value,
                    page: 1,
                  }))
                }
              >
                <option value="">Todos</option>
                {renderOptions(catalog.sportTypes)}
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
                      {item.scoutingProfile?.playerName || "Jugador"} ·{" "}
                      {item.scoutingProfile?.playerPosition || "Posición"} ·{" "}
                      {item.scoutingProfile?.country || "País"} ·{" "}
                      {item.scoutingProfile?.city || "Ciudad"}
                    </p>
                    <div className="recruiters-board__chips">
                      <span>{item.scoutingProfile?.sportType || item.video.sportType || "sport"}</span>
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

        <aside className="recruiters-board__preview recruiters-dashboard__table">
          <div className="recruiters-dashboard__table-header recruiters-dashboard__table-header--stack">
            <h3>Preview</h3>
            <span>Clip seleccionado para revisión rápida</span>
          </div>

          {selectedItem ? (
            <div className="recruiters-board__preview-body">
              <div className="recruiters-board__preview-player">
                {playableUrl ? (
                  <video key={selectedVideoId || playableUrl} controls>
                    <source src={playableUrl} />
                  </video>
                ) : (
                  <div className="recruiters-board__preview-empty">Sin preview</div>
                )}
              </div>

              <div className="recruiters-board__preview-copy">
                <strong>{selectedItem.scoutingProfile?.title || selectedItem.video.s3Key}</strong>
                <p>
                  {selectedItem.scoutingProfile?.playerName || "Jugador"} ·{" "}
                  {selectedItem.scoutingProfile?.playerTeam || "Equipo"} ·{" "}
                  {selectedItem.scoutingProfile?.tournamentName || "Torneo"}
                </p>
                <p>{selectedItem.scoutingProfile?.notes || "Sin notas del perfil."}</p>
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
                  Editar profile
                </button>
              </div>
            </div>
          ) : (
            <p>No hay clips para mostrar.</p>
          )}
        </aside>
      </div>
    </section>
  );
};

export default RecruiterRankingsPage;
