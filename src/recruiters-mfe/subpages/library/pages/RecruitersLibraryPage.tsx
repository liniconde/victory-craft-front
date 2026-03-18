import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import ScoutingLibrarySearchBar from "../components/ScoutingLibrarySearchBar";
import PlayerProfileSearchModal from "../../player-profiles/components/PlayerProfileSearchModal";
import type {
  RecruiterPlayerProfile,
  RecruiterPlayerProfileListItem,
  RecruiterVideoLibraryItem,
} from "../../../features/recruiters/types";
import { useRecruitersModule } from "../../../hooks/useRecruitersModule";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;

const getPlayableUrl = (video: RecruiterVideoLibraryItem) =>
  video.playbackUrl || video.videoUrl || "";

const RecruitersLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { actualRole } = useAuth();
  const isElevated = actualRole === "admin" || actualRole === "recruiter";
  const {
    api: {
      getFiltersCatalog,
      getLibrary,
      getMyLibrary,
      getMyPlayerProfile,
      getPlayerProfile,
      getPlayerProfileVideos,
      getVotesSummary,
      linkVideoToPlayerProfile,
      unlinkVideoFromPlayerProfile,
    },
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
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<RecruiterPlayerProfile | null>(null);
  const [linkedVideos, setLinkedVideos] = useState<RecruiterVideoLibraryItem[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

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
    if (isElevated) return;

    getMyPlayerProfile()
      .then(setSelectedPlayerProfile)
      .catch((error) => {
        const message = error instanceof Error ? error.message : "";
        if (message.toLowerCase().includes("no encontrado")) {
          setSelectedPlayerProfile(null);
          return;
        }

        feedback.showError(message || "No se pudo cargar tu player profile.");
      });
  }, [feedback, getMyPlayerProfile, isElevated]);

  useEffect(() => {
    setIsLoading(true);
    const loader = isElevated ? getLibrary : getMyLibrary;
    loader(page, PAGE_SIZE, debouncedSearchTerm, sportTypeFilter || undefined)
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
  }, [debouncedSearchTerm, feedback, getLibrary, getMyLibrary, isElevated, page, sportTypeFilter]);

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

  useEffect(() => {
    if (!selectedPlayerProfile?._id) {
      setLinkedVideos([]);
      return;
    }

    getPlayerProfileVideos(selectedPlayerProfile._id, 1, 6)
      .then((response) => {
        setLinkedVideos(
          response.items
            .map((item) => item.video)
            .filter((item): item is RecruiterVideoLibraryItem => Boolean(item?._id))
        );
      })
      .catch(() => {
        setLinkedVideos([]);
      });
  }, [getPlayerProfileVideos, selectedPlayerProfile?._id]);

  const selectedVideoAlreadyLinked = Boolean(
    selectedVideo?._id && linkedVideos.some((item) => item._id === selectedVideo._id)
  );

  const handleProfileSelected = async (profile: RecruiterPlayerProfileListItem) => {
    try {
      const detail = await getPlayerProfile(profile._id);
      setSelectedPlayerProfile(detail);
    } catch (error) {
      feedback.showError(
        error instanceof Error ? error.message : "No se pudo cargar el player profile."
      );
    }
  };

  const handleLinkSelectedVideo = async () => {
    if (!selectedPlayerProfile?._id || !selectedVideo?._id) {
      feedback.showError("Selecciona primero un player profile y un video.");
      return;
    }

    setIsLinking(true);
    try {
      await linkVideoToPlayerProfile(selectedPlayerProfile._id, {
        videoId: selectedVideo._id,
      });
      const response = await getPlayerProfileVideos(selectedPlayerProfile._id, 1, 6);
      setLinkedVideos(
        response.items
          .map((item) => item.video)
          .filter((item): item is RecruiterVideoLibraryItem => Boolean(item?._id))
      );
      feedback.showLoading(
        "Video vinculado al jugador. Completa la metadata editorial para publicarlo en el ranking."
      );
      window.setTimeout(() => feedback.hideLoading(), 1500);
    } catch (error) {
      feedback.showError(
        error instanceof Error ? error.message : "No se pudo vincular el video."
      );
    } finally {
      setIsLinking(false);
    }
  };

  const handlePublishToRanking = async () => {
    if (!selectedPlayerProfile?._id) {
      feedback.showError("Selecciona o crea primero un player profile.");
      navigate("/scouting/subpages/player-profiles");
      return;
    }

    if (!selectedVideo?._id) {
      feedback.showError("Selecciona un video antes de enviarlo al ranking.");
      return;
    }

    setIsLinking(true);
    try {
      if (!selectedVideoAlreadyLinked) {
        await linkVideoToPlayerProfile(selectedPlayerProfile._id, {
          videoId: selectedVideo._id,
        });
      }

      navigate(
        `/scouting/subpages/profile/${selectedVideo._id}?playerProfileId=${selectedPlayerProfile._id}`
      );
    } catch (error) {
      feedback.showError(
        error instanceof Error ? error.message : "No se pudo preparar el video para ranking."
      );
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkVideo = async (videoId: string) => {
    if (!selectedPlayerProfile?._id) return;
    try {
      await unlinkVideoFromPlayerProfile(selectedPlayerProfile._id, videoId);
      setLinkedVideos((current) => current.filter((item) => item._id !== videoId));
    } catch (error) {
      feedback.showError(
        error instanceof Error ? error.message : "No se pudo desvincular el video."
      );
    }
  };

  return (
    <section className="recruiters-dashboard">
      <header className="recruiters-dashboard__hero">
        <div>
          <p className="recruiters-dashboard__eyebrow">Scouting Library</p>
          <h2>Biblioteca de videos para scouting</h2>
          <p>
            Selecciona primero el jugador y luego el video. El vínculo prepara la publicación, pero
            el video se publica al ranking cuando guardas la metadata editorial.
          </p>
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
        <div className="recruiters-library__player-bar">
          <div>
            <p className="recruiters-dashboard__eyebrow">Player Profile activo</p>
            <strong>{selectedPlayerProfile?.fullName || "Sin jugador seleccionado"}</strong>
            <p>
              {selectedPlayerProfile
                ? `${selectedPlayerProfile.team || "Sin equipo"} · ${
                    selectedPlayerProfile.sportType || "Sin deporte"
                  } · ${selectedPlayerProfile.category || "Sin categoría"}`
                : isElevated
                  ? "Busca un jugador existente o crea uno nuevo antes de vincular videos."
                  : "Crea tu player profile para poder asociar videos propios."}
            </p>
          </div>
          <div className="videos-library-page__actions">
            {isElevated ? (
              <button type="button" onClick={() => setIsPlayerModalOpen(true)}>
                Buscar jugador
              </button>
            ) : null}
            <button type="button" onClick={() => navigate("/scouting/subpages/player-profiles")}>
              {selectedPlayerProfile ? "Editar player profile" : "Crear player profile"}
            </button>
          </div>
        </div>

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
                    onClick={handlePublishToRanking}
                    disabled={!selectedPlayerProfile || !selectedVideo || isLinking}
                  >
                    {selectedVideoAlreadyLinked
                      ? "Completar publicación"
                      : isLinking
                        ? "Preparando..."
                        : "Preparar publicación"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLinkSelectedVideo}
                    disabled={!selectedPlayerProfile || !selectedVideo || isLinking}
                  >
                    {selectedVideoAlreadyLinked ? "Actualizar vínculo" : "Vincular al jugador"}
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
                  Flujo recomendado: elegir jugador, preparar la publicación y luego guardar la
                  metadata editorial del video para que aparezca en el ranking.
                </p>
                {linkedVideos.length ? (
                  <div className="recruiters-library__linked">
                    <div className="recruiters-dashboard__table-header">
                      <h3>Videos vinculados al jugador</h3>
                      <span>{linkedVideos.length}</span>
                    </div>
                    {linkedVideos.map((item) => (
                      <div key={item._id} className="recruiters-dashboard__row">
                        <div>
                          <h4>{item.s3Key || item._id}</h4>
                          <p>{item.sportType || "Sin deporte"}</p>
                        </div>
                        <button type="button" onClick={() => handleUnlinkVideo(item._id)}>
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="videos-library-page__state">Selecciona un video para reproducir.</p>
            )}
          </div>
        </div>
      </section>

      <PlayerProfileSearchModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onSelect={handleProfileSelected}
      />

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
