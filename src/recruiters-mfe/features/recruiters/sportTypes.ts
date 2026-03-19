export const RECRUITER_SPORT_TYPES = [
  "football",
  "futsal",
  "basketball",
  "baseball",
  "volleyball",
  "tennis",
  "padel",
  "other",
] as const;

export type RecruiterSportType = (typeof RECRUITER_SPORT_TYPES)[number];

const SPORT_TYPE_SET = new Set<string>(RECRUITER_SPORT_TYPES);

const SPORT_TYPE_LABELS: Record<RecruiterSportType, string> = {
  football: "Football",
  futsal: "Futsal",
  basketball: "Basketball",
  baseball: "Baseball",
  volleyball: "Volleyball",
  tennis: "Tennis",
  padel: "Padel",
  other: "Other",
};

const SPORT_TYPE_ALIASES: Record<string, RecruiterSportType> = {
  football: "football",
  futsal: "futsal",
  basketball: "basketball",
  baseball: "baseball",
  volleyball: "volleyball",
  tennis: "tennis",
  padel: "padel",
  other: "other",
};

export const normalizeRecruiterSportType = (
  value: unknown
): RecruiterSportType | undefined => {
  if (typeof value !== "string") return undefined;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  return SPORT_TYPE_ALIASES[normalized];
};

export const isRecruiterSportType = (value: unknown): value is RecruiterSportType =>
  typeof value === "string" && SPORT_TYPE_SET.has(value);

export const sanitizeRecruiterSportTypes = (
  values: string[] = [],
  includeFallback = true
): RecruiterSportType[] => {
  const normalized = values
    .map((item) => normalizeRecruiterSportType(item))
    .filter((item): item is RecruiterSportType => Boolean(item));

  const source = normalized.length || !includeFallback ? normalized : [...RECRUITER_SPORT_TYPES];
  return Array.from(new Set(source));
};

export const getRecruiterSportTypeLabel = (value?: string | null): string => {
  const normalized = normalizeRecruiterSportType(value);
  if (!normalized) return value?.trim() || "";
  return SPORT_TYPE_LABELS[normalized];
};
