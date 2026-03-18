import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScoutingLibrarySearchBar from "../components/ScoutingLibrarySearchBar";
import type { RecruiterVideoLibraryItem } from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;

const getPlayableUrl = (video: RecruiterVideoLibraryItem) =>
  video.playbackUrl || video.videoUrl || "";

const RecruitersLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    api: { getFiltersCatalog, getLibrary, getVotesSummary },
    feedback,
  } = useRecruitersModule();
  const [items, setItems] = useState<RecruiterVideoLibraryItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sportTypeFilter, setSportTypeFilter] = useState("");
  const [sportTypeOptions, setSportTypeOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchQuery.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [sportTypeFilter]);

  useEffect(() => {
    getFiltersCatalog()
      .then((catalog) => {
        setSportTypeOptions(catalog.sportTypes.filter(Boolean));
      })
      .catch(() => {
        setSportTypeOptions([]);
      });
  }, [getFiltersCatalog]);

  useEffect(() => {
    setIsLoading(true);
    getLibrary(page, PAGE_SIZE, debouncedSearchTerm, sportTypeFilter || undefined)
      .then((response) => {
        setItems(response.items);
        setTotal(response.pagination.total);
        setTotalPages(Math.max(1, response.pagination.totalPages));
        setPage((currentPage) =>
          response.pagination.page > 0 && response.pagination.page !== currentPage
            ? response.pagination.page
            : currentPage
        );
        setSelectedVideoId((currentId) => {
          const stillExists = response.items.some((item) => item._id === currentId);
          if (stillExists) return currentId;
          return response.items[0]?._id ?? "";
        });
      })
      .catch((error) => {
        feedback.showError(error instanceof Error ? error.message : "No se pudo cargar library.");
      })
      .finally(() => setIsLoading(false));
  }, [debouncedSearchTerm, feedback, getLibrary, page, sportTypeFilter]);

  const selectedVideo = useMemo(
    () => items.find((item) => item._id === selectedVideoId) ?? null,
    [items, selectedVideoId]
  );

  useEffect(() => {
    if (!selectedVideo?._id) {
      setSummaryText("");
      return;
    }

    getVotesSummary(selectedVideo._id)
      .then((summary) => {
        setSummaryText(
          `Score ${summary.score} · upvotes ${summary.upvotes} · net ${summary.netVotes}`
        );
      })
      .catch(() => setSummaryText(""));
  }, [getVotesSummary, selectedVideo?._id]);

  return (
    <section className="recruiters-dashboard">
      <header className="recruiters-dashboard__hero">
        <div>
          <p className="recruiters-dashboard__eyebrow">Scouting Library</p>
          <h2>Biblioteca de videos para scouting</h2>
          <p>Usa la misma lógica de exploración de library y desde aquí abre solo el flujo recruiter.</p>
        </div>
        <aside className="recruiters-dashboard__stats">
          <span>Total en scouting library</span>
          <strong>{total}</strong>
          <p>
            Página {page} de {totalPages}
          </p>
        </aside>
      </header>

      <ScoutingLibrarySearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        sportType={sportTypeFilter}
        onSportTypeChange={setSportTypeFilter}
        options={sportTypeOptions}
        resultCount={total}
        isLoading={isLoading}
      />

      <section className="recruiters-dashboard__table recruiters-library">
        <div className="videos-library-page__layout">
          <div className="videos-library-page__list">
            {isLoading ? (
              <p className="videos-library-page__state">Cargando videos...</p>
            ) : items.length ? (
              items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  className={`videos-library-page__item ${
                    item._id === selectedVideoId ? "is-active" : ""
                  }`}
                  onClick={() => setSelectedVideoId(item._id)}
                >
                  <strong>{item.s3Key || item._id}</strong>
                  <span>
                    {item.sportType || "Sin deporte"} ·{" "}
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Sin fecha"}
                  </span>
                </button>
              ))
            ) : (
              <p className="videos-library-page__state">
                {debouncedSearchTerm || sportTypeFilter
                  ? "No se encontraron videos."
                  : "No hay videos disponibles."}
              </p>
            )}
          </div>

          <div className="videos-library-page__viewer">
            {selectedVideo ? (
              <div className="videos-library-page__viewer-content">
                {getPlayableUrl(selectedVideo) ? (
                  <video
                    key={selectedVideoId || getPlayableUrl(selectedVideo)}
                    className="videos-library-page__player"
                    controls
                  >
                    <source src={getPlayableUrl(selectedVideo)} />
                  </video>
                ) : (
                  <p className="videos-library-page__state">Sin URL de reproducción.</p>
                )}
                <p className="videos-library-page__helper">{summaryText}</p>
                <div className="videos-library-page__actions">
                  <button
                    type="button"
                    className="videos-library-page__publish-button"
                    onClick={() => navigate(`/scouting/subpages/profile/${selectedVideo._id}`)}
                  >
                    Crear/Editar profile
                  </button>
                  <button
                    type="button"
                    className="videos-library-page__analyze-button"
                    onClick={() => navigate(`/scouting/subpages/video/${selectedVideo._id}`)}
                  >
                    Ver recruiter view
                  </button>
                </div>
                <p className="videos-library-page__helper">
                  Desde aquí completas el profile o abres el detalle recruiter del clip seleccionado.
                </p>
              </div>
            ) : (
              <p className="videos-library-page__state">Selecciona un video para reproducir.</p>
            )}
          </div>
        </div>
      </section>

      <footer className="videos-library-page__pagination">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1 || isLoading}
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages || isLoading}
        >
          Siguiente
        </button>
      </footer>
    </section>
  );
};

export default RecruitersLibraryPage;
