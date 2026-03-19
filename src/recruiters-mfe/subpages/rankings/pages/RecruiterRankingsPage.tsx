import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  RecruiterFiltersCatalog,
  RecruiterRankingItem,
  RecruiterRankingsQuery,
} from "../../../features/recruiters/types";
import { sanitizeRecruiterSportTypes } from "../../../features/recruiters/sportTypes";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import RecruiterRankingsMobileView from "../components/RecruiterRankingsMobileView";
import {
  RecruiterRankingsFiltersPanel,
  RecruiterRankingsList,
  RecruiterRankingsPodium,
  RecruiterRankingsPreview,
  getPlayableUrl,
  type RankingsPaginationState,
} from "../components/RecruiterRankingsSections";

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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState<RankingsPaginationState>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 12,
  });

  useEffect(() => {
    trackTask(
      getFiltersCatalog(),
      "Los sticks están afinando los filtros del ranking.",
    )
      .then((response) =>
        setCatalog({
          ...response,
          sportTypes: sanitizeRecruiterSportTypes(response.sportTypes),
        }),
      )
      .catch((error) => {
        feedback.showError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el catálogo.",
        );
      });
  }, [feedback, getFiltersCatalog, trackTask]);

  useEffect(() => {
    trackTask(
      getRankings(query),
      "Los sticks están reordenando el ranking mientras llegan los clips.",
    )
      .then((response) => {
        setItems(response.items);
        setPagination(response.pagination);
        setSelectedVideoId((current) => {
          if (response.items.some((item) => item.video._id === current)) {
            return current;
          }

          return response.items[0]?.video._id ?? "";
        });
      })
      .catch((error) => {
        feedback.showError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el ranking.",
        );
      });
  }, [feedback, getRankings, query, trackTask]);

  const selectedItem = useMemo(
    () =>
      items.find((item) => item.video._id === selectedVideoId) ??
      items[0] ??
      null,
    [items, selectedVideoId],
  );

  const playableUrl = getPlayableUrl(selectedItem);
  const topThree = items.slice(0, 3);

  const updateVote = async (videoId: string, value: -1 | 0 | 1) => {
    try {
      await voteVideo(videoId, value);
      const response = await getRankings(query);
      setItems(response.items);
      setPagination(response.pagination);
      setSelectedVideoId(videoId);
    } catch (error) {
      feedback.showError(
        error instanceof Error ? error.message : "No se pudo votar.",
      );
    }
  };

  const updateQuery = (
    updater: (current: RecruiterRankingsQuery) => RecruiterRankingsQuery,
  ) => {
    setQuery((current) => updater(current));
  };

  const changePage = (page: number) => {
    setQuery((current) => ({
      ...current,
      page,
    }));
  };

  useEffect(() => {
    if (!items.length) return;

    const selectedIndex = items.findIndex(
      (item) => item.video._id === selectedVideoId,
    );
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
          <p>
            Descubre tus mejores jugadas, compite con otros jugadores y haz que
            tus clips destaquen en el scouting ranking.
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
                  !(typeof value === "string" && value.trim() === ""),
              ).length
            }
          </strong>
        </article>
      </section>

      <div className="recruiters-board--desktop">
        <RecruiterRankingsPodium
          topThree={topThree}
          selectedVideoId={selectedItem?.video._id || ""}
          onSelectVideo={setSelectedVideoId}
        />

        <div className="recruiters-board__layout">
          <aside className="recruiters-board__filters recruiters-dashboard__table">
            <div className="recruiters-dashboard__table-header recruiters-dashboard__table-header--stack">
              <h3>Filtros</h3>
              <span>Refina el board sin salir de scouting</span>
            </div>

            <RecruiterRankingsFiltersPanel
              catalog={catalog}
              query={query}
              onQueryChange={updateQuery}
            />
          </aside>

          <aside className="recruiters-board__preview recruiters-dashboard__table">
            <div className="recruiters-dashboard__table-header recruiters-dashboard__table-header--stack">
              <h3>Preview</h3>
            </div>

            <RecruiterRankingsPreview
              selectedItem={selectedItem}
              selectedVideoId={selectedVideoId}
              playableUrl={playableUrl}
              onVote={updateVote}
              onOpenRecruiterView={(videoId) =>
                navigate(`/scouting/subpages/video/${videoId}`)
              }
              onOpenProfile={(videoId) =>
                navigate(`/scouting/subpages/profile/${videoId}`)
              }
            />
          </aside>

          <section className="recruiters-board__list recruiters-dashboard__table">
            <div className="recruiters-dashboard__table-header">
              <h3>Ranking editorial</h3>
              <span>
                Página {pagination.page} de {pagination.totalPages}
              </span>
            </div>

            <RecruiterRankingsList
              items={items}
              selectedVideoId={selectedItem?.video._id || ""}
              pagination={pagination}
              onSelectVideo={setSelectedVideoId}
              onVote={updateVote}
              onPageChange={changePage}
            />
          </section>
        </div>
      </div>

      <RecruiterRankingsMobileView
        catalog={catalog}
        items={items}
        topThree={topThree}
        selectedItem={selectedItem}
        selectedVideoId={selectedItem?.video._id || ""}
        playableUrl={playableUrl}
        pagination={pagination}
        query={query}
        isFiltersOpen={isMobileFiltersOpen}
        onSelectVideo={setSelectedVideoId}
        onVote={updateVote}
        onPageChange={changePage}
        onQueryChange={updateQuery}
        onOpenFilters={() => setIsMobileFiltersOpen(true)}
        onCloseFilters={() => setIsMobileFiltersOpen(false)}
        onOpenRecruiterView={(videoId) =>
          navigate(`/scouting/subpages/video/${videoId}`)
        }
        onOpenProfile={(videoId) =>
          navigate(`/scouting/subpages/profile/${videoId}`)
        }
      />
    </section>
  );
};

export default RecruiterRankingsPage;
