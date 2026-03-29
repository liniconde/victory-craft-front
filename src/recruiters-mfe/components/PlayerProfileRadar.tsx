import React, { useMemo } from "react";
import "./PlayerProfileRadar.css";

export interface PlayerProfileRadarMetric {
  key: string;
  label: string;
  shortLabel?: string;
  value: number;
  ratio: number;
}

interface PlayerProfileRadarProps {
  eyebrow?: string;
  title?: string;
  caption?: string;
  metrics: PlayerProfileRadarMetric[];
}

const CHART_SIZE = 240;
const CENTER = CHART_SIZE / 2;
const RADIUS = 78;
const GRID_LEVELS = 4;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const getPoint = (index: number, total: number, scale: number) => {
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  return {
    x: CENTER + Math.cos(angle) * RADIUS * scale,
    y: CENTER + Math.sin(angle) * RADIUS * scale,
  };
};

const getTextAnchor = (x: number) => {
  if (x < CENTER - 12) return "end";
  if (x > CENTER + 12) return "start";
  return "middle";
};

const toPoints = (points: Array<{ x: number; y: number }>) =>
  points.map((point) => `${point.x},${point.y}`).join(" ");

const PlayerProfileRadar: React.FC<PlayerProfileRadarProps> = ({
  eyebrow = "Scouting Radar",
  title = "Radar de estadísticas",
  caption = "Escala relativa al KPI más alto disponible en este perfil.",
  metrics,
}) => {
  const safeMetrics = metrics.slice(0, 6);
  const radarPolygon = useMemo(
    () =>
      toPoints(
        safeMetrics.map((metric, index) =>
          getPoint(index, safeMetrics.length || 1, clamp(metric.ratio))
        )
      ),
    [safeMetrics]
  );

  const gridPolygons = useMemo(
    () =>
      Array.from({ length: GRID_LEVELS }, (_, index) => {
        const scale = (index + 1) / GRID_LEVELS;
        return toPoints(
          safeMetrics.map((_, metricIndex) =>
            getPoint(metricIndex, safeMetrics.length || 1, scale)
          )
        );
      }),
    [safeMetrics]
  );

  const spokes = useMemo(
    () =>
      safeMetrics.map((_, index) => ({
        start: { x: CENTER, y: CENTER },
        end: getPoint(index, safeMetrics.length || 1, 1),
      })),
    [safeMetrics]
  );

  const labels = useMemo(
    () =>
      safeMetrics.map((metric, index) => {
        const point = getPoint(index, safeMetrics.length || 1, 1.18);
        return {
          ...metric,
          x: point.x,
          y: point.y,
          anchor: getTextAnchor(point.x),
          shortLabel: metric.shortLabel || metric.label.slice(0, 4).toUpperCase(),
        };
      }),
    [safeMetrics]
  );

  return (
    <article className="player-profile-radar">
      <div className="player-profile-radar__header">
        <p>{eyebrow}</p>
        <h3>{title}</h3>
      </div>

      <div className="player-profile-radar__chart-shell">
        <div className="player-profile-radar__chart-frame">
          <svg
            viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
            className="player-profile-radar__svg"
            role="img"
            aria-label={title}
          >
            {gridPolygons.map((polygon, index) => (
              <polygon
                key={`grid-${index + 1}`}
                points={polygon}
                className="player-profile-radar__grid"
              />
            ))}

            {spokes.map((spoke, index) => (
              <line
                key={`spoke-${safeMetrics[index]?.key || index}`}
                x1={spoke.start.x}
                y1={spoke.start.y}
                x2={spoke.end.x}
                y2={spoke.end.y}
                className="player-profile-radar__spoke"
              />
            ))}

            <polygon points={radarPolygon} className="player-profile-radar__shape-fill" />
            <polygon points={radarPolygon} className="player-profile-radar__shape-stroke" />

            {safeMetrics.map((metric, index) => {
              const point = getPoint(index, safeMetrics.length || 1, clamp(metric.ratio));
              return (
                <circle
                  key={`point-${metric.key}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  className="player-profile-radar__point"
                />
              );
            })}

            {labels.map((label) => (
              <text
                key={`label-${label.key}`}
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                className="player-profile-radar__axis-label"
              >
                {label.shortLabel}
              </text>
            ))}
          </svg>
        </div>
      </div>

      <div className="player-profile-radar__metrics">
        {safeMetrics.map((metric) => (
          <article key={metric.key} className="player-profile-radar__metric">
            <span>{metric.shortLabel || metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <p className="player-profile-radar__caption">{caption}</p>
    </article>
  );
};

export default PlayerProfileRadar;
