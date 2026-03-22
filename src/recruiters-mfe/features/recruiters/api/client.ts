import axios from "axios";
import { api, s3Api } from "../../../../utils/api";
import type {
  RecruiterFiltersCatalog,
  RecruiterRankingItem,
  RecruiterS3UploadResponse,
  RecruiterVideoLibraryCreatePayload,
  RecruiterPlayerProfile,
  RecruiterPlayerProfilesCatalog,
  RecruiterPlayerProfilesQuery,
  RecruiterPlayerProfilesResponse,
  RecruiterPlayerProfileSummary,
  RecruiterPlayerProfilePayload,
  RecruiterPlayerProfileVideoLink,
  RecruiterPlayerProfileVideoLinkPayload,
  RecruiterPlayerProfileVideoLinkResponse,
  RecruiterPlayerProfileVideosResponse,
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
  RecruiterPlaybackResponse,
} from "../types";
import {
  normalizeRecruiterSportType,
  sanitizeRecruiterSportTypes,
} from "../sportTypes";

const toRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const compactQueryParams = <T extends Record<string, unknown>>(params: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    })
  ) as Partial<T>;

const recruiterViewCache = new Map<string, Promise<RecruiterViewResponse>>();
const recruiterVideoUrlCache = new Map<
  string,
  { playbackUrl?: string; videoUrl?: string; expiresAt: number }
>();

const numberOrZero = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const SIGNED_URL_EXPIRY_SAFETY_WINDOW_MS = 30_000;

const readSignedUrlExpiry = (url: string | undefined): number => {
  if (!url) return 0;

  try {
    const parsed = new URL(url);
    const date = parsed.searchParams.get("X-Amz-Date");
    const expires = parsed.searchParams.get("X-Amz-Expires");
    if (!date || !expires) return 0;

    const matched = date.match(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/
    );
    if (!matched) return 0;

    const [, year, month, day, hour, minute, second] = matched;
    const issuedAt = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );

    return issuedAt + Number(expires) * 1000;
  } catch {
    return 0;
  }
};

const isSignedUrlUsable = (expiresAt: number): boolean =>
  expiresAt > Date.now() + SIGNED_URL_EXPIRY_SAFETY_WINDOW_MS;

export const getCachedRecruiterPlaybackUrl = (videoId: string): string | undefined => {
  const cached = recruiterVideoUrlCache.get(videoId);
  if (!cached || !isSignedUrlUsable(cached.expiresAt)) return undefined;
  return cached.playbackUrl || cached.videoUrl;
};

export const cacheRecruiterPlaybackUrl = (videoId: string, playbackUrl: string): string => {
  const expiresAt = readSignedUrlExpiry(playbackUrl);
  recruiterVideoUrlCache.set(videoId, {
    playbackUrl,
    videoUrl: playbackUrl,
    expiresAt,
  });
  return playbackUrl;
};

const resolveCachedVideoUrls = (
  videoId: string,
  playbackUrl?: string,
  videoUrl?: string
) => {
  const cached = recruiterVideoUrlCache.get(videoId);
  const nextExpiry = Math.max(readSignedUrlExpiry(playbackUrl), readSignedUrlExpiry(videoUrl));

  if (cached && isSignedUrlUsable(cached.expiresAt)) {
    return {
      playbackUrl: cached.playbackUrl || playbackUrl,
      videoUrl: cached.videoUrl || videoUrl,
      expiresAt: cached.expiresAt,
    };
  }

  if (nextExpiry > 0) {
    const nextValue = {
      playbackUrl,
      videoUrl,
      expiresAt: nextExpiry,
    };
    recruiterVideoUrlCache.set(videoId, nextValue);
    return nextValue;
  }

  recruiterVideoUrlCache.delete(videoId);
  return { playbackUrl, videoUrl, expiresAt: 0 };
};

const toValidationMessage = (issues: unknown): string | null => {
  if (!Array.isArray(issues) || issues.length === 0) return null;

  const labels: Record<string, string> = {
    playerProfileId: "Player profile",
    publicationStatus: "Estado de publicación",
    title: "Título",
    sportType: "Deporte",
    playType: "Tipo de jugada",
    tournamentType: "Tipo de torneo",
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
  const videoId =
    readString(raw._id) || readString(raw.id) || readString(raw.videoId) || `video-${index}`;
  const normalizedPlaybackUrl =
    typeof raw.playbackUrl === "string" ? raw.playbackUrl : undefined;
  const normalizedVideoUrl = typeof raw.videoUrl === "string" ? raw.videoUrl : undefined;
  const cachedUrls = resolveCachedVideoUrls(
    videoId,
    normalizedPlaybackUrl,
    normalizedVideoUrl
  );
  return {
    _id: videoId,
    s3Key: typeof raw.s3Key === "string" ? raw.s3Key : "",
    videoUrl: cachedUrls.videoUrl,
    playbackUrl: cachedUrls.playbackUrl,
    uploadedAt: typeof raw.uploadedAt === "string" ? raw.uploadedAt : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    sportType: normalizeRecruiterSportType(raw.sportType),
    ownerUserId: typeof raw.ownerUserId === "string" ? raw.ownerUserId : undefined,
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
    playerProfileId:
      typeof raw.playerProfileId === "string" ? raw.playerProfileId : raw.playerProfileId === null ? null : undefined,
    publicationStatus:
      raw.publicationStatus === "draft" ||
      raw.publicationStatus === "published" ||
      raw.publicationStatus === "archived"
        ? raw.publicationStatus
        : undefined,
    title: typeof raw.title === "string" ? raw.title : undefined,
    sportType: normalizeRecruiterSportType(raw.sportType),
    playType: typeof raw.playType === "string" ? raw.playType : undefined,
    tournamentType: typeof raw.tournamentType === "string" ? raw.tournamentType : undefined,
    playerAge: typeof raw.playerAge === "number" ? raw.playerAge : undefined,
    jerseyNumber: typeof raw.jerseyNumber === "number" ? raw.jerseyNumber : undefined,
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

const normalizePlayerProfileSummary = (value: unknown): RecruiterPlayerProfileSummary => {
  const raw = toRecord(value);
  const status = raw.status;
  return {
    _id: typeof raw._id === "string" ? raw._id : "",
    userId:
      typeof raw.userId === "string" ? raw.userId : raw.userId === null ? null : undefined,
    email: typeof raw.email === "string" ? raw.email : raw.email === null ? null : undefined,
    fullName: typeof raw.fullName === "string" ? raw.fullName : undefined,
    sportType: normalizeRecruiterSportType(raw.sportType),
    primaryPosition:
      typeof raw.primaryPosition === "string" ? raw.primaryPosition : undefined,
    secondaryPosition:
      typeof raw.secondaryPosition === "string" ? raw.secondaryPosition : undefined,
    team: typeof raw.team === "string" ? raw.team : undefined,
    category: typeof raw.category === "string" ? raw.category : undefined,
    country: typeof raw.country === "string" ? raw.country : undefined,
    city: typeof raw.city === "string" ? raw.city : undefined,
    avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : undefined,
    status:
      status === "draft" || status === "active" || status === "archived"
        ? status
        : undefined,
  };
};

const normalizePlayerProfile = (value: unknown): RecruiterPlayerProfile => {
  const raw = toRecord(value);
  const summary = normalizePlayerProfileSummary(value);
  return {
    ...summary,
    birthDate: typeof raw.birthDate === "string" ? raw.birthDate : undefined,
    dominantProfile:
      typeof raw.dominantProfile === "string" ? raw.dominantProfile : undefined,
    bio: typeof raw.bio === "string" ? raw.bio : undefined,
    createdBy:
      typeof raw.createdBy === "string" ? raw.createdBy : raw.createdBy === null ? null : undefined,
    updatedBy:
      typeof raw.updatedBy === "string" ? raw.updatedBy : raw.updatedBy === null ? null : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };
};

const normalizePlayerProfileListItem = (value: unknown) => {
  const raw = toRecord(value);
  return {
    ...normalizePlayerProfileSummary(value),
    userName: typeof raw.userName === "string" ? raw.userName : undefined,
  };
};

const normalizePlayerProfileVideoLink = (
  value: unknown
): RecruiterPlayerProfileVideoLink => {
  const raw = toRecord(value);
  return {
    _id: typeof raw._id === "string" ? raw._id : undefined,
    playerProfileId:
      typeof raw.playerProfileId === "string" ? raw.playerProfileId : undefined,
    videoId: typeof raw.videoId === "string" ? raw.videoId : undefined,
    linkedBy:
      typeof raw.linkedBy === "string" ? raw.linkedBy : raw.linkedBy === null ? null : undefined,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((item): item is string => typeof item === "string")
      : undefined,
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
    playerProfile: raw.playerProfile ? normalizePlayerProfileSummary(raw.playerProfile) : null,
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

const normalizeS3UploadResponse = (value: unknown): RecruiterS3UploadResponse => {
  const raw = toRecord(value);
  const headersRaw = toRecord(raw.headers);
  const headers = Object.fromEntries(
    Object.entries(headersRaw).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );

  return {
    uploadUrl: typeof raw.uploadUrl === "string" ? raw.uploadUrl : undefined,
    url: typeof raw.url === "string" ? raw.url : undefined,
    presignedUrl: typeof raw.presignedUrl === "string" ? raw.presignedUrl : undefined,
    signedUrl: typeof raw.signedUrl === "string" ? raw.signedUrl : undefined,
    s3Url: typeof raw.s3Url === "string" ? raw.s3Url : undefined,
    fileUrl: typeof raw.fileUrl === "string" ? raw.fileUrl : undefined,
    publicUrl: typeof raw.publicUrl === "string" ? raw.publicUrl : undefined,
    objectKey: typeof raw.objectKey === "string" ? raw.objectKey : undefined,
    key: typeof raw.key === "string" ? raw.key : undefined,
    method: typeof raw.method === "string" ? raw.method : undefined,
    headers,
  };
};

export const recruitersApi = {
  uploadLibraryVideoFile: async (
    file: File,
    scope = "videos/library"
  ): Promise<{ s3Key: string; s3Url?: string; videoUrl?: string }> => {
    try {
      const safeName = file.name.replace(/\s+/g, "-");
      const objectKey = `${scope}/${Date.now()}-${safeName}`;
      const response = await api.post("/videos/upload", { objectKey });
      const upload = normalizeS3UploadResponse(response.data);
      const uploadUrl = upload.uploadUrl || upload.presignedUrl || upload.signedUrl;
      const s3Key = upload.objectKey || upload.key || objectKey;

      if (!uploadUrl) {
        throw new Error("El backend no devolvió una URL válida para subir el video.");
      }

      await s3Api.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
          ...(upload.headers || {}),
        },
      });

      return {
        s3Key,
        s3Url: upload.s3Url || upload.publicUrl || upload.fileUrl || upload.url,
        videoUrl: upload.publicUrl || upload.fileUrl || upload.url || upload.s3Url,
      };
    } catch (error) {
      throw mapError(error, "No se pudo subir el video a library.");
    }
  },
  createLibraryVideo: async (
    payload: RecruiterVideoLibraryCreatePayload
  ): Promise<RecruiterVideoLibraryItem> => {
    try {
      const response = await api.post("/videos/library", {
        ...payload,
        sportType: normalizeRecruiterSportType(payload.sportType),
      });
      return normalizeVideo(response.data);
    } catch (error) {
      throw mapError(error, "No se pudo registrar el video en library.");
    }
  },
  uploadPlayerAvatar: async (
    file: File,
    scope = "player-profiles"
  ): Promise<{ avatarUrl: string; objectKey?: string }> => {
    try {
      const safeName = file.name.replace(/\s+/g, "-");
      const objectKey = `${scope}/${Date.now()}-${safeName}`;
      const response = await api.post("/images/upload", { objectKey });
      const upload = normalizeS3UploadResponse(response.data);
      const uploadUrl = upload.uploadUrl || upload.presignedUrl || upload.signedUrl;

      if (!uploadUrl) {
        throw new Error("El backend no devolvió una URL válida para subir la imagen.");
      }

      await s3Api.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
          ...(upload.headers || {}),
        },
      });

      const avatarUrl =
        upload.publicUrl ||
        upload.fileUrl ||
        upload.s3Url ||
        upload.url ||
        "";

      if (!avatarUrl) {
        throw new Error("La subida terminó pero no se recibió una URL pública para el avatar.");
      }

      return { avatarUrl, objectKey: upload.objectKey || upload.key };
    } catch (error) {
      throw mapError(error, "No se pudo subir la foto del jugador.");
    }
  },
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
          ...(normalizeRecruiterSportType(sportType)
            ? { sportType: normalizeRecruiterSportType(sportType) }
            : {}),
        },
      });
      return normalizeLibraryResponse(response.data);
    } catch (error) {
      throw mapError(error, "No se pudo cargar la biblioteca.");
    }
  },
  getMyLibrary: async (
    page = 1,
    limit = 20,
    searchTerm = "",
    sportType?: string
  ): Promise<RecruiterVideoLibraryResponse> => {
    try {
      const response = await api.get("/videos/library/mine", {
        params: {
          page,
          limit,
          ...(searchTerm.trim() ? { searchTerm: searchTerm.trim() } : {}),
          ...(normalizeRecruiterSportType(sportType)
            ? { sportType: normalizeRecruiterSportType(sportType) }
            : {}),
        },
      });
      return normalizeLibraryResponse(response.data);
    } catch (error) {
      throw mapError(error, "No se pudo cargar tu biblioteca.");
    }
  },
  getMyPlayerProfile: async (): Promise<RecruiterPlayerProfile> => {
    try {
      const response = await api.get("/recruiters/player-profiles/me");
      return normalizePlayerProfile(response.data);
    } catch (error) {
      throw mapError(error, "No se pudo cargar tu player profile.");
    }
  },
  listPlayerProfiles: async (
    query: RecruiterPlayerProfilesQuery = {}
  ): Promise<RecruiterPlayerProfilesResponse> => {
    try {
      const normalizedQuery = {
        ...query,
        ...(normalizeRecruiterSportType(query.sportType)
          ? { sportType: normalizeRecruiterSportType(query.sportType) }
          : query.sportType
            ? { sportType: undefined }
            : {}),
      };
      const response = await api.get("/recruiters/player-profiles", { params: normalizedQuery });
      const raw = toRecord(response.data);
      const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
      return {
        items: itemsRaw.map(normalizePlayerProfileListItem),
        pagination: normalizePagination(raw.pagination),
      };
    } catch (error) {
      throw mapError(error, "No se pudo buscar player profiles.");
    }
  },
  getPlayerProfilesCatalog: async (): Promise<RecruiterPlayerProfilesCatalog> => {
    try {
      const response = await api.get("/recruiters/player-profiles/catalog");
      const raw = toRecord(response.data);
      const array = (value: unknown) =>
        Array.isArray(value)
          ? value.filter((item): item is string => typeof item === "string")
          : [];
      return {
        sportTypes: sanitizeRecruiterSportTypes(array(raw.sportTypes)),
        positions: array(raw.positions),
        categories: array(raw.categories),
        countries: array(raw.countries),
        cities: array(raw.cities),
      };
    } catch (error) {
      throw mapError(error, "No se pudo cargar el catálogo de player profiles.");
    }
  },
  getPlayerProfile: async (profileId: string): Promise<RecruiterPlayerProfile> => {
    try {
      const response = await api.get(`/recruiters/player-profiles/${profileId}`);
      return normalizePlayerProfile(response.data);
    } catch (error) {
      throw mapError(error, "No se pudo cargar el player profile.");
    }
  },
  createPlayerProfile: async (
    payload: RecruiterPlayerProfilePayload
  ): Promise<RecruiterPlayerProfile> => {
    try {
      const response = await api.post("/recruiters/player-profiles", {
        ...payload,
        sportType: normalizeRecruiterSportType(payload.sportType),
      });
      return normalizePlayerProfile(response.data);
    } catch (error) {
      throw mapError(error, "No se pudo crear el player profile.");
    }
  },
  updatePlayerProfile: async (
    profileId: string,
    payload: RecruiterPlayerProfilePayload
  ): Promise<RecruiterPlayerProfile> => {
    try {
      const response = await api.put(`/recruiters/player-profiles/${profileId}`, {
        ...payload,
        sportType: normalizeRecruiterSportType(payload.sportType),
      });
      return normalizePlayerProfile(response.data);
    } catch (error) {
      throw mapError(error, "No se pudo actualizar el player profile.");
    }
  },
  linkVideoToPlayerProfile: async (
    profileId: string,
    payload: RecruiterPlayerProfileVideoLinkPayload
  ): Promise<RecruiterPlayerProfileVideoLinkResponse> => {
    try {
      const response = await api.post(`/recruiters/player-profiles/${profileId}/videos`, payload);
      const raw = toRecord(response.data);
      return {
        link: raw.link ? normalizePlayerProfileVideoLink(raw.link) : undefined,
        playerProfile: raw.playerProfile
          ? normalizePlayerProfileSummary(raw.playerProfile)
          : undefined,
        video: raw.video ? normalizeVideo(raw.video) : undefined,
      };
    } catch (error) {
      throw mapError(error, "No se pudo vincular el video al player profile.");
    }
  },
  getPlayerProfileVideos: async (
    profileId: string,
    page = 1,
    limit = 20
  ): Promise<RecruiterPlayerProfileVideosResponse> => {
    try {
      const response = await api.get(`/recruiters/player-profiles/${profileId}/videos`, {
        params: { page, limit },
      });
      const raw = toRecord(response.data);
      const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
      return {
        playerProfile: raw.playerProfile
          ? normalizePlayerProfileSummary(raw.playerProfile)
          : undefined,
        items: itemsRaw.map((item) => {
          const itemRaw = toRecord(item);
          return {
            link: itemRaw.link ? normalizePlayerProfileVideoLink(itemRaw.link) : undefined,
            video: itemRaw.video ? normalizeVideo(itemRaw.video) : undefined,
          };
        }),
        pagination: normalizePagination(raw.pagination),
      };
    } catch (error) {
      throw mapError(error, "No se pudieron cargar los videos del player profile.");
    }
  },
  unlinkVideoFromPlayerProfile: async (
    profileId: string,
    videoId: string
  ): Promise<RecruiterPlayerProfileVideoLinkResponse> => {
    try {
      const response = await api.delete(
        `/recruiters/player-profiles/${profileId}/videos/${videoId}`
      );
      const raw = toRecord(response.data);
      return {
        playerProfile: raw.playerProfile
          ? normalizePlayerProfileSummary(raw.playerProfile)
          : undefined,
        video: raw.video ? normalizeVideo(raw.video) : undefined,
      };
    } catch (error) {
      throw mapError(error, "No se pudo desvincular el video del player profile.");
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
      const response = await api.post(`/videos/library/${videoId}/scouting-profile`, {
        ...payload,
        sportType: normalizeRecruiterSportType(payload.sportType),
      });
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
      const response = await api.put(`/videos/library/${videoId}/scouting-profile`, {
        ...payload,
        sportType: normalizeRecruiterSportType(payload.sportType),
      });
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
          rankingItem: raw.rankingItem ? normalizeRankingItem(raw.rankingItem) : undefined,
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
        rankingItem: raw.rankingItem ? normalizeRankingItem(raw.rankingItem) : undefined,
      };
    } catch (error) {
      throw mapError(error, "No se pudo actualizar el voto.");
    }
  },
  getVideoPlayback: async (videoId: string): Promise<RecruiterPlaybackResponse> => {
    const cachedPlaybackUrl = getCachedRecruiterPlaybackUrl(videoId);
    if (cachedPlaybackUrl) {
      return {
        videoId,
        playbackUrl: cachedPlaybackUrl,
      };
    }

    try {
      const response = await api.get(`/videos/library/${videoId}/playback`);
      const raw = toRecord(response.data);
      const playbackUrl = readString(raw.playbackUrl);

      if (!playbackUrl) {
        throw new Error("No se recibio una URL de reproduccion valida.");
      }

      return {
        videoId: typeof raw.videoId === "string" ? raw.videoId : videoId,
        playbackUrl: cacheRecruiterPlaybackUrl(videoId, playbackUrl),
      };
    } catch (error) {
      throw mapError(error, "No se pudo resolver la reproduccion del video.");
    }
  },
  getRankings: async (query: RecruiterRankingsQuery = {}): Promise<RecruiterRankingsResponse> => {
    try {
      const normalizedQuery = compactQueryParams({
        ...query,
        ...(normalizeRecruiterSportType(query.sportType)
          ? { sportType: normalizeRecruiterSportType(query.sportType) }
          : query.sportType
            ? { sportType: undefined }
            : {}),
      });
      const response = await api.get("/videos/library/rankings", { params: normalizedQuery });
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
      const normalizedQuery = compactQueryParams({
        ...query,
        ...(normalizeRecruiterSportType(query.sportType)
          ? { sportType: normalizeRecruiterSportType(query.sportType) }
          : query.sportType
            ? { sportType: undefined }
            : {}),
      });
      const response = await api.get("/videos/library/rankings/top", { params: normalizedQuery });
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
        sportTypes: sanitizeRecruiterSportTypes(array(raw.sportTypes)),
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
    const cached = recruiterViewCache.get(videoId);
    if (cached) return cached;

    const request = api
      .get(`/videos/library/${videoId}/recruiter-view`)
      .then((response) => {
        const raw = toRecord(response.data);
        const related = Array.isArray(raw.relatedVideos) ? raw.relatedVideos : [];
        return {
          video: raw.video ? normalizeVideo(raw.video) : undefined,
          scoutingProfile: raw.scoutingProfile ? normalizeProfile(raw.scoutingProfile) : null,
          playerProfile: raw.playerProfile
            ? normalizePlayerProfileSummary(raw.playerProfile)
            : null,
          ranking: raw.ranking ? normalizeSummary(raw.ranking) : undefined,
          relatedVideos: related.map((item) => {
            const relatedRaw = toRecord(item);
            return {
              video: relatedRaw.video ? normalizeVideo(relatedRaw.video) : undefined,
              scoutingProfile: relatedRaw.scoutingProfile
                ? normalizeProfile(relatedRaw.scoutingProfile)
                : null,
              playerProfile: relatedRaw.playerProfile
                ? normalizePlayerProfileSummary(relatedRaw.playerProfile)
                : null,
            };
          }),
        };
      })
      .catch((error) => {
        recruiterViewCache.delete(videoId);
        throw mapError(error, "No se pudo cargar la vista recruiter.");
      });

    recruiterViewCache.set(videoId, request);
    return request;
  },
  prefetchRecruiterView: async (videoId: string): Promise<void> => {
    try {
      await recruitersApi.getRecruiterView(videoId);
    } catch {
      // Ignore prefetch failures; the page handles the real fetch error on navigation.
    }
  },
};
