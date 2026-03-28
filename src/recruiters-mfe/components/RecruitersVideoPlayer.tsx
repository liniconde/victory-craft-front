import React, { useEffect, useRef, useState } from "react";
import SportsLoader from "../../components/loader/SportsLoader";

interface RecruitersVideoPlayerProps {
  src: string;
  className?: string;
  message?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: "none" | "metadata" | "auto";
  controls?: boolean;
  isActive?: boolean;
}

const RecruitersVideoPlayer: React.FC<RecruitersVideoPlayerProps> = ({
  src,
  className,
  message = "Los sticks están calentando mientras el video queda listo.",
  autoPlay = false,
  muted = false,
  loop = false,
  preload = "metadata",
  controls = true,
  isActive = true,
}) => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setIsVideoReady(false);
    setOrientation("landscape");
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isActive) {
      video.pause();
      return;
    }

    if (!autoPlay) return;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => undefined);
    }
  }, [autoPlay, isActive, src]);

  return (
    <div className={`recruiters-video-player is-${orientation}`}>
      {!isVideoReady ? (
        <SportsLoader
          compact
          overlay
          className="sports-loader--video"
          message={message}
        />
      ) : null}
      <video
        ref={videoRef}
        className={className}
        src={src}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload={preload}
        onLoadedMetadata={(event) => {
          const { videoWidth, videoHeight } = event.currentTarget;
          setOrientation(videoHeight > videoWidth ? "portrait" : "landscape");
        }}
        onLoadedData={() => setIsVideoReady(true)}
        onCanPlay={() => setIsVideoReady(true)}
      />
    </div>
  );
};

export default RecruitersVideoPlayer;
