import React, { useEffect, useState } from "react";
import type {
  RecruiterPlayerProfilesCatalog,
  RecruiterPlayerProfilesQuery,
  RecruiterPlayerProfileListItem,
} from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";

interface PlayerProfileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (profile: RecruiterPlayerProfileListItem) => void;
}

const emptyCatalog: RecruiterPlayerProfilesCatalog = {
  sportTypes: [],
  positions: [],
  categories: [],
  countries: [],
  cities: [],
};

const PlayerProfileSearchModal: React.FC<PlayerProfileSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const {
    api: { getPlayerProfilesCatalog, listPlayerProfiles },
    feedback,
  } = useRecruitersModule();
  const [catalog, setCatalog] = useState<RecruiterPlayerProfilesCatalog>(emptyCatalog);
  const [filters, setFilters] = useState<RecruiterPlayerProfilesQuery>({
    page: 1,
    limit: 8,
    status: "",
  });
  const [items, setItems] = useState<RecruiterPlayerProfileListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 8,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    getPlayerProfilesCatalog()
      .then(setCatalog)
      .catch((error) => {
        feedback.showError(
          error instanceof Error ? error.message : "No se pudo cargar el catálogo."
        );
      });
  }, [feedback, getPlayerProfilesCatalog, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    listPlayerProfiles(filters)
      .then((response) => {
        setItems(response.items);
        setPagination(response.pagination);
      })
      .catch((error) => {
        feedback.showError(
          error instanceof Error ? error.message : "No se pudo cargar el listado."
        );
      })
      .finally(() => setIsLoading(false));
  }, [feedback, filters, isOpen, listPlayerProfiles]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderOptions = (values: string[]) =>
    values.map((value) => (
      <option key={value} value={value}>
        {value}
      </option>
    ));

  return (
    <div className="recruiters-modal" role="dialog" aria-modal="true">
      <div className="recruiters-modal__backdrop" onClick={onClose} />
      <div className="recruiters-modal__panel">
        <header className="recruiters-modal__header">
          <div>
            <p className="recruiters-dashboard__eyebrow">Player Profiles</p>
            <h3>Buscar jugador</h3>
          </div>
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </header>

        <div className="recruiters-modal__filters">
          <label>
            <span>Email</span>
            <input
              type="text"
              value={filters.email ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  email: event.target.value,
                  page: 1,
                }))
              }
            />
          </label>
          <label>
            <span>User name</span>
            <input
              type="text"
              value={filters.userName ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  userName: event.target.value,
                  page: 1,
                }))
              }
            />
          </label>
          <label>
            <span>Nombre</span>
            <input
              type="text"
              value={filters.fullName ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  fullName: event.target.value,
                  page: 1,
                }))
              }
            />
          </label>
          <label>
            <span>Equipo</span>
            <input
              type="text"
              value={filters.team ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  team: event.target.value,
                  page: 1,
                }))
              }
            />
          </label>
          <label>
            <span>Deporte</span>
            <select
              value={filters.sportType ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sportType: event.target.value,
                  page: 1,
                }))
              }
            >
              <option value="">Todos</option>
              {renderOptions(catalog.sportTypes)}
            </select>
          </label>
          <label>
            <span>País</span>
            <select
              value={filters.country ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  country: event.target.value,
                  page: 1,
                }))
              }
            >
              <option value="">Todos</option>
              {renderOptions(catalog.countries)}
            </select>
          </label>
          <label>
            <span>Ciudad</span>
            <select
              value={filters.city ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  city: event.target.value,
                  page: 1,
                }))
              }
            >
              <option value="">Todas</option>
              {renderOptions(catalog.cities)}
            </select>
          </label>
          <label>
            <span>Categoría</span>
            <select
              value={filters.category ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  category: event.target.value,
                  page: 1,
                }))
              }
            >
              <option value="">Todas</option>
              {renderOptions(catalog.categories)}
            </select>
          </label>
          <label>
            <span>Estado</span>
            <select
              value={filters.status ?? ""}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value as RecruiterPlayerProfilesQuery["status"],
                  page: 1,
                }))
              }
            >
              <option value="">Todos</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>

        <div className="recruiters-modal__results">
          <div className="recruiters-dashboard__table-header">
            <h3>Resultados</h3>
            <span>{isLoading ? "Buscando..." : `${pagination.total} perfiles`}</span>
          </div>

          {items.length ? (
            items.map((item) => (
              <button
                key={item._id}
                type="button"
                className="recruiters-modal__result"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <strong>{item.fullName || "Sin nombre"}</strong>
                <span>{item.email || item.userName || "Sin usuario"}</span>
                <span>
                  {item.team || "Sin equipo"} · {item.sportType || "Sin deporte"} ·{" "}
                  {item.category || "Sin categoría"}
                </span>
              </button>
            ))
          ) : (
            <p className="videos-library-page__state">
              {isLoading ? "Buscando perfiles..." : "No se encontraron perfiles."}
            </p>
          )}
        </div>

        <footer className="videos-library-page__pagination">
          <button
            type="button"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                page: Math.max(1, (current.page ?? 1) - 1),
              }))
            }
            disabled={pagination.page <= 1 || isLoading}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                page: Math.min(pagination.totalPages, (current.page ?? 1) + 1),
              }))
            }
            disabled={pagination.page >= pagination.totalPages || isLoading}
          >
            Siguiente
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PlayerProfileSearchModal;
