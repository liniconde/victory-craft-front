import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../utils/api";
import "./VideoForm.css";
import { Video } from "../../../interfaces/VideoInterfaces";
import { getVideo } from "../../../services/video/videoService";

interface VideoUploadFormProps {
  mode: "create" | "edit";
}

const VideoUploadForm: React.FC<VideoUploadFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();

  const [videoData, setVideoData] = useState<Video>({
    fieldId: "",
    s3Key: "",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 📌 Obtener datos del video si está en modo edición
  useEffect(() => {
    if (mode === "edit" && videoId) {
      const fetchVideoData = async () => {
        try {
          const video = await getVideo(videoId);
          setVideoData(video);
        } catch (error) {
          console.error("❌ Error fetching video:", error);
        }
      };

      fetchVideoData();
    }
  }, [mode, videoId]);

  // 📌 Manejar la selección del archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoFile(event.target.files[0]);
    }
  };

  // 📤 Subir el video a S3 y obtener la URL firmada
  const uploadVideoToS3 = async (): Promise<{ s3Key: string } | null> => {
    if (!videoFile) return null;

    try {
      setIsUploading(true);
      const fileType = videoFile.name.split(".").pop();

      // 1️⃣ Solicitar una URL firmada para subir el video
      const res = await api.get(`/videos/upload?videoId=${videoId || ""}&fileType=${fileType}`);
      const { uploadUrl, objectKey } = res.data;

      // 2️⃣ Subir el video a S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: videoFile,
        headers: { "Content-Type": `video/${fileType}` },
      });

      setIsUploading(false);
      return { s3Key: objectKey };
    } catch (error) {
      console.error("❌ Error uploading video:", error);
      setIsUploading(false);
      return null;
    }
  };

  // 📌 Manejo del envío del formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!videoFile) {
      alert("Please select a video file.");
      return;
    }

    const videoObject = await uploadVideoToS3();
    if (videoObject) {
      videoData.s3Key = videoObject.s3Key;
    }

    if (mode === "create") {
      api
        .post("/videos", videoData)
        .then(() => navigate(`/videos/${videoData.fieldId}`))
        .catch((error) => console.error("Error creating video:", error));
    } else if (videoId) {
      api
        .put(`/videos/${videoId}`, videoData)
        .then(() => navigate(`/videos/${videoData.fieldId}`))
        .catch((error) => console.error("Error updating video:", error));
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto px-8 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        {mode === "create" ? "Upload a New Video" : "Update Video"}
      </h2>

      <div className="video-form-container">
        <form onSubmit={handleSubmit} className="video-form">
          {/* Video File Upload */}
          <div>
            <label htmlFor="videoFile" className="video-form-label">
              Upload Video
            </label>
            <input
              id="videoFile"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="video-form-input"
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="video-form-button">
            {mode === "create" ? "Upload Video" : "Update Video"}
          </button>

          {isUploading && <p className="text-blue-500">Uploading video...</p>}
        </form>
      </div>
    </div>
  );
};

export default VideoUploadForm;
