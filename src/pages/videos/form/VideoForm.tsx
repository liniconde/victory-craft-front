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
import SlotSelector from "../../../components/slotSelector/slotSelector";
import { Slot } from "../../../interfaces/SlotInterfaces";
import { useAppFeedback } from "../../../hooks/useAppFeedback";

interface VideoUploadFormProps {
  mode: "create" | "edit";
}

const VideoUploadForm: React.FC<VideoUploadFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { videoId, fieldId } = useParams<{
    videoId: string;
    fieldId: string;
    slotId: string;
  }>();

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [videoData, setVideoData] = useState<Video>({
    _id: "",
    videoUrl: "",
    fieldId: "",
    s3Key: "",
    slotId: "",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);

  const { hideLoading, showError, showLoading } = useAppFeedback();

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
    const file = event.target.files?.[0];

    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isSizeValid = file.size <= 50 * 1024 * 1024; // 50 MB en bytes

    if (!isVideo) {
      showError("Solo puedes subir archivos de video.");
      return;
    }

    if (!isSizeValid) {
      showError("El archivo no puede superar los 50MB.");
      return;
    }

    // ✅ Si pasa las validaciones
    setVideoFile(file);
  };

  // 📤 Subir el video a S3 y obtener la URL firmada
  const uploadVideoToS3 = async (): Promise<S3UploadObject | null> => {
    if (!videoFile) return null;

    try {
      showLoading();
      const response = await uploadVideoS3(videoFile);
      return response;
    } catch (error) {
      console.error("Error uploading video:", error);
      showError("Error uploading video");
      return null;
    } finally {
      hideLoading();
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
    if (videoObject && selectedSlot) {
      videoData.s3Key = videoObject.objectKey;
      videoData.videoUrl = videoObject.uploadUrl;
      videoData.fieldId = fieldId!;
      videoData.slotId = selectedSlot._id;
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

      {fieldId && (
        <SlotSelector
          fieldId={fieldId!}
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
        />
      )}

      <div className="video-form-container">
        <form onSubmit={handleSubmit} className="video-form">
          {/* Video File Upload */}
          <div>
            <label htmlFor="videoFile" className="video-form-label">
              Subir Video
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
          <button
            type="submit"
            className="video-form-button"
            disabled={!selectedSlot || !videoFile}
          >
            {mode === "create" ? "Subir Video" : "Update Video"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUploadForm;
