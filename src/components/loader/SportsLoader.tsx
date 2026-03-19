import { useMemo } from "react";
import "./SportsLoader.css";

interface SportsLoaderProps {
  message?: string;
  compact?: boolean;
  overlay?: boolean;
  className?: string;
}

const gifModules = import.meta.glob("../../assets/loaders/*.gif", {
  eager: true,
  import: "default",
});

const loaderGifs = Object.entries(gifModules)
  .map(([path, src]) => {
    const fileName = path.split("/").pop()?.replace(/\.gif$/i, "") || "Loader";
    const label = fileName
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return {
      src: String(src),
      label,
    };
  })
  .sort((left, right) => left.label.localeCompare(right.label));

export default function SportsLoader({
  message = "Cargando experiencia deportiva...",
  compact = false,
  overlay = false,
  className = "",
}: SportsLoaderProps) {
  const activeGif = useMemo(
    () =>
      loaderGifs.length
        ? loaderGifs[Math.floor(Math.random() * loaderGifs.length)]
        : null,
    []
  );

  return (
    <div
      className={`sports-loader ${compact ? "sports-loader--compact" : ""} ${
        overlay ? "sports-loader--overlay" : ""
      } ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="sports-loader__backdrop" />

      <div className="sports-loader__content">
        <div className="sports-loader__media-shell">
          {activeGif ? (
            <img
              className="sports-loader__gif"
              src={activeGif.src}
              alt=""
              aria-hidden="true"
            />
          ) : (
            <div className="sports-loader__fallback" aria-hidden="true" />
          )}
        </div>
        <span className="sports-loader__sr-only">
          {activeGif?.label ? `${activeGif.label}. ` : ""}
          {message}
        </span>
      </div>
    </div>
  );
}
