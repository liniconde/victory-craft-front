export interface RecruiterPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface RecruiterVideoLibraryItem {
  _id: string;
  s3Key: string;
  videoUrl?: string;
  playbackUrl?: string;
  uploadedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  sportType?: string;
  ownerUserId?: string;
}

export interface RecruiterVideoLibraryResponse {
  items: RecruiterVideoLibraryItem[];
  pagination: RecruiterPagination;
}

export interface RecruiterVideoLibraryCreatePayload {
  s3Key: string;
  sportType?: string;
  ownerUserId?: string;
  s3Url?: string;
  videoUrl?: string;
}

export interface RecruiterS3UploadResponse {
  uploadUrl?: string;
  url?: string;
  presignedUrl?: string;
  signedUrl?: string;
  s3Url?: string;
  fileUrl?: string;
  publicUrl?: string;
  objectKey?: string;
  key?: string;
  method?: string;
  headers?: Record<string, string>;
}

export interface RecruiterScoutingProfile {
  _id?: string;
  videoId: string;
  playerProfileId?: string | null;
  publicationStatus?: "draft" | "published" | "archived";
  title?: string;
  sportType?: string;
  playType?: string;
  tournamentType?: string;
  playerAge?: number;
  jerseyNumber?: number;
  tournamentName?: string;
  notes?: string;
  tags?: string[];
  recordedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterScoutingProfileEnvelope {
  video?: RecruiterVideoLibraryItem;
  scoutingProfile?: RecruiterScoutingProfile | null;
}

export interface RecruiterScoutingProfilePayload {
  playerProfileId?: string;
  publicationStatus?: "draft" | "published" | "archived";
  title?: string;
  sportType?: string;
  playType?: string;
  tournamentType?: string;
  playerAge?: number;
  jerseyNumber?: number;
  tournamentName?: string;
  notes?: string;
  tags?: string[];
  recordedAt?: string;
}

export interface RecruiterVotesSummary {
  videoId: string;
  upvotes: number;
  downvotes: number;
  netVotes: number;
  score: number;
  myVote?: -1 | 1 | null;
}

export interface RecruiterVoteUpsertResponse {
  vote?: {
    videoId?: string;
    userId?: string;
    value?: -1 | 1 | null;
  };
  summary: RecruiterVotesSummary;
  rankingItem?: RecruiterRankingItem;
}

export interface RecruiterVoteDeleteResponse {
  message?: string;
  summary: RecruiterVotesSummary;
  rankingItem?: RecruiterRankingItem;
}

export interface RecruiterRankingMetrics {
  score: number;
  upvotes: number;
  downvotes: number;
  netVotes: number;
}

export interface RecruiterRankingItem {
  video: RecruiterVideoLibraryItem;
  scoutingProfile?: RecruiterScoutingProfile | null;
  playerProfile?: RecruiterPlayerProfileSummary | null;
  ranking: RecruiterRankingMetrics;
  myVote?: -1 | 1 | null;
}

export interface RecruiterRankingsResponse {
  items: RecruiterRankingItem[];
  pagination: RecruiterPagination;
}

export interface RecruiterFiltersCatalog {
  sportTypes: string[];
  playTypes: string[];
  tournamentTypes: string[];
  countries: string[];
  cities: string[];
  playerPositions: string[];
  playerCategories: string[];
  tournaments: string[];
  tags: string[];
}

export interface RecruiterViewResponse {
  video?: RecruiterVideoLibraryItem;
  scoutingProfile?: RecruiterScoutingProfile | null;
  playerProfile?: RecruiterPlayerProfileSummary | null;
  ranking?: RecruiterVotesSummary;
  relatedVideos: Array<{
    video?: RecruiterVideoLibraryItem;
    scoutingProfile?: RecruiterScoutingProfile | null;
    playerProfile?: RecruiterPlayerProfileSummary | null;
  }>;
}

export interface RecruiterPlaybackResponse {
  videoId: string;
  playbackUrl: string;
}

export interface RecruiterRankingsQuery {
  sportType?: string;
  playType?: string;
  country?: string;
  city?: string;
  tournamentType?: string;
  playerPosition?: string;
  playerCategory?: string;
  tournamentName?: string;
  searchTerm?: string;
  sortBy?: "score" | "recent" | "upvotes";
  page?: number;
  limit?: number;
}

export interface RecruiterPlayerProfileSummary {
  _id: string;
  userId?: string | null;
  email?: string | null;
  fullName?: string;
  sportType?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  team?: string;
  category?: string;
  country?: string;
  city?: string;
  avatarUrl?: string;
  status?: "draft" | "active" | "archived";
}

export interface RecruiterPlayerProfile extends RecruiterPlayerProfileSummary {
  birthDate?: string;
  dominantProfile?: string;
  bio?: string;
  publicProfile?: RecruiterPlayerProfilePublicProfile | null;
  scoutingStats?: RecruiterPlayerProfileStatsBody | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterPlayerProfilePayload {
  userId?: string;
  email?: string;
  fullName?: string;
  sportType?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  team?: string;
  category?: string;
  country?: string;
  city?: string;
  birthDate?: string;
  dominantProfile?: string;
  bio?: string;
  avatarUrl?: string;
  status?: "draft" | "active" | "archived";
}

export interface RecruiterPlayerProfileListItem
  extends RecruiterPlayerProfileSummary {
  userName?: string;
}

export interface RecruiterPlayerProfilesQuery {
  page?: number;
  limit?: number;
  email?: string;
  userName?: string;
  fullName?: string;
  team?: string;
  sportType?: string;
  country?: string;
  city?: string;
  category?: string;
  status?: "draft" | "active" | "archived" | "";
}

export interface RecruiterPlayerProfilesResponse {
  items: RecruiterPlayerProfileListItem[];
  pagination: RecruiterPagination;
}

export interface RecruiterPlayerProfilesCatalog {
  sportTypes: string[];
  positions: string[];
  categories: string[];
  countries: string[];
  cities: string[];
}

export interface RecruiterPlayerProfileVideoLink {
  _id?: string;
  playerProfileId?: string;
  videoId?: string;
  linkedBy?: string | null;
  notes?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterPlayerProfileVideoLinkPayload {
  videoId: string;
  notes?: string;
  tags?: string[];
}

export interface RecruiterPlayerProfileVideoLinkResponse {
  link?: RecruiterPlayerProfileVideoLink;
  playerProfile?: RecruiterPlayerProfileSummary;
  video?: RecruiterVideoLibraryItem;
}

export interface RecruiterPlayerProfileVideosResponse {
  playerProfile?: RecruiterPlayerProfileSummary;
  items: Array<{
    link?: RecruiterPlayerProfileVideoLink;
    video?: RecruiterVideoLibraryItem;
    scoutingProfile?: RecruiterPlayerProfileVideoScoutingSummary | null;
  }>;
  pagination: RecruiterPagination;
}

export interface RecruiterPlayerProfileVideoScoutingSummary {
  _id?: string;
  videoId?: string;
  playerProfileId?: string | null;
  publicationStatus?: "draft" | "published" | "archived";
  playType?: string | null;
  title?: string | null;
  recordedAt?: string | null;
  updatedAt?: string | null;
}

export interface RecruiterPlayerProfileStatsSummary {
  totalVideos?: number;
  publishedVideos?: number;
  draftVideos?: number;
  archivedVideos?: number;
  videosWithoutScoutingProfile?: number;
  videosWithoutPlayType?: number;
}

export interface RecruiterPlayerProfilePlayTypeStatItem {
  playType?: string;
  count?: number;
}

export interface RecruiterPlayerProfileStatsBody {
  summary?: RecruiterPlayerProfileStatsSummary;
  playTypeStats?: Record<string, number>;
  playTypeItems?: RecruiterPlayerProfilePlayTypeStatItem[];
  updatedAt?: string;
}

export interface RecruiterPlayerProfileStatsResponse extends RecruiterPlayerProfileStatsBody {
  playerProfile?: {
    _id?: string;
    fullName?: string;
  };
}

export interface RecruiterPlayerProfilePublicProfile {
  isPublic?: boolean;
  publicSlug?: string | null;
  publicShareId?: string | null;
  publicPath?: string | null;
  sharePath?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RecruiterPlayerProfilePublicProfileUpsertPayload {
  isPublic?: boolean;
  publicSlug?: string | null;
}

export interface RecruiterPlayerProfilePublicProfileRegeneratePayload {
  regeneratePublicShareId?: boolean;
  regeneratePublicSlug?: boolean;
  publicSlug?: string | null;
}

export interface RecruiterPlayerProfilePublicProfileConfigResponse {
  playerProfile?: RecruiterPlayerProfile;
  publicProfile?: RecruiterPlayerProfilePublicProfile | null;
}

export interface RecruiterPublicPlayerProfile {
  fullName?: string;
  sportType?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  team?: string;
  category?: string;
  country?: string;
  city?: string;
  avatarUrl?: string;
  bio?: string;
  dominantProfile?: string;
  publicSlug?: string | null;
}

export interface RecruiterPublicPlayerProfileStatsSummary {
  totalVideos?: number;
  publishedVideos?: number;
}

export interface RecruiterPublicPlayerProfileStats {
  summary?: RecruiterPublicPlayerProfileStatsSummary;
  playTypeStats?: Record<string, number>;
  playTypeItems?: RecruiterPlayerProfilePlayTypeStatItem[];
  updatedAt?: string;
}

export interface RecruiterPublicPlayerProfileVideoItem {
  title?: string | null;
  playType?: string | null;
  publicationStatus?: "published";
  recordedAt?: string | null;
}

export interface RecruiterPublicPlayerProfileResponse {
  profile?: RecruiterPublicPlayerProfile;
  scoutingStats?: RecruiterPublicPlayerProfileStats | null;
  videos?: RecruiterPublicPlayerProfileVideoItem[];
}
