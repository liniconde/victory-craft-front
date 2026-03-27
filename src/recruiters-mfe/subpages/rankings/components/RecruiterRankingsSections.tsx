import React from "react";
import type {
  RecruiterFiltersCatalog,
  RecruiterRankingItem,
  RecruiterRankingsQuery,
} from "../../../features/recruiters/types";
import RecruitersVideoPlayer from "../../../components/RecruitersVideoPlayer";
import RecruiterVoteButtons from "../../../components/RecruiterVoteButtons";
import {
  getRecruiterSportTypeLabel,
  normalizeRecruiterSportType,
} from "../../../features/recruiters/sportTypes";

export interface RankingsPaginationState {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

interface RankingsFiltersPanelProps {
  catalog: RecruiterFiltersCatalog;
  query: RecruiterRankingsQuery;
  onQueryChange: (
    updater: (current: RecruiterRankingsQuery) => RecruiterRankingsQuery,
  ) => void;
}

interface RankingsPodiumProps {
  topThree: RecruiterRankingItem[];
  selectedVideoId: string;
  onSelectVideo: (videoId: string) => void;
}

interface RankingsMobileTopButtonsProps {
  topThree: RecruiterRankingItem[];
  selectedVideoId: string;
  onSelectVideo: (videoId: string) => void;
}

interface RankingsListProps {
  items: RecruiterRankingItem[];
  selectedVideoId: string;
  pagination: RankingsPaginationState;
  onSelectVideo: (videoId: string) => void;
  onVote: (videoId: string, value: -1 | 0 | 1) => void;
  pendingVotes?: Record<string, -1 | 0 | 1 | null | undefined>;
  onPageChange: (page: number) => void;
  compact?: boolean;
}

interface RankingsRowProps {
  item: RecruiterRankingItem;
  isActive: boolean;
  absoluteRank: number;
  onSelectVideo: (videoId: string) => void;
  onVote: (videoId: string, value: -1 | 0 | 1) => void;
  pendingVote?: -1 | 0 | 1 | null;
  compact?: boolean;
}

interface RankingsPreviewProps {
  selectedItem: RecruiterRankingItem | null;
  selectedVideoId: string;
  playableUrl: string;
  onVote: (videoId: string, value: -1 | 0 | 1) => void;
  pendingVote?: -1 | 0 | 1 | null;
  onOpenRecruiterView: (videoId: string) => void;
  onOpenProfile: (videoId: string) => void;
  mobile?: boolean;
}

const renderPlainOptions = (values: string[]) =>
  values.map((value) => (
    <option key={value} value={value}>
      {value}
    </option>
  ));

const getDisplayName = (item: RecruiterRankingItem) =>
  item.playerProfile?.fullName || item.scoutingProfile?.title || item.video.s3Key || "Player";

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "VC";

export const RecruiterRankingsFiltersPanel: React.FC<
  RankingsFiltersPanelProps
> = ({ catalog, query, onQueryChange }) => (
  <div className="recruiters-board__filters-shell">
    <div className="recruiters-board__filters-grid recruiters-board__filters-grid--primary">
      <label className="recruiters-board__filter recruiters-board__filter--search">
        <span>Buscar</span>
        <input
          type="text"
          value={query.searchTerm ?? ""}
          onChange={(event) =>
            onQueryChange((current) => ({
              ...current,
              searchTerm: event.target.value,
              page: 1,
            }))
          }
          placeholder="Jugador, torneo o notas"
        />
      </label>

      <label className="recruiters-board__filter">
        <span>Deporte</span>
        <select
          value={query.sportType ?? ""}
          onChange={(event) =>
            onQueryChange((current) => ({
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

      <label className="recruiters-board__filter">
        <span>Jugada</span>
        <select
          value={query.playType ?? ""}
          onChange={(event) =>
            onQueryChange((current) => ({
              ...current,
              playType: event.target.value,
              page: 1,
            }))
          }
        >
          <option value="">Todas</option>
          {renderPlainOptions(catalog.playTypes)}
        </select>
      </label>

      <label className="recruiters-board__filter">
        <span>Torneo</span>
        <select
          value={query.tournamentType ?? ""}
          onChange={(event) =>
            onQueryChange((current) => ({
              ...current,
              tournamentType: event.target.value,
              page: 1,
            }))
          }
        >
          <option value="">Todos</option>
          {renderPlainOptions(catalog.tournamentTypes)}
        </select>
      </label>

      <label className="recruiters-board__filter">
        <span>País</span>
        <select
          value={query.country ?? ""}
          onChange={(event) =>
            onQueryChange((current) => ({
              ...current,
              country: event.target.value,
              page: 1,
            }))
          }
        >
          <option value="">Todos</option>
          {renderPlainOptions(catalog.countries)}
        </select>
      </label>
    </div>

    <details className="recruiters-board__filters-advanced">
      <summary>
        Advanced filters
        <small>
          {[
            query.city,
            query.playerPosition,
            query.playerCategory,
            query.sortBy && query.sortBy !== "score" ? query.sortBy : "",
          ]
            .filter(Boolean)
            .length || "optional"}
        </small>
      </summary>

      <div className="recruiters-board__filters-grid recruiters-board__filters-grid--secondary">
        <label className="recruiters-board__filter">
          <span>Ciudad</span>
          <select
            value={query.city ?? ""}
            onChange={(event) =>
              onQueryChange((current) => ({
                ...current,
                city: event.target.value,
                page: 1,
              }))
            }
          >
            <option value="">Todas</option>
            {renderPlainOptions(catalog.cities)}
          </select>
        </label>

        <label className="recruiters-board__filter">
          <span>Posición</span>
          <select
            value={query.playerPosition ?? ""}
            onChange={(event) =>
              onQueryChange((current) => ({
                ...current,
                playerPosition: event.target.value,
                page: 1,
              }))
            }
          >
            <option value="">Todas</option>
            {renderPlainOptions(catalog.playerPositions)}
          </select>
        </label>

        <label className="recruiters-board__filter">
          <span>Categoría</span>
          <select
            value={query.playerCategory ?? ""}
            onChange={(event) =>
              onQueryChange((current) => ({
                ...current,
                playerCategory: event.target.value,
                page: 1,
              }))
            }
          >
            <option value="">Todas</option>
            {renderPlainOptions(catalog.playerCategories)}
          </select>
        </label>

        <label className="recruiters-board__filter">
          <span>Orden</span>
          <select
            value={query.sortBy ?? "score"}
            onChange={(event) =>
              onQueryChange((current) => ({
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
    </details>
  </div>
);

export const RecruiterRankingsPodium: React.FC<RankingsPodiumProps> = ({
  topThree,
  selectedVideoId,
  onSelectVideo,
}) => (
  <section className="recruiters-board__top">
    {topThree.map((item, index) => (
      <button
        key={item.video._id}
        type="button"
        className={`recruiters-board__top-card recruiters-board__top-card--rank-${
          index + 1
        } ${selectedVideoId === item.video._id ? "is-active" : ""}`}
        onClick={() => onSelectVideo(item.video._id)}
      >
        <div className="recruiters-board__top-card-head">
          <p className="recruiters-board__top-card-kicker">Top {index + 1}</p>
          <div
            className={`recruiters-board__top-card-avatar ${
              index === 0 ? "is-premium" : ""
            }`}
            aria-hidden="true"
          >
            {getInitials(getDisplayName(item))}
          </div>
        </div>
        <div className="recruiters-board__top-card-main">
          <div>
            <h3>{getDisplayName(item)}</h3>
            <p>{item.playerProfile?.primaryPosition || "Position"}</p>
          </div>
        </div>
        <div className="recruiters-board__top-card-stats">
          <article>
            <span>Score</span>
            <strong>{item.ranking.score}</strong>
          </article>
          <article>
            <span>Heat</span>
            <strong>{item.ranking.netVotes}</strong>
          </article>
        </div>
      </button>
    ))}
  </section>
);

export const RecruiterRankingsMobileTopButtons: React.FC<
  RankingsMobileTopButtonsProps
> = ({ topThree, selectedVideoId, onSelectVideo }) => (
  <section className="recruiters-board-mobile__top-buttons">
    {topThree.map((item, index) => (
      <button
        key={item.video._id}
        type="button"
        className={`recruiters-board-mobile__top-button recruiters-board-mobile__top-button--rank-${
          index + 1
        } ${selectedVideoId === item.video._id ? "is-active" : ""}`}
        onClick={() => onSelectVideo(item.video._id)}
      >
        <span className="recruiters-board-mobile__top-button-rank">
          Top {index + 1}
        </span>
        <strong>{item.ranking.score}</strong>
        <small>pts</small>
      </button>
    ))}
  </section>
);

export const RecruiterRankingsPreview: React.FC<RankingsPreviewProps> = ({
  selectedItem,
  selectedVideoId,
  playableUrl,
  onVote,
  pendingVote = null,
  onOpenRecruiterView,
  onOpenProfile,
  mobile = false,
}) => {
  if (!selectedItem) {
    return <p>No hay clips para mostrar.</p>;
  }

  const score = Math.max(0, Math.min(100, Math.round((selectedItem.ranking.score / 10) * 100)));
  const voteVolume = selectedItem.ranking.upvotes + selectedItem.ranking.downvotes;
  const heatBalance = Math.max(
    0,
    Math.min(
      100,
      voteVolume > 0
        ? Math.round(((selectedItem.ranking.upvotes - selectedItem.ranking.downvotes + voteVolume) / (voteVolume * 2)) * 100)
        : 50,
    ),
  );
  const recentSignal = Math.max(24, Math.min(100, 42 + Math.abs(selectedItem.ranking.netVotes) * 6));
  const verdict =
    selectedItem.scoutingProfile?.notes ||
    `${getDisplayName(selectedItem)} destaca por su impacto actual en el board y por la tracción editorial que está generando.`;

  return (
    <div
      className={`recruiters-board__preview-body ${
        mobile ? "recruiters-board__preview-body--mobile" : ""
      }`}
    >
      <div
        className={`recruiters-board__preview-player ${
          mobile ? "recruiters-board__preview-player--mobile" : ""
        }`}
      >
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
        <span className="recruiters-board__preview-kicker">Featured clip</span>
        <div className="recruiters-board__preview-copy-header">
          <strong>{selectedItem.scoutingProfile?.title || selectedItem.video.s3Key}</strong>
          <div className="scouting-video-card__votes recruiters-board__preview-votes">
            <RecruiterVoteButtons
              upvotes={selectedItem.ranking.upvotes}
              downvotes={selectedItem.ranking.downvotes}
              myVote={selectedItem.myVote}
              pendingVote={pendingVote}
              isPending={pendingVote !== null && pendingVote !== undefined}
              onVote={(value) => onVote(selectedItem.video._id, value)}
            />
          </div>
        </div>
        <p>
          {selectedItem.playerProfile?.fullName || "Jugador"} ·{" "}
          {selectedItem.playerProfile?.team || "Equipo"} ·{" "}
          {selectedItem.scoutingProfile?.tournamentName || "Torneo"}
        </p>
        <p>{selectedItem.scoutingProfile?.notes || "Sin notas editoriales."}</p>
      </div>

      <div className="recruiters-board__preview-stats">
        <article>
          <span>Scout Score</span>
          <strong>{selectedItem.ranking.score}</strong>
        </article>
        <article>
          <span>Heat Balance</span>
          <strong>{selectedItem.ranking.netVotes}</strong>
        </article>
        <article>
          <span>Published</span>
          <strong>
            {selectedItem.video.createdAt
              ? new Date(selectedItem.video.createdAt).toLocaleDateString()
              : selectedItem.video.uploadedAt
                ? new Date(selectedItem.video.uploadedAt).toLocaleDateString()
                : "s/f"}
          </strong>
        </article>
      </div>

      {selectedItem.playerProfile ? (
        <section className="recruiters-board__player-profile">
          <span>Linked profile</span>
          <strong>{selectedItem.playerProfile.fullName || "Sin nombre"}</strong>
          <p>
            {selectedItem.playerProfile.team || "Sin equipo"} ·{" "}
            {getRecruiterSportTypeLabel(selectedItem.playerProfile.sportType) ||
              "Sin deporte"}{" "}
            · {selectedItem.playerProfile.category || "Sin categoría"}
          </p>
        </section>
      ) : null}

      {!mobile ? (
        <section className="recruiters-board__analysis">
          <article className="recruiters-board__analysis-panel">
            <h3>Scouting Breakdown</h3>
            <div className="recruiters-board__analysis-bars">
              <div>
                <div className="recruiters-board__analysis-label">
                  <span>Technical Score</span>
                  <strong>{score}%</strong>
                </div>
                <div className="recruiters-board__analysis-track">
                  <div style={{ width: `${score}%` }} />
                </div>
              </div>
              <div>
                <div className="recruiters-board__analysis-label">
                  <span>Heat Balance</span>
                  <strong>{heatBalance}%</strong>
                </div>
                <div className="recruiters-board__analysis-track">
                  <div style={{ width: `${heatBalance}%` }} />
                </div>
              </div>
              <div>
                <div className="recruiters-board__analysis-label">
                  <span>Recent Signal</span>
                  <strong>{recentSignal}%</strong>
                </div>
                <div className="recruiters-board__analysis-track">
                  <div style={{ width: `${recentSignal}%` }} />
                </div>
              </div>
            </div>
          </article>

          <article className="recruiters-board__verdict-panel">
            <span>Expert Verdict</span>
            <strong>
              {selectedItem.ranking.score >= 9
                ? "Elite priority"
                : selectedItem.ranking.score >= 8
                  ? "Strong prospect"
                  : "Monitor closely"}
            </strong>
            <p>{verdict}</p>
          </article>
        </section>
      ) : null}

      <div className="scouting-form__actions">
        <button
          type="button"
          onClick={() => onOpenRecruiterView(selectedItem.video._id)}
        >
          Open video room
        </button>
        <button type="button" onClick={() => onOpenProfile(selectedItem.video._id)}>
          Refine metadata
        </button>
      </div>
    </div>
  );
};

export const RecruiterRankingsList: React.FC<RankingsListProps> = ({
  items,
  selectedVideoId,
  pagination,
  onSelectVideo,
  onVote,
  pendingVotes = {},
  onPageChange,
  compact = false,
}) => (
  <>
    <div className={`recruiters-board__list-body ${compact ? "is-mobile" : ""}`}>
      {items.map((item, index) => {
        return (
          <RankingsRow
            key={item.video._id}
            item={item}
            isActive={item.video._id === selectedVideoId}
            absoluteRank={(pagination.page - 1) * pagination.limit + index + 1}
            onSelectVideo={onSelectVideo}
            onVote={onVote}
            pendingVote={pendingVotes[item.video._id] ?? null}
            compact={compact}
          />
        );
      })}
    </div>

    <div className="scouting-form__actions">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
        disabled={pagination.page <= 1}
      >
        Anterior
      </button>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
        disabled={pagination.page >= pagination.totalPages}
      >
        Siguiente
      </button>
    </div>
  </>
);

export const getPlayableUrl = (item: RecruiterRankingItem | null | undefined) =>
  item?.video.playbackUrl || item?.video.videoUrl || "";

const RankingsRow: React.FC<RankingsRowProps> = React.memo(
  ({
    item,
    isActive,
    absoluteRank,
    onSelectVideo,
    onVote,
    pendingVote = null,
    compact = false,
  }) => (
    <article
      className={`recruiters-board__row ${isActive ? "is-active" : ""} ${
        compact ? "recruiters-board__row--mobile" : ""
      }`}
      onClick={() => onSelectVideo(item.video._id)}
      role="button"
      tabIndex={0}
    >
      <div className="recruiters-board__row-rank">#{absoluteRank}</div>
      <div className="recruiters-board__row-main">
        <div className="recruiters-board__row-header">
          <strong>{getDisplayName(item)}</strong>
          <span>{item.ranking.score}</span>
        </div>
        <p>
          {item.playerProfile?.primaryPosition || "Position"} ·{" "}
          {item.playerProfile?.team || "Team"} ·{" "}
          {item.playerProfile?.city || "City"}
        </p>
        <div className="recruiters-board__chips">
          <span>
            {getRecruiterSportTypeLabel(
              item.scoutingProfile?.sportType || item.video.sportType,
            ) || "sport"}
          </span>
          <span>{item.scoutingProfile?.playType || "play type"}</span>
          <span>{item.scoutingProfile?.tournamentType || "torneo"}</span>
        </div>
      </div>
      <div className="recruiters-board__row-meta">
        <RecruiterVoteButtons
          className="recruiters-board__row-votes"
          compact
          upvotes={item.ranking.upvotes}
          downvotes={item.ranking.downvotes}
          myVote={item.myVote}
          pendingVote={pendingVote}
          isPending={pendingVote !== null && pendingVote !== undefined}
          onVote={(value) => onVote(item.video._id, value)}
        />
      </div>
    </article>
  ),
  (prev, next) =>
    prev.item === next.item &&
    prev.isActive === next.isActive &&
    prev.absoluteRank === next.absoluteRank &&
    prev.pendingVote === next.pendingVote &&
    prev.compact === next.compact &&
    prev.onSelectVideo === next.onSelectVideo &&
    prev.onVote === next.onVote
);
