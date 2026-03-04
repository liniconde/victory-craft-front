import {
  AnalysisJob,
  AnalysisResultsResponse,
  AnalyzeVideoJobRequest,
  CloseStreamResponse,
  CreateMatchSessionRequest,
  CreateVideoSegmentRequest,
  CreateVideoSegmentResponse,
  CreateAnalyzeJobResponse,
  Field,
  NotificationItem,
  RoomParticipant,
  RoomSegmentsResponse,
  S3UploadObject,
  Slot,
  StreamRoom,
  StreamRoomDetails,
  Video,
  VideoLibraryCreateRequest,
  VideoLibraryPaginatedResponse,
  MatchSession,
  VideoStats,
} from "./types";

export interface VideosApi {
  getFields: () => Promise<Field[]>;
  getFieldSlots: (fieldId: string) => Promise<Slot[]>;
  getFieldVideos: (fieldId: string) => Promise<Video[]>;
  getVideo: (videoId: string) => Promise<Video>;
  uploadVideoS3: (videoFile: File) => Promise<S3UploadObject>;
  createVideo: (videoData: Video) => Promise<Video>;
  updateVideoById: (videoId: string, videoData: Video) => Promise<Video>;
  getVideoStatsByVideoId: (videoId: string) => Promise<VideoStats>;
  createVideoStats: (statsData: VideoStats) => Promise<VideoStats>;
  updateVideoStats: (
    videoId: string,
    updateData: Partial<VideoStats>
  ) => Promise<VideoStats>;
  deleteVideoStats: (videoId: string) => Promise<void>;
  analyzeVideoWithGemini: (videoId: string) => Promise<VideoStats>;
  getVideoLibrary: (
    page?: number,
    limit?: number
  ) => Promise<VideoLibraryPaginatedResponse>;
  createLibraryVideo: (
    payload: VideoLibraryCreateRequest
  ) => Promise<Video>;
  createMatchSession: (payload: CreateMatchSessionRequest) => Promise<MatchSession>;
  createStreamRoom: (matchSessionId: string) => Promise<StreamRoom>;
  publishMatchSegment: (
    matchSessionId: string,
    payload: CreateVideoSegmentRequest
  ) => Promise<CreateVideoSegmentResponse>;
  getStreamRoomDetails: (roomId: string) => Promise<StreamRoomDetails>;
  getRoomSegments: (
    roomId: string,
    afterSequence?: number
  ) => Promise<RoomSegmentsResponse>;
  joinStreamRoom: (roomId: string) => Promise<RoomParticipant>;
  leaveStreamRoom: (roomId: string) => Promise<RoomParticipant>;
  closeStreamRoom: (roomId: string) => Promise<CloseStreamResponse>;
  createAnalyzeJob: (
    videoId: string,
    payload: AnalyzeVideoJobRequest
  ) => Promise<CreateAnalyzeJobResponse>;
  getAnalyzeJobStatus: (videoId: string, jobId: string) => Promise<AnalysisJob>;
  getAnalysisResults: (
    videoId: string,
    page?: number,
    limit?: number
  ) => Promise<AnalysisResultsResponse>;
  listNotifications: (limit?: number) => Promise<NotificationItem[]>;
  getNotifications: (limit?: number) => Promise<NotificationItem[]>;
  deleteNotification: (id: string) => Promise<void>;
}
