import { Field, S3UploadObject, Slot, Video, VideoStats } from "./types";

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
  analyzeVideoWithGemini: (videoId: string) => Promise<VideoStats>;
}
