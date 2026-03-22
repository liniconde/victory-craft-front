const AGENT_PLANNER_V2_STORAGE_KEY = "victory-craft.agent.usePlannerV2";

const readEnvDefault = () => {
  const configuredValue = import.meta.env.VITE_AGENT_USE_PLANNER_V2?.trim().toLowerCase();
  return configuredValue === "1" || configuredValue === "true";
};

export const getDefaultPlannerV2Value = () => readEnvDefault();

export const getStoredPlannerV2Value = () => {
  if (typeof window === "undefined") return getDefaultPlannerV2Value();

  const storedValue = window.localStorage.getItem(AGENT_PLANNER_V2_STORAGE_KEY);
  if (storedValue === "true") return true;
  if (storedValue === "false") return false;
  return getDefaultPlannerV2Value();
};

export const setStoredPlannerV2Value = (value: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AGENT_PLANNER_V2_STORAGE_KEY, String(value));
};

export const getAgentPlannerLocale = () => {
  if (typeof navigator === "undefined" || !navigator.language) return "en";
  return navigator.language;
};
