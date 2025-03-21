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

  // Obtener las canchas
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

  // Obtener los videos de la cancha seleccionada
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
        🎥 View Field Videos
      </h2>

      {/* Selector de cancha */}
      <div className="mb-6">
        <label htmlFor="field" className="block text-sm font-medium mb-1">
          Select a field:
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
          <option value="">-- Select a field --</option>
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
            ➕ Upload New Video
          </button>
        </div>
      )}

      {/* Listado de videos */}
      {selectedFieldId && (
        <div className="space-y-6">
          {videos.length === 0 ? (
            <p className="text-gray-500">No videos available for this field.</p>
          ) : (
            videos.map((video) => (
              <div
                key={video._id}
                className="p-4 border border-gray-200 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-gray-600">Video: {video._id}</p>
                  <p className="text-sm text-gray-600">Name: {video.s3Key}</p>
                  <p className="text-xs text-gray-400">Match ID: {"N/A"}</p>
                </div>
                <button
                  onClick={() => handlePlayVideo(video)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  ▶ Play
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reproductor de video */}
      {activeVideoUrl && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-2">Now Playing</h3>
          <video controls width="100%" className="rounded shadow">
            <source src={activeVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default FieldVideosPage;
