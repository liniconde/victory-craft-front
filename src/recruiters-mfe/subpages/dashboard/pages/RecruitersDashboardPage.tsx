import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RecruiterRankingItem } from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";
import "./RecruitersDashboardPage.css";

const RecruitersDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    api: { getTopRankings },
    feedback,
  } = useRecruitersModule();
  const [topVideos, setTopVideos] = useState<RecruiterRankingItem[]>([]);

  useEffect(() => {
    getTopRankings({ limit: 5 })
      .then(setTopVideos)
      .catch((error) => {
        feedback.showError(error instanceof Error ? error.message : "No se pudo cargar el dashboard.");
      });
  }, [feedback, getTopRankings]);

  return (
    <section className="recruiters-dashboard">
      <header className="recruiters-dashboard__hero">
        <div>
          <p className="recruiters-dashboard__eyebrow">Scouting Workspace</p>
          <h2>Dashboard del dominio scouting</h2>
          <p>Desde aqui entramos al ranking publico, a library y al recruiter view sin usar el flujo legacy.</p>
        </div>
        <div className="recruiters-dashboard__stats">
          <strong>{topVideos.length}</strong>
          <span>videos publicados destacados</span>
        </div>
      </header>

      <div className="recruiters-dashboard__cards">
        <article>
          <h3>Library</h3>
          <p>Explora la biblioteca y elige qué video perfilar.</p>
          <button type="button" onClick={() => navigate("/scouting/subpages/library")}>
            Abrir library
          </button>
        </article>
        <article>
          <h3>Player profiles</h3>
          <p>Gestiona la ficha base del jugador antes de vincular videos y publicarlos.</p>
          <button type="button" onClick={() => navigate("/scouting/subpages/player-profiles")}>
            Abrir perfiles
          </button>
        </article>
        <article>
          <h3>Rankings</h3>
          <p>Consulta el ranking publico de videos publicados con filtros del backend.</p>
          <button type="button" onClick={() => navigate("/scouting/subpages/rankings")}>
            Abrir rankings
          </button>
        </article>
      </div>

      <section className="recruiters-dashboard__table">
        <div className="recruiters-dashboard__table-header">
          <h3>Top actual</h3>
          <span>ordenado por score backend</span>
        </div>
        {topVideos.map((item, index) => (
          <div key={item.video._id} className="recruiters-dashboard__row">
            <strong>#{index + 1}</strong>
            <div>
              <h4>{item.scoutingProfile?.title || item.video.s3Key}</h4>
              <p>
                {item.playerProfile?.fullName || "Jugador"} ·{" "}
                {item.playerProfile?.primaryPosition || "Posicion"} ·{" "}
                {item.playerProfile?.city || "Ciudad"}
              </p>
            </div>
            <span>{item.ranking.netVotes} votos netos</span>
            <button
              type="button"
              onClick={() => navigate(`/scouting/subpages/video/${item.video._id}`)}
            >
              Ver
            </button>
          </div>
        ))}
      </section>
    </section>
  );
};

export default RecruitersDashboardPage;
