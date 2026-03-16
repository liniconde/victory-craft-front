import type { AgentLlmAdapter, AgentLlmInput } from "../../../agent-mfe";
import { agentPlannerClient } from "../api/agentPlannerClient";

export const createBackendAgentAdapter = (): AgentLlmAdapter => ({
  name: "backend-agent-planner",
  plan: (input: AgentLlmInput) => agentPlannerClient.plan(input),
});
