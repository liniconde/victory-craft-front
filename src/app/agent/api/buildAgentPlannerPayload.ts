import type { AgentLlmInput } from "../../../agent-mfe";
import { buildNavigationKnowledgeBlock } from "../navigation/navigationKnowledge";

const trimTrailingWhitespace = (value: string) => value.trim();

export const buildAgentPlannerPayload = (input: AgentLlmInput): AgentLlmInput => {
  const prompt = trimTrailingWhitespace(input.prompt);
  const navigationKnowledge = buildNavigationKnowledgeBlock({
    currentPath: input.currentPath,
    prompt,
  });

  return {
    ...input,
    prompt: [
      "User request:",
      prompt,
      "",
      navigationKnowledge,
      "",
      "Plan only with the registered actions provided in this payload.",
    ].join("\n"),
  };
};
