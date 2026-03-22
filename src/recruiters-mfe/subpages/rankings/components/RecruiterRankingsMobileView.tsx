import React from "react";
import { FaFilter, FaListUl } from "react-icons/fa";
import type {
  RecruiterFiltersCatalog,
  RecruiterRankingItem,
  RecruiterRankingsQuery,
} from "../../../features/recruiters/types";
import {
  RecruiterRankingsFiltersPanel,
  RecruiterRankingsList,
  RecruiterRankingsMobileTopButtons,
  RecruiterRankingsPreview,
  type RankingsPaginationState,
} from "./RecruiterRankingsSections";

interface RecruiterRankingsMobileViewProps {
  catalog: RecruiterFiltersCatalog;
  items: RecruiterRankingItem[];
  topThree: RecruiterRankingItem[];
  selectedItem: RecruiterRankingItem | null;
  selectedVideoId: string;
  playableUrl: string;
  pendingVotes?: Record<string, -1 | 0 | 1 | null | undefined>;
  pagination: RankingsPaginationState;
  query: RecruiterRankingsQuery;
  isFiltersOpen: boolean;
  onSelectVideo: (videoId: string) => void;
  onVote: (videoId: string, value: -1 | 0 | 1) => void;
  onPageChange: (page: number) => void;
  onQueryChange: (
    updater: (current: RecruiterRankingsQuery) => RecruiterRankingsQuery,
  ) => void;
  onOpenFilters: () => void;
  onCloseFilters: () => void;
  onOpenRecruiterView: (videoId: string) => void;
  onOpenProfile: (videoId: string) => void;
}

const RecruiterRankingsMobileView: React.FC<
  RecruiterRankingsMobileViewProps
> = ({
  catalog,
  items,
  topThree,
  selectedItem,
  selectedVideoId,
  playableUrl,
  pendingVotes = {},
  pagination,
  query,
  isFiltersOpen,
  onSelectVideo,
  onVote,
  onPageChange,
  onQueryChange,
  onOpenFilters,
  onCloseFilters,
  onOpenRecruiterView,
  onOpenProfile,
}) => {
  const handleSelectFromList = (videoId: string) => {
    onSelectVideo(videoId);

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
  <div className="recruiters-board-mobile">
    <div className="recruiters-board-mobile__toolbar">
      <button
        type="button"
        className="recruiters-board-mobile__toolbar-button"
        onClick={onOpenFilters}
      >
        <FaFilter aria-hidden="true" />
        <span>Filtros</span>
      </button>
      <a
        href="#mobile-ranking-list"
        className="recruiters-board-mobile__toolbar-button recruiters-board-mobile__toolbar-button--ghost"
      >
        <FaListUl aria-hidden="true" />
        <span>Ranking</span>
      </a>
    </div>

    <section className="recruiters-board-mobile__summary">
      <article>
        <span>Publicados</span>
        <strong>{pagination.total}</strong>
      </article>
      <article>
        <span>Página</span>
        <strong>
          {pagination.page}/{pagination.totalPages}
        </strong>
      </article>
      <article>
        <span>Filtros</span>
        <strong>
          {
            Object.values(query).filter(
              (value) =>
                value !== undefined &&
                value !== null &&
                !(typeof value === "string" && value.trim() === ""),
            ).length
          }
        </strong>
      </article>
    </section>

    <RecruiterRankingsMobileTopButtons
      topThree={topThree}
      selectedVideoId={selectedVideoId}
      onSelectVideo={onSelectVideo}
    />

    <section className="recruiters-board-mobile__spotlight recruiters-dashboard__table">
      <div className="recruiters-dashboard__table-header recruiters-dashboard__table-header--stack">
        <h3>Video destacado</h3>
        <span>El video es el centro de la experiencia en móvil.</span>
      </div>
      <RecruiterRankingsPreview
        selectedItem={selectedItem}
        selectedVideoId={selectedVideoId}
        playableUrl={playableUrl}
        pendingVote={selectedItem ? pendingVotes[selectedItem.video._id] ?? null : null}
        onVote={onVote}
        onOpenRecruiterView={onOpenRecruiterView}
        onOpenProfile={onOpenProfile}
        mobile
      />
    </section>

    <section
      id="mobile-ranking-list"
      className="recruiters-board-mobile__list recruiters-dashboard__table"
    >
      <div className="recruiters-dashboard__table-header recruiters-dashboard__table-header--stack">
        <h3>Clips del ranking</h3>
        <span>Toca cualquier video para moverlo al centro.</span>
      </div>
      <RecruiterRankingsList
        items={items}
        selectedVideoId={selectedVideoId}
        pagination={pagination}
        onSelectVideo={handleSelectFromList}
        onVote={onVote}
        pendingVotes={pendingVotes}
        onPageChange={onPageChange}
        compact
      />
    </section>

    {isFiltersOpen ? (
      <div className="recruiters-board-mobile__sheet">
        <button
          type="button"
          className="recruiters-board-mobile__sheet-backdrop"
          onClick={onCloseFilters}
          aria-label="Cerrar filtros"
        />
        <section className="recruiters-board-mobile__sheet-panel recruiters-dashboard__table">
          <div className="recruiters-dashboard__table-header recruiters-dashboard__table-header--stack">
            <h3>Filtros del ranking</h3>
            <span>Encuentra rápido los goles, jugadas y perfiles que quieres ver.</span>
          </div>
          <RecruiterRankingsFiltersPanel
            catalog={catalog}
            query={query}
            onQueryChange={onQueryChange}
          />
          <div className="scouting-form__actions">
            <button type="button" onClick={onCloseFilters}>
              Aplicar y cerrar
            </button>
          </div>
        </section>
      </div>
    ) : null}
  </div>
  );
};

export default RecruiterRankingsMobileView;
