import {
  SCOUTING_ONBOARDING_ID,
  SCOUTING_ONBOARDING_VERSION,
  type OnboardingSportId,
} from "./scoutingOnboardingContent";

export interface ScoutingOnboardingProgress {
  completed: boolean;
  selectedSport: OnboardingSportId;
}

const DEFAULT_SPORT: OnboardingSportId = "football";
const DEFAULT_FALLBACK_PATH = "/";
const DESKTOP_ONBOARDING_MEDIA_QUERY = "(min-width: 881px)";

export const getScoutingOnboardingIdentity = (
  userId: string | null,
  email: string | null
) => userId || email || "guest";

export const buildScoutingOnboardingStorageKey = (identity: string) =>
  `victorycraft:onboarding:${SCOUTING_ONBOARDING_ID}:${SCOUTING_ONBOARDING_VERSION}:${identity}`;

export const getScoutingOnboardingProgress = (
  identity: string
): ScoutingOnboardingProgress | null => {
  try {
    const rawValue = window.localStorage.getItem(buildScoutingOnboardingStorageKey(identity));
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<ScoutingOnboardingProgress>;
    return {
      completed: Boolean(parsed.completed),
      selectedSport: parsed.selectedSport || DEFAULT_SPORT,
    };
  } catch {
    return null;
  }
};

export const persistScoutingOnboardingProgress = (
  identity: string,
  progress: ScoutingOnboardingProgress
) => {
  window.localStorage.setItem(
    buildScoutingOnboardingStorageKey(identity),
    JSON.stringify(progress)
  );
};

export const isScoutingOnboardingDesktopEnabled = () => {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia === "function") {
    return window.matchMedia(DESKTOP_ONBOARDING_MEDIA_QUERY).matches;
  }

  return window.innerWidth > 880;
};

export const getScoutingOnboardingPostLoginPath = (fallbackPath = DEFAULT_FALLBACK_PATH) => {
  if (!isScoutingOnboardingDesktopEnabled()) {
    return fallbackPath;
  }

  const identity = getScoutingOnboardingIdentity(
    window.localStorage.getItem("userId"),
    window.localStorage.getItem("email")
  );
  const progress = getScoutingOnboardingProgress(identity);

  if (!progress?.completed) {
    return "/scouting/intro";
  }

  return fallbackPath;
};
