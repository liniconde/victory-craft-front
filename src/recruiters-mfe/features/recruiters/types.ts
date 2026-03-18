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
}

export interface RecruiterVideoLibraryResponse {
  items: RecruiterVideoLibraryItem[];
  pagination: RecruiterPagination;
}

export interface RecruiterScoutingProfile {
  _id?: string;
  videoId: string;
  title?: string;
  sportType?: string;
  playType?: string;
  tournamentType?: string;
  playerName?: string;
  playerAge?: number;
  playerPosition?: string;
  playerTeam?: string;
  playerCategory?: string;
  jerseyNumber?: number;
  dominantProfile?: string;
  country?: string;
  city?: string;
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
  title?: string;
  sportType?: string;
  playType?: string;
  tournamentType?: string;
  playerName?: string;
  playerAge?: number;
  playerPosition?: string;
  playerTeam?: string;
  playerCategory?: string;
  jerseyNumber?: number;
  dominantProfile?: string;
  country?: string;
  city?: string;
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
}

export interface RecruiterVoteDeleteResponse {
  message?: string;
  summary: RecruiterVotesSummary;
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
  ranking?: RecruiterVotesSummary;
  relatedVideos: Array<{
    video?: RecruiterVideoLibraryItem;
    scoutingProfile?: RecruiterScoutingProfile | null;
  }>;
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
  includeWithoutProfile?: boolean;
}
