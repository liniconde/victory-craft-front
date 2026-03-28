import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
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
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import RecruitersWorkspaceButton from "../../../components/RecruitersWorkspaceButton";
import RecruiterRankingsMobileView from "../components/RecruiterRankingsMobileView";
import "./RecruiterRankingsPage.desktop.css";
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

const RecruiterRankingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    api: { getFiltersCatalog, getRankings, getVideoPlayback, voteVideo },
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
  const [playbackByVideoId, setPlaybackByVideoId] = useState<Record<string, string>>({});
  const playbackByVideoIdRef = useRef<Record<string, string>>({});
  const [pendingVotes, setPendingVotes] = useState<
    Record<string, -1 | 0 | 1 | null | undefined>
  >({});
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

  const selectedVideoIdValue = selectedItem?.video._id || "";
  const fallbackPlayableUrl = getPlayableUrl(selectedItem);
  const playableUrl =
    (selectedVideoIdValue ? playbackByVideoId[selectedVideoIdValue] : "") || fallbackPlayableUrl;
  const topThree = items.slice(0, 3);

  useEffect(() => {
    playbackByVideoIdRef.current = playbackByVideoId;
  }, [playbackByVideoId]);

  const ensurePlayback = useCallback(
    async (video: RecruiterRankingItem["video"] | undefined, forceRefresh = false) => {
      const videoId = video?._id || "";
      if (!videoId) return "";

      const currentUrl =
        (!forceRefresh && playbackByVideoIdRef.current[videoId]) ||
        (!forceRefresh && getCachedRecruiterPlaybackUrl(videoId)) ||
        "";
      if (currentUrl) {
        if (!playbackByVideoIdRef.current[videoId]) {
          setPlaybackByVideoId((current) =>
            current[videoId] ? current : { ...current, [videoId]: currentUrl }
          );
        }
        return currentUrl;
      }

      const preferredUrl = !forceRefresh ? getPlayableUrl({ video } as RecruiterRankingItem) : "";
      if (preferredUrl) {
        cacheRecruiterPlaybackUrl(videoId, preferredUrl);
        setPlaybackByVideoId((current) =>
          current[videoId] === preferredUrl ? current : { ...current, [videoId]: preferredUrl }
        );
        return preferredUrl;
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

      if (response.rankingItem?.video) {
        void ensurePlayback(response.rankingItem.video);
      }
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
  }, [ensurePlayback, feedback, query.sortBy, voteVideo]);

  const updateQuery = useCallback((
    updater: (current: RecruiterRankingsQuery) => RecruiterRankingsQuery,
  ) => {
    setQuery((current) => updater(current));
  }, []);

  const changePage = useCallback((page: number) => {
    setQuery((current) => ({
      ...current,
      page,
    }));
  }, []);

  useEffect(() => {
    if (!selectedItem?.video) return;

    void ensurePlayback(selectedItem.video);
  }, [ensurePlayback, selectedItem]);

  useEffect(() => {
    if (!items.length) return;

    const selectedIndex = items.findIndex(
      (item) => item.video._id === selectedVideoId,
    );
    const startIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const warmUp = () => {
      items
        .slice(startIndex, startIndex + VIDEO_PRELOAD_COUNT)
        .forEach((item) => {
          const cachedUrl =
            playbackByVideoIdRef.current[item.video._id] ||
            getCachedRecruiterPlaybackUrl(item.video._id) ||
            getPlayableUrl(item);

          if (cachedUrl) {
            warmRankingVideo(cachedUrl);
            return;
          }

          void getVideoPlayback(item.video._id)
            .then((response) => {
              setPlaybackByVideoId((current) =>
                current[item.video._id] === response.playbackUrl
                  ? current
                  : { ...current, [item.video._id]: response.playbackUrl }
              );
              warmRankingVideo(response.playbackUrl);
            })
            .catch(() => undefined);
        });
    };

    const idleId = requestIdle(warmUp);
    return () => cancelIdle(idleId);
  }, [getVideoPlayback, items, selectedVideoId]);

  return (
    <section className="recruiters-dashboard recruiters-board recruiters-board-v2">
      <header className="recruiters-dashboard__hero">
        <div>
          <p className="recruiters-dashboard__eyebrow">Performance Library</p>
          <h2 className="recruiters-board-v2__hero-title">Elite weekly rankings</h2>
          <p>
            Una lectura más unificada del board para revisar footage, detectar momentum
            competitivo y decidir qué clips suben con fuego, bajan con hielo o quedan neutrales.
          </p>
        </div>
        <div className="recruiters-dashboard__stats">
          <strong>{pagination.total}</strong>
          <span>live feed clips</span>
        </div>
      </header>

      <div className="recruiters-board--desktop">
        <RecruiterRankingsPodium
          topThree={topThree}
          selectedVideoId={selectedItem?.video._id || ""}
          onSelectVideo={setSelectedVideoId}
        />

        <div className="recruiters-board__layout">
          <aside className="recruiters-board__filters recruiters-dashboard__table">
            <RecruiterRankingsFiltersPanel
              catalog={catalog}
              query={query}
              onQueryChange={updateQuery}
            />
          </aside>

          <aside className="recruiters-board__preview recruiters-dashboard__table">
            <RecruiterRankingsPreview
              selectedItem={selectedItem}
              selectedVideoId={selectedVideoId}
              playableUrl={playableUrl}
              pendingVote={selectedItem ? pendingVotes[selectedItem.video._id] ?? null : null}
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
              <div>
                <h3>Leaderboard extended</h3>
                <span>
                  Updated live · page {pagination.page}
                </span>
              </div>
              <RecruitersWorkspaceButton
                className="recruiters-board__interactive-link"
                onClick={() => navigate("/scouting/subpages/rankings/interactive")}
                icon={<FiArrowRight aria-hidden="true" />}
                caption="feed continuo + filtros fijos"
              >
                Modo interactivo
              </RecruitersWorkspaceButton>
            </div>

            <RecruiterRankingsList
              items={items}
              selectedVideoId={selectedItem?.video._id || ""}
              pagination={pagination}
              onSelectVideo={setSelectedVideoId}
              onVote={updateVote}
              pendingVotes={pendingVotes}
              onPageChange={changePage}
            />
          </section>
        </div>
      </div>

      <section className="recruiters-board__summary recruiters-board-v2__summary">
        <article>
          <span>Feed Mode</span>
          <strong>Weekly ranking</strong>
        </article>
        <article>
          <span>Board Page</span>
          <strong>
            {pagination.page}/{pagination.totalPages}
          </strong>
        </article>
        <article>
          <span>Live Filters</span>
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

      <RecruiterRankingsMobileView
        catalog={catalog}
        items={items}
        topThree={topThree}
        selectedItem={selectedItem}
        selectedVideoId={selectedItem?.video._id || ""}
        playableUrl={playableUrl}
        pendingVotes={pendingVotes}
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
