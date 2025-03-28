import React, { useState } from "react";
import { createVideoStats } from "../../../services/videoStats/videoStatsService";

interface StatsSectionProps {
  videoId: string;
  sportType: string;
}

const StatsSection: React.FC<StatsSectionProps> = ({ videoId, sportType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [model, setModel] = useState("manual");

  const teamsDefault =
    sportType === "football" ? ["Rojo", "Azul"] : ["Jugador 1", "Jugador 2"];

  const generateRandomStats = () => {
    if (sportType === "football") {
      return teamsDefault.map((team) => ({
        teamName: team,
        stats: {
          goles: Math.floor(Math.random() * 5),
          pases: Math.floor(Math.random() * 150),
          faltas: Math.floor(Math.random() * 10),
          tiros: Math.floor(Math.random() * 20),
        },
      }));
    } else {
      return teamsDefault.map((team) => ({
        teamName: team,
        stats: {
          puntos: Math.floor(Math.random() * 100),
          saques: Math.floor(Math.random() * 50),
          golpes: Math.floor(Math.random() * 200),
          errores_no_forzados: Math.floor(Math.random() * 10),
        },
      }));
    }
  };

  const handleGenerateStats = () => {
    setIsLoading(true);
    setTimeout(async () => {
      const generated = generateRandomStats();
      setStats(generated);
      setIsLoading(false);

      await createVideoStats({
        videoId,
        sportType,
        teams: generated,
        generatedByModel: model,
      });
    }, 5000);
  };

  const handleManualStats = async () => {
    const emptyStats = teamsDefault.map((team) => ({
      teamName: team,
      stats: {},
    }));
    await createVideoStats({
      videoId,
      sportType,
      teams: emptyStats,
      generatedByModel: "manual",
    });
    alert(
      "Modo manual creado. Puedes editar las estadísticas desde otro formulario."
    );
  };

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">📊 Estadísticas del Video</h3>

      <div className="flex gap-4 items-center mb-4">
        <select
          className="border rounded px-2 py-1"
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isLoading ? "Generando..." : "Calcular Estadísticas"}
        </button>

        <button
          onClick={handleManualStats}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Ingresar Manualmente
        </button>
      </div>

      {stats && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-800 mb-2">Resultados:</h4>
          <table className="table-auto w-full text-sm bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Equipo</th>
                {Object.keys(stats[0].stats).map((key) => (
                  <th key={key} className="p-2 text-left">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((team: any, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 font-medium text-gray-700">
                    {team.teamName}
                  </td>
                  {Object.values(team.stats).map((val: any, i) => (
                    <td key={i} className="p-2">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StatsSection;
