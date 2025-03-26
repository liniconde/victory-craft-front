import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video } from "../../interfaces/VideoInterfaces";
import { Field } from "../../interfaces/FieldInterfaces";
import { getFields } from "../../services/field/fieldService";
import { getFieldVideos } from "../../services/video/videoService";

const FieldVideosPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const navigate = useNavigate();

  // Obtener las campos
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

  // Obtener los videos de la campo seleccionada
  useEffect(() => {
    const fetchVideos = async () => {
      if (!selectedFieldId) return;
      try {
        const videosList = await getFieldVideos(selectedFieldId);
        setVideos(videosList);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, [selectedFieldId]);

  // Reproducir video
  const handlePlayVideo = (video: Video) => {
    setActiveVideoUrl(video.videoUrl!);
  };

  // Redirigir a la página de creación de video
  const handleUploadNewVideo = () => {
    if (selectedFieldId) {
      navigate(`/fields/${selectedFieldId}/videos/create`);
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto px-8 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        🎥 Ver partidos
      </h2>

      {/* Selector de campo */}
      <div className="mb-6">
        <label htmlFor="field" className="block text-sm font-medium mb-1">
          Seleccciona un campo:
        </label>
        <select
          id="field"
          value={selectedFieldId}
          onChange={(e) => {
            setSelectedFieldId(e.target.value);
            setActiveVideoUrl(null); // Reset player when field changes
          }}
          className="w-full border border-gray-300 rounded px-4 py-2"
        >
          <option value="">-- Selecciona un campo --</option>
          {fields.map((field) => (
            <option key={field._id} value={field._id}>
              {field.name} ({field.type})
            </option>
          ))}
        </select>
      </div>

      {/* Botón de subir nuevo video */}
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

      {/* Listado de videos */}
      {selectedFieldId && (
        <div className="space-y-6">
          {videos.length === 0 ? (
            <p className="text-gray-500">
              No hay videos disponibles para este campo.
            </p>
          ) : (
            videos.map((video) => (
              <div
                key={video._id}
                className={`p-4 border rounded-lg shadow-sm transition hover:shadow-md bg-white flex items-center gap-4 ${
                  activeVideoUrl === video.videoUrl
                    ? "border-blue-500 ring-1 ring-blue-300"
                    : ""
                }`}
              >
                {/* Información del video - ocupa 5/6 del espacio */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    🎬 Video ID:{" "}
                    <span className="font-normal">{video._id}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    📁 Archivo:{" "}
                    <span className="text-gray-700">{video.s3Key}</span>
                  </p>
                  <p className="text-xs text-gray-400">🆔 Match ID: N/A</p>
                </div>

                {/* Botón reproducir - ocupa 1/6 del espacio */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handlePlayVideo(video)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition text-sm shadow-sm"
                  >
                    <span className="text-base">▶</span>
                    <span>Play</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reproductor de video */}
      {activeVideoUrl && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Reproduciendo ahora</h3>
          <video
            key={activeVideoUrl}
            controls
            width="100%"
            className="rounded shadow"
          >
            <source src={activeVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default FieldVideosPage;
