import axios from "axios";
import {
  Slot,
  Video,
  VideoStats,
  S3UploadObject,
  Field,
  VideoLibraryCreateRequest,
  VideoLibraryPaginatedResponse,
  VideoLibraryItem,
} from "./types";
import { VideosApi } from "./videosApi";

const api = axios.create({
  baseURL: "http://localhost:5001",
});

export const configureVideosApi = (config: {
  baseURL?: string;
  token?: string | null;
}) => {
  if (config.baseURL) {
    api.defaults.baseURL = config.baseURL;
  }

  if (config.token) {
    api.defaults.headers.common.Authorization = `Bearer ${config.token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

const API_VIDEO_STATS_URL = "/video-stats";
const API_VIDEOS_URL = "/videos";
const API_FIELDS_URL = "/fields";
const API_VIDEOS_LIBRARY_URL = "/videos/library";

const EVENT_TYPES = new Set(["pass", "shot", "goal", "foul", "other"]);
const TEAM_SIDES = new Set(["A", "B"]);

const numberOrZero = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const buildEmptyMetric = () => ({
  total: 0,
  teamA: 0,
  teamB: 0,
});

const buildEmptyMatchStats = () => ({
  passes: buildEmptyMetric(),
  shots: buildEmptyMetric(),
  goals: buildEmptyMetric(),
  fouls: buildEmptyMetric(),
  others: buildEmptyMetric(),
});

const normalizeManualEvents = (events: unknown): VideoStats["events"] => {
  if (!Array.isArray(events)) return [];
  return events
    .filter((event): event is Record<string, unknown> => Boolean(event))
    .map((event, index) => {
      const rawType = String(event.type ?? "other");
      const rawTeam = String(event.team ?? "A");
      const type = EVENT_TYPES.has(rawType) ? rawType : "other";
      const team = TEAM_SIDES.has(rawTeam) ? rawTeam : "A";
      const note =
        typeof event.note === "string" ? event.note.slice(0, 500) : undefined;
      return {
        id:
          typeof event.id === "string" && event.id.trim().length > 0
            ? event.id
            : `evt-${index}`,
        time: Math.max(numberOrZero(event.time), 0),
        type,
        team,
        note,
      };
    });
};

const computeMatchStatsFromEvents = (
  events: NonNullable<VideoStats["events"]>
): NonNullable<VideoStats["matchStats"]> => {
  const stats = buildEmptyMatchStats();
  for (const event of events) {
    const side = event.team === "A" ? "teamA" : "teamB";
    if (event.type === "pass") {
      stats.passes.total += 1;
      stats.passes[side] += 1;
    } else if (event.type === "shot") {
      stats.shots.total += 1;
      stats.shots[side] += 1;
    } else if (event.type === "goal") {
      stats.goals.total += 1;
      stats.goals[side] += 1;
      stats.shots.total += 1;
      stats.shots[side] += 1;
    } else if (event.type === "foul") {
      stats.fouls.total += 1;
      stats.fouls[side] += 1;
    } else {
      stats.others.total += 1;
      stats.others[side] += 1;
    }
  }
  return stats;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const normalizeTeamStats = (value: unknown): Record<string, number> => {
  const record = toRecord(value);
  const result: Record<string, number> = {};

  for (const [key, keyValue] of Object.entries(record)) {
    if (typeof keyValue === "number" && Number.isFinite(keyValue)) {
      result[key] = keyValue;
    }
  }

  if (result.passes === undefined) {
    result.passes = numberOrZero(record.pases);
  }
  if (result.shots === undefined) {
    result.shots = numberOrZero(record.tiros);
  }
  if (result.goals === undefined) {
    result.goals = numberOrZero(record.goles);
  }
  if (result.fouls === undefined) {
    result.fouls = numberOrZero(record.faltas);
  }
  if (result.others === undefined) {
    result.others = numberOrZero(record.otros);
  }

  return result;
};

const normalizeVideoStatsResponse = (data: unknown): VideoStats => {
  const raw = toRecord(data);
  const nested = toRecord(raw.statistics);

  const statsSource = Object.keys(nested).length > 0 ? nested : raw;
  const teamsRaw = Array.isArray(raw.teams)
    ? raw.teams
    : Array.isArray(nested.teams)
      ? nested.teams
      : [];

  const teams = teamsRaw
    .filter((team): team is Record<string, unknown> => Boolean(team))
    .map((team, index) => ({
      _id: typeof team._id === "string" ? team._id : undefined,
      teamName:
        typeof team.teamName === "string"
          ? team.teamName
          : index === 0
            ? "Team A"
            : "Team B",
      stats: normalizeTeamStats(team.stats),
    }));

  const events = normalizeManualEvents(statsSource.events);
  const fallbackMatchStatsFromEvents = computeMatchStatsFromEvents(events);
  const matchStatsRaw = toRecord(statsSource.matchStats);
  const matchStats = {
    passes: {
      total: numberOrZero(matchStatsRaw.passes && toRecord(matchStatsRaw.passes).total),
      teamA: numberOrZero(matchStatsRaw.passes && toRecord(matchStatsRaw.passes).teamA),
      teamB: numberOrZero(matchStatsRaw.passes && toRecord(matchStatsRaw.passes).teamB),
    },
    shots: {
      total: numberOrZero(matchStatsRaw.shots && toRecord(matchStatsRaw.shots).total),
      teamA: numberOrZero(matchStatsRaw.shots && toRecord(matchStatsRaw.shots).teamA),
      teamB: numberOrZero(matchStatsRaw.shots && toRecord(matchStatsRaw.shots).teamB),
    },
    goals: {
      total: numberOrZero(matchStatsRaw.goals && toRecord(matchStatsRaw.goals).total),
      teamA: numberOrZero(matchStatsRaw.goals && toRecord(matchStatsRaw.goals).teamA),
      teamB: numberOrZero(matchStatsRaw.goals && toRecord(matchStatsRaw.goals).teamB),
    },
    fouls: {
      total: numberOrZero(matchStatsRaw.fouls && toRecord(matchStatsRaw.fouls).total),
      teamA: numberOrZero(matchStatsRaw.fouls && toRecord(matchStatsRaw.fouls).teamA),
      teamB: numberOrZero(matchStatsRaw.fouls && toRecord(matchStatsRaw.fouls).teamB),
    },
    others: {
      total: numberOrZero(matchStatsRaw.others && toRecord(matchStatsRaw.others).total),
      teamA: numberOrZero(matchStatsRaw.others && toRecord(matchStatsRaw.others).teamA),
      teamB: numberOrZero(matchStatsRaw.others && toRecord(matchStatsRaw.others).teamB),
    },
  };

  const hasMatchStats =
    Object.values(matchStats).some(
      (metric) => metric.total || metric.teamA || metric.teamB
    ) || events.length === 0;

  const resolvedTeamAName =
    typeof statsSource.teamAName === "string" && statsSource.teamAName.trim()
      ? statsSource.teamAName
      : teams[0]?.teamName ?? "Team A";
  const resolvedTeamBName =
    typeof statsSource.teamBName === "string" && statsSource.teamBName.trim()
      ? statsSource.teamBName
      : teams[1]?.teamName ?? "Team B";

  return {
    summary:
      typeof raw.summary === "string"
        ? raw.summary
        : typeof nested.summary === "string"
          ? nested.summary
          : undefined,
    _id: typeof raw._id === "string" ? raw._id : undefined,
    videoId: typeof raw.videoId === "string" ? raw.videoId : "",
    sportType:
      typeof statsSource.sportType === "string"
        ? (statsSource.sportType as VideoStats["sportType"])
        : "other",
    teamAName: resolvedTeamAName,
    teamBName: resolvedTeamBName,
    events,
    matchStats: hasMatchStats ? matchStats : fallbackMatchStatsFromEvents,
    teams,
    generatedByModel:
      typeof raw.generatedByModel === "string" ? raw.generatedByModel : "manual",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    __v: typeof raw.__v === "number" ? raw.__v : undefined,
    statistics: Object.keys(nested).length
      ? ({
          summary:
            typeof nested.summary === "string" ? nested.summary : undefined,
          sportType:
            typeof nested.sportType === "string"
              ? (nested.sportType as VideoStats["sportType"])
              : undefined,
          teamAName:
            typeof nested.teamAName === "string" ? nested.teamAName : undefined,
          teamBName:
            typeof nested.teamBName === "string" ? nested.teamBName : undefined,
          events: normalizeManualEvents(nested.events),
          matchStats,
          teams,
        } as VideoStats["statistics"])
      : undefined,
  };
};

const normalizeLibraryResponse = (
  data: unknown,
  page: number,
  limit: number
): VideoLibraryPaginatedResponse => {
  const raw = (data ?? {}) as Record<string, unknown>;

  const rawItems = Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.data)
      ? raw.data
      : [];

  const items: VideoLibraryItem[] = rawItems as VideoLibraryItem[];

  const total =
    typeof raw.total === "number"
      ? raw.total
      : typeof raw.count === "number"
        ? raw.count
        : items.length;

  const totalPages =
    typeof raw.totalPages === "number"
      ? raw.totalPages
      : Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items,
    page: typeof raw.page === "number" ? raw.page : page,
    limit: typeof raw.limit === "number" ? raw.limit : limit,
    total,
    totalPages,
  };
};

export const defaultVideosApi: VideosApi = {
  getFields: async (): Promise<Field[]> => {
    const response = await api.get<Field[]>(API_FIELDS_URL);
    return response.data;
  },
  getFieldSlots: async (fieldId: string): Promise<Slot[]> => {
    const response = await api.get<Slot[]>(`${API_FIELDS_URL}/${fieldId}/slots`);
    return response.data;
  },
  getFieldVideos: async (fieldId: string): Promise<Video[]> => {
    const response = await api.get<Video[]>(`fields/${fieldId}/videos/`);
    return response.data;
  },
  getVideo: async (videoId: string): Promise<Video> => {
    const response = await api.get<Video>(`videos/${videoId}`);
    return response.data;
  },
  uploadVideoS3: async (videoFile: File): Promise<S3UploadObject> => {
    const fileType = videoFile.name.split(".").pop();
    const response = await api.post<S3UploadObject>("/videos/upload", {
      objectKey: videoFile.name,
      fileType,
    });

    const data = response.data;
    await axios.put(data.uploadUrl, videoFile, {
      method: "PUT",
      headers: { "Content-Type": videoFile.type },
    });
    return data;
  },
  createVideo: async (videoData: Video): Promise<Video> => {
    const response = await api.post<Video>(API_VIDEOS_URL, videoData);
    return response.data;
  },
  updateVideoById: async (videoId: string, videoData: Video): Promise<Video> => {
    const response = await api.put<Video>(`${API_VIDEOS_URL}/${videoId}`, videoData);
    return response.data;
  },
  getVideoStatsByVideoId: async (videoId: string): Promise<VideoStats> => {
    const response = await api.get<VideoStats>(`${API_VIDEO_STATS_URL}/${videoId}`);
    return normalizeVideoStatsResponse(response.data);
  },
  createVideoStats: async (statsData: VideoStats): Promise<VideoStats> => {
    const response = await api.post<VideoStats>(API_VIDEO_STATS_URL, statsData);
    return normalizeVideoStatsResponse(response.data);
  },
  updateVideoStats: async (
    videoId: string,
    updateData: Partial<VideoStats>
  ): Promise<VideoStats> => {
    const response = await api.put<VideoStats>(
      `${API_VIDEO_STATS_URL}/${videoId}`,
      updateData
    );
    return normalizeVideoStatsResponse(response.data);
  },
  deleteVideoStats: async (videoId: string): Promise<void> => {
    await api.delete(`${API_VIDEO_STATS_URL}/${videoId}`);
  },
  analyzeVideoWithGemini: async (videoId: string): Promise<VideoStats> => {
    const response = await api.post<VideoStats>(`/videos/${videoId}/analyze`, {});
    return normalizeVideoStatsResponse(response.data);
  },
  getVideoLibrary: async (
    page = 1,
    limit = 20
  ): Promise<VideoLibraryPaginatedResponse> => {
    const response = await api.get(API_VIDEOS_LIBRARY_URL, {
      params: { page, limit },
    });
    return normalizeLibraryResponse(response.data, page, limit);
  },
  createLibraryVideo: async (
    payload: VideoLibraryCreateRequest
  ): Promise<Video> => {
    const response = await api.post<Video>(API_VIDEOS_LIBRARY_URL, payload);
    return response.data;
  },
};
