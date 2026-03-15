import { api } from "../../../../utils/api";
import type {
  DeleteMatchResponse,
  DeleteMatchStatResponse,
  DeletePlayerResponse,
  DeleteTeamResponse,
  DeleteTournamentResponse,
  GenerateTournamentMatchesResponse,
  MatchFilters,
  MatchStatFilters,
  PlayerFilters,
  TeamFilters,
  Tournament,
  TournamentCreateRequest,
  TournamentFilters,
  TournamentListResponse,
  TournamentMatch,
  TournamentMatchCreateRequest,
  TournamentMatchListResponse,
  TournamentMatchStat,
  TournamentMatchStatCreateRequest,
  TournamentMatchStatListResponse,
  TournamentMatchStatUpdateRequest,
  TournamentMatchUpdateRequest,
  TournamentPlayer,
  TournamentPlayerCreateRequest,
  TournamentPlayerListResponse,
  TournamentPlayerUpdateRequest,
  TournamentTeam,
  TournamentTeamCreateRequest,
  TournamentTeamListResponse,
  TournamentTeamUpdateRequest,
  TournamentUpdateRequest,
} from "../types";

const BASE = "/tournaments";

export const tournamentsApi = {
  listTournaments: async (
    params: TournamentFilters = {}
  ): Promise<TournamentListResponse> => {
    const response = await api.get<TournamentListResponse>(BASE, { params });
    return response.data;
  },
  createTournament: async (
    payload: TournamentCreateRequest
  ): Promise<Tournament> => {
    const response = await api.post<Tournament>(BASE, payload);
    return response.data;
  },
  getTournament: async (id: string): Promise<Tournament> => {
    const response = await api.get<Tournament>(`${BASE}/${id}`);
    return response.data;
  },
  updateTournament: async (
    id: string,
    payload: TournamentUpdateRequest
  ): Promise<Tournament> => {
    const response = await api.put<Tournament>(`${BASE}/${id}`, payload);
    return response.data;
  },
  deleteTournament: async (id: string): Promise<DeleteTournamentResponse> => {
    const response = await api.delete<DeleteTournamentResponse>(`${BASE}/${id}`);
    return response.data;
  },
  generateMatches: async (
    id: string
  ): Promise<GenerateTournamentMatchesResponse> => {
    const response = await api.post<GenerateTournamentMatchesResponse>(
      `${BASE}/${id}/generate-matches`
    );
    return response.data;
  },
  listTeams: async (params: TeamFilters = {}): Promise<TournamentTeamListResponse> => {
    const response = await api.get<TournamentTeamListResponse>(`${BASE}/teams`, {
      params,
    });
    return response.data;
  },
  createTeam: async (
    payload: TournamentTeamCreateRequest
  ): Promise<TournamentTeam> => {
    const response = await api.post<TournamentTeam>(`${BASE}/teams`, payload);
    return response.data;
  },
  getTeam: async (id: string): Promise<TournamentTeam> => {
    const response = await api.get<TournamentTeam>(`${BASE}/teams/${id}`);
    return response.data;
  },
  updateTeam: async (
    id: string,
    payload: TournamentTeamUpdateRequest
  ): Promise<TournamentTeam> => {
    const response = await api.put<TournamentTeam>(`${BASE}/teams/${id}`, payload);
    return response.data;
  },
  deleteTeam: async (id: string): Promise<DeleteTeamResponse> => {
    const response = await api.delete<DeleteTeamResponse>(`${BASE}/teams/${id}`);
    return response.data;
  },
  listPlayers: async (
    params: PlayerFilters = {}
  ): Promise<TournamentPlayerListResponse> => {
    const response = await api.get<TournamentPlayerListResponse>(
      `${BASE}/matches/players`,
      { params }
    );
    return response.data;
  },
  createPlayer: async (
    payload: TournamentPlayerCreateRequest
  ): Promise<TournamentPlayer> => {
    const response = await api.post<TournamentPlayer>(
      `${BASE}/matches/players`,
      payload
    );
    return response.data;
  },
  getPlayer: async (id: string): Promise<TournamentPlayer> => {
    const response = await api.get<TournamentPlayer>(`${BASE}/matches/players/${id}`);
    return response.data;
  },
  updatePlayer: async (
    id: string,
    payload: TournamentPlayerUpdateRequest
  ): Promise<TournamentPlayer> => {
    const response = await api.put<TournamentPlayer>(
      `${BASE}/matches/players/${id}`,
      payload
    );
    return response.data;
  },
  deletePlayer: async (id: string): Promise<DeletePlayerResponse> => {
    const response = await api.delete<DeletePlayerResponse>(
      `${BASE}/matches/players/${id}`
    );
    return response.data;
  },
  listMatches: async (
    params: MatchFilters = {}
  ): Promise<TournamentMatchListResponse> => {
    const response = await api.get<TournamentMatchListResponse>(`${BASE}/matches`, {
      params,
    });
    return response.data;
  },
  createMatch: async (
    payload: TournamentMatchCreateRequest
  ): Promise<TournamentMatch> => {
    const response = await api.post<TournamentMatch>(`${BASE}/matches`, payload);
    return response.data;
  },
  getMatch: async (id: string): Promise<TournamentMatch> => {
    const response = await api.get<TournamentMatch>(`${BASE}/matches/${id}`);
    return response.data;
  },
  updateMatch: async (
    id: string,
    payload: TournamentMatchUpdateRequest
  ): Promise<TournamentMatch> => {
    const response = await api.put<TournamentMatch>(`${BASE}/matches/${id}`, payload);
    return response.data;
  },
  deleteMatch: async (id: string): Promise<DeleteMatchResponse> => {
    const response = await api.delete<DeleteMatchResponse>(`${BASE}/matches/${id}`);
    return response.data;
  },
  listMatchStats: async (
    params: MatchStatFilters = {}
  ): Promise<TournamentMatchStatListResponse> => {
    const response = await api.get<TournamentMatchStatListResponse>(
      `${BASE}/matches/match-stats`,
      { params }
    );
    return response.data;
  },
  createMatchStat: async (
    payload: TournamentMatchStatCreateRequest
  ): Promise<TournamentMatchStat> => {
    const response = await api.post<TournamentMatchStat>(
      `${BASE}/matches/match-stats`,
      payload
    );
    return response.data;
  },
  getMatchStat: async (id: string): Promise<TournamentMatchStat> => {
    const response = await api.get<TournamentMatchStat>(
      `${BASE}/matches/match-stats/${id}`
    );
    return response.data;
  },
  updateMatchStat: async (
    id: string,
    payload: TournamentMatchStatUpdateRequest
  ): Promise<TournamentMatchStat> => {
    const response = await api.put<TournamentMatchStat>(
      `${BASE}/matches/match-stats/${id}`,
      payload
    );
    return response.data;
  },
  deleteMatchStat: async (id: string): Promise<DeleteMatchStatResponse> => {
    const response = await api.delete<DeleteMatchStatResponse>(
      `${BASE}/matches/match-stats/${id}`
    );
    return response.data;
  },
};
