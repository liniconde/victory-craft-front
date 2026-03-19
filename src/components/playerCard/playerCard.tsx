import React from "react";
import { FaUserCircle } from "react-icons/fa";
import "./playerCard.css";
import { getRecruiterSportTypeLabel } from "../../recruiters-mfe/features/recruiters/sportTypes";

type PlayerCardProps = {
  fullName?: string;
  primaryPosition?: string;
  secondaryPosition?: string;
  country?: string;
  team?: string;
  category?: string;
  dominantProfile?: string;
  sportType?: string;
  avatarUrl?: string;
  status?: string;
  profileVideosCount?: number;
};

const clampStat = (value: number) => Math.max(40, Math.min(99, Math.round(value)));

const estimateStats = ({
  sportType,
  primaryPosition,
  category,
  profileVideosCount = 0,
}: PlayerCardProps) => {
  const sportBoost =
    sportType?.toLowerCase() === "football"
      ? 6
      : sportType?.toLowerCase() === "basketball"
        ? 4
        : 2;
  const categoryBoost = category?.toLowerCase().includes("professional")
    ? 8
    : category?.toLowerCase().includes("senior")
      ? 5
      : 2;
  const videoBoost = Math.min(profileVideosCount * 2, 10);
  const position = primaryPosition?.toLowerCase() || "";

  const attackBias = /forward|winger|shooting guard/.test(position) ? 8 : 0;
  const defenseBias = /back|def|goalkeeper|center/.test(position) ? 8 : 0;
  const midfieldBias = /midfielder|point guard/.test(position) ? 7 : 0;

  return {
    pac: clampStat(64 + sportBoost + attackBias + videoBoost),
    sho: clampStat(58 + sportBoost + attackBias + categoryBoost),
    pas: clampStat(60 + sportBoost + midfieldBias + videoBoost),
    dri: clampStat(62 + sportBoost + attackBias + midfieldBias),
    def: clampStat(52 + sportBoost + defenseBias + categoryBoost),
    phy: clampStat(61 + sportBoost + defenseBias + videoBoost),
  };
};

const estimateOverallRating = (stats: ReturnType<typeof estimateStats>) =>
  clampStat(
    (stats.pac + stats.sho + stats.pas + stats.dri + stats.def + stats.phy) / 6
  );

const PlayerCard: React.FC<PlayerCardProps> = (props) => {
  const stats = estimateStats(props);
  const rating = estimateOverallRating(stats);
  const position = props.primaryPosition || props.secondaryPosition || "ATH";
  const nation = props.country || "N/A";
  const subtitle = [props.team, props.category].filter(Boolean).join(" · ");

  return (
    <section className="fifa-card-shell">
      <div className="fifa-card-shell__header">
        <div>
          <p className="fifa-card-shell__eyebrow">Modelo alternativo</p>
          <h3>Player card comparativa</h3>
        </div>
        <span>Adaptada al playerProfile actual</span>
      </div>

      <div className="fifa-card">
        <div className="fifa-card__shine" />

        <div className="fifa-card__top">
          <div className="fifa-card__meta">
            <div className="fifa-card__rating">{rating}</div>
            <div className="fifa-card__position">{position}</div>
            <div className="fifa-card__line" />
            <div className="fifa-card__nation">{nation.slice(0, 3).toUpperCase()}</div>
            <div className="fifa-card__status">{props.status || "active"}</div>
          </div>

          <div className="fifa-card__player-wrapper">
            {props.avatarUrl ? (
              <img
                src={props.avatarUrl}
                alt={props.fullName || "Jugador"}
                className="fifa-card__player-image"
              />
            ) : (
              <div className="fifa-card__player-fallback">
                <FaUserCircle aria-hidden="true" />
              </div>
            )}
          </div>
        </div>

        <div className="fifa-card__bottom">
          <h2 className="fifa-card__name">{props.fullName || "PLAYER"}</h2>
          <p className="fifa-card__subtitle">{subtitle || "Sin equipo · Sin categoría"}</p>

          <div className="fifa-card__name-divider" />

          <div className="fifa-card__stats">
            <div className="fifa-card__stats-column">
              <div className="fifa-card__stat">
                <span className="fifa-card__stat-value">{stats.pac}</span>
                <span className="fifa-card__stat-label">PAC</span>
              </div>
              <div className="fifa-card__stat">
                <span className="fifa-card__stat-value">{stats.sho}</span>
                <span className="fifa-card__stat-label">SHO</span>
              </div>
              <div className="fifa-card__stat">
                <span className="fifa-card__stat-value">{stats.pas}</span>
                <span className="fifa-card__stat-label">PAS</span>
              </div>
            </div>

            <div className="fifa-card__stats-divider" />

            <div className="fifa-card__stats-column">
              <div className="fifa-card__stat">
                <span className="fifa-card__stat-value">{stats.dri}</span>
                <span className="fifa-card__stat-label">DRI</span>
              </div>
              <div className="fifa-card__stat">
                <span className="fifa-card__stat-value">{stats.def}</span>
                <span className="fifa-card__stat-label">DEF</span>
              </div>
              <div className="fifa-card__stat">
                <span className="fifa-card__stat-value">{stats.phy}</span>
                <span className="fifa-card__stat-label">PHY</span>
              </div>
            </div>
          </div>

          <div className="fifa-card__details">
            <span>{getRecruiterSportTypeLabel(props.sportType) || "sport"}</span>
            <span>{props.dominantProfile || "perfil base"}</span>
            <span>{props.profileVideosCount || 0} videos</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlayerCard;
