import axios from "axios";
import { api } from "../../../../utils/api";
import type {
  RecruiterFiltersCatalog,
  RecruiterRankingItem,
  RecruiterRankingsQuery,
  RecruiterRankingsResponse,
  RecruiterScoutingProfile,
  RecruiterScoutingProfileEnvelope,
  RecruiterScoutingProfilePayload,
  RecruiterVideoLibraryItem,
  RecruiterVideoLibraryResponse,
  RecruiterViewResponse,
  RecruiterVoteDeleteResponse,
  RecruiterVoteUpsertResponse,
  RecruiterVotesSummary,
} from "../types";

const toRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

const numberOrZero = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const toValidationMessage = (issues: unknown): string | null => {
  if (!Array.isArray(issues) || issues.length === 0) return null;

  const labels: Record<string, string> = {
    title: "Título",
    sportType: "Deporte",
    playType: "Tipo de jugada",
    tournamentType: "Tipo de torneo",
    playerName: "Jugador",
    playerPosition: "Posición",
    playerTeam: "Equipo",
    playerCategory: "Categoría",
    dominantProfile: "Perfil dominante",
    country: "País",
    city: "Ciudad",
    tournamentName: "Torneo",
    recordedAt: "Fecha del clip",
  };

  const messages = issues
    .map((issue) => {
      const raw = toRecord(issue);
      const path = Array.isArray(raw.path) ? raw.path : [];
      const field = typeof path[0] === "string" ? path[0] : "";
      const label = labels[field] || field || "Campo";

      if (field === "recordedAt") {
        return `${label}: usa una fecha válida.`;
      }

      if (raw.code === "too_small") {
        return `${label}: este campo es obligatorio.`;
      }

      return `${label}: valor inválido.`;
    })
    .filter(Boolean);

  return messages.length ? messages.join(" ") : null;
};

const mapError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = toRecord(error.response?.data);
    const issueMessage = toValidationMessage(error.response?.data);
    const detail =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : "";

    if (status === 401) return new Error("Inicia sesión para continuar.");
    if (status === 403) {
      return new Error(detail || "No tienes permisos suficientes.");
    }
    if (status === 404) return new Error(detail || "Recurso no encontrado.");
    if (status === 409) return new Error(detail || "El perfil ya existe.");
    if (status === 400) return new Error(issueMessage || detail || "Solicitud inválida.");
  }

  return new Error(fallback);
};

const normalizeVideo = (item: unknown, index = 0): RecruiterVideoLibraryItem => {
  const raw = toRecord(item);
  return {
    _id: typeof raw._id === "string" ? raw._id : `video-${index}`,
    s3Key: typeof raw.s3Key === "string" ? raw.s3Key : "",
    videoUrl: typeof raw.videoUrl === "string" ? raw.videoUrl : undefined,
    playbackUrl:
      typeof raw.playbackUrl === "string" ? raw.playbackUrl : undefined,
    uploadedAt: typeof raw.uploadedAt === "string" ? raw.uploadedAt : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    sportType: typeof raw.sportType === "string" ? raw.sportType : undefined,
  };
};

const normalizePagination = (value: unknown) => {
  const raw = toRecord(value);
  return {
    page: Math.max(1, numberOrZero(raw.page) || 1),
    limit: Math.max(1, numberOrZero(raw.limit) || 20),
    total: Math.max(0, numberOrZero(raw.total)),
    totalPages: Math.max(1, numberOrZero(raw.totalPages) || 1),
    hasNextPage: typeof raw.hasNextPage === "boolean" ? raw.hasNextPage : undefined,
    hasPrevPage: typeof raw.hasPrevPage === "boolean" ? raw.hasPrevPage : undefined,
  };
};

const normalizeProfile = (value: unknown): RecruiterScoutingProfile => {
  const raw = toRecord(value);
  return {
    _id: typeof raw._id === "string" ? raw._id : undefined,
    videoId: typeof raw.videoId === "string" ? raw.videoId : "",
    title: typeof raw.title === "string" ? raw.title : undefined,
    sportType: typeof raw.sportType === "string" ? raw.sportType : undefined,
    playType: typeof raw.playType === "string" ? raw.playType : undefined,
    tournamentType: typeof raw.tournamentType === "string" ? raw.tournamentType : undefined,
    playerName: typeof raw.playerName === "string" ? raw.playerName : undefined,
    playerAge: typeof raw.playerAge === "number" ? raw.playerAge : undefined,
    playerPosition: typeof raw.playerPosition === "string" ? raw.playerPosition : undefined,
    playerTeam: typeof raw.playerTeam === "string" ? raw.playerTeam : undefined,
    playerCategory: typeof raw.playerCategory === "string" ? raw.playerCategory : undefined,
    jerseyNumber: typeof raw.jerseyNumber === "number" ? raw.jerseyNumber : undefined,
    dominantProfile:
      typeof raw.dominantProfile === "string" ? raw.dominantProfile : undefined,
    country: typeof raw.country === "string" ? raw.country : undefined,
    city: typeof raw.city === "string" ? raw.city : undefined,
    tournamentName:
      typeof raw.tournamentName === "string" ? raw.tournamentName : undefined,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((item): item is string => typeof item === "string")
      : undefined,
    recordedAt: typeof raw.recordedAt === "string" ? raw.recordedAt : undefined,
    createdBy: typeof raw.createdBy === "string" ? raw.createdBy : undefined,
    updatedBy: typeof raw.updatedBy === "string" ? raw.updatedBy : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
};

const normalizeSummary = (value: unknown): RecruiterVotesSummary => {
  const raw = toRecord(value);
  const myVote = raw.myVote;
  return {
    videoId: typeof raw.videoId === "string" ? raw.videoId : "",
    upvotes: numberOrZero(raw.upvotes),
    downvotes: numberOrZero(raw.downvotes),
    netVotes: numberOrZero(raw.netVotes),
    score: numberOrZero(raw.score),
    myVote: myVote === -1 || myVote === 1 ? myVote : null,
  };
};

const normalizeRankingItem = (value: unknown): RecruiterRankingItem => {
  const raw = toRecord(value);
  const rankingRaw = toRecord(raw.ranking);
  const myVote = raw.myVote;
  return {
    video: normalizeVideo(raw.video),
    scoutingProfile: raw.scoutingProfile ? normalizeProfile(raw.scoutingProfile) : null,
    ranking: {
      score: numberOrZero(rankingRaw.score),
      upvotes: numberOrZero(rankingRaw.upvotes),
      downvotes: numberOrZero(rankingRaw.downvotes),
      netVotes: numberOrZero(rankingRaw.netVotes),
    },
    myVote: myVote === -1 || myVote === 1 ? myVote : null,
  };
};

const normalizeLibraryResponse = (value: unknown): RecruiterVideoLibraryResponse => {
  const raw = toRecord(value);
  const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
  return {
    items: itemsRaw.map((item, index) => normalizeVideo(item, index)),
    pagination: normalizePagination(raw.pagination),
  };
};

export const recruitersApi = {
  getLibrary: async (
    page = 1,
    limit = 20,
    searchTerm = "",
    sportType?: string
  ): Promise<RecruiterVideoLibraryResponse> => {
    try {
      const response = await api.get("/videos/library", {
        params: {
          page,
          limit,
          ...(searchTerm.trim() ? { searchTerm: searchTerm.trim() } : {}),
          ...(sportType?.trim() ? { sportType: sportType.trim() } : {}),
        },
      });
      return normalizeLibraryResponse(response.data);
    } catch (error) {
      throw mapError(error, "No se pudo cargar la biblioteca.");
    }
  },
  getScoutingProfile: async (videoId: string): Promise<RecruiterScoutingProfileEnvelope> => {
    try {
      const response = await api.get(`/videos/library/${videoId}/scouting-profile`);
      const raw = toRecord(response.data);
      return {
        video: raw.video ? normalizeVideo(raw.video) : undefined,
        scoutingProfile: raw.scoutingProfile ? normalizeProfile(raw.scoutingProfile) : null,
      };
    } catch (error) {
      throw mapError(error, "No se pudo cargar el perfil de scouting.");
    }
  },
  createScoutingProfile: async (
    videoId: string,
    payload: RecruiterScoutingProfilePayload
  ): Promise<RecruiterScoutingProfileEnvelope> => {
    try {
      const response = await api.post(`/videos/library/${videoId}/scouting-profile`, payload);
      const raw = toRecord(response.data);
      return {
        video: raw.video ? normalizeVideo(raw.video) : undefined,
        scoutingProfile: raw.scoutingProfile ? normalizeProfile(raw.scoutingProfile) : null,
      };
    } catch (error) {
      throw mapError(error, "No se pudo crear el perfil de scouting.");
    }
  },
  updateScoutingProfile: async (
    videoId: string,
    payload: RecruiterScoutingProfilePayload
  ): Promise<RecruiterScoutingProfileEnvelope> => {
    try {
      const response = await api.put(`/videos/library/${videoId}/scouting-profile`, payload);
      const raw = toRecord(response.data);
      return {
        video: raw.video ? normalizeVideo(raw.video) : undefined,
        scoutingProfile: raw.scoutingProfile ? normalizeProfile(raw.scoutingProfile) : null,
      };
    } catch (error) {
      throw mapError(error, "No se pudo actualizar el perfil de scouting.");
    }
  },
  getVotesSummary: async (videoId: string): Promise<RecruiterVotesSummary> => {
    try {
      const response = await api.get(`/videos/library/${videoId}/votes/summary`);
      return normalizeSummary(response.data);
    } catch (error) {
      throw mapError(error, "No se pudo cargar el resumen de votos.");
    }
  },
  voteVideo: async (
    videoId: string,
    value: -1 | 0 | 1
  ): Promise<RecruiterVoteUpsertResponse | RecruiterVoteDeleteResponse> => {
    try {
      if (value === 0) {
        const response = await api.delete(`/videos/library/${videoId}/votes/me`);
        const raw = toRecord(response.data);
        return {
          message: typeof raw.message === "string" ? raw.message : undefined,
          summary: normalizeSummary(raw.summary),
        };
      }

      const response = await api.post(`/videos/library/${videoId}/votes`, { value });
      const raw = toRecord(response.data);
      const voteRaw = toRecord(raw.vote);
      return {
        vote: {
          videoId: typeof voteRaw.videoId === "string" ? voteRaw.videoId : undefined,
          userId: typeof voteRaw.userId === "string" ? voteRaw.userId : undefined,
          value: voteRaw.value === -1 || voteRaw.value === 1 ? voteRaw.value : null,
        },
        summary: normalizeSummary(raw.summary),
      };
    } catch (error) {
      throw mapError(error, "No se pudo actualizar el voto.");
    }
  },
  getRankings: async (query: RecruiterRankingsQuery = {}): Promise<RecruiterRankingsResponse> => {
    try {
      const response = await api.get("/videos/library/rankings", { params: query });
      const raw = toRecord(response.data);
      const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
      return {
        items: itemsRaw.map(normalizeRankingItem),
        pagination: normalizePagination(raw.pagination),
      };
    } catch (error) {
      throw mapError(error, "No se pudo cargar el ranking.");
    }
  },
  getTopRankings: async (
    query: Partial<RecruiterRankingsQuery> = {}
  ): Promise<RecruiterRankingItem[]> => {
    try {
      const response = await api.get("/videos/library/rankings/top", { params: query });
      const raw = toRecord(response.data);
      const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
      return itemsRaw.map(normalizeRankingItem);
    } catch (error) {
      throw mapError(error, "No se pudo cargar el top recruiter.");
    }
  },
  getFiltersCatalog: async (): Promise<RecruiterFiltersCatalog> => {
    try {
      const response = await api.get("/videos/library/filters/catalog");
      const raw = toRecord(response.data);
      const array = (value: unknown) =>
        Array.isArray(value)
          ? value.filter((item): item is string => typeof item === "string")
          : [];

      return {
        sportTypes: array(raw.sportTypes),
        playTypes: array(raw.playTypes),
        tournamentTypes: array(raw.tournamentTypes),
        countries: array(raw.countries),
        cities: array(raw.cities),
        playerPositions: array(raw.playerPositions),
        playerCategories: array(raw.playerCategories),
        tournaments: array(raw.tournaments),
        tags: array(raw.tags),
      };
    } catch (error) {
      throw mapError(error, "No se pudo cargar el catálogo de filtros.");
    }
  },
  getRecruiterView: async (videoId: string): Promise<RecruiterViewResponse> => {
    try {
      const response = await api.get(`/videos/library/${videoId}/recruiter-view`);
      const raw = toRecord(response.data);
      const related = Array.isArray(raw.relatedVideos) ? raw.relatedVideos : [];
      return {
        video: raw.video ? normalizeVideo(raw.video) : undefined,
        scoutingProfile: raw.scoutingProfile ? normalizeProfile(raw.scoutingProfile) : null,
        ranking: raw.ranking ? normalizeSummary(raw.ranking) : undefined,
        relatedVideos: related.map((item) => {
          const relatedRaw = toRecord(item);
          return {
            video: relatedRaw.video ? normalizeVideo(relatedRaw.video) : undefined,
            scoutingProfile: relatedRaw.scoutingProfile
              ? normalizeProfile(relatedRaw.scoutingProfile)
              : null,
          };
        }),
      };
    } catch (error) {
      throw mapError(error, "No se pudo cargar la vista recruiter.");
    }
  },
};
