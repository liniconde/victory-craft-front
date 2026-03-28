import React, { useEffect, useRef, useState } from "react";
import { FaFilter, FaListUl } from "react-icons/fa";
import type {
  RecruiterFiltersCatalog,
  RecruiterRankingItem,
  RecruiterRankingsQuery,
} from "../../../features/recruiters/types";
import RecruitersWorkspaceButton from "../../../components/RecruitersWorkspaceButton";
import {
  RecruiterRankingsFiltersPanel,
  RecruiterRankingsMobileTopButtons,
} from "./RecruiterRankingsSections";
import RecruiterRankingsInteractiveVideoCard from "./RecruiterRankingsInteractiveVideoCard";

interface RecruiterRankingsInteractiveMobileViewProps {
  catalog: RecruiterFiltersCatalog;
  items: RecruiterRankingItem[];
  topThree: RecruiterRankingItem[];
  totalItems: number;
  query: RecruiterRankingsQuery;
  isFiltersOpen: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  pendingVotes?: Record<string, -1 | 0 | 1 | null | undefined>;
  getPlayableUrlForVideo: (videoId: string, item: RecruiterRankingItem) => string;
  onSelectVideo: (videoId: string) => void;
  onVote: (videoId: string, value: -1 | 0 | 1) => void;
  onQueryChange: (
    updater: (current: RecruiterRankingsQuery) => RecruiterRankingsQuery,
  ) => void;
  onOpenFilters: () => void;
  onCloseFilters: () => void;
  onLoadMore: () => void;
  onExitInteractiveMode: () => void;
}

const RecruiterRankingsInteractiveMobileView: React.FC<
  RecruiterRankingsInteractiveMobileViewProps
> = ({
  catalog,
  items,
  topThree,
  totalItems,
  query,
  isFiltersOpen,
  isLoadingMore,
  hasMore,
  pendingVotes = {},
  getPlayableUrlForVideo,
  onSelectVideo,
  onVote,
  onQueryChange,
  onOpenFilters,
  onCloseFilters,
  onLoadMore,
  onExitInteractiveMode,
}) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeVideoId, setActiveVideoId] = useState("");

  const scrollToVideoCard = (videoId: string) => {
    const card = cardRefs.current[videoId];
    if (!card || typeof window === "undefined") {
      onSelectVideo(videoId);
      return;
    }

    setActiveVideoId(videoId);
    onSelectVideo(videoId);

    const rect = card.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const targetTop =
      rect.top + scrollTop - window.innerHeight / 2 + rect.height / 2;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !isLoadingMore) {
          onLoadMore();
        }
      },
      { rootMargin: "420px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    setActiveVideoId((current) => {
      if (current && items.some((item) => item.video._id === current)) {
        return current;
      }

      return items[0]?.video._id || "";
    });
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frameId = 0;

    const pickCenteredVideo = () => {
      const viewportCenter = window.innerHeight / 2;
      let nextActiveVideoId = "";
      let bestDistance = Number.POSITIVE_INFINITY;

      items.forEach((item) => {
        const card = cardRefs.current[item.video._id];
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!isVisible) return;

        const cardCenter = rect.top + rect.height / 2;
        const distanceToCenter = Math.abs(cardCenter - viewportCenter);

        if (distanceToCenter < bestDistance) {
          bestDistance = distanceToCenter;
          nextActiveVideoId = item.video._id;
        }
      });

      setActiveVideoId((current) => nextActiveVideoId || current);
    };

    const schedulePickCenteredVideo = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        pickCenteredVideo();
      });
    };

    schedulePickCenteredVideo();
    window.addEventListener("scroll", schedulePickCenteredVideo, { passive: true });
    window.addEventListener("resize", schedulePickCenteredVideo);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", schedulePickCenteredVideo);
      window.removeEventListener("resize", schedulePickCenteredVideo);
    };
  }, [items]);

  return (
    <div className="recruiters-board-mobile recruiters-board-mobile--interactive">
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
          href="#mobile-interactive-feed"
          className="recruiters-board-mobile__toolbar-button recruiters-board-mobile__toolbar-button--ghost"
        >
          <FaListUl aria-hidden="true" />
          <span>Feed</span>
        </a>
      </div>

      <section className="recruiters-board-mobile__summary">
        <article>
          <span>Clips</span>
          <strong>{totalItems}</strong>
        </article>
        <article>
          <span>Cargados</span>
          <strong>{items.length}</strong>
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
        selectedVideoId={activeVideoId}
        onSelectVideo={scrollToVideoCard}
      />

      <section
        id="mobile-interactive-feed"
        className="recruiters-board-mobile__interactive-feed recruiters-dashboard__table"
      >
        <div className="recruiters-dashboard__table-header recruiters-dashboard__table-header--stack">
          <h3>Modo interactivo</h3>
          <span>Scroll continuo con autoplay solo en el clip visible.</span>
        </div>

        <div className="recruiters-board-mobile__interactive-list">
          {items.map((item) => (
            <div
              key={item.video._id}
              ref={(node) => {
                cardRefs.current[item.video._id] = node;
              }}
            >
              <RecruiterRankingsInteractiveVideoCard
                item={item}
                playableUrl={getPlayableUrlForVideo(item.video._id, item)}
                isActive={activeVideoId === item.video._id}
                playbackState={activeVideoId === item.video._id}
                pendingVote={pendingVotes[item.video._id] ?? null}
                onVote={onVote}
                onSelect={scrollToVideoCard}
              />
            </div>
          ))}

          <div ref={sentinelRef} className="recruiters-board-mobile__interactive-sentinel" />

          {isLoadingMore ? (
            <p className="recruiters-board-mobile__interactive-status">
              Cargando 10 clips más...
            </p>
          ) : null}

          {!hasMore && items.length > 0 ? (
            <p className="recruiters-board-mobile__interactive-status">
              Llegaste al final del ranking interactivo.
            </p>
          ) : null}
        </div>
      </section>

      <RecruitersWorkspaceButton
        className="recruiters-board-mobile__interactive-exit"
        variant="gold"
        caption="volver a la vista editorial"
        onClick={onExitInteractiveMode}
      >
        Volver al ranking
      </RecruitersWorkspaceButton>

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
              <span>Ajusta el feed sin salir del modo interactivo.</span>
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

export default RecruiterRankingsInteractiveMobileView;
