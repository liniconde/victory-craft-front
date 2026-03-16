import axios from "axios";
import { api } from "../../../utils/api";
import type {
  AgentExecutionPlan,
  AgentFunctionCall,
  AgentLlmInput,
} from "../../../agent-mfe";

export const AGENT_PLAN_API_URL = "/agent/plan";

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
  };
};

export const agentPlannerClient = {
  async plan(payload: AgentLlmInput): Promise<AgentExecutionPlan> {
    try {
      const response = await api.post(AGENT_PLAN_API_URL, payload);
      return normalizeExecutionPlan(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error(
            "Agent planner rejected the request. Check the prompt and registered actions."
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
    }
  },
};
