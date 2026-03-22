import type { AgentLlmAdapter, AgentLlmInput } from "../../../agent-mfe";
import { getStoredPlannerV2Value } from "../config/agentPlannerConfig";
import { agentPlannerClient } from "../api/agentPlannerClient";

export const createBackendAgentAdapter = (): AgentLlmAdapter => ({
  name: "backend-agent-planner",
  plan: (input: AgentLlmInput) =>
    agentPlannerClient.plan(input, {
      usePlannerV2: getStoredPlannerV2Value(),
    }),
});
