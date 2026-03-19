import React from "react";
import { getRecruiterSportTypeLabel } from "../../../features/recruiters/sportTypes";

interface ScoutingLibrarySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  sportType: string;
  onSportTypeChange: (sportType: string) => void;
  options: string[];
  resultCount: number;
  isLoading?: boolean;
}

const ScoutingLibrarySearchBar: React.FC<ScoutingLibrarySearchBarProps> = ({
  value,
  onChange,
  sportType,
  onSportTypeChange,
  options,
  resultCount,
  isLoading = false,
}) => {
  return (
    <div className="videos-library-page__search">
      <div className="videos-library-page__search-row">
        <label className="videos-library-page__search-field">
          <span className="videos-library-page__search-label">Buscar por nombre</span>
          <div className="videos-library-page__search-input-row">
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Ej: semifinal-sub17.mp4"
              className="videos-library-page__search-input"
            />
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="videos-library-page__search-clear"
              >
                Limpiar
              </button>
            ) : null}
          </div>
        </label>

        <label className="videos-library-page__search-field videos-library-page__search-field--sport">
          <span className="videos-library-page__search-label">Tipo de deporte</span>
          <select
            value={sportType}
            onChange={(event) => onSportTypeChange(event.target.value)}
            className="videos-library-page__search-input videos-library-page__search-select"
          >
            <option value="">Todos</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {getRecruiterSportTypeLabel(option)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="videos-library-page__search-meta">
        {isLoading ? "Buscando..." : `Resultados totales: ${resultCount}`}
      </p>
    </div>
  );
};

export default ScoutingLibrarySearchBar;
