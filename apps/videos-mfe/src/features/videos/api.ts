import axios from "axios";
import { Slot, Video, VideoStats, S3UploadObject, Field } from "./types";
import { VideosApi } from "./videosApi";

const api = axios.create({
  baseURL: "",
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
    return response.data;
  },
  createVideoStats: async (statsData: VideoStats): Promise<VideoStats> => {
    const response = await api.post<VideoStats>(API_VIDEO_STATS_URL, statsData);
    return response.data;
  },
  updateVideoStats: async (
    videoId: string,
    updateData: Partial<VideoStats>
  ): Promise<VideoStats> => {
    const response = await api.put<VideoStats>(
      `${API_VIDEO_STATS_URL}/${videoId}`,
      updateData
    );
    return response.data;
  },
  analyzeVideoWithGemini: async (videoId: string): Promise<VideoStats> => {
    const response = await api.post<VideoStats>(`/videos/${videoId}/analyze`, {});
    return response.data;
  },
};
