import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { RecruiterViewResponse, RecruiterVotesSummary } from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";

const RecruiterVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();
  const {
    api: { getRecruiterView, voteVideo },
    feedback,
  } = useRecruitersModule();
  const [data, setData] = useState<RecruiterViewResponse | null>(null);
  const [summary, setSummary] = useState<RecruiterVotesSummary | null>(null);

  useEffect(() => {
    if (!videoId) return;

    getRecruiterView(videoId)
      .then((response) => {
        setData(response);
        setSummary(response.ranking ?? null);
      })
      .catch((error) => {
        feedback.showError(error instanceof Error ? error.message : "No se pudo cargar el detalle.");
      });
  }, [feedback, getRecruiterView, videoId]);

  const updateVote = async (value: -1 | 0 | 1) => {
    if (!videoId) return;
    try {
      const response = await voteVideo(videoId, value);
      setSummary(response.summary);
    } catch (error) {
      feedback.showError(error instanceof Error ? error.message : "No se pudo votar.");
    }
  };

  const playableUrl = data?.video?.playbackUrl || data?.video?.videoUrl || "";

  return (
    <section className="recruiters-dashboard">
      <header className="recruiters-dashboard__hero">
        <div>
          <p className="recruiters-dashboard__eyebrow">Recruiter View</p>
          <h2>{data?.scoutingProfile?.title || data?.video?.s3Key || "Detalle de video"}</h2>
          <p>Vista agregada del dominio scouting, separada de videos.</p>
        </div>
      </header>

      {!data?.video ? (
        <section className="recruiters-dashboard__table">
          <p>No se encontró el video.</p>
        </section>
      ) : (
        <>
          <div className="scouting-upload-layout">
            <section className="scouting-results">
              {playableUrl ? (
                <video className="videos-library-page__player" controls>
                  <source src={playableUrl} />
                </video>
              ) : (
                <p>Sin URL de reproducción.</p>
              )}
            </section>

            <aside className="scouting-side-panel">
              <h3>Acciones</h3>
              <div className="scouting-video-card__votes">
                <button type="button" onClick={() => updateVote(1)}>
                  ▲ {summary?.upvotes ?? 0}
                </button>
                <button type="button" className="is-negative" onClick={() => updateVote(-1)}>
                  ▼ {summary?.downvotes ?? 0}
                </button>
                <button type="button" onClick={() => updateVote(0)}>
                  Neutralizar
                </button>
              </div>
              <p>Score: {summary?.score ?? 0}</p>
              <p>Net votes: {summary?.netVotes ?? 0}</p>
              <button
                type="button"
                onClick={() => navigate(`/scouting/subpages/profile/${data.video?._id}`)}
              >
                {data.scoutingProfile ? "Editar profile" : "Crear profile"}
              </button>
            </aside>
          </div>

          <section className="recruiters-dashboard__table">
            <div className="recruiters-dashboard__table-header">
              <h3>Scouting profile</h3>
            </div>
            {data.scoutingProfile ? (
              <div className="recruiters-dashboard__row">
                <div>
                  <h4>{data.scoutingProfile.playerName || "Sin jugador"}</h4>
                  <p>
                    {data.scoutingProfile.playerPosition || "Sin posición"} ·{" "}
                    {data.scoutingProfile.playerTeam || "Sin equipo"} ·{" "}
                    {data.scoutingProfile.city || "Sin ciudad"}
                  </p>
                  <p>{data.scoutingProfile.notes || "Sin notas"}</p>
                </div>
              </div>
            ) : (
              <p>Este video aún no tiene profile de scouting.</p>
            )}
          </section>

          <section className="recruiters-dashboard__table">
            <div className="recruiters-dashboard__table-header">
              <h3>Relacionados</h3>
              <span>{data.relatedVideos.length} videos</span>
            </div>
            {data.relatedVideos.map((item) => (
              <div
                key={item.video?._id || item.scoutingProfile?._id}
                className="recruiters-dashboard__row"
              >
                <div>
                  <h4>{item.scoutingProfile?.title || item.video?.s3Key}</h4>
                  <p>
                    {item.scoutingProfile?.playerName || "Jugador"} ·{" "}
                    {item.scoutingProfile?.country || "País"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    item.video?._id && navigate(`/scouting/subpages/video/${item.video._id}`)
                  }
                >
                  Abrir
                </button>
              </div>
            ))}
          </section>
        </>
      )}
    </section>
  );
};

export default RecruiterVideoPage;
