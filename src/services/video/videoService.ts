import axios from "axios";
import { api, s3Api } from "../../utils/api";
import { Video } from "../../interfaces/VideoInterfaces";

const API_VIDEOS_URL = "/videos";

export interface S3UploadObject {
  s3Url: string;
  objectKey: string;
  uploadUrl: string;
}

// 📌 Función para hacer login y almacenar el token
export const getFieldVideos = async (fieldId: string): Promise<Video[]> => {
  try {
    const response = await api.get<Video[]>(`fields/${fieldId}/videos/`);
    return response.data;
  } catch (error) {
    console.error("Error getting Field videos:", error);
    throw error;
  }
};

// 📌 Función para hacer login y almacenar el token
export const getVideo = async (videoId: string): Promise<Video> => {
  try {
    const response = await api.get<Video>(`videos/${videoId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting Field videos:", error);
    throw error;
  }
};

export const createVideo = async (videoData: Video): Promise<Video> => {
  try {
    const response = await api.post<Video>(API_VIDEOS_URL, videoData);
    return response.data;
  } catch (error) {
    console.error("Error creating video:", error);
    throw error;
  }
};

export const getS3UploadVideoUrl = async (
  videoFile: File,
  fieldId: string
): Promise<S3UploadObject> => {
  try {
    const result = await api.post(`${API_VIDEOS_URL}/upload`, {
      objectKey: `videos/fields/${fieldId}/${videoFile.name}`,
    });

    const videoObject: S3UploadObject = result.data;

    console.log("data obtenida", videoObject);

    await s3Api.put(videoObject.uploadUrl, videoFile);

    return videoObject;
  } catch (error) {
    console.error("Error getting S3 upload video", error);
    throw error;
  }
};

export const uploadVideoS3 = async (
  videoFile: File
): Promise<S3UploadObject> => {
  try {
    console.log("videofile", videoFile.name, videoFile.size);
    const fileType = videoFile.name.split(".").pop();

    const response = await api.post("/videos/upload", {
      objectKey: videoFile.name,
      fileType,
    });

    const data: S3UploadObject = response.data;

    console.log("dataa", data)

    await axios.put(data.uploadUrl, videoFile, {
      method: "PUT",
      headers: { "Content-Type": videoFile.type },
    });

    return data;
  } catch (error) {
    console.error("Error uploading video", error);
    throw error;
  }
};

// 📌 Función para hacer login y almacenar el token
export const updateVideo = async (videoId: string): Promise<Video> => {
  try {
    const response = await api.get<Video>(`videos/${videoId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting Field videos:", error);
    throw error;
  }
};

export const updateVideoById = async (
  videoId: string,
  videoData: Video
): Promise<Video> => {
  try {
    const response = await api.put<Video>(`${API_VIDEOS_URL}/${videoId}`, videoData);
    return response.data;
  } catch (error) {
    console.error("Error updating video:", error);
    throw error;
  }
};
