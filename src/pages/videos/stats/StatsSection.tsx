import React, { useState, useEffect } from "react";
import {
  createVideoStats,
  getVideoStatsByVideoId,
  TeamStats,
  updateVideoStats,
} from "../../../services/videoStats/videoStatsService";
import { useAppFeedback } from "../../../hooks/useAppFeedback";
import "./StatsSection.css";

interface StatsSectionProps {
  videoId: string;
  sportType: string;
}

const StatsSection: React.FC<StatsSectionProps> = ({ videoId, sportType }) => {
  const [stats, setStats] = useState<TeamStats[] | null>(null);
  const [model, setModel] = useState("manual");
  const { showLoading, hideLoading, showError, isLoading } = useAppFeedback();

  const teamsDefault =
    sportType === "football" ? ["Rojo", "Azul"] : ["Jugador 1", "Jugador 2"];

  useEffect(() => {
    const fetchStats = async () => {
      showLoading();
      try {
        const existingStats = await getVideoStatsByVideoId(videoId);
        if (existingStats) {
          setStats(existingStats.teams);
        }
      } catch (err) {
        console.warn("No se encontraron estadísticas previas", err);
      } finally {
        hideLoading();
      }
    };

    fetchStats();
  }, [videoId]);

  const generateRandomStats = () => {
    if (sportType === "football") {
      return teamsDefault.map((team) => ({
        teamName: team,
        stats: {
          goles: Math.floor(Math.random() * 2),
          pases: Math.floor(Math.random() * 50),
          faltas: Math.floor(Math.random() * 2),
          tiros: Math.floor(Math.random() * 5),
        },
      }));
    } else {
      return teamsDefault.map((team) => ({
        teamName: team,
        stats: {
          puntos: Math.floor(Math.random() * 10),
          saques: Math.floor(Math.random() * 2),
          golpes: Math.floor(Math.random() * 50),
          errores_no_forzados: Math.floor(Math.random() * 2),
        },
      }));
    }
  };

  const handleGenerateStats = () => {
    showLoading();
    setTimeout(async () => {
      try {
        const generated = generateRandomStats();
        if (!stats) {
          await createVideoStats({
            videoId,
            sportType,
            teams: generated,
            generatedByModel: model,
          });
        } else {
          await updateVideoStats(videoId, {
            sportType,
            teams: generated,
            generatedByModel: model,
          });
        }
        setStats(generated);
      } catch (err: any) {
        showError("Error al generar estadísticas");
      } finally {
        hideLoading();
      }
    }, 5000);
  };

  const handleManualStats = async () => {
    const emptyStats = teamsDefault.map((team) => ({
      teamName: team,
      stats: {},
    }));
    try {
      await createVideoStats({
        videoId,
        sportType,
        teams: emptyStats,
        generatedByModel: "manual",
      });
      alert(
        "Modo manual creado. Puedes editar las estadísticas desde otro formulario."
      );
    } catch (err: any) {
      showError("No se pudo crear el modo manual");
    }
  };

  return (
    <div className="stats-container">
      <h3 className="stats-title">📊 Estadísticas del Video</h3>

      <div className="stats-controls">
        <select
          className="stats-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="manual">Manual</option>
          <option value="OpenPose">OpenPose</option>
          <option value="YOLOv8">YOLOv8</option>
          <option value="DeepSportAnalyzer">DeepSportAnalyzer</option>
        </select>

        <button
          onClick={handleGenerateStats}
          disabled={isLoading}
          className="stats-button-primary"
        >
          {isLoading ? "Generando..." : "Calcular Estadísticas"}
        </button>

        <button
          onClick={handleManualStats}
          className="stats-button-secondary"
        >
          Ingresar Manualmente
        </button>
      </div>

      {stats && (
        <div className="stats-table-container">
          <h4 className="stats-subtitle">Resultados:</h4>
          <div className="overflow-x-auto">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  {Object.keys(stats[0].stats).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.map((team, idx: number) => (
                  <tr key={idx}>
                    <td className="font-semibold">{team.teamName}</td>
                    {Object.values(team.stats).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsSection;
