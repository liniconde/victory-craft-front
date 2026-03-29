import type {
  RecruiterPlayerProfileStatsBody,
  RecruiterPlayerProfileStatsResponse,
  RecruiterPublicPlayerProfileStats,
} from "../../features/recruiters/types";
import type { PlayerProfileRadarMetric } from "../../components/PlayerProfileRadar";

const KPI_PLAY_TYPES = ["Goal", "Assist", "Blooper", "Highlight"] as const;

export interface PlayerProfileKpis {
  totalVideos: number;
  goals: number;
  assists: number;
  bloopers: number;
  highlights: number;
  publishedVideos: number;
  draftVideos: number;
  archivedVideos: number;
  videosWithoutScoutingProfile: number;
  videosWithoutPlayType: number;
}

type PlayerProfileStatsLike =
  | RecruiterPlayerProfileStatsBody
  | RecruiterPlayerProfileStatsResponse
  | RecruiterPublicPlayerProfileStats
  | null
  | undefined;

const numberOrZero = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const readSummaryMetric = (
  stats: PlayerProfileStatsLike,
  key: string
) => numberOrZero((stats?.summary as Record<string, unknown> | undefined)?.[key]);

export const getPlayerProfilePlayTypeCount = (
  stats: PlayerProfileStatsLike,
  playType: string
) => numberOrZero(stats?.playTypeStats?.[playType]);

export const getPlayerProfileKpis = (stats: PlayerProfileStatsLike): PlayerProfileKpis => ({
  totalVideos: readSummaryMetric(stats, "totalVideos"),
  goals: getPlayerProfilePlayTypeCount(stats, KPI_PLAY_TYPES[0]),
  assists: getPlayerProfilePlayTypeCount(stats, KPI_PLAY_TYPES[1]),
  bloopers: getPlayerProfilePlayTypeCount(stats, KPI_PLAY_TYPES[2]),
  highlights: getPlayerProfilePlayTypeCount(stats, KPI_PLAY_TYPES[3]),
  publishedVideos: readSummaryMetric(stats, "publishedVideos"),
  draftVideos: readSummaryMetric(stats, "draftVideos"),
  archivedVideos: readSummaryMetric(stats, "archivedVideos"),
  videosWithoutScoutingProfile: readSummaryMetric(stats, "videosWithoutScoutingProfile"),
  videosWithoutPlayType: readSummaryMetric(stats, "videosWithoutPlayType"),
});

export const getPlayerProfileRadarMetrics = (
  stats: PlayerProfileStatsLike
): PlayerProfileRadarMetric[] => {
  const kpis = getPlayerProfileKpis(stats);
  const metrics = [
    { key: "goals", label: "Goals", shortLabel: "GLS", value: kpis.goals },
    { key: "assists", label: "Assists", shortLabel: "AST", value: kpis.assists },
    { key: "highlights", label: "Highlights", shortLabel: "HL", value: kpis.highlights },
    { key: "published", label: "Published", shortLabel: "PUB", value: kpis.publishedVideos },
    { key: "bloopers", label: "Bloopers", shortLabel: "BLP", value: kpis.bloopers },
  ];
  const maxValue = Math.max(...metrics.map((metric) => metric.value), 1);

  return metrics.map((metric) => ({
    ...metric,
    ratio: metric.value / maxValue,
  }));
};
