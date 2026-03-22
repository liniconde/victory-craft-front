import axios from "axios";
import { api } from "../../../utils/api";
import type {
  AgentExecutionPlan,
  AgentFunctionCall,
  AgentLlmInput,
  AgentPlannerMeta,
} from "../../../agent-mfe";
import { getAgentPlannerLocale } from "../config/agentPlannerConfig";
import { buildNavigationCatalog } from "../navigation/navigationKnowledge";
import { buildAgentPlannerPayload } from "./buildAgentPlannerPayload";

export const AGENT_PLAN_API_URL = "/agent/plan";
export const AGENT_PLAN_V2_API_URL = "/agent/v2/plan";

const LAST_SUCCESSFUL_CATALOG_VERSION_STORAGE_KEY =
  "victory-craft.agent.lastSuccessfulNavigationCatalogVersion";

const normalizeFunctionCall = (value: unknown): AgentFunctionCall | null => {
  if (typeof value !== "object" || value === null || !("name" in value)) return null;

  const name = typeof value.name === "string" ? value.name : "";
  if (!name) return null;

  return {
    name,
    arguments:
      "arguments" in value && typeof value.arguments === "object" && value.arguments !== null
        ? (value.arguments as Record<string, unknown>)
        : {},
  };
};

const normalizeMeta = (value: unknown): AgentPlannerMeta | undefined => {
  if (typeof value !== "object" || value === null) return undefined;

  const plannerMode =
    "plannerMode" in value && typeof value.plannerMode === "string" ? value.plannerMode : null;
  const confidence =
    "confidence" in value && typeof value.confidence === "number" ? value.confidence : null;
  const traceId = "traceId" in value && typeof value.traceId === "string" ? value.traceId : null;

  if (!plannerMode || confidence === null || !traceId) return undefined;

  return {
    plannerMode: plannerMode as AgentPlannerMeta["plannerMode"],
    confidence,
    traceId,
    selectedRoute:
      "selectedRoute" in value && typeof value.selectedRoute === "string"
        ? value.selectedRoute
        : undefined,
    navigationCatalogVersion:
      "navigationCatalogVersion" in value &&
      typeof value.navigationCatalogVersion === "string"
        ? value.navigationCatalogVersion
        : undefined,
    cacheKey:
      "cacheKey" in value && typeof value.cacheKey === "string" ? value.cacheKey : undefined,
    cacheHit:
      "cacheHit" in value && typeof value.cacheHit === "boolean" ? value.cacheHit : undefined,
    candidateRoutes:
      "candidateRoutes" in value && Array.isArray(value.candidateRoutes)
        ? value.candidateRoutes
            .filter(
              (candidate): candidate is { route: string; score: number } =>
                typeof candidate === "object" &&
                candidate !== null &&
                "route" in candidate &&
                typeof candidate.route === "string" &&
                "score" in candidate &&
                typeof candidate.score === "number"
            )
            .map((candidate) => ({
              route: candidate.route,
              score: candidate.score,
            }))
        : undefined,
    validationWarnings:
      "validationWarnings" in value && Array.isArray(value.validationWarnings)
        ? value.validationWarnings.filter(
            (warning): warning is string => typeof warning === "string"
          )
        : undefined,
  };
};

const normalizeExecutionPlan = (payload: unknown): AgentExecutionPlan => {
  if (typeof payload !== "object" || payload === null || !("calls" in payload)) {
    throw new Error("Agent planner returned an invalid payload.");
  }

  const summary =
    "summary" in payload && typeof payload.summary === "string"
      ? payload.summary
      : undefined;
  const rawCalls = Array.isArray(payload.calls) ? payload.calls : [];
  const calls = rawCalls
    .map((value) => normalizeFunctionCall(value))
    .filter((value): value is AgentFunctionCall => value !== null);

  return {
    summary,
    calls,
    meta: "meta" in payload ? normalizeMeta(payload.meta) : undefined,
  };
};

const getLastSuccessfulCatalogVersion = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(LAST_SUCCESSFUL_CATALOG_VERSION_STORAGE_KEY) || "";
};

const setLastSuccessfulCatalogVersion = (version: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SUCCESSFUL_CATALOG_VERSION_STORAGE_KEY, version);
};

const readErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return "";

  const responseMessage =
    typeof error.response?.data?.message === "string" ? error.response.data.message : "";
  return responseMessage || error.message || "";
};

const isUnknownCatalogVersionError = (error: unknown) => {
  const message = readErrorMessage(error).toLowerCase();
  if (!message) return false;

  return (
    /(navigationcatalogversion|catalog version|catalogo|catálogo)/i.test(message) &&
    /(unknown|missing|not found|not registered|unrecognized|desconoc|sincroniz|sync)/i.test(
      message
    )
  );
};

const shouldFallbackToLegacyPlanner = (error: unknown) => {
  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;
  if (status === 404 || status === 405 || status === 501) return true;

  const message = readErrorMessage(error).toLowerCase();
  return /not implemented|unsupported|no implementado/.test(message);
};

const mapPlannerError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 400) {
      throw new Error(
        "Agent planner rejected the request. Check the prompt, navigation catalog, and registered actions."
      );
    }

    if (error.response?.status === 500) {
      throw new Error("Agent planner failed while building the action plan.");
    }

    if (error.response?.status === 502) {
      throw new Error("Agent planner is temporarily unavailable. Try again shortly.");
    }
  }

  throw new Error("Could not reach the agent planner endpoint.");
};

const postLegacyPlan = async (input: AgentLlmInput) => {
  const response = await api.post(AGENT_PLAN_API_URL, buildAgentPlannerPayload(input));
  return normalizeExecutionPlan(response.data);
};

const postV2Plan = async (input: AgentLlmInput) => {
  const payload = buildAgentPlannerPayload(input);
  const locale = getAgentPlannerLocale();
  const navigationCatalog = buildNavigationCatalog(locale);
  const shouldSendCatalog =
    getLastSuccessfulCatalogVersion() !== navigationCatalog.version;

  const requestBody = {
    ...payload,
    locale,
    navigationCatalogVersion: navigationCatalog.version,
    ...(shouldSendCatalog ? { navigationCatalog } : {}),
  };

  try {
    const response = await api.post(AGENT_PLAN_V2_API_URL, requestBody);
    setLastSuccessfulCatalogVersion(navigationCatalog.version);
    return normalizeExecutionPlan(response.data);
  } catch (error) {
    if (!shouldSendCatalog && isUnknownCatalogVersionError(error)) {
      const retryResponse = await api.post(AGENT_PLAN_V2_API_URL, {
        ...requestBody,
        navigationCatalog,
      });

      setLastSuccessfulCatalogVersion(navigationCatalog.version);
      return normalizeExecutionPlan(retryResponse.data);
    }

    throw error;
  }
};

export const planAgentActions = async (params: {
  input: AgentLlmInput;
  usePlannerV2: boolean;
}): Promise<AgentExecutionPlan> => {
  const { input, usePlannerV2 } = params;

  if (!usePlannerV2) {
    try {
      return await postLegacyPlan(input);
    } catch (error) {
      mapPlannerError(error);
    }
  }

  try {
    return await postV2Plan(input);
  } catch (error) {
    if (shouldFallbackToLegacyPlanner(error)) {
      console.warn("Planner v2 unavailable, falling back to legacy planner.", error);

      try {
        return await postLegacyPlan(input);
      } catch (legacyError) {
        mapPlannerError(legacyError);
      }
    }

    mapPlannerError(error);
  }

  throw new Error("Planner execution did not return a result.");
};

export const agentPlannerClient = {
  async plan(input: AgentLlmInput, options?: { usePlannerV2?: boolean }) {
    return planAgentActions({
      input,
      usePlannerV2: options?.usePlannerV2 === true,
    });
  },
};
