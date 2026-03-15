import type {
  TournamentCreateRequest,
  TournamentMatchCreateRequest,
  TournamentMatchStatCreateRequest,
  TournamentPlayerCreateRequest,
  TournamentTeamCreateRequest,
} from "./types";

export type ValidationErrors<T extends string = string> = Partial<Record<T, string>>;

export const validateTournament = (
  values: TournamentCreateRequest
): ValidationErrors<keyof TournamentCreateRequest> => {
  const errors: ValidationErrors<keyof TournamentCreateRequest> = {};

  if (!values.name.trim()) errors.name = "El nombre es obligatorio.";
  if (!values.sport.trim()) errors.sport = "El deporte es obligatorio.";
  if (values.startsAt && values.endsAt) {
    const startsAt = new Date(values.startsAt).getTime();
    const endsAt = new Date(values.endsAt).getTime();
    if (!Number.isNaN(startsAt) && !Number.isNaN(endsAt) && endsAt < startsAt) {
      errors.endsAt = "La fecha de fin debe ser posterior al inicio.";
    }
  }

  return errors;
};

export const validateTeam = (
  values: TournamentTeamCreateRequest
): ValidationErrors<keyof TournamentTeamCreateRequest> => {
  const errors: ValidationErrors<keyof TournamentTeamCreateRequest> = {};

  if (!values.tournamentId) errors.tournamentId = "Selecciona un torneo.";
  if (!values.name.trim()) errors.name = "El nombre del equipo es obligatorio.";

  return errors;
};

export const validatePlayer = (
  values: TournamentPlayerCreateRequest
): ValidationErrors<keyof TournamentPlayerCreateRequest> => {
  const errors: ValidationErrors<keyof TournamentPlayerCreateRequest> = {};

  if (!values.teamId) errors.teamId = "Selecciona un equipo.";
  if (!values.firstName.trim()) errors.firstName = "El nombre es obligatorio.";
  if (!values.lastName.trim()) errors.lastName = "El apellido es obligatorio.";
  if (typeof values.jerseyNumber === "number" && values.jerseyNumber < 0) {
    errors.jerseyNumber = "El dorsal no puede ser negativo.";
  }

  return errors;
};

export const validateMatch = (
  values: TournamentMatchCreateRequest
): ValidationErrors<keyof TournamentMatchCreateRequest> => {
  const errors: ValidationErrors<keyof TournamentMatchCreateRequest> = {};

  if (!values.homeTeamId) errors.homeTeamId = "Selecciona el equipo local.";
  if (!values.awayTeamId) errors.awayTeamId = "Selecciona el equipo visitante.";
  if (values.homeTeamId && values.awayTeamId && values.homeTeamId === values.awayTeamId) {
    errors.awayTeamId = "El equipo visitante debe ser distinto al local.";
  }

  return errors;
};

export const validateMatchStat = (
  values: TournamentMatchStatCreateRequest
): ValidationErrors<"matchId" | "stats"> => {
  const errors: ValidationErrors<"matchId" | "stats"> = {};

  if (!values.matchId) errors.matchId = "Selecciona un partido.";
  if (!values.stats || Object.keys(values.stats).length === 0) {
    errors.stats = "Las estadisticas son obligatorias.";
  }

  return errors;
};

export const safeParseJsonObject = (value: string): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};
