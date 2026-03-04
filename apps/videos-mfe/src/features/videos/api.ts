import axios from "axios";
import {
  AnalysisJob,
  AnalysisResultsResponse,
  AnalyzeVideoJobRequest,
  CloseStreamResponse,
  CreateMatchSessionRequest,
  CreateVideoSegmentRequest,
  CreateVideoSegmentResponse,
  CreateAnalyzeJobResponse,
  Slot,
  Video,
  VideoStats,
  S3UploadObject,
  Field,
  MatchSession,
  RoomParticipant,
  RoomSegmentsResponse,
  StreamRoom,
  StreamRoomDetails,
  VideoLibraryCreateRequest,
  VideoLibraryPaginatedResponse,
  VideoLibraryItem,
  VideoSegment,
  MessageResponse,
  NotificationItem,
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

export const getVideosApiRuntimeConfig = () => {
  const rawCommonHeaders =
    (api.defaults.headers as { common?: Record<string, unknown> }).common ?? {};
  const authHeader = rawCommonHeaders.Authorization;
  const token =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

  return {
    baseURL: api.defaults.baseURL ?? "",
    token,
  };
};

const API_VIDEO_STATS_URL = "/video-stats";
const API_VIDEOS_URL = "/videos";
const API_FIELDS_URL = "/fields";
const API_VIDEOS_LIBRARY_URL = "/videos/library";
const API_NOTIFICATIONS_URL = "/notifications";
const API_MATCH_SESSIONS_URL = "/match-sessions";
const API_ROOMS_URL = "/rooms";

const JOB_STATUS_VALUES = new Set([
  "queued",
  "started",
  "in_progress",
  "completed",
  "failed",
]);

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

const normalizeNotificationsResponse = (data: unknown): NotificationItem[] => {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item, index) => ({
      _id: typeof item._id === "string" ? item._id : `notification-${index}`,
      type:
        item.type === "analysis_queued" ||
        item.type === "analysis_completed" ||
        item.type === "analysis_failed" ||
        item.type === "info"
          ? item.type
          : "info",
      message: typeof item.message === "string" ? item.message : "",
      videoId: typeof item.videoId === "string" ? item.videoId : undefined,
      analysisJobId:
        typeof item.analysisJobId === "string" ? item.analysisJobId : undefined,
      metadata:
        typeof item.metadata === "object" && item.metadata !== null
          ? (item.metadata as Record<string, unknown>)
          : undefined,
      createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
      updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
    }));
};

const normalizeAnalysisJob = (data: unknown): AnalysisJob => {
  const raw = toRecord(data);
  const statusRaw = String(raw.status ?? "");
  return {
    _id: typeof raw._id === "string" ? raw._id : undefined,
    videoId: typeof raw.videoId === "string" ? raw.videoId : undefined,
    analysisType:
      raw.analysisType === "agent_prompt" || raw.analysisType === "custom"
        ? raw.analysisType
        : undefined,
    status: JOB_STATUS_VALUES.has(statusRaw)
      ? (statusRaw as AnalysisJob["status"])
      : undefined,
    input: toRecord(raw.input),
    output: toRecord(raw.output),
    errorMessage:
      typeof raw.errorMessage === "string" ? raw.errorMessage : undefined,
    sqsMessageId:
      typeof raw.sqsMessageId === "string" ? raw.sqsMessageId : undefined,
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : undefined,
    completedAt:
      typeof raw.completedAt === "string" ? raw.completedAt : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
};

const normalizeCreateAnalyzeJobResponse = (
  data: unknown
): CreateAnalyzeJobResponse => {
  const raw = toRecord(data);
  return {
    message: typeof raw.message === "string" ? raw.message : undefined,
    job: normalizeAnalysisJob(raw.job),
  };
};

const normalizeAnalysisResultsResponse = (
  data: unknown,
  page: number,
  limit: number
): AnalysisResultsResponse => {
  const raw = toRecord(data);
  const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
  const items = itemsRaw
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item, index) => {
      const input = toRecord(item.input);
      return {
        _id: typeof item._id === "string" ? item._id : `analysis-result-${index}`,
        analysisJobId:
          typeof item.analysisJobId === "string" ? item.analysisJobId : undefined,
        analysisType:
          item.analysisType === "agent_prompt" || item.analysisType === "custom"
            ? item.analysisType
            : undefined,
        createdAt:
          typeof item.createdAt === "string" ? item.createdAt : undefined,
        updatedAt:
          typeof item.updatedAt === "string" ? item.updatedAt : undefined,
        videoId: typeof item.videoId === "string" ? item.videoId : undefined,
        input: {
          prompt: typeof input.prompt === "string" ? input.prompt : undefined,
          ...input,
        },
        output: toRecord(item.output),
        params: toRecord(item.params),
      };
    });

  const paginationRaw = toRecord(raw.pagination);
  return {
    items,
    pagination: {
      page:
        typeof paginationRaw.page === "number" ? paginationRaw.page : page,
      limit:
        typeof paginationRaw.limit === "number" ? paginationRaw.limit : limit,
      total:
        typeof paginationRaw.total === "number"
          ? paginationRaw.total
          : items.length,
      totalPages:
        typeof paginationRaw.totalPages === "number"
          ? paginationRaw.totalPages
          : Math.max(1, Math.ceil(items.length / Math.max(limit, 1))),
      hasNextPage:
        typeof paginationRaw.hasNextPage === "boolean"
          ? paginationRaw.hasNextPage
          : undefined,
      hasPrevPage:
        typeof paginationRaw.hasPrevPage === "boolean"
          ? paginationRaw.hasPrevPage
          : undefined,
    },
  };
};

const normalizeVideoSegment = (data: unknown): VideoSegment => {
  const raw = toRecord(data);
  return {
    _id: typeof raw._id === "string" ? raw._id : "",
    matchSessionId:
      typeof raw.matchSessionId === "string" ? raw.matchSessionId : "",
    roomId: typeof raw.roomId === "string" ? raw.roomId : "",
    libraryVideoId:
      typeof raw.libraryVideoId === "string" ? raw.libraryVideoId : undefined,
    sequence: numberOrZero(raw.sequence),
    durationSec: numberOrZero(raw.durationSec),
    startOffsetSec: numberOrZero(raw.startOffsetSec),
    endOffsetSec: numberOrZero(raw.endOffsetSec),
    s3Key: typeof raw.s3Key === "string" ? raw.s3Key : "",
    videoUrl: typeof raw.videoUrl === "string" ? raw.videoUrl : "",
    signedDownloadUrl:
      typeof raw.signedDownloadUrl === "string"
        ? raw.signedDownloadUrl
        : undefined,
    uploadedAt: typeof raw.uploadedAt === "string" ? raw.uploadedAt : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
};

const normalizeCloseStreamResponse = (data: unknown): CloseStreamResponse => {
  const raw = toRecord(data);
  return {
    roomId: typeof raw.roomId === "string" ? raw.roomId : "",
    matchSessionId:
      typeof raw.matchSessionId === "string" ? raw.matchSessionId : "",
    endedAt: typeof raw.endedAt === "string" ? raw.endedAt : undefined,
    totalDurationSec: numberOrZero(raw.totalDurationSec),
    lastSequence: numberOrZero(raw.lastSequence),
    status:
      raw.status === "active" || raw.status === "closed"
        ? raw.status
        : undefined,
  };
};

const toApiError = (error: unknown, fallbackMessage: string): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = toRecord(error.response?.data);
    const detail =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : "";

    if (status === 401) {
      return new Error("No autorizado (401). Inicia sesion de nuevo.");
    }
    if (status === 403) {
      return new Error("No tienes permisos para esta sala (403).");
    }
    if (status === 404) {
      return new Error("Recurso no encontrado (404).");
    }
    if (status === 400) {
      return new Error(detail ? `Solicitud invalida (400): ${detail}` : "Solicitud invalida (400).");
    }
    if (status === 409) {
      return new Error(
        detail ? `Conflicto de estado (409): ${detail}` : "Conflicto de estado (409)."
      );
    }

    if (detail) {
      return new Error(detail);
    }
  }

  return new Error(fallbackMessage);
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
  createMatchSession: async (
    payload: CreateMatchSessionRequest
  ): Promise<MatchSession> => {
    try {
      const response = await api.post<MatchSession>(API_MATCH_SESSIONS_URL, payload);
      return response.data;
    } catch (error) {
      throw toApiError(error, "No se pudo crear la sesion.");
    }
  },
  createStreamRoom: async (matchSessionId: string): Promise<StreamRoom> => {
    try {
      const response = await api.post<StreamRoom>(
        `${API_MATCH_SESSIONS_URL}/${matchSessionId}/rooms`,
        {}
      );
      return response.data;
    } catch (error) {
      throw toApiError(error, "No se pudo crear la sala.");
    }
  },
  publishMatchSegment: async (
    matchSessionId: string,
    payload: CreateVideoSegmentRequest
  ): Promise<CreateVideoSegmentResponse> => {
    try {
      const response = await api.post<CreateVideoSegmentResponse>(
        `${API_MATCH_SESSIONS_URL}/${matchSessionId}/segments`,
        payload
      );
      return {
        created: Boolean(response.data.created),
        totalDurationSec: numberOrZero(response.data.totalDurationSec),
        lastSequence: numberOrZero(response.data.lastSequence),
        sequenceInfo:
          typeof response.data.sequenceInfo === "object" &&
          response.data.sequenceInfo !== null
            ? {
                expectedNextSequence: numberOrZero(
                  (response.data.sequenceInfo as { expectedNextSequence?: unknown })
                    .expectedNextSequence
                ),
                hasGap: Boolean(
                  (response.data.sequenceInfo as { hasGap?: unknown }).hasGap
                ),
              }
            : undefined,
        segment: normalizeVideoSegment(response.data.segment),
      };
    } catch (error) {
      throw toApiError(error, "No se pudo publicar el segmento.");
    }
  },
  getStreamRoomDetails: async (roomId: string): Promise<StreamRoomDetails> => {
    try {
      const response = await api.get<StreamRoomDetails>(`${API_ROOMS_URL}/${roomId}`);
      return {
        ...response.data,
        participants: Array.isArray(response.data.participants)
          ? response.data.participants
          : [],
        matchSession:
          typeof response.data.matchSession === "object" &&
          response.data.matchSession !== null
            ? {
                _id:
                  typeof response.data.matchSession._id === "string"
                    ? response.data.matchSession._id
                    : "",
                title:
                  typeof response.data.matchSession.title === "string"
                    ? response.data.matchSession.title
                    : "",
                status:
                  response.data.matchSession.status === "active" ||
                  response.data.matchSession.status === "ended"
                    ? response.data.matchSession.status
                    : undefined,
                totalDurationSec: numberOrZero(
                  response.data.matchSession.totalDurationSec
                ),
                endedAt:
                  typeof response.data.matchSession.endedAt === "string"
                    ? response.data.matchSession.endedAt
                    : undefined,
              }
            : undefined,
      };
    } catch (error) {
      throw toApiError(error, "No se pudo obtener la sala.");
    }
  },
  getRoomSegments: async (
    roomId: string,
    afterSequence?: number
  ): Promise<RoomSegmentsResponse> => {
    try {
      const response = await api.get<{ items?: unknown[] }>(
        `${API_ROOMS_URL}/${roomId}/segments`,
        {
          params:
            typeof afterSequence === "number" && Number.isFinite(afterSequence)
              ? { afterSequence }
              : undefined,
        }
      );

      return {
        items: Array.isArray(response.data.items)
          ? response.data.items.map((item) => normalizeVideoSegment(item))
          : [],
      };
    } catch (error) {
      throw toApiError(error, "No se pudieron cargar los segmentos.");
    }
  },
  joinStreamRoom: async (roomId: string): Promise<RoomParticipant> => {
    try {
      const response = await api.post<RoomParticipant>(`${API_ROOMS_URL}/${roomId}/join`, {});
      return response.data;
    } catch (error) {
      throw toApiError(error, "No se pudo unir a la sala.");
    }
  },
  leaveStreamRoom: async (roomId: string): Promise<RoomParticipant> => {
    try {
      const response = await api.post<RoomParticipant>(
        `${API_ROOMS_URL}/${roomId}/leave`,
        {}
      );
      return response.data;
    } catch (error) {
      throw toApiError(error, "No se pudo salir de la sala.");
    }
  },
  closeStreamRoom: async (roomId: string): Promise<CloseStreamResponse> => {
    try {
      const response = await api.post<CloseStreamResponse>(
        `${API_ROOMS_URL}/${roomId}/close`,
        {}
      );
      return normalizeCloseStreamResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        throw new Error("Solo el owner puede cerrar la transmision (403).");
      }
      throw toApiError(error, "No se pudo cerrar la sala.");
    }
  },
  createAnalyzeJob: async (
    videoId: string,
    payload: AnalyzeVideoJobRequest
  ): Promise<CreateAnalyzeJobResponse> => {
    const response = await api.post(
      `${API_VIDEOS_URL}/${videoId}/analyzeVideo`,
      payload
    );
    return normalizeCreateAnalyzeJobResponse(response.data);
  },
  getAnalyzeJobStatus: async (
    videoId: string,
    jobId: string
  ): Promise<AnalysisJob> => {
    const response = await api.get(
      `${API_VIDEOS_URL}/${videoId}/analyzeVideo/${jobId}/status`
    );
    return normalizeAnalysisJob(response.data);
  },
  getAnalysisResults: async (
    videoId: string,
    page = 1,
    limit = 20
  ): Promise<AnalysisResultsResponse> => {
    const response = await api.get(
      `${API_VIDEOS_URL}/${videoId}/analysis-results`,
      {
        params: { page, limit },
      }
    );
    return normalizeAnalysisResultsResponse(response.data, page, limit);
  },
  listNotifications: async (limit = 50): Promise<NotificationItem[]> => {
    const response = await api.get<NotificationItem[]>(API_NOTIFICATIONS_URL, {
      params: { limit },
    });
    return normalizeNotificationsResponse(response.data);
  },
  getNotifications: async (limit = 50): Promise<NotificationItem[]> => {
    const response = await api.get<NotificationItem[]>(API_NOTIFICATIONS_URL, {
      params: { limit },
    });
    return normalizeNotificationsResponse(response.data);
  },
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete<MessageResponse>(`${API_NOTIFICATIONS_URL}/${id}`);
  },
};
