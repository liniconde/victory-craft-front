import React, { useEffect, useState } from "react";
import SportsLoader from "../../components/loader/SportsLoader";

interface RecruitersVideoPlayerProps {
  src: string;
  className?: string;
  message?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: "none" | "metadata" | "auto";
}

const RecruitersVideoPlayer: React.FC<RecruitersVideoPlayerProps> = ({
  src,
  className,
  message = "Los sticks están calentando mientras el video queda listo.",
  autoPlay = false,
  muted = false,
  loop = false,
  preload = "metadata",
}) => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");

  useEffect(() => {
    setIsVideoReady(false);
    setOrientation("landscape");
  }, [src]);

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
        key={src}
        className={className}
        controls
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
      >
        <source src={src} />
      </video>
    </div>
  );
};

export default RecruitersVideoPlayer;
