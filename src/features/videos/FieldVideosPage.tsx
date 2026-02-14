import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video } from "../../interfaces/VideoInterfaces";
import { Field } from "../../interfaces/FieldInterfaces";
import { getFields } from "../../services/field/fieldService";
import { getFieldVideos } from "../../services/video/videoService";
import StatsSection from "./stats/StatsSection";
import "./FieldVideosPage.css";

const FieldVideosPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const fields = await getFields();
        setFields(fields);
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
    };
    fetchFields();
  }, []);

  const getField = (fieldId: string) => {
    return fields.find((f) => f._id === fieldId) || null;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        let videosList: Video[] = [];

        if (selectedFieldId) {
          videosList = await getFieldVideos(selectedFieldId);
        } else {
          const allFields = await getFields();
          setFields(allFields);
          const allVideosPromises = allFields.map((field) =>
            getFieldVideos(field._id)
          );
          const videosGrouped = await Promise.all(allVideosPromises);
          videosList = videosGrouped.flat();
        }

        setVideos(videosList);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, [selectedFieldId]);

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setActiveVideoUrl(video.videoUrl!);
  };

  const handleUploadNewVideo = () => {
    if (selectedFieldId) {
      navigate(`/fields/${selectedFieldId}/videos/create`);
    }
  };

  return (
    <div className="field-videos-container">
      <h2 className="field-videos-title">🎥 Ver partidos</h2>

      {/* Selector */}
      <div className="field-videos-select-container">
        <label htmlFor="field" className="field-videos-label">
          Selecciona un campo:
        </label>
        <select
          id="field"
          value={selectedFieldId}
          onChange={(e) => {
            setSelectedFieldId(e.target.value);
            setActiveVideoUrl(null);
          }}
          className="field-videos-select"
        >
          <option value="">-- Selecciona un campo --</option>
          {fields.map((field) => (
            <option key={field._id} value={field._id}>
              {field.name} ({field.type})
            </option>
          ))}
        </select>
      </div>

      {selectedFieldId && (
        <div className="flex justify-end mb-6">
          <button
            onClick={handleUploadNewVideo}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ➕ Sube un nuevo video
          </button>
        </div>
      )}

      {videos.length > 0 ? (
        <div className="space-y-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className={`video-card ${
                activeVideoUrl === video.videoUrl ? "active" : ""
              }`}
            >
              {/* 🎥 Mostrar vista previa del video siempre */}
              <video
                key={video.videoUrl}
                className="video-preview cursor-pointer"
                onClick={() => handlePlayVideo(video)}
                controls={activeVideoUrl === video.videoUrl}
                muted
              >
                <source src={video.videoUrl!} type="video/mp4" />
                Tu navegador no soporta el video.
              </video>

              {/* 📋 Información del video */}
              <div className="video-info mt-3">
                <p>
                  <strong>Archivo:</strong> {video.s3Key}
                </p>

                <p>
                  <strong>Campo:</strong>{" "}
                  {getField(video.fieldId)?.name || "N/A"}
                </p>
              </div>

              {/* ▶ Botón para reproducir si no está activo */}
              {activeVideoUrl !== video.videoUrl && (
                <button
                  onClick={() => handlePlayVideo(video)}
                  className="play-button mt-2"
                >
                  ▶ Ver video
                </button>
              )}

              {/* 📊 Mostrar estadísticas si está activo */}
              {activeVideoUrl === video.videoUrl && selectedVideo && (
                <StatsSection
                  videoId={selectedVideo._id}
                  sportType={
                    getField(selectedVideo.fieldId)?.type || "football"
                  }
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay videos disponibles aún.</p>
      )}
    </div>
  );
};

export default FieldVideosPage;
