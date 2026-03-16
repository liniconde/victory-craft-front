import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { Field } from "../../../../interfaces/FieldInterfaces";
import { useAuth } from "../../../../context/AuthContext";
import { getFields } from "../../../../services/field/fieldService";
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
  fieldId: undefined,
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

export const toInputDateTime = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

export const toInputDate = (value?: string): string => {
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

export const humanizeLabel = (value?: string): string => {
  if (!value) return "-";
  return value.replace(/_/g, " ");
};

export const formatDateTime = (value?: string): string => {
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

interface TournamentsDashboardDataContextValue {
  tournaments: Tournament[];
  teams: TournamentTeam[];
  players: TournamentPlayer[];
  matches: TournamentMatch[];
  matchStats: TournamentMatchStat[];
  fieldCatalog: Field[];
  teamCatalog: TournamentTeam[];
  matchCatalog: TournamentMatch[];
  tournamentMap: Map<string, Tournament>;
  teamMap: Map<string, TournamentTeam>;
  fieldMap: Map<string, Field>;
  tournamentOptions: { value: string; label: string }[];
  playerTeamOptions: { value: string; label: string }[];
  matchTeamOptions: { value: string; label: string }[];
  statMatchOptions: { value: string; label: string }[];
  fieldOptions: { value: string; label: string }[];
  tournamentFilters: TournamentFilters;
  setTournamentFilters: React.Dispatch<React.SetStateAction<TournamentFilters>>;
  teamFilters: TeamFilters;
  setTeamFilters: React.Dispatch<React.SetStateAction<TeamFilters>>;
  playerFilters: { tournamentId: string; teamId: string };
  setPlayerFilters: React.Dispatch<React.SetStateAction<{ tournamentId: string; teamId: string }>>;
  matchFilters: MatchFilters;
  setMatchFilters: React.Dispatch<React.SetStateAction<MatchFilters>>;
  matchStatFilters: MatchStatFilters;
  setMatchStatFilters: React.Dispatch<React.SetStateAction<MatchStatFilters>>;
  tournamentFeedback: SectionFeedback;
  teamFeedback: SectionFeedback;
  playerFeedback: SectionFeedback;
  matchFeedback: SectionFeedback;
  matchStatFeedback: SectionFeedback;
  tournamentForm: TournamentCreateRequest;
  setTournamentForm: React.Dispatch<React.SetStateAction<TournamentCreateRequest>>;
  teamForm: TournamentTeamCreateRequest;
  setTeamForm: React.Dispatch<React.SetStateAction<TournamentTeamCreateRequest>>;
  playerForm: TournamentPlayerCreateRequest;
  setPlayerForm: React.Dispatch<React.SetStateAction<TournamentPlayerCreateRequest>>;
  matchForm: TournamentMatchCreateRequest;
  setMatchForm: React.Dispatch<React.SetStateAction<TournamentMatchCreateRequest>>;
  matchFormScoreHome: number;
  setMatchFormScoreHome: React.Dispatch<React.SetStateAction<number>>;
  matchFormScoreAway: number;
  setMatchFormScoreAway: React.Dispatch<React.SetStateAction<number>>;
  matchFormWinnerTeamId: string;
  setMatchFormWinnerTeamId: React.Dispatch<React.SetStateAction<string>>;
  matchStatForm: TournamentMatchStatCreateRequest;
  setMatchStatForm: React.Dispatch<React.SetStateAction<TournamentMatchStatCreateRequest>>;
  matchStatsJsonText: string;
  setMatchStatsJsonText: React.Dispatch<React.SetStateAction<string>>;
  editingTournament: Tournament | null;
  setEditingTournament: React.Dispatch<React.SetStateAction<Tournament | null>>;
  editingTeam: TournamentTeam | null;
  setEditingTeam: React.Dispatch<React.SetStateAction<TournamentTeam | null>>;
  editingPlayer: TournamentPlayer | null;
  setEditingPlayer: React.Dispatch<React.SetStateAction<TournamentPlayer | null>>;
  editingMatch: TournamentMatch | null;
  setEditingMatch: React.Dispatch<React.SetStateAction<TournamentMatch | null>>;
  editingMatchStat: TournamentMatchStat | null;
  setEditingMatchStat: React.Dispatch<React.SetStateAction<TournamentMatchStat | null>>;
  tournamentErrors: ValidationErrors<keyof TournamentCreateRequest>;
  setTournamentErrors: React.Dispatch<React.SetStateAction<ValidationErrors<keyof TournamentCreateRequest>>>;
  teamErrors: ValidationErrors<keyof TournamentTeamCreateRequest>;
  setTeamErrors: React.Dispatch<React.SetStateAction<ValidationErrors<keyof TournamentTeamCreateRequest>>>;
  playerErrors: ValidationErrors<keyof TournamentPlayerCreateRequest>;
  setPlayerErrors: React.Dispatch<React.SetStateAction<ValidationErrors<keyof TournamentPlayerCreateRequest>>>;
  matchErrors: ValidationErrors<keyof TournamentMatchCreateRequest>;
  setMatchErrors: React.Dispatch<React.SetStateAction<ValidationErrors<keyof TournamentMatchCreateRequest>>>;
  matchStatErrors: ValidationErrors<"matchId" | "stats">;
  setMatchStatErrors: React.Dispatch<React.SetStateAction<ValidationErrors<"matchId" | "stats">>>;
  resetTournamentForm: () => void;
  resetTeamForm: () => void;
  resetPlayerForm: () => void;
  resetMatchForm: () => void;
  resetMatchStatForm: () => void;
  handleTournamentSubmit: (event: React.FormEvent) => Promise<void>;
  handleTeamSubmit: (event: React.FormEvent) => Promise<void>;
  handlePlayerSubmit: (event: React.FormEvent) => Promise<void>;
  handleMatchSubmit: (event: React.FormEvent) => Promise<void>;
  handleMatchStatSubmit: (event: React.FormEvent) => Promise<void>;
  handleGenerateMatches: (tournamentId: string) => Promise<void>;
  deleteWithConfirmation: (label: string, action: () => Promise<void>) => Promise<void>;
  api: ReturnType<typeof useTournamentsModule>["api"];
  userId: string | null;
  TOURNAMENT_STATUS_OPTIONS: typeof TOURNAMENT_STATUS_OPTIONS;
  MATCH_STATUS_OPTIONS: typeof MATCH_STATUS_OPTIONS;
  loadTournaments: () => Promise<void>;
  loadTeams: () => Promise<void>;
  loadPlayers: () => Promise<void>;
  loadMatches: () => Promise<void>;
  loadMatchStats: () => Promise<void>;
  loadTeamCatalog: () => Promise<void>;
  loadMatchCatalog: () => Promise<void>;
  loadFieldCatalog: () => Promise<void>;
}

const TournamentsDashboardDataContext = createContext<TournamentsDashboardDataContextValue | undefined>(undefined);

export const TournamentsDashboardDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { api, feedback } = useTournamentsModule();
  const { userId } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [matchStats, setMatchStats] = useState<TournamentMatchStat[]>([]);
  const [fieldCatalog, setFieldCatalog] = useState<Field[]>([]);
  const [teamCatalog, setTeamCatalog] = useState<TournamentTeam[]>([]);
  const [matchCatalog, setMatchCatalog] = useState<TournamentMatch[]>([]);

  const [tournamentFilters, setTournamentFilters] = useState<TournamentFilters>({ sport: "", status: "" });
  const [teamFilters, setTeamFilters] = useState<TeamFilters>({ tournamentId: "" });
  const [playerFilters, setPlayerFilters] = useState({ tournamentId: "", teamId: "" });
  const [matchFilters, setMatchFilters] = useState<MatchFilters>({ tournamentId: "", teamId: "", status: "" });
  const [matchStatFilters, setMatchStatFilters] = useState<MatchStatFilters>({ tournamentId: "", matchId: "" });

  const [tournamentFeedback, setTournamentFeedback] = useState<SectionFeedback>(EMPTY_FEEDBACK);
  const [teamFeedback, setTeamFeedback] = useState<SectionFeedback>(EMPTY_FEEDBACK);
  const [playerFeedback, setPlayerFeedback] = useState<SectionFeedback>(EMPTY_FEEDBACK);
  const [matchFeedback, setMatchFeedback] = useState<SectionFeedback>(EMPTY_FEEDBACK);
  const [matchStatFeedback, setMatchStatFeedback] = useState<SectionFeedback>(EMPTY_FEEDBACK);

  const [tournamentForm, setTournamentForm] = useState<TournamentCreateRequest>(createTournamentInitialState(userId));
  const [teamForm, setTeamForm] = useState<TournamentTeamCreateRequest>(createTeamInitialState());
  const [playerForm, setPlayerForm] = useState<TournamentPlayerCreateRequest>(createPlayerInitialState());
  const [matchForm, setMatchForm] = useState<TournamentMatchCreateRequest>(createMatchInitialState());
  const [matchFormScoreHome, setMatchFormScoreHome] = useState(0);
  const [matchFormScoreAway, setMatchFormScoreAway] = useState(0);
  const [matchFormWinnerTeamId, setMatchFormWinnerTeamId] = useState("");
  const [matchStatForm, setMatchStatForm] = useState<TournamentMatchStatCreateRequest>(createMatchStatInitialState());
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

  const tournamentMap = useMemo(() => new Map(tournaments.map((item) => [item._id, item])), [tournaments]);
  const teamMap = useMemo(() => new Map(teamCatalog.map((item) => [item._id, item])), [teamCatalog]);
  const fieldMap = useMemo(() => new Map(fieldCatalog.map((item) => [item._id, item])), [fieldCatalog]);

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
      const response = await api.listTeams({ tournamentId: teamFilters.tournamentId || undefined });
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

  const loadFieldCatalog = async () => {
    try {
      const response = await getFields();
      setFieldCatalog(response || []);
    } catch (error) {
      console.error("Error loading field catalog:", error);
    }
  };

  useEffect(() => { void loadTournaments(); }, [tournamentFilters.sport, tournamentFilters.status]);
  useEffect(() => { void loadTeams(); }, [teamFilters.tournamentId]);
  useEffect(() => { void loadPlayers(); }, [playerFilters.tournamentId, playerFilters.teamId]);
  useEffect(() => { void loadMatches(); }, [matchFilters.tournamentId, matchFilters.teamId, matchFilters.status]);
  useEffect(() => { void loadMatchStats(); }, [matchStatFilters.tournamentId, matchStatFilters.matchId]);
  useEffect(() => { void loadTeamCatalog(); void loadMatchCatalog(); void loadFieldCatalog(); }, []);

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
    const basePayload = {
      ...matchForm,
      scheduledAt: toApiDateTime(matchForm.scheduledAt),
      matchSessionId: matchForm.matchSessionId || undefined,
    };
    const errors = validateMatch(basePayload);
    if (typeof matchForm.fieldId === "string" && matchForm.fieldId && !fieldMap.has(matchForm.fieldId)) {
      errors.fieldId = "La cancha seleccionada no existe en el sistema.";
    }
    setMatchErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(setMatchFeedback);
    try {
      if (editingMatch) {
        const updatePayload = {
          ...basePayload,
          fieldId: matchForm.fieldId ? matchForm.fieldId : null,
        };
        await api.updateMatch(editingMatch._id, {
          ...updatePayload,
          score:
            matchForm.status === "finished" || editingMatch.score
              ? { home: matchFormScoreHome, away: matchFormScoreAway }
              : undefined,
          winnerTeamId: matchFormWinnerTeamId || undefined,
        });
        setMatchFeedback({ loading: false, error: null, success: "Partido actualizado." });
      } else {
        const createPayload = {
          ...basePayload,
          fieldId: matchForm.fieldId ? matchForm.fieldId : undefined,
        };
        await api.createMatch(createPayload);
        setMatchFeedback({ loading: false, error: null, success: "Partido creado." });
      }
      resetMatchForm();
      await Promise.all([loadMatches(), loadMatchCatalog()]);
    } catch (error) {
      console.error("Error saving match:", error);
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404 &&
        error.response.data?.code === "field_not_found"
      ) {
        setMatchErrors((current) => ({
          ...current,
          fieldId: "La cancha seleccionada ya no existe.",
        }));
        setMatchFeedback({
          loading: false,
          error: "La cancha seleccionada ya no existe.",
          success: null,
        });
        return;
      }
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
    if (!parsedStats) errors.stats = "Introduce un JSON valido para las estadisticas.";
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
        success: response.message || `Fixture generado con ${response.matchesCreated ?? 0} partidos.`,
      });
      await Promise.all([loadMatches(), loadMatchCatalog()]);
    } catch (error) {
      console.error("Error generating matches:", error);
      setTournamentFeedback({ loading: false, error: "No se pudo generar el fixture.", success: null });
    }
  };

  const deleteWithConfirmation = async (label: string, action: () => Promise<void>) => {
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

  const fieldOptions = fieldCatalog.map((field) => ({
    value: field._id,
    label: [
      field.name,
      field.location?.name || "",
      field.type || "",
    ]
      .filter(Boolean)
      .join(" · "),
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

  const value = {
    tournaments,
    teams,
    players,
    matches,
    matchStats,
    fieldCatalog,
    teamCatalog,
    matchCatalog,
    tournamentMap,
    teamMap,
    fieldMap,
    tournamentOptions,
    playerTeamOptions,
    matchTeamOptions,
    statMatchOptions,
    fieldOptions,
    tournamentFilters,
    setTournamentFilters,
    teamFilters,
    setTeamFilters,
    playerFilters,
    setPlayerFilters,
    matchFilters,
    setMatchFilters,
    matchStatFilters,
    setMatchStatFilters,
    tournamentFeedback,
    teamFeedback,
    playerFeedback,
    matchFeedback,
    matchStatFeedback,
    tournamentForm,
    setTournamentForm,
    teamForm,
    setTeamForm,
    playerForm,
    setPlayerForm,
    matchForm,
    setMatchForm,
    matchFormScoreHome,
    setMatchFormScoreHome,
    matchFormScoreAway,
    setMatchFormScoreAway,
    matchFormWinnerTeamId,
    setMatchFormWinnerTeamId,
    matchStatForm,
    setMatchStatForm,
    matchStatsJsonText,
    setMatchStatsJsonText,
    editingTournament,
    setEditingTournament,
    editingTeam,
    setEditingTeam,
    editingPlayer,
    setEditingPlayer,
    editingMatch,
    setEditingMatch,
    editingMatchStat,
    setEditingMatchStat,
    tournamentErrors,
    setTournamentErrors,
    teamErrors,
    setTeamErrors,
    playerErrors,
    setPlayerErrors,
    matchErrors,
    setMatchErrors,
    matchStatErrors,
    setMatchStatErrors,
    resetTournamentForm,
    resetTeamForm,
    resetPlayerForm,
    resetMatchForm,
    resetMatchStatForm,
    handleTournamentSubmit,
    handleTeamSubmit,
    handlePlayerSubmit,
    handleMatchSubmit,
    handleMatchStatSubmit,
    handleGenerateMatches,
    deleteWithConfirmation,
    api,
    userId,
    TOURNAMENT_STATUS_OPTIONS,
    MATCH_STATUS_OPTIONS,
    loadTournaments,
    loadTeams,
    loadPlayers,
    loadMatches,
    loadMatchStats,
    loadTeamCatalog,
    loadMatchCatalog,
    loadFieldCatalog,
  } satisfies TournamentsDashboardDataContextValue;

  return (
    <TournamentsDashboardDataContext.Provider value={value}>
      {children}
    </TournamentsDashboardDataContext.Provider>
  );
};

export const useTournamentsDashboardData = () => {
  const context = useContext(TournamentsDashboardDataContext);
  if (!context) {
    throw new Error("useTournamentsDashboardData must be used within provider");
  }
  return context;
};
