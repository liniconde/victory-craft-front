import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import type {
  RecruiterFiltersCatalog,
  RecruiterRankingItem,
  RecruiterRankingsQuery,
} from "../../../features/recruiters/types";
import { sanitizeRecruiterSportTypes } from "../../../features/recruiters/sportTypes";
import {
  cacheRecruiterPlaybackUrl,
  getCachedRecruiterPlaybackUrl,
} from "../../../features/recruiters/api/client";
import useAppViewport from "../../../../hooks/useAppViewport";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import RecruitersWorkspaceButton from "../../../components/RecruitersWorkspaceButton";
import {
  RecruiterRankingsFiltersPanel,
  RecruiterRankingsPodium,
  getPlayableUrl,
} from "../components/RecruiterRankingsSections";
import RecruiterRankingsInteractiveVideoCard from "../components/RecruiterRankingsInteractiveVideoCard";
import RecruiterRankingsInteractiveMobileView from "../components/RecruiterRankingsInteractiveMobileView";
import "./RecruiterRankingsPage.desktop.css";
import "./RecruiterRankingsInteractivePage.css";

const PAGE_SIZE = 10;

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

const sortRankingItems = (
  items: RecruiterRankingItem[],
  sortBy: RecruiterRankingsQuery["sortBy"]
) => {
  const getRecentTimestamp = (item: RecruiterRankingItem) =>
    Date.parse(item.video.createdAt || item.video.uploadedAt || "") || 0;

  const sorted = [...items];
  sorted.sort((left, right) => {
    if (sortBy === "recent") {
      return getRecentTimestamp(right) - getRecentTimestamp(left);
    }

    if (sortBy === "upvotes") {
      return (
        right.ranking.upvotes - left.ranking.upvotes ||
        right.ranking.score - left.ranking.score ||
        getRecentTimestamp(right) - getRecentTimestamp(left)
      );
    }

    return (
      right.ranking.score - left.ranking.score ||
      getRecentTimestamp(right) - getRecentTimestamp(left)
    );
  });

  return sorted;
};

const RecruiterRankingsInteractivePage: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile: isMobileView } = useAppViewport({ mobileBreakpoint: 880 });
  const {
    api: { getFiltersCatalog, getRankings, getVideoPlayback, voteVideo },
    feedback,
    loading: { trackTask },
  } = useRecruitersModule();

  const [catalog, setCatalog] = useState<RecruiterFiltersCatalog>(emptyCatalog);
  const [query, setQuery] = useState<RecruiterRankingsQuery>({
    sortBy: "score",
    page: 1,
    limit: PAGE_SIZE,
  });
  const [items, setItems] = useState<RecruiterRankingItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [playbackByVideoId, setPlaybackByVideoId] = useState<Record<string, string>>({});
  const [pendingVotes, setPendingVotes] = useState<
    Record<string, -1 | 0 | 1 | null | undefined>
  >({});

  const playbackByVideoIdRef = useRef<Record<string, string>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const loadingMoreRef = useRef(false);
  const pageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = pageRef.current?.closest(".recruiters-content");
    const layout = pageRef.current?.closest(".recruiters-layout");
    const pageContainer = pageRef.current?.closest(".page-container");
    if (!isMobileView) {
      if (container instanceof HTMLElement) {
        container.classList.add("recruiters-content--interactive-ranking");
      }
      if (layout instanceof HTMLElement) {
        layout.classList.add("recruiters-layout--interactive-ranking");
      }
      if (pageContainer instanceof HTMLElement) {
        pageContainer.classList.add("page-container--interactive-ranking");
      }
    }

    return () => {
      if (container instanceof HTMLElement) {
        container.classList.remove("recruiters-content--interactive-ranking");
      }
      if (layout instanceof HTMLElement) {
        layout.classList.remove("recruiters-layout--interactive-ranking");
      }
      if (pageContainer instanceof HTMLElement) {
        pageContainer.classList.remove("page-container--interactive-ranking");
      }
    };
  }, [isMobileView]);

  useEffect(() => {
    playbackByVideoIdRef.current = playbackByVideoId;
  }, [playbackByVideoId]);

  useEffect(() => {
    loadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  useEffect(() => {
    trackTask(
      getFiltersCatalog(),
      "Los sticks están afinando los filtros del ranking interactivo.",
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

  const ensurePlayback = useCallback(
    async (video: RecruiterRankingItem["video"] | undefined, forceRefresh = false) => {
      const videoId = video?._id || "";
      if (!videoId) return "";

      const cached =
        (!forceRefresh && playbackByVideoIdRef.current[videoId]) ||
        (!forceRefresh && getCachedRecruiterPlaybackUrl(videoId)) ||
        "";
      if (cached) {
        if (!playbackByVideoIdRef.current[videoId]) {
          setPlaybackByVideoId((current) =>
            current[videoId] ? current : { ...current, [videoId]: cached }
          );
        }
        return cached;
      }

      const preferred = !forceRefresh ? getPlayableUrl({ video } as RecruiterRankingItem) : "";
      if (preferred) {
        cacheRecruiterPlaybackUrl(videoId, preferred);
        setPlaybackByVideoId((current) =>
          current[videoId] === preferred ? current : { ...current, [videoId]: preferred }
        );
        return preferred;
      }

      const response = await getVideoPlayback(videoId);
      setPlaybackByVideoId((current) =>
        current[videoId] === response.playbackUrl
          ? current
          : { ...current, [videoId]: response.playbackUrl }
      );
      return response.playbackUrl;
    },
    [getVideoPlayback]
  );

  const loadPage = useCallback(
    async (page: number, mode: "replace" | "append") => {
      if (mode === "append") {
        setIsLoadingMore(true);
      }

      try {
        const response =
          mode === "replace"
            ? await trackTask(
                getRankings({ ...query, page, limit: PAGE_SIZE }),
                "Los sticks están preparando el modo interactivo.",
              )
            : await getRankings({ ...query, page, limit: PAGE_SIZE });

        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);
        setCurrentPage(response.pagination.page);
        setItems((current) => {
          if (mode === "replace") {
            return response.items;
          }

          const existingIds = new Set(current.map((item) => item.video._id));
          const merged = [...current];
          response.items.forEach((item) => {
            if (!existingIds.has(item.video._id)) {
              merged.push(item);
            }
          });
          return merged;
        });
        setSelectedVideoId((current) => current || response.items[0]?.video._id || "");
      } catch (error) {
        feedback.showError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el ranking interactivo.",
        );
      } finally {
        setIsLoadingMore(false);
      }
    },
    [feedback, getRankings, query, trackTask]
  );

  useEffect(() => {
    setItems([]);
    setCurrentPage(1);
    setTotalPages(1);
    setSelectedVideoId("");
    void loadPage(1, "replace");
  }, [loadPage]);

  useEffect(() => {
    items.slice(0, Math.min(items.length, currentPage * PAGE_SIZE)).forEach((item) => {
      if (
        playbackByVideoIdRef.current[item.video._id] ||
        getCachedRecruiterPlaybackUrl(item.video._id) ||
        getPlayableUrl(item)
      ) {
        return;
      }

      void ensurePlayback(item.video).catch(() => undefined);
    });
  }, [currentPage, ensurePlayback, items]);

  const loadNextPage = useCallback(() => {
    if (loadingMoreRef.current || currentPage >= totalPages) return;
    void loadPage(currentPage + 1, "append");
  }, [currentPage, loadPage, totalPages]);

  useEffect(() => {
    if (isMobileView) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextPage();
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isMobileView, loadNextPage]);

  const updateVote = useCallback(async (videoId: string, value: -1 | 0 | 1) => {
    try {
      setPendingVotes((current) => ({ ...current, [videoId]: value }));
      const response = await voteVideo(videoId, value);
      setItems((current) =>
        sortRankingItems(
          current.map((item) =>
            item.video._id === videoId
              ? response.rankingItem
                ? response.rankingItem
                : {
                    ...item,
                    ranking: {
                      score: response.summary.score,
                      upvotes: response.summary.upvotes,
                      downvotes: response.summary.downvotes,
                      netVotes: response.summary.netVotes,
                    },
                    myVote: response.summary.myVote ?? null,
                  }
              : item
          ),
          query.sortBy ?? "score"
        )
      );
      setSelectedVideoId(videoId);
    } catch (error) {
      feedback.showError(
        error instanceof Error ? error.message : "No se pudo votar.",
      );
    } finally {
      setPendingVotes((current) => {
        const next = { ...current };
        delete next[videoId];
        return next;
      });
    }
  }, [feedback, query.sortBy, voteVideo]);

  const updateQuery = useCallback((
    updater: (current: RecruiterRankingsQuery) => RecruiterRankingsQuery,
  ) => {
    setQuery((current) => ({
      ...updater(current),
      page: 1,
      limit: PAGE_SIZE,
    }));
  }, []);

  const topThree = useMemo(() => items.slice(0, 3), [items]);

  const handleSelectVideo = useCallback((videoId: string) => {
    setSelectedVideoId(videoId);
    itemRefs.current[videoId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  return (
    <section
      ref={pageRef}
      className="recruiters-dashboard recruiters-board recruiters-board-v2 recruiters-board-interactive"
    >
      {isMobileView ? (
        <RecruiterRankingsInteractiveMobileView
          catalog={catalog}
          items={items}
          topThree={topThree}
          totalItems={totalItems}
          query={query}
          isFiltersOpen={isMobileFiltersOpen}
          isLoadingMore={isLoadingMore}
          hasMore={currentPage < totalPages}
          pendingVotes={pendingVotes}
          getPlayableUrlForVideo={(videoId, item) =>
            playbackByVideoId[videoId] ||
            getCachedRecruiterPlaybackUrl(videoId) ||
            getPlayableUrl(item)
          }
          onSelectVideo={setSelectedVideoId}
          onVote={updateVote}
          onQueryChange={updateQuery}
          onOpenFilters={() => setIsMobileFiltersOpen(true)}
          onCloseFilters={() => setIsMobileFiltersOpen(false)}
          onLoadMore={loadNextPage}
          onExitInteractiveMode={() => navigate("/scouting/subpages/rankings")}
        />
      ) : null}

      {!isMobileView ? (
      <div className="recruiters-board-interactive__layout">
        <div className="recruiters-board-interactive__main">
          <div className="recruiters-board-interactive__podium-shell recruiters-dashboard__table">
            <RecruiterRankingsPodium
              topThree={topThree}
              selectedVideoId={selectedVideoId}
              onSelectVideo={handleSelectVideo}
            />
          </div>

          <section className="recruiters-board-interactive__feed recruiters-dashboard__table">
            <div className="recruiters-board-interactive__feed-list">
              {items.map((item) => (
                <div
                  key={item.video._id}
                  ref={(node) => {
                    itemRefs.current[item.video._id] = node;
                  }}
                >
                  <RecruiterRankingsInteractiveVideoCard
                    item={item}
                    playableUrl={
                      playbackByVideoId[item.video._id] ||
                      getCachedRecruiterPlaybackUrl(item.video._id) ||
                      getPlayableUrl(item)
                    }
                    isActive={selectedVideoId === item.video._id}
                    pendingVote={pendingVotes[item.video._id] ?? null}
                    onVote={updateVote}
                    onSelect={setSelectedVideoId}
                  />
                </div>
              ))}

              <div ref={sentinelRef} className="recruiters-board-interactive__sentinel" />

              {isLoadingMore ? (
                <p className="recruiters-board-interactive__status">Cargando 10 clips más...</p>
              ) : null}

              {!isLoadingMore && currentPage >= totalPages ? (
                <p className="recruiters-board-interactive__status">
                  Llegaste al final del ranking interactivo.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="recruiters-board-interactive__sidebar recruiters-dashboard__table">
          <div className="recruiters-dashboard__table-header recruiters-board-interactive__sidebar-header">
            <div>
              <h3>Filtros</h3>
            </div>
          </div>

          <RecruiterRankingsFiltersPanel
            catalog={catalog}
            query={query}
            onQueryChange={updateQuery}
          />

          <div className="recruiters-dashboard__stats recruiters-board-interactive__sidebar-stats">
            <strong>{totalItems}</strong>
            <span>ranked clips</span>
          </div>

          <RecruitersWorkspaceButton
            className="recruiters-board-interactive__back-button"
            variant="gold"
            icon={<FiArrowLeft aria-hidden="true" />}
            caption="volver a la vista editorial"
            onClick={() => navigate("/scouting/subpages/rankings")}
          >
            Volver al ranking
          </RecruitersWorkspaceButton>
        </aside>
      </div>
      ) : null}
    </section>
  );
};

export default RecruiterRankingsInteractivePage;
