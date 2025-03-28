import { api } from "../../utils/api";

const API_VIDEO_STATS_URL = "/video-stats";

export interface TeamStats {
  teamName: string;
  stats: Record<string, number>;
}

export interface VideoStats {
  _id?: string;
  videoId: string;
  sportType: string;
  teams: TeamStats[];
  generatedByModel: string;
  createdAt?: string;
  updatedAt?: string;
}

// 📌 Crear estadísticas de video
export const createVideoStats = async (
  statsData: VideoStats
): Promise<VideoStats> => {
  try {
    const response = await api.post<VideoStats>(API_VIDEO_STATS_URL, statsData);
    return response.data;
  } catch (error) {
    console.error("Error creating video stats:", error);
    throw error;
  }
};

// 📌 Obtener estadísticas por ID de video
export const getVideoStatsByVideoId = async (
  videoId: string
): Promise<VideoStats> => {
  try {
    const response = await api.get<VideoStats>(
      `${API_VIDEO_STATS_URL}/${videoId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching video stats:", error);
    throw error;
  }
};

// 📌 Actualizar estadísticas por ID de video
export const updateVideoStats = async (
  videoId: string,
  updateData: Partial<VideoStats>
): Promise<VideoStats> => {
  try {
    const response = await api.put<VideoStats>(
      `${API_VIDEO_STATS_URL}/${videoId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating video stats:", error);
    throw error;
  }
};

// 📌 Eliminar estadísticas por ID de video
export const deleteVideoStats = async (
  videoId: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(
      `${API_VIDEO_STATS_URL}/${videoId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting video stats:", error);
    throw error;
  }
};
