import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useTournamentsModule } from "../../../hooks/useTournamentsModule";
import {
  MATCH_STATUS_OPTIONS,
  TOURNAMENT_STATUS_OPTIONS,
  type MatchFilters,
  type MatchStatFilters,
  type SectionFeedback,
  type TeamFilters,
  type Tournament,
  type TournamentCreateRequest,
  type TournamentFilters,
  type TournamentMatch,
  type TournamentMatchCreateRequest,
  type TournamentMatchStat,
  type TournamentMatchStatCreateRequest,
  type TournamentPlayer,
  type TournamentPlayerCreateRequest,
  type TournamentTeam,
  type TournamentTeamCreateRequest,
} from "../../../features/tournaments/types";
import {
  safeParseJsonObject,
  validateMatch,
  validateMatchStat,
  validatePlayer,
  validateTeam,
  validateTournament,
  type ValidationErrors,
} from "../../../features/tournaments/validators";
import "./TournamentsDashboardPage.css";

const EMPTY_FEEDBACK: SectionFeedback = {
  loading: false,
  error: null,
  success: null,
};

const createTournamentInitialState = (ownerId?: string | null): TournamentCreateRequest => ({
  name: "",
  sport: "",
  description: "",
  ownerId: ownerId || "",
  status: "draft",
  startsAt: "",
  endsAt: "",
});

const createTeamInitialState = (): TournamentTeamCreateRequest => ({
  tournamentId: "",
  name: "",
  shortName: "",
  logoUrl: "",
  coachName: "",
});

const createPlayerInitialState = (): TournamentPlayerCreateRequest => ({
  teamId: "",
  firstName: "",
  lastName: "",
  jerseyNumber: undefined,
  position: "",
  birthDate: "",
});

const createMatchInitialState = (): TournamentMatchCreateRequest => ({
  homeTeamId: "",
  awayTeamId: "",
  scheduledAt: "",
  venue: "",
  round: "",
  status: "scheduled",
  matchSessionId: "",
});

const createMatchStatInitialState = (): TournamentMatchStatCreateRequest => ({
  matchId: "",
  sport: "",
  stats: {},
});

const toInputDateTime = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toInputDate = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toApiDateTime = (value?: string): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const toApiDate = (value?: string): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const humanizeLabel = (value?: string): string => {
  if (!value) return "-";
  return value.replace(/_/g, " ");
};

const formatDateTime = (value?: string): string => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const SectionNotice: React.FC<{ type: "error" | "success"; message: string }> = ({
  type,
  message,
}) => <div className={`tournaments-notice tournaments-notice--${type}`}>{message}</div>;

const TournamentsDashboardPage: React.FC = () => {
  const { api, feedback } = useTournamentsModule();
  const { userId } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [matchStats, setMatchStats] = useState<TournamentMatchStat[]>([]);
  const [teamCatalog, setTeamCatalog] = useState<TournamentTeam[]>([]);
  const [matchCatalog, setMatchCatalog] = useState<TournamentMatch[]>([]);

  const [tournamentFilters, setTournamentFilters] = useState<TournamentFilters>({
    sport: "",
    status: "",
  });
  const [teamFilters, setTeamFilters] = useState<TeamFilters>({ tournamentId: "" });
  const [playerFilters, setPlayerFilters] = useState({
    tournamentId: "",
    teamId: "",
  });
  const [matchFilters, setMatchFilters] = useState<MatchFilters>({
    tournamentId: "",
    teamId: "",
    status: "",
  });
  const [matchStatFilters, setMatchStatFilters] = useState<MatchStatFilters>({
    tournamentId: "",
    matchId: "",
  });

  const [tournamentFeedback, setTournamentFeedback] = useState<SectionFeedback>(EMPTY_FEEDBACK);
  const [teamFeedback, setTeamFeedback] = useState<SectionFeedback>(EMPTY_FEEDBACK);
  const [playerFeedback, setPlayerFeedback] = useState<SectionFeedback>(EMPTY_FEEDBACK);
  const [matchFeedback, setMatchFeedback] = useState<SectionFeedback>(EMPTY_FEEDBACK);
  const [matchStatFeedback, setMatchStatFeedback] = useState<SectionFeedback>(EMPTY_FEEDBACK);

  const [tournamentForm, setTournamentForm] = useState<TournamentCreateRequest>(
    createTournamentInitialState(userId)
  );
  const [teamForm, setTeamForm] = useState<TournamentTeamCreateRequest>(createTeamInitialState());
  const [playerForm, setPlayerForm] = useState<TournamentPlayerCreateRequest>(createPlayerInitialState());
  const [matchForm, setMatchForm] = useState<TournamentMatchCreateRequest>(createMatchInitialState());
  const [matchFormScoreHome, setMatchFormScoreHome] = useState(0);
  const [matchFormScoreAway, setMatchFormScoreAway] = useState(0);
  const [matchFormWinnerTeamId, setMatchFormWinnerTeamId] = useState("");
  const [matchStatForm, setMatchStatForm] = useState<TournamentMatchStatCreateRequest>(
    createMatchStatInitialState()
  );
  const [matchStatsJsonText, setMatchStatsJsonText] = useState("{}");

  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editingTeam, setEditingTeam] = useState<TournamentTeam | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<TournamentPlayer | null>(null);
  const [editingMatch, setEditingMatch] = useState<TournamentMatch | null>(null);
  const [editingMatchStat, setEditingMatchStat] = useState<TournamentMatchStat | null>(null);

  const [tournamentErrors, setTournamentErrors] = useState<ValidationErrors<keyof TournamentCreateRequest>>({});
  const [teamErrors, setTeamErrors] = useState<ValidationErrors<keyof TournamentTeamCreateRequest>>({});
  const [playerErrors, setPlayerErrors] = useState<ValidationErrors<keyof TournamentPlayerCreateRequest>>({});
  const [matchErrors, setMatchErrors] = useState<ValidationErrors<keyof TournamentMatchCreateRequest>>({});
  const [matchStatErrors, setMatchStatErrors] = useState<ValidationErrors<"matchId" | "stats">>({});

  const tournamentMap = useMemo(
    () => new Map(tournaments.map((item) => [item._id, item])),
    [tournaments]
  );
  const teamMap = useMemo(
    () => new Map(teamCatalog.map((item) => [item._id, item])),
    [teamCatalog]
  );
  const setLoading = (setter: React.Dispatch<React.SetStateAction<SectionFeedback>>) =>
    setter({ loading: true, error: null, success: null });

  const loadTournaments = async () => {
    setLoading(setTournamentFeedback);
    try {
      const response = await api.listTournaments({
        sport: tournamentFilters.sport || undefined,
        status: tournamentFilters.status || undefined,
      });
      setTournaments(response.items || []);
      setTournamentFeedback((current) => ({ ...current, loading: false, error: null }));
    } catch (error) {
      console.error("Error loading tournaments:", error);
      setTournamentFeedback({ loading: false, error: "No se pudieron cargar los torneos.", success: null });
      feedback.showError("No se pudieron cargar los torneos.");
    }
  };

  const loadTeams = async () => {
    setLoading(setTeamFeedback);
    try {
      const response = await api.listTeams({
        tournamentId: teamFilters.tournamentId || undefined,
      });
      setTeams(response.items || []);
      setTeamFeedback((current) => ({ ...current, loading: false, error: null }));
    } catch (error) {
      console.error("Error loading teams:", error);
      setTeamFeedback({ loading: false, error: "No se pudieron cargar los equipos.", success: null });
    }
  };

  const loadPlayers = async () => {
    setLoading(setPlayerFeedback);
    try {
      const response = await api.listPlayers({
        tournamentId: playerFilters.tournamentId || undefined,
        teamId: playerFilters.teamId || undefined,
      });
      setPlayers(response.items || []);
      setPlayerFeedback((current) => ({ ...current, loading: false, error: null }));
    } catch (error) {
      console.error("Error loading players:", error);
      setPlayerFeedback({ loading: false, error: "No se pudieron cargar los jugadores.", success: null });
    }
  };

  const loadMatches = async () => {
    setLoading(setMatchFeedback);
    try {
      const response = await api.listMatches({
        tournamentId: matchFilters.tournamentId || undefined,
        teamId: matchFilters.teamId || undefined,
        status: matchFilters.status || undefined,
      });
      setMatches(response.items || []);
      setMatchFeedback((current) => ({ ...current, loading: false, error: null }));
    } catch (error) {
      console.error("Error loading matches:", error);
      setMatchFeedback({ loading: false, error: "No se pudieron cargar los partidos.", success: null });
    }
  };

  const loadMatchStats = async () => {
    setLoading(setMatchStatFeedback);
    try {
      const response = await api.listMatchStats({
        tournamentId: matchStatFilters.tournamentId || undefined,
        matchId: matchStatFilters.matchId || undefined,
      });
      setMatchStats(response.items || []);
      setMatchStatFeedback((current) => ({ ...current, loading: false, error: null }));
    } catch (error) {
      console.error("Error loading match stats:", error);
      setMatchStatFeedback({ loading: false, error: "No se pudieron cargar las estadisticas.", success: null });
    }
  };

  const loadTeamCatalog = async () => {
    try {
      const response = await api.listTeams();
      setTeamCatalog(response.items || []);
    } catch (error) {
      console.error("Error loading team catalog:", error);
    }
  };

  const loadMatchCatalog = async () => {
    try {
      const response = await api.listMatches();
      setMatchCatalog(response.items || []);
    } catch (error) {
      console.error("Error loading match catalog:", error);
    }
  };

  useEffect(() => {
    void loadTournaments();
  }, [tournamentFilters.sport, tournamentFilters.status]);

  useEffect(() => {
    void loadTeams();
  }, [teamFilters.tournamentId]);

  useEffect(() => {
    void loadPlayers();
  }, [playerFilters.tournamentId, playerFilters.teamId]);

  useEffect(() => {
    void loadMatches();
  }, [matchFilters.tournamentId, matchFilters.teamId, matchFilters.status]);

  useEffect(() => {
    void loadMatchStats();
  }, [matchStatFilters.tournamentId, matchStatFilters.matchId]);

  useEffect(() => {
    void loadTeamCatalog();
    void loadMatchCatalog();
  }, []);

  const resetTournamentForm = () => {
    setEditingTournament(null);
    setTournamentForm(createTournamentInitialState(userId));
    setTournamentErrors({});
  };

  const resetTeamForm = () => {
    setEditingTeam(null);
    setTeamForm(createTeamInitialState());
    setTeamErrors({});
  };

  const resetPlayerForm = () => {
    setEditingPlayer(null);
    setPlayerForm(createPlayerInitialState());
    setPlayerErrors({});
  };

  const resetMatchForm = () => {
    setEditingMatch(null);
    setMatchForm(createMatchInitialState());
    setMatchFormScoreHome(0);
    setMatchFormScoreAway(0);
    setMatchFormWinnerTeamId("");
    setMatchErrors({});
  };

  const resetMatchStatForm = () => {
    setEditingMatchStat(null);
    setMatchStatForm(createMatchStatInitialState());
    setMatchStatsJsonText("{}");
    setMatchStatErrors({});
  };

  const handleTournamentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...tournamentForm,
      ownerId: tournamentForm.ownerId || userId || undefined,
      startsAt: toApiDateTime(tournamentForm.startsAt),
      endsAt: toApiDateTime(tournamentForm.endsAt),
    };
    const errors = validateTournament(payload);
    setTournamentErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(setTournamentFeedback);
    try {
      if (editingTournament) {
        await api.updateTournament(editingTournament._id, payload);
        setTournamentFeedback({ loading: false, error: null, success: "Torneo actualizado." });
      } else {
        await api.createTournament(payload);
        setTournamentFeedback({ loading: false, error: null, success: "Torneo creado." });
      }
      resetTournamentForm();
      await loadTournaments();
    } catch (error) {
      console.error("Error saving tournament:", error);
      setTournamentFeedback({ loading: false, error: "No se pudo guardar el torneo.", success: null });
    }
  };

  const handleTeamSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { ...teamForm };
    const errors = validateTeam(payload);
    setTeamErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(setTeamFeedback);
    try {
      if (editingTeam) {
        await api.updateTeam(editingTeam._id, payload);
        setTeamFeedback({ loading: false, error: null, success: "Equipo actualizado." });
      } else {
        await api.createTeam(payload);
        setTeamFeedback({ loading: false, error: null, success: "Equipo creado." });
      }
      resetTeamForm();
      await Promise.all([loadTeams(), loadTeamCatalog()]);
    } catch (error) {
      console.error("Error saving team:", error);
      setTeamFeedback({ loading: false, error: "No se pudo guardar el equipo.", success: null });
    }
  };

  const handlePlayerSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...playerForm,
      birthDate: toApiDate(playerForm.birthDate),
      jerseyNumber:
        playerForm.jerseyNumber === undefined || Number.isNaN(Number(playerForm.jerseyNumber))
          ? undefined
          : Number(playerForm.jerseyNumber),
    };
    const errors = validatePlayer(payload);
    setPlayerErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(setPlayerFeedback);
    try {
      if (editingPlayer) {
        await api.updatePlayer(editingPlayer._id, payload);
        setPlayerFeedback({ loading: false, error: null, success: "Jugador actualizado." });
      } else {
        await api.createPlayer(payload);
        setPlayerFeedback({ loading: false, error: null, success: "Jugador creado." });
      }
      resetPlayerForm();
      await loadPlayers();
    } catch (error) {
      console.error("Error saving player:", error);
      setPlayerFeedback({ loading: false, error: "No se pudo guardar el jugador.", success: null });
    }
  };

  const handleMatchSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...matchForm,
      scheduledAt: toApiDateTime(matchForm.scheduledAt),
      matchSessionId: matchForm.matchSessionId || undefined,
    };
    const errors = validateMatch(payload);
    setMatchErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(setMatchFeedback);
    try {
      if (editingMatch) {
        await api.updateMatch(editingMatch._id, {
          ...payload,
          score:
            matchForm.status === "finished" || editingMatch.score
              ? { home: matchFormScoreHome, away: matchFormScoreAway }
              : undefined,
          winnerTeamId: matchFormWinnerTeamId || undefined,
        });
        setMatchFeedback({ loading: false, error: null, success: "Partido actualizado." });
      } else {
        await api.createMatch(payload);
        setMatchFeedback({ loading: false, error: null, success: "Partido creado." });
      }
      resetMatchForm();
      await Promise.all([loadMatches(), loadMatchCatalog()]);
    } catch (error) {
      console.error("Error saving match:", error);
      setMatchFeedback({ loading: false, error: "No se pudo guardar el partido.", success: null });
    }
  };

  const handleMatchStatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedStats = safeParseJsonObject(matchStatsJsonText);
    const payload = {
      ...matchStatForm,
      sport: matchStatForm.sport || undefined,
      stats: parsedStats || {},
    };
    const errors = validateMatchStat(payload);
    if (!parsedStats) {
      errors.stats = "Introduce un JSON valido para las estadisticas.";
    }
    setMatchStatErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(setMatchStatFeedback);
    try {
      if (editingMatchStat) {
        await api.updateMatchStat(editingMatchStat._id, payload);
        setMatchStatFeedback({ loading: false, error: null, success: "Estadistica actualizada." });
      } else {
        await api.createMatchStat(payload);
        setMatchStatFeedback({ loading: false, error: null, success: "Estadistica creada." });
      }
      resetMatchStatForm();
      await loadMatchStats();
    } catch (error) {
      console.error("Error saving match stat:", error);
      setMatchStatFeedback({ loading: false, error: "No se pudo guardar la estadistica.", success: null });
    }
  };

  const handleGenerateMatches = async (tournamentId: string) => {
    setLoading(setTournamentFeedback);
    try {
      const response = await api.generateMatches(tournamentId);
      setTournamentFeedback({
        loading: false,
        error: null,
        success:
          response.message ||
          `Fixture generado con ${response.matchesCreated ?? 0} partidos.`,
      });
      await Promise.all([loadMatches(), loadMatchCatalog()]);
    } catch (error) {
      console.error("Error generating matches:", error);
      setTournamentFeedback({ loading: false, error: "No se pudo generar el fixture.", success: null });
    }
  };

  const deleteWithConfirmation = async (
    label: string,
    action: () => Promise<void>
  ) => {
    if (!window.confirm(`¿Seguro que quieres eliminar ${label}?`)) return;
    await action();
  };

  const tournamentOptions = tournaments.map((item) => ({ value: item._id, label: item.name }));
  const filteredTeamCatalog = teamCatalog.filter((team) =>
    !matchFilters.tournamentId && !teamFilters.tournamentId && !playerFilters.tournamentId
      ? true
      : [matchFilters.tournamentId, teamFilters.tournamentId, playerFilters.tournamentId]
          .filter(Boolean)
          .includes(team.tournamentId)
  );

  const matchTeamOptions = filteredTeamCatalog.map((team) => ({
    value: team._id,
    label: `${team.name}${team.shortName ? ` (${team.shortName})` : ""}`,
  }));

  const playerTeamOptions = teamCatalog
    .filter((team) => !playerFilters.tournamentId || team.tournamentId === playerFilters.tournamentId)
    .map((team) => ({ value: team._id, label: team.name }));

  const statMatchOptions = matchCatalog
    .filter((match) => {
      if (!matchStatFilters.tournamentId) return true;
      const homeTeam = teamMap.get(match.homeTeamId);
      return homeTeam?.tournamentId === matchStatFilters.tournamentId;
    })
    .map((match) => ({
      value: match._id,
      label: `${teamMap.get(match.homeTeamId)?.name || "Equipo local"} vs ${teamMap.get(match.awayTeamId)?.name || "Equipo visitante"}`,
    }));

  return (
    <div className="tournaments-dashboard">
      <div className="tournaments-hero">
        <div>
          <span className="tournaments-hero__eyebrow">Nuevo modulo</span>
          <h1>Torneos</h1>
          <p>
            Gestiona torneos, equipos, jugadores, partidos y estadisticas desde un
            panel preparado para futura extraccion a microfrontend.
          </p>
        </div>
      </div>

      <section className="tournaments-section-grid">
        <article className="tournaments-section-card">
          <div className="tournaments-section-card__header">
            <div>
              <h2>Torneos</h2>
              <p>CRUD principal y generacion de fixture.</p>
            </div>
          </div>
          <div className="tournaments-filters">
            <input
              className="tournaments-input"
              placeholder="Filtrar por deporte"
              value={tournamentFilters.sport || ""}
              onChange={(event) =>
                setTournamentFilters((current) => ({ ...current, sport: event.target.value }))
              }
            />
            <select
              className="tournaments-input"
              value={tournamentFilters.status || ""}
              onChange={(event) =>
                setTournamentFilters((current) => ({
                  ...current,
                  status: event.target.value as TournamentFilters["status"],
                }))
              }
            >
              <option value="">Todos los estados</option>
              {TOURNAMENT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {humanizeLabel(status)}
                </option>
              ))}
            </select>
          </div>
          {tournamentFeedback.error && <SectionNotice type="error" message={tournamentFeedback.error} />}
          {tournamentFeedback.success && <SectionNotice type="success" message={tournamentFeedback.success} />}
          <div className="tournaments-table-shell">
            <table className="tournaments-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Deporte</th>
                  <th>Estado</th>
                  <th>Fechas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.sport}</td>
                    <td>{humanizeLabel(item.status)}</td>
                    <td>
                      {formatDateTime(item.startsAt)}
                      <br />
                      {formatDateTime(item.endsAt)}
                    </td>
                    <td>
                      <div className="tournaments-actions">
                        <button
                          className="tournaments-button tournaments-button--ghost"
                          onClick={() => {
                            setEditingTournament(item);
                            setTournamentForm({
                              name: item.name,
                              sport: item.sport,
                              description: item.description || "",
                              ownerId: item.ownerId || userId || "",
                              status: item.status || "draft",
                              startsAt: toInputDateTime(item.startsAt),
                              endsAt: toInputDateTime(item.endsAt),
                            });
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="tournaments-button tournaments-button--secondary"
                          onClick={() => handleGenerateMatches(item._id)}
                        >
                          Generar partidos
                        </button>
                        <button
                          className="tournaments-button tournaments-button--danger"
                          onClick={() =>
                            deleteWithConfirmation(`el torneo ${item.name}`, async () => {
                              await api.deleteTournament(item._id);
                              await Promise.all([
                                loadTournaments(),
                                loadTeams(),
                                loadPlayers(),
                                loadMatches(),
                                loadMatchStats(),
                                loadTeamCatalog(),
                                loadMatchCatalog(),
                              ]);
                            })
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!tournamentFeedback.loading && tournaments.length === 0 && (
              <div className="tournaments-empty">No hay torneos para los filtros actuales.</div>
            )}
          </div>

          <form className="tournaments-form" onSubmit={handleTournamentSubmit}>
            <div className="tournaments-form__header">
              <h3>{editingTournament ? "Editar torneo" : "Crear torneo"}</h3>
              {editingTournament && (
                <button type="button" className="tournaments-link-button" onClick={resetTournamentForm}>
                  Cancelar edicion
                </button>
              )}
            </div>
            <div className="tournaments-form-grid">
              <label>
                <span>Nombre</span>
                <input
                  className="tournaments-input"
                  value={tournamentForm.name}
                  onChange={(event) => setTournamentForm((current) => ({ ...current, name: event.target.value }))}
                />
                {tournamentErrors.name && <small>{tournamentErrors.name}</small>}
              </label>
              <label>
                <span>Deporte</span>
                <input
                  className="tournaments-input"
                  value={tournamentForm.sport}
                  onChange={(event) => setTournamentForm((current) => ({ ...current, sport: event.target.value }))}
                />
                {tournamentErrors.sport && <small>{tournamentErrors.sport}</small>}
              </label>
              <label>
                <span>Estado</span>
                <select
                  className="tournaments-input"
                  value={tournamentForm.status || "draft"}
                  onChange={(event) =>
                    setTournamentForm((current) => ({
                      ...current,
                      status: event.target.value as TournamentCreateRequest["status"],
                    }))
                  }
                >
                  {TOURNAMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {humanizeLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Owner ID</span>
                <input
                  className="tournaments-input"
                  value={tournamentForm.ownerId || ""}
                  onChange={(event) => setTournamentForm((current) => ({ ...current, ownerId: event.target.value }))}
                />
              </label>
              <label>
                <span>Inicio</span>
                <input
                  type="datetime-local"
                  className="tournaments-input"
                  value={tournamentForm.startsAt || ""}
                  onChange={(event) => setTournamentForm((current) => ({ ...current, startsAt: event.target.value }))}
                />
              </label>
              <label>
                <span>Fin</span>
                <input
                  type="datetime-local"
                  className="tournaments-input"
                  value={tournamentForm.endsAt || ""}
                  onChange={(event) => setTournamentForm((current) => ({ ...current, endsAt: event.target.value }))}
                />
                {tournamentErrors.endsAt && <small>{tournamentErrors.endsAt}</small>}
              </label>
              <label className="tournaments-form-grid__full">
                <span>Descripcion</span>
                <textarea
                  className="tournaments-input tournaments-textarea"
                  value={tournamentForm.description || ""}
                  onChange={(event) => setTournamentForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
            </div>
            <div className="tournaments-actions tournaments-actions--end">
              <button className="tournaments-button" type="submit">
                {editingTournament ? "Guardar torneo" : "Crear torneo"}
              </button>
            </div>
          </form>
        </article>

        <article className="tournaments-section-card">
          <div className="tournaments-section-card__header">
            <div>
              <h2>Equipos</h2>
              <p>Equipos asociados a cada torneo.</p>
            </div>
          </div>
          <div className="tournaments-filters">
            <select
              className="tournaments-input"
              value={teamFilters.tournamentId || ""}
              onChange={(event) =>
                setTeamFilters({ tournamentId: event.target.value })
              }
            >
              <option value="">Todos los torneos</option>
              {tournamentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {teamFeedback.error && <SectionNotice type="error" message={teamFeedback.error} />}
          {teamFeedback.success && <SectionNotice type="success" message={teamFeedback.success} />}
          <div className="tournaments-table-shell">
            <table className="tournaments-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Torneo</th>
                  <th>Coach</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}{item.shortName ? ` (${item.shortName})` : ""}</td>
                    <td>{tournamentMap.get(item.tournamentId)?.name || item.tournamentId}</td>
                    <td>{item.coachName || "-"}</td>
                    <td>
                      <div className="tournaments-actions">
                        <button
                          className="tournaments-button tournaments-button--ghost"
                          onClick={() => {
                            setEditingTeam(item);
                            setTeamForm({
                              tournamentId: item.tournamentId,
                              name: item.name,
                              shortName: item.shortName || "",
                              logoUrl: item.logoUrl || "",
                              coachName: item.coachName || "",
                            });
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="tournaments-button tournaments-button--danger"
                          onClick={() =>
                            deleteWithConfirmation(`el equipo ${item.name}`, async () => {
                              await api.deleteTeam(item._id);
                              await Promise.all([loadTeams(), loadTeamCatalog(), loadPlayers(), loadMatches(), loadMatchCatalog(), loadMatchStats()]);
                            })
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!teamFeedback.loading && teams.length === 0 && (
              <div className="tournaments-empty">No hay equipos para el filtro actual.</div>
            )}
          </div>
          <form className="tournaments-form" onSubmit={handleTeamSubmit}>
            <div className="tournaments-form__header">
              <h3>{editingTeam ? "Editar equipo" : "Crear equipo"}</h3>
              {editingTeam && (
                <button type="button" className="tournaments-link-button" onClick={resetTeamForm}>
                  Cancelar edicion
                </button>
              )}
            </div>
            <div className="tournaments-form-grid">
              <label>
                <span>Torneo</span>
                <select
                  className="tournaments-input"
                  value={teamForm.tournamentId}
                  onChange={(event) => setTeamForm((current) => ({ ...current, tournamentId: event.target.value }))}
                >
                  <option value="">Selecciona un torneo</option>
                  {tournamentOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {teamErrors.tournamentId && <small>{teamErrors.tournamentId}</small>}
              </label>
              <label>
                <span>Nombre</span>
                <input className="tournaments-input" value={teamForm.name} onChange={(event) => setTeamForm((current) => ({ ...current, name: event.target.value }))} />
                {teamErrors.name && <small>{teamErrors.name}</small>}
              </label>
              <label>
                <span>Nombre corto</span>
                <input className="tournaments-input" value={teamForm.shortName || ""} onChange={(event) => setTeamForm((current) => ({ ...current, shortName: event.target.value }))} />
              </label>
              <label>
                <span>Coach</span>
                <input className="tournaments-input" value={teamForm.coachName || ""} onChange={(event) => setTeamForm((current) => ({ ...current, coachName: event.target.value }))} />
              </label>
              <label className="tournaments-form-grid__full">
                <span>Logo URL</span>
                <input className="tournaments-input" value={teamForm.logoUrl || ""} onChange={(event) => setTeamForm((current) => ({ ...current, logoUrl: event.target.value }))} />
              </label>
            </div>
            <div className="tournaments-actions tournaments-actions--end">
              <button className="tournaments-button" type="submit">{editingTeam ? "Guardar equipo" : "Crear equipo"}</button>
            </div>
          </form>
        </article>

        <article className="tournaments-section-card">
          <div className="tournaments-section-card__header">
            <div>
              <h2>Jugadores</h2>
              <p>Plantillas por equipo.</p>
            </div>
          </div>
          <div className="tournaments-filters">
            <select className="tournaments-input" value={playerFilters.tournamentId} onChange={(event) => setPlayerFilters((current) => ({ ...current, tournamentId: event.target.value, teamId: "" }))}>
              <option value="">Todos los torneos</option>
              {tournamentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select className="tournaments-input" value={playerFilters.teamId} onChange={(event) => setPlayerFilters((current) => ({ ...current, teamId: event.target.value }))}>
              <option value="">Todos los equipos</option>
              {playerTeamOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          {playerFeedback.error && <SectionNotice type="error" message={playerFeedback.error} />}
          {playerFeedback.success && <SectionNotice type="success" message={playerFeedback.success} />}
          <div className="tournaments-table-shell">
            <table className="tournaments-table">
              <thead>
                <tr>
                  <th>Jugador</th>
                  <th>Equipo</th>
                  <th>Posicion</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {players.map((item) => (
                  <tr key={item._id}>
                    <td>{item.firstName} {item.lastName} {item.jerseyNumber ? `#${item.jerseyNumber}` : ""}</td>
                    <td>{teamMap.get(item.teamId)?.name || item.teamId}</td>
                    <td>{item.position || "-"}</td>
                    <td>
                      <div className="tournaments-actions">
                        <button className="tournaments-button tournaments-button--ghost" onClick={() => {
                          setEditingPlayer(item);
                          setPlayerForm({
                            teamId: item.teamId,
                            firstName: item.firstName,
                            lastName: item.lastName,
                            jerseyNumber: item.jerseyNumber,
                            position: item.position || "",
                            birthDate: toInputDate(item.birthDate),
                          });
                        }}>Editar</button>
                        <button className="tournaments-button tournaments-button--danger" onClick={() => deleteWithConfirmation(`al jugador ${item.firstName} ${item.lastName}`, async () => {
                          await api.deletePlayer(item._id);
                          await loadPlayers();
                        })}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!playerFeedback.loading && players.length === 0 && <div className="tournaments-empty">No hay jugadores para los filtros actuales.</div>}
          </div>
          <form className="tournaments-form" onSubmit={handlePlayerSubmit}>
            <div className="tournaments-form__header">
              <h3>{editingPlayer ? "Editar jugador" : "Crear jugador"}</h3>
              {editingPlayer && <button type="button" className="tournaments-link-button" onClick={resetPlayerForm}>Cancelar edicion</button>}
            </div>
            <div className="tournaments-form-grid">
              <label>
                <span>Equipo</span>
                <select className="tournaments-input" value={playerForm.teamId} onChange={(event) => setPlayerForm((current) => ({ ...current, teamId: event.target.value }))}>
                  <option value="">Selecciona un equipo</option>
                  {playerTeamOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {playerErrors.teamId && <small>{playerErrors.teamId}</small>}
              </label>
              <label>
                <span>Nombre</span>
                <input className="tournaments-input" value={playerForm.firstName} onChange={(event) => setPlayerForm((current) => ({ ...current, firstName: event.target.value }))} />
                {playerErrors.firstName && <small>{playerErrors.firstName}</small>}
              </label>
              <label>
                <span>Apellido</span>
                <input className="tournaments-input" value={playerForm.lastName} onChange={(event) => setPlayerForm((current) => ({ ...current, lastName: event.target.value }))} />
                {playerErrors.lastName && <small>{playerErrors.lastName}</small>}
              </label>
              <label>
                <span>Dorsal</span>
                <input type="number" className="tournaments-input" value={playerForm.jerseyNumber ?? ""} onChange={(event) => setPlayerForm((current) => ({ ...current, jerseyNumber: event.target.value ? Number(event.target.value) : undefined }))} />
                {playerErrors.jerseyNumber && <small>{playerErrors.jerseyNumber}</small>}
              </label>
              <label>
                <span>Posicion</span>
                <input className="tournaments-input" value={playerForm.position || ""} onChange={(event) => setPlayerForm((current) => ({ ...current, position: event.target.value }))} />
              </label>
              <label>
                <span>Fecha de nacimiento</span>
                <input type="date" className="tournaments-input" value={playerForm.birthDate || ""} onChange={(event) => setPlayerForm((current) => ({ ...current, birthDate: event.target.value }))} />
              </label>
            </div>
            <div className="tournaments-actions tournaments-actions--end">
              <button className="tournaments-button" type="submit">{editingPlayer ? "Guardar jugador" : "Crear jugador"}</button>
            </div>
          </form>
        </article>

        <article className="tournaments-section-card">
          <div className="tournaments-section-card__header">
            <div>
              <h2>Partidos</h2>
              <p>Programacion, session streaming y marcador.</p>
            </div>
          </div>
          <div className="tournaments-filters tournaments-filters--three">
            <select className="tournaments-input" value={matchFilters.tournamentId || ""} onChange={(event) => setMatchFilters((current) => ({ ...current, tournamentId: event.target.value, teamId: "" }))}>
              <option value="">Todos los torneos</option>
              {tournamentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select className="tournaments-input" value={matchFilters.teamId || ""} onChange={(event) => setMatchFilters((current) => ({ ...current, teamId: event.target.value }))}>
              <option value="">Todos los equipos</option>
              {matchTeamOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select className="tournaments-input" value={matchFilters.status || ""} onChange={(event) => setMatchFilters((current) => ({ ...current, status: event.target.value as MatchFilters["status"] }))}>
              <option value="">Todos los estados</option>
              {MATCH_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{humanizeLabel(status)}</option>)}
            </select>
          </div>
          {matchFeedback.error && <SectionNotice type="error" message={matchFeedback.error} />}
          {matchFeedback.success && <SectionNotice type="success" message={matchFeedback.success} />}
          <div className="tournaments-table-shell">
            <table className="tournaments-table">
              <thead>
                <tr>
                  <th>Partido</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Streaming</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((item) => (
                  <tr key={item._id}>
                    <td>{teamMap.get(item.homeTeamId)?.name || item.homeTeamId} vs {teamMap.get(item.awayTeamId)?.name || item.awayTeamId}</td>
                    <td>{formatDateTime(item.scheduledAt)}</td>
                    <td>{humanizeLabel(item.status)}</td>
                    <td>{item.matchSessionId || "-"}</td>
                    <td>
                      <div className="tournaments-actions">
                        <button className="tournaments-button tournaments-button--ghost" onClick={() => {
                          setEditingMatch(item);
                          setMatchForm({
                            homeTeamId: item.homeTeamId,
                            awayTeamId: item.awayTeamId,
                            scheduledAt: toInputDateTime(item.scheduledAt),
                            venue: item.venue || "",
                            round: item.round || "",
                            status: item.status || "scheduled",
                            matchSessionId: item.matchSessionId || "",
                          });
                          setMatchFormScoreHome(item.score?.home || 0);
                          setMatchFormScoreAway(item.score?.away || 0);
                          setMatchFormWinnerTeamId(item.winnerTeamId || "");
                        }}>Editar</button>
                        <button className="tournaments-button tournaments-button--danger" onClick={() => deleteWithConfirmation("el partido", async () => {
                          await api.deleteMatch(item._id);
                          await Promise.all([loadMatches(), loadMatchCatalog(), loadMatchStats()]);
                        })}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!matchFeedback.loading && matches.length === 0 && <div className="tournaments-empty">No hay partidos para los filtros actuales.</div>}
          </div>
          <form className="tournaments-form" onSubmit={handleMatchSubmit}>
            <div className="tournaments-form__header">
              <h3>{editingMatch ? "Editar partido" : "Crear partido"}</h3>
              {editingMatch && <button type="button" className="tournaments-link-button" onClick={resetMatchForm}>Cancelar edicion</button>}
            </div>
            <div className="tournaments-form-grid">
              <label>
                <span>Equipo local</span>
                <select className="tournaments-input" value={matchForm.homeTeamId} onChange={(event) => setMatchForm((current) => ({ ...current, homeTeamId: event.target.value }))}>
                  <option value="">Selecciona equipo</option>
                  {matchTeamOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {matchErrors.homeTeamId && <small>{matchErrors.homeTeamId}</small>}
              </label>
              <label>
                <span>Equipo visitante</span>
                <select className="tournaments-input" value={matchForm.awayTeamId} onChange={(event) => setMatchForm((current) => ({ ...current, awayTeamId: event.target.value }))}>
                  <option value="">Selecciona equipo</option>
                  {matchTeamOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {matchErrors.awayTeamId && <small>{matchErrors.awayTeamId}</small>}
              </label>
              <label>
                <span>Programado para</span>
                <input type="datetime-local" className="tournaments-input" value={matchForm.scheduledAt || ""} onChange={(event) => setMatchForm((current) => ({ ...current, scheduledAt: event.target.value }))} />
              </label>
              <label>
                <span>Estado</span>
                <select className="tournaments-input" value={matchForm.status || "scheduled"} onChange={(event) => setMatchForm((current) => ({ ...current, status: event.target.value as TournamentMatchCreateRequest["status"] }))}>
                  {MATCH_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{humanizeLabel(status)}</option>)}
                </select>
              </label>
              <label>
                <span>Ronda</span>
                <input className="tournaments-input" value={matchForm.round || ""} onChange={(event) => setMatchForm((current) => ({ ...current, round: event.target.value }))} />
              </label>
              <label>
                <span>Venue</span>
                <input className="tournaments-input" value={matchForm.venue || ""} onChange={(event) => setMatchForm((current) => ({ ...current, venue: event.target.value }))} />
              </label>
              <label>
                <span>matchSessionId</span>
                <input className="tournaments-input" value={matchForm.matchSessionId || ""} onChange={(event) => setMatchForm((current) => ({ ...current, matchSessionId: event.target.value }))} />
              </label>
              {editingMatch && (
                <>
                  <label>
                    <span>Marcador local</span>
                    <input type="number" className="tournaments-input" value={matchFormScoreHome} onChange={(event) => setMatchFormScoreHome(Number(event.target.value) || 0)} />
                  </label>
                  <label>
                    <span>Marcador visitante</span>
                    <input type="number" className="tournaments-input" value={matchFormScoreAway} onChange={(event) => setMatchFormScoreAway(Number(event.target.value) || 0)} />
                  </label>
                  <label>
                    <span>Ganador</span>
                    <select className="tournaments-input" value={matchFormWinnerTeamId} onChange={(event) => setMatchFormWinnerTeamId(event.target.value)}>
                      <option value="">Sin ganador</option>
                      {matchTeamOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                </>
              )}
            </div>
            <div className="tournaments-actions tournaments-actions--end">
              <button className="tournaments-button" type="submit">{editingMatch ? "Guardar partido" : "Crear partido"}</button>
            </div>
          </form>
        </article>

        <article className="tournaments-section-card">
          <div className="tournaments-section-card__header">
            <div>
              <h2>Estadisticas</h2>
              <p>Metrics y resumenes asociados a cada partido.</p>
            </div>
          </div>
          <div className="tournaments-filters">
            <select className="tournaments-input" value={matchStatFilters.tournamentId || ""} onChange={(event) => setMatchStatFilters({ tournamentId: event.target.value, matchId: "" })}>
              <option value="">Todos los torneos</option>
              {tournamentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select className="tournaments-input" value={matchStatFilters.matchId || ""} onChange={(event) => setMatchStatFilters((current) => ({ ...current, matchId: event.target.value }))}>
              <option value="">Todos los partidos</option>
              {statMatchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          {matchStatFeedback.error && <SectionNotice type="error" message={matchStatFeedback.error} />}
          {matchStatFeedback.success && <SectionNotice type="success" message={matchStatFeedback.success} />}
          <div className="tournaments-table-shell">
            <table className="tournaments-table">
              <thead>
                <tr>
                  <th>Partido</th>
                  <th>Sport</th>
                  <th>Stats</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {matchStats.map((item) => (
                  <tr key={item._id}>
                    <td>{statMatchOptions.find((option) => option.value === item.matchId)?.label || item.matchId}</td>
                    <td>{item.sport || "-"}</td>
                    <td><pre className="tournaments-json-preview">{JSON.stringify(item.stats, null, 2)}</pre></td>
                    <td>
                      <div className="tournaments-actions">
                        <button className="tournaments-button tournaments-button--ghost" onClick={() => {
                          setEditingMatchStat(item);
                          setMatchStatForm({ matchId: item.matchId, sport: item.sport || "", stats: item.stats || {} });
                          setMatchStatsJsonText(JSON.stringify(item.stats || {}, null, 2));
                        }}>Editar</button>
                        <button className="tournaments-button tournaments-button--danger" onClick={() => deleteWithConfirmation("la estadistica", async () => {
                          await api.deleteMatchStat(item._id);
                          await loadMatchStats();
                        })}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!matchStatFeedback.loading && matchStats.length === 0 && <div className="tournaments-empty">No hay estadisticas para los filtros actuales.</div>}
          </div>
          <form className="tournaments-form" onSubmit={handleMatchStatSubmit}>
            <div className="tournaments-form__header">
              <h3>{editingMatchStat ? "Editar estadistica" : "Crear estadistica"}</h3>
              {editingMatchStat && <button type="button" className="tournaments-link-button" onClick={resetMatchStatForm}>Cancelar edicion</button>}
            </div>
            <div className="tournaments-form-grid">
              <label>
                <span>Partido</span>
                <select className="tournaments-input" value={matchStatForm.matchId} onChange={(event) => setMatchStatForm((current) => ({ ...current, matchId: event.target.value }))}>
                  <option value="">Selecciona partido</option>
                  {statMatchOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {matchStatErrors.matchId && <small>{matchStatErrors.matchId}</small>}
              </label>
              <label>
                <span>Sport</span>
                <input className="tournaments-input" value={matchStatForm.sport || ""} onChange={(event) => setMatchStatForm((current) => ({ ...current, sport: event.target.value }))} />
              </label>
              <label className="tournaments-form-grid__full">
                <span>Stats JSON</span>
                <textarea className="tournaments-input tournaments-textarea tournaments-textarea--code" value={matchStatsJsonText} onChange={(event) => setMatchStatsJsonText(event.target.value)} />
                {matchStatErrors.stats && <small>{matchStatErrors.stats}</small>}
              </label>
            </div>
            <div className="tournaments-actions tournaments-actions--end">
              <button className="tournaments-button" type="submit">{editingMatchStat ? "Guardar estadistica" : "Crear estadistica"}</button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
};

export default TournamentsDashboardPage;
