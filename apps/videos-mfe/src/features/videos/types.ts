export interface Video {
  _id: string;
  fieldId: string;
  s3Key: string;
  videoUrl?: string;
  slotId: string;
}

export interface Field {
  _id: string;
  name: string;
  type: string;
}

export interface TeamStats {
  teamName: string;
  stats: Record<string, number>;
  _id?: string;
}

export type SportType =
  | "football"
  | "padel"
  | "tennis"
  | "basketball"
  | "other";

export type ManualEventType = "pass" | "shot" | "goal" | "foul" | "other";
export type ManualEventTeam = "A" | "B";

export interface ManualEvent {
  id: string;
  time: number;
  type: ManualEventType;
  team: ManualEventTeam;
  note?: string;
}

export interface MatchStatMetric {
  total: number;
  teamA: number;
  teamB: number;
}

export interface MatchStats {
  passes: MatchStatMetric;
  shots: MatchStatMetric;
  goals: MatchStatMetric;
  fouls: MatchStatMetric;
  others: MatchStatMetric;
}

export interface VideoStats {
  summary?: string;
  _id?: string;
  videoId: string;
  sportType: SportType;
  teamAName?: string;
  teamBName?: string;
  events?: ManualEvent[];
  matchStats?: MatchStats;
  teams: TeamStats[];
  generatedByModel: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  statistics?: {
    summary?: string;
    sportType?: SportType;
    teamAName?: string;
    teamBName?: string;
    events?: ManualEvent[];
    matchStats?: MatchStats;
    teams: TeamStats[];
  };
}

export interface S3UploadObject {
  s3Url: string;
  objectKey: string;
  uploadUrl: string;
}

export interface Slot {
  _id: string;
  startTime: string;
  endTime: string;
  value: number;
  isAvailable: boolean;
}

export interface VideoLibraryItem {
  _id: string;
  s3Key: string;
  videoUrl?: string;
  playbackUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoLibraryCreateRequest {
  s3Key?: string;
  objectKey?: string;
  videoUrl?: string;
}

export interface VideoLibraryPaginatedResponse {
  items: VideoLibraryItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type MatchSessionStatus = "active" | "ended";
export type StreamRoomStatus = "active" | "closed";
export type RoomParticipantRole = "owner" | "participant";
export type RoomParticipantStatus = "active" | "left";

export interface MatchSession {
  _id: string;
  ownerId: string;
  title: string;
  status?: MatchSessionStatus;
  endedAt?: string;
  totalDurationSec?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMatchSessionRequest {
  title: string;
}

export interface StreamRoom {
  _id: string;
  matchSessionId: string;
  ownerId: string;
  status?: StreamRoomStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomParticipant {
  _id: string;
  roomId: string;
  userId: string;
  role?: RoomParticipantRole;
  joinedAt?: string;
  leftAt?: string;
  status?: RoomParticipantStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface StreamRoomDetails extends StreamRoom {
  participants?: RoomParticipant[];
  matchSession?: MatchSessionSummary;
}

export interface VideoSegment {
  _id: string;
  matchSessionId: string;
  roomId: string;
  libraryVideoId?: string;
  sequence: number;
  durationSec: number;
  startOffsetSec: number;
  endOffsetSec: number;
  s3Key: string;
  videoUrl: string;
  signedDownloadUrl?: string;
  uploadedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVideoSegmentRequest {
  roomId: string;
  libraryVideoId?: string;
  sequence: number;
  durationSec: number;
  startOffsetSec: number;
  endOffsetSec: number;
  s3Key: string;
  videoUrl: string;
}

export interface CreateVideoSegmentResponse {
  created: boolean;
  totalDurationSec?: number;
  lastSequence?: number;
  sequenceInfo?: {
    expectedNextSequence?: number;
    hasGap?: boolean;
  };
  segment: VideoSegment;
}

export interface RoomSegmentsResponse {
  items: VideoSegment[];
}

export interface MatchSessionSummary {
  _id: string;
  title: string;
  status?: MatchSessionStatus;
  totalDurationSec?: number;
  endedAt?: string;
}

export interface CloseStreamResponse {
  roomId: string;
  matchSessionId: string;
  endedAt?: string;
  totalDurationSec?: number;
  lastSequence?: number;
  status?: StreamRoomStatus;
}

export interface StreamClosedEventPayload {
  roomId: string;
  matchSessionId: string;
  endedAt?: string;
  totalDurationSec?: number;
  lastSequence?: number;
  status?: "closed";
}

export interface NotificationItem {
  _id: string;
  type: "analysis_queued" | "analysis_completed" | "analysis_failed" | "info";
  message: string;
  videoId?: string;
  analysisJobId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageResponse {
  message?: string;
}

export type AnalysisType = "agent_prompt" | "custom";
export type AnalysisJobStatus =
  | "queued"
  | "started"
  | "in_progress"
  | "completed"
  | "failed";

export interface AnalyzeVideoJobRequest {
  analysisType?: AnalysisType;
  prompt: string;
  sportType?: SportType;
  input?: Record<string, unknown>;
}

export interface AnalysisJob {
  _id?: string;
  videoId?: string;
  analysisType?: AnalysisType;
  status?: AnalysisJobStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  errorMessage?: string;
  sqsMessageId?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnalyzeJobResponse {
  message?: string;
  job: AnalysisJob;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface AnalysisResultItem {
  _id: string;
  analysisJobId?: string;
  analysisType?: AnalysisType;
  createdAt?: string;
  updatedAt?: string;
  videoId?: string;
  input?: {
    prompt?: string;
    [key: string]: unknown;
  };
  output?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

export interface AnalysisResultsResponse {
  items: AnalysisResultItem[];
  pagination?: PaginationInfo;
}
