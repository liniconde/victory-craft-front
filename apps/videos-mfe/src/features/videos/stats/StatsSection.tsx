import React, { useEffect, useMemo, useState } from "react";
import { MatchStats, SportType, TeamStats, VideoStats } from "../types";
import { useVideosModule } from "../../../hooks/useVideosModule";
import "./StatsSection.css";

interface StatsSectionProps {
  videoId: string;
  sportType: string;
}

const emptyMatchStats: MatchStats = {
  passes: { total: 0, teamA: 0, teamB: 0 },
  shots: { total: 0, teamA: 0, teamB: 0 },
  goals: { total: 0, teamA: 0, teamB: 0 },
  fouls: { total: 0, teamA: 0, teamB: 0 },
  others: { total: 0, teamA: 0, teamB: 0 },
};

const toMetricLabel = (metric: string): string =>
  metric.charAt(0).toUpperCase() + metric.slice(1);

const StatsSection: React.FC<StatsSectionProps> = ({ videoId, sportType }) => {
  const [videoStats, setVideoStats] = useState<VideoStats | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [model, setModel] = useState("manual");
  const {
    api: {
      analyzeVideoWithGemini,
      createVideoStats,
      getVideoStatsByVideoId,
      updateVideoStats,
    },
    feedback: { showLoading, hideLoading, showError, isLoading },
  } = useVideosModule();

  useEffect(() => {
    const fetchStats = async () => {
      showLoading();
      try {
        const existingStats = await getVideoStatsByVideoId(videoId);
        setVideoStats(existingStats);
        if (existingStats.summary) setSummary(existingStats.summary);
      } catch (error) {
        const maybeError = error as { response?: { status?: number } };
        if (maybeError.response?.status !== 404) {
          console.warn("No se encontraron estadísticas previas", error);
        }
      } finally {
        hideLoading();
      }
    };

    fetchStats();
  }, [getVideoStatsByVideoId, hideLoading, showLoading, videoId]);

  const handleGenerateStats = () => {
    showLoading();
    setTimeout(async () => {
      try {
        if (model.toLowerCase().includes("gemini")) {
          const analysis = await analyzeVideoWithGemini(videoId);
          setVideoStats(analysis);
          if (analysis.summary) {
            setSummary(analysis.summary);
          }
          return;
        }

        const payload: VideoStats = {
          videoId,
          sportType: sportType as SportType,
          teamAName: videoStats?.teamAName ?? "Team A",
          teamBName: videoStats?.teamBName ?? "Team B",
          events: videoStats?.events ?? [],
          teams: videoStats?.teams ?? [
            { teamName: "Team A", stats: {} },
            { teamName: "Team B", stats: {} },
          ],
          matchStats: videoStats?.matchStats ?? emptyMatchStats,
          generatedByModel: model,
          statistics: {
            sportType: sportType as SportType,
            teamAName: videoStats?.teamAName ?? "Team A",
            teamBName: videoStats?.teamBName ?? "Team B",
            events: videoStats?.events ?? [],
            teams: videoStats?.teams ?? [
              { teamName: "Team A", stats: {} },
              { teamName: "Team B", stats: {} },
            ],
            matchStats: videoStats?.matchStats ?? emptyMatchStats,
          },
        };

        const persisted = videoStats
          ? await updateVideoStats(videoId, payload)
          : await createVideoStats(payload);
        setVideoStats(persisted);
      } catch (error) {
        showError("Error al generar estadísticas");
      } finally {
        hideLoading();
      }
    }, 500);
  };

  const handleManualStats = async () => {
    try {
      const created = await createVideoStats({
        videoId,
        sportType: sportType as SportType,
        teamAName: "Team A",
        teamBName: "Team B",
        events: [],
        teams: [
          { teamName: "Team A", stats: {} },
          { teamName: "Team B", stats: {} },
        ],
        matchStats: emptyMatchStats,
        generatedByModel: "manual",
        statistics: {
          sportType: sportType as SportType,
          teamAName: "Team A",
          teamBName: "Team B",
          events: [],
          teams: [
            { teamName: "Team A", stats: {} },
            { teamName: "Team B", stats: {} },
          ],
          matchStats: emptyMatchStats,
        },
      });
      setVideoStats(created);
      setSummary(created.summary ?? null);
      window.alert("Modo manual creado en /video-stats.");
    } catch (error) {
      showError("No se pudo crear el modo manual");
    }
  };

  const teams = useMemo<TeamStats[]>(() => videoStats?.teams ?? [], [videoStats]);
  const matchStats = videoStats?.matchStats ?? emptyMatchStats;
  const teamAName = videoStats?.teamAName ?? teams[0]?.teamName ?? "Team A";
  const teamBName = videoStats?.teamBName ?? teams[1]?.teamName ?? "Team B";

  return (
    <div className="stats-container">
      <h3 className="stats-title">📊 Estadísticas del Video</h3>

      <div className="stats-controls">
        <select
          className="stats-select"
          value={model}
          onChange={(event) => setModel(event.target.value)}
        >
          <option value="manual">Manual</option>
          <option value="OpenPose">OpenPose</option>
          <option value="YOLOv8">YOLOv8</option>
          <option value="DeepSportAnalyzer">DeepSportAnalyzer</option>
          <option value="Gemini-2.0-Flash">Gemini-2.0-Flash</option>
        </select>

        <button
          onClick={handleGenerateStats}
          disabled={isLoading}
          className="stats-button-primary"
        >
          {isLoading ? "Generando..." : "Calcular Estadísticas"}
        </button>

        <button onClick={handleManualStats} className="stats-button-secondary">
          Ingresar Manualmente
        </button>
      </div>

      {summary ? (
        <div className="stats-summary-container">
          <h4 className="stats-summary-title">📝 Resumen del Análisis</h4>
          <p className="stats-summary-text">{summary}</p>
        </div>
      ) : null}

      {videoStats ? (
        <div className="stats-table-container">
          <h4 className="stats-subtitle">Estadísticas globales (partido)</h4>
          <div className="overflow-x-auto">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Total</th>
                  <th>{teamAName}</th>
                  <th>{teamBName}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(matchStats).map(([metric, values]) => (
                  <tr key={metric}>
                    <td>{toMetricLabel(metric)}</td>
                    <td>{values.total}</td>
                    <td>{values.teamA}</td>
                    <td>{values.teamB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {teams.length > 0 ? (
            <>
              <h4 className="stats-subtitle">Estadísticas individuales por equipo</h4>
              <div className="overflow-x-auto">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Equipo</th>
                      {Object.keys(teams[0].stats).map((key) => (
                        <th key={key}>{toMetricLabel(key)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, idx: number) => (
                      <tr key={team._id ?? idx}>
                        <td className="font-semibold">{team.teamName}</td>
                        {Object.values(team.stats).map((val, i) => (
                          <td key={`${team.teamName}-${i}`}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default StatsSection;
