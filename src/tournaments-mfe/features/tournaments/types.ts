export const TOURNAMENT_STATUS_OPTIONS = [
  "draft",
  "registration_open",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const MATCH_STATUS_OPTIONS = [
  "scheduled",
  "in_progress",
  "finished",
  "cancelled",
] as const;

export type TournamentStatus = (typeof TOURNAMENT_STATUS_OPTIONS)[number];
export type MatchStatus = (typeof MATCH_STATUS_OPTIONS)[number];

export interface Tournament {
  _id: string;
  name: string;
  sport: string;
  description?: string;
  ownerId?: string;
  status?: TournamentStatus;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentCreateRequest {
  name: string;
  sport: string;
  description?: string;
  ownerId?: string;
  status?: TournamentStatus;
  startsAt?: string;
  endsAt?: string;
}

export interface TournamentUpdateRequest {
  name?: string;
  sport?: string;
  description?: string;
  ownerId?: string;
  status?: TournamentStatus;
  startsAt?: string;
  endsAt?: string;
}

export interface TournamentListResponse {
  items: Tournament[];
  total: number;
}

export interface TournamentTeam {
  _id: string;
  tournamentId: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  coachName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentTeamCreateRequest {
  tournamentId: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  coachName?: string;
}

export interface TournamentTeamUpdateRequest {
  name?: string;
  shortName?: string;
  logoUrl?: string;
  coachName?: string;
}

export interface TournamentTeamListResponse {
  items: TournamentTeam[];
  total: number;
}

export interface TournamentPlayer {
  _id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentPlayerCreateRequest {
  teamId: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: number;
  position?: string;
  birthDate?: string;
}

export interface TournamentPlayerUpdateRequest {
  firstName?: string;
  lastName?: string;
  jerseyNumber?: number;
  position?: string;
  birthDate?: string;
}

export interface TournamentPlayerListResponse {
  items: TournamentPlayer[];
  total: number;
}

export interface TournamentMatchScore {
  home: number;
  away: number;
}

export interface TournamentMatch {
  _id: string;
  homeTeamId: string;
  awayTeamId: string;
  pairKey?: string;
  scheduledAt?: string;
  venue?: string;
  round?: string;
  status?: MatchStatus;
  score?: TournamentMatchScore;
  winnerTeamId?: string;
  matchSessionId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentMatchCreateRequest {
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt?: string;
  venue?: string;
  round?: string;
  status?: MatchStatus;
  matchSessionId?: string;
}

export interface TournamentMatchUpdateRequest {
  scheduledAt?: string;
  venue?: string;
  round?: string;
  status?: MatchStatus;
  score?: TournamentMatchScore;
  winnerTeamId?: string;
  matchSessionId?: string;
}

export interface TournamentMatchListResponse {
  items: TournamentMatch[];
  total: number;
}

export interface TournamentMatchStat {
  _id: string;
  matchId: string;
  sport?: string;
  stats: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentMatchStatCreateRequest {
  matchId: string;
  sport?: string;
  stats: Record<string, unknown>;
}

export interface TournamentMatchStatUpdateRequest {
  sport?: string;
  stats?: Record<string, unknown>;
}

export interface TournamentMatchStatListResponse {
  items: TournamentMatchStat[];
  total: number;
}

export interface DeleteTournamentResponse {
  message?: string;
  deletedTournamentId?: string;
  deletedTeamsCount?: number;
  deletedMatchesCount?: number;
}

export interface DeleteTeamResponse {
  message?: string;
  deletedTeamId?: string;
  deletedMatchesCount?: number;
}

export interface DeletePlayerResponse {
  message?: string;
  deletedPlayerId?: string;
}

export interface DeleteMatchResponse {
  message?: string;
  deletedMatchId?: string;
  deletedStatsCount?: number;
}

export interface DeleteMatchStatResponse {
  message?: string;
  deletedMatchStatId?: string;
}

export interface GenerateTournamentMatchesResponse {
  tournamentId?: string;
  teamsCount?: number;
  matchesCreated?: number;
  message?: string;
}

export interface TournamentFilters {
  sport?: string;
  status?: TournamentStatus | "";
}

export interface TeamFilters {
  tournamentId?: string;
}

export interface PlayerFilters {
  tournamentId?: string;
  teamId?: string;
}

export interface MatchFilters {
  tournamentId?: string;
  teamId?: string;
  status?: MatchStatus | "";
}

export interface MatchStatFilters {
  tournamentId?: string;
  matchId?: string;
}

export interface SectionFeedback {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface EntityOption {
  value: string;
  label: string;
}
