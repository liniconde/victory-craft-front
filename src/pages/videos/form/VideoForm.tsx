import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../utils/api";
import "./VideoForm.css";
import { Video } from "../../../interfaces/VideoInterfaces";
import {
  getVideo,
  S3UploadObject,
  uploadVideoS3,
} from "../../../services/video/videoService";

interface VideoUploadFormProps {
  mode: "create" | "edit";
}

const VideoUploadForm: React.FC<VideoUploadFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { videoId, fieldId } = useParams<{
    videoId: string;
    fieldId: string;
  }>();

  const [videoData, setVideoData] = useState<Video>({
    _id: "",
    videoUrl: "",
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
  const uploadVideoToS3 = async (): Promise<S3UploadObject | null> => {
    if (!videoFile) return null;

    try {
      setIsUploading(true);

      const response = await uploadVideoS3(videoFile);

      setIsUploading(false);
      return response;
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
    console.log("image iobjectt", videoObject);
    if (videoObject) {
      videoData.s3Key = videoObject.objectKey;
      videoData.videoUrl = videoObject.uploadUrl;
      videoData.fieldId = fieldId!;
    } else {
      alert("Error uploading File");
      return;
    }

    if (mode === "create") {
      api
        .post("/videos", videoData)
        .then(() => {
          navigate(`/fields/videos/`);
          alert("Video uploaded Succesfully");
        })
        .catch((error) => console.error("Error creating video:", error));
    } else if (videoId) {
      api
        .put(`/videos/${videoId}`, videoData)
        .then(() => {
          navigate(`/fields/videos/`);
          alert("Video updated Succesfully");
        })
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
