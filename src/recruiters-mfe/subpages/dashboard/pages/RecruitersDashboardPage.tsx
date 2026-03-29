import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiFolder,
  FiPlayCircle,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import type { RecruiterRankingItem } from "../../../features/recruiters/types";
import RecruitersWorkspaceButton from "../../../components/RecruitersWorkspaceButton";
import RecruitersVideoPlayer from "../../../components/RecruitersVideoPlayer";
import {
  cacheRecruiterPlaybackUrl,
  getCachedRecruiterPlaybackUrl,
} from "../../../features/recruiters/api/client";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import "./RecruitersDashboardPage.v2.css";

const RecruitersDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    api: { getTopRankings, getVideoPlayback, prefetchRecruiterView },
    feedback,
  } = useRecruitersModule();
  const [topVideo, setTopVideo] = useState<RecruiterRankingItem | null>(null);
  const [topVideos, setTopVideos] = useState<RecruiterRankingItem[]>([]);
  const [isTopVideoLoading, setIsTopVideoLoading] = useState(true);
  const [isTopListLoading, setIsTopListLoading] = useState(true);
  const [topVideoPlaybackUrl, setTopVideoPlaybackUrl] = useState("");

  const getPlayableUrl = (item?: RecruiterRankingItem | null) =>
    item?.video.playbackUrl || item?.video.videoUrl || "";

  useEffect(() => {
    setIsTopVideoLoading(true);
    getTopRankings({ limit: 1 })
      .then((items) => {
        setTopVideo(items[0] ?? null);
      })
      .catch((error) => {
        feedback.showError(
          error instanceof Error ? error.message : "No se pudo cargar el top 1 del dashboard."
        );
      })
      .finally(() => setIsTopVideoLoading(false));
  }, [feedback, getTopRankings]);

  useEffect(() => {
    setIsTopListLoading(true);
    getTopRankings({ limit: 5 })
      .then(setTopVideos)
      .catch((error) => {
        feedback.showError(error instanceof Error ? error.message : "No se pudo cargar el dashboard.");
      })
      .finally(() => setIsTopListLoading(false));
  }, [feedback, getTopRankings]);

  useEffect(() => {
    if (!topVideo?.video._id) return;
    void prefetchRecruiterView(topVideo.video._id);
  }, [prefetchRecruiterView, topVideo?.video._id]);

  useEffect(() => {
    let isCancelled = false;

    const resolveTopVideoPlayback = async () => {
      if (!topVideo?.video?._id) {
        setTopVideoPlaybackUrl("");
        return;
      }

      const videoId = topVideo.video._id;
      const cachedUrl = getCachedRecruiterPlaybackUrl(videoId);
      const preferredUrl = getPlayableUrl(topVideo);

      if (cachedUrl) {
        setTopVideoPlaybackUrl(cachedUrl);
        return;
      }

      if (preferredUrl) {
        cacheRecruiterPlaybackUrl(videoId, preferredUrl);
        setTopVideoPlaybackUrl(preferredUrl);
        return;
      }

      try {
        const response = await getVideoPlayback(videoId);
        if (!isCancelled) {
          setTopVideoPlaybackUrl(response.playbackUrl);
        }
      } catch {
        if (!isCancelled) {
          setTopVideoPlaybackUrl("");
        }
      }
    };

    void resolveTopVideoPlayback();

    return () => {
      isCancelled = true;
    };
  }, [getVideoPlayback, topVideo]);

  const publishedCount = topVideos.filter(
    (item) => item.scoutingProfile?.publicationStatus === "published"
  ).length;
  const totalNetVotes = topVideos.reduce((acc, item) => acc + (item.ranking.netVotes || 0), 0);
  const trendStatus = publishedCount > 0 ? "Active" : "Standby";
  const trendPercent = Math.max(
    18,
    Math.min(100, topVideos.length > 0 ? Math.round((publishedCount / topVideos.length) * 100) : 24)
  );

  const quickLinks = [
    {
      title: "Library",
      copy: "Centraliza footage, sesiones y clips listos para pasar al flujo editorial.",
      icon: FiFolder,
      onClick: () => navigate("/scouting/subpages/library"),
    },
    {
      title: "Player Profiles",
      copy: "Da contexto al atleta con ficha, posición, ciudad y capa competitiva.",
      icon: FiUser,
      onClick: () => navigate("/scouting/subpages/player-profiles"),
    },
    {
      title: "Rankings",
      copy: "Detecta qué publicaciones están dominando el board y dónde está la referencia.",
      icon: FiBarChart2,
      onClick: () => navigate("/scouting/subpages/rankings"),
    },
  ];

  return (
    <section className="recruiters-dashboard recruiters-dashboard-v2">
      <header className="recruiters-dashboard-v2__hero">
        <div className="recruiters-dashboard-v2__hero-copy">
          <p className="recruiters-dashboard-v2__eyebrow">Elite Access</p>
          <h2>Scouting Workspace</h2>
          <p className="recruiters-dashboard-v2__hero-text">
            Analiza performance, prepara pipeline editorial y descubre qué jugador o video
            debe moverse ahora mismo dentro del ecosistema de scouting.
          </p>
          <div className="recruiters-dashboard-v2__hero-actions">
            <RecruitersWorkspaceButton
              variant="gold"
              size="sm"
              icon={<FiArrowRight aria-hidden="true" />}
              caption="video vault y sesiones"
              onClick={() => navigate("/scouting/subpages/library")}
            >
              Initialize Scan
            </RecruitersWorkspaceButton>
            <RecruitersWorkspaceButton
              variant="gold"
              size="sm"
              icon={<FiArrowRight aria-hidden="true" />}
              caption="ranking editorial"
              onClick={() => navigate("/scouting/subpages/rankings")}
            >
              View Pipeline
            </RecruitersWorkspaceButton>
          </div>

          <div className="recruiters-dashboard-v2__hero-stats">
            <article>
              <span>Scouting board</span>
              <strong>{isTopListLoading ? "..." : topVideos.length}</strong>
              <p>Piezas líderes visibles en la lectura rápida de esta sesión.</p>
            </article>
            <article>
              <span>Published assets</span>
              <strong>{isTopListLoading ? "..." : publishedCount}</strong>
              <p>Videos listos para competir dentro de ranking y recruiter view.</p>
            </article>
            <article>
              <span>Net votes</span>
              <strong>{isTopListLoading ? "..." : totalNetVotes}</strong>
              <p>Pulso agregado del top actual que está empujando el board.</p>
            </article>
          </div>
        </div>
      </header>

      <section className="recruiters-dashboard-v2__tools">
        {quickLinks.map(({ title, copy, icon: Icon, onClick }) => (
          <article key={title} className="recruiters-dashboard-v2__tool-card">
            <div className="recruiters-dashboard-v2__tool-icon">
              <Icon />
            </div>
            <h3>{title}</h3>
            <p>{copy}</p>
            <button type="button" onClick={onClick}>
              Abrir <FiArrowRight />
            </button>
          </article>
        ))}
      </section>

      {isTopVideoLoading ? (
        <section className="recruiters-dashboard-v2__feature recruiters-dashboard-v2__feature--loading">
          <div className="recruiters-dashboard-v2__feature-copy">
            <span className="recruiters-dashboard-v2__pill">Cargando top video</span>
            <h3>Preparando el video líder del momento</h3>
            <p>Estamos trayendo la pieza más fuerte del board para colocarla al centro del workspace.</p>
          </div>
        </section>
      ) : topVideo ? (
        <section className="recruiters-dashboard-v2__feature">
          <div className="recruiters-dashboard-v2__feature-main">
            <div className="recruiters-dashboard-v2__feature-media">
              <div className="recruiters-dashboard-v2__feature-overlay" />
              {topVideoPlaybackUrl ? (
                <RecruitersVideoPlayer
                  src={topVideoPlaybackUrl}
                  className="recruiters-dashboard-v2__feature-video"
                  muted
                  loop
                  autoPlay
                  preload="auto"
                  message="Cargando el video líder del momento."
                />
              ) : null}
            </div>

            <div className="recruiters-dashboard-v2__feature-panel">
              <div className="recruiters-dashboard-v2__feature-topline">
                <span className="recruiters-dashboard-v2__pill">Video Líder del Momento</span>
                <strong>TOP 1</strong>
              </div>

              <div className="recruiters-dashboard-v2__feature-copy">
                <h3>{topVideo.scoutingProfile?.title || topVideo.video.s3Key}</h3>
                <p>
                  Performance analysis from the scouting board featuring{" "}
                  {topVideo.playerProfile?.primaryPosition || "high-impact"}{" "}
                  actions by {topVideo.playerProfile?.fullName || "the leading athlete"}.
                </p>
              </div>

              <div className="recruiters-dashboard-v2__feature-stats">
                <article>
                  <span>Victory Score</span>
                  <strong>{topVideo.ranking.score}</strong>
                </article>
                <article>
                  <span>Net Votes</span>
                  <strong>{topVideo.ranking.netVotes}</strong>
                </article>
              </div>

              <button
                type="button"
                className="recruiters-dashboard-v2__feature-button"
                onClick={() => navigate(`/scouting/subpages/video/${topVideo.video._id}`)}
              >
                <FiPlayCircle />
                Open Recruiter View
              </button>
            </div>
          </div>

          <aside className="recruiters-dashboard-v2__trend-card">
            <FiTrendingUp className="recruiters-dashboard-v2__trend-watermark" />
            <h4>Trend Analysis</h4>
            <p>
              Engagement is concentrated around the current top assets and the published
              scouting pipeline is gaining traction.
            </p>
            <div className="recruiters-dashboard-v2__trend-meta">
              <div>
                <span>Global Reach</span>
                <strong>{trendStatus}</strong>
              </div>
              <div className="recruiters-dashboard-v2__trend-bar">
                <div style={{ width: `${trendPercent}%` }} />
              </div>
            </div>
          </aside>
        </section>
      ) : null}

      <section className="recruiters-dashboard-v2__table-card">
        <div className="recruiters-dashboard-v2__table-header">
          <div>
            <p className="recruiters-dashboard-v2__section-label">Top actual</p>
            <h3>Live scouting board</h3>
          </div>
          <button type="button" onClick={() => navigate("/scouting/subpages/rankings")}>
            Open full rankings
          </button>
        </div>

        {isTopListLoading ? (
          <p className="recruiters-dashboard-v2__state">Cargando top actual...</p>
        ) : (
          <div className="recruiters-dashboard-v2__rows">
            {topVideos.map((item, index) => (
              <div key={item.video._id} className="recruiters-dashboard-v2__row">
                <div className="recruiters-dashboard-v2__rank-badge">#{index + 1}</div>
                <div className="recruiters-dashboard-v2__row-main">
                  <h4>{item.scoutingProfile?.title || item.video.s3Key}</h4>
                  <p>
                    {item.playerProfile?.fullName || "Jugador"} ·{" "}
                    {item.playerProfile?.primaryPosition || "Posición"} ·{" "}
                    {item.playerProfile?.city || "Ciudad"}
                  </p>
                </div>
                <div className="recruiters-dashboard-v2__row-metric">
                  <span>Score</span>
                  <strong>{item.ranking.score}</strong>
                </div>
                <div className="recruiters-dashboard-v2__row-metric">
                  <span>Net votes</span>
                  <strong>{item.ranking.netVotes}</strong>
                </div>
                <button
                  type="button"
                  className="recruiters-dashboard-v2__row-action"
                  onClick={() => navigate(`/scouting/subpages/video/${item.video._id}`)}
                >
                  Ver
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default RecruitersDashboardPage;
