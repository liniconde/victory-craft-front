import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { RecruiterViewResponse, RecruiterVotesSummary } from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import RecruitersVideoPlayer from "../../../components/RecruitersVideoPlayer";
import RecruiterVoteButtons from "../../../components/RecruiterVoteButtons";

const RecruiterVideoPage: React.FC = () => {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();
  const {
    api: { getRecruiterView, voteVideo },
    feedback,
    loading: { trackTask },
  } = useRecruitersModule();
  const [data, setData] = useState<RecruiterViewResponse | null>(null);
  const [summary, setSummary] = useState<RecruiterVotesSummary | null>(null);

  useEffect(() => {
    if (!videoId) return;

    trackTask(
      getRecruiterView(videoId),
      "Los sticks están revisando el video recruiter mientras carga el detalle."
    )
      .then((response) => {
        setData(response);
        setSummary(response.ranking ?? null);
      })
      .catch((error) => {
        feedback.showError(error instanceof Error ? error.message : "No se pudo cargar el detalle.");
      });
  }, [feedback, getRecruiterView, trackTask, videoId]);

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
                <RecruitersVideoPlayer
                  className="videos-library-page__player"
                  src={playableUrl}
                  message="Los sticks están practicando mientras termina de cargar este video."
                />
              ) : (
                <p>Sin URL de reproducción.</p>
              )}
            </section>

            <aside className="scouting-side-panel">
              <h3>Acciones</h3>
              <div className="scouting-video-card__votes">
                <RecruiterVoteButtons
                  upvotes={summary?.upvotes ?? 0}
                  downvotes={summary?.downvotes ?? 0}
                  myVote={summary?.myVote ?? null}
                  onVote={updateVote}
                />
              </div>
              <p>Score: {summary?.score ?? 0}</p>
              <p>Net votes: {summary?.netVotes ?? 0}</p>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    data.playerProfile?._id
                      ? `/scouting/subpages/profile/${data.video?._id}?playerProfileId=${data.playerProfile._id}`
                      : `/scouting/subpages/profile/${data.video?._id}`
                  )
                }
              >
                {data.scoutingProfile ? "Editar metadata de publicación" : "Publicar en ranking"}
              </button>
            </aside>
          </div>

          <section className="recruiters-dashboard__table">
            <div className="recruiters-dashboard__table-header">
              <h3>Detalle recruiter</h3>
            </div>
            {data.playerProfile ? (
              <div className="recruiters-dashboard__row">
                <div>
                  <h4>{data.playerProfile.fullName || "Player profile"}</h4>
                  <p>
                    {data.playerProfile.team || "Sin equipo"} ·{" "}
                    {data.playerProfile.primaryPosition || "Sin posición"} ·{" "}
                    {data.playerProfile.category || "Sin categoría"}
                  </p>
                </div>
              </div>
            ) : null}
            {data.scoutingProfile ? (
              <div className="recruiters-dashboard__row">
                <div>
                  <h4>{data.scoutingProfile.title || "Scouting profile"}</h4>
                  <p>
                    {data.scoutingProfile.publicationStatus || "draft"} ·{" "}
                    {data.scoutingProfile.tournamentType || "Sin tipo de torneo"} ·{" "}
                    {data.scoutingProfile.tournamentName || "Sin torneo"}
                  </p>
                  <p>{data.scoutingProfile.notes || "Sin notas editoriales"}</p>
                </div>
              </div>
            ) : (
              <p>Este video aun no tiene scouting profile editorial.</p>
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
                    {item.playerProfile?.fullName || "Jugador"} ·{" "}
                    {item.playerProfile?.country || "Pais"}
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
