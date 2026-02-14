import { getFields } from "../../../services/field/fieldService";
import {
  createVideo,
  getFieldVideos,
  getVideo,
  updateVideoById,
  uploadVideoS3,
} from "../../../services/video/videoService";
import {
  analyzeVideoWithGemini,
  createVideoStats,
  getVideoStatsByVideoId,
  updateVideoStats,
} from "../../../services/videoStats/videoStatsService";
import { VideosApi } from "../contracts/videosApi";

export const defaultVideosApi: VideosApi = {
  getFields,
  getFieldVideos,
  getVideo,
  uploadVideoS3,
  createVideo,
  updateVideoById,
  getVideoStatsByVideoId,
  createVideoStats,
  updateVideoStats,
  analyzeVideoWithGemini,
};
