import type {
  AgentActionDefinition,
  AgentExecutionPlan,
  AgentFunctionCall,
  AgentLlmAdapter,
  AgentLlmInput,
} from "../types";

const normalize = (value: string) => value.trim().toLowerCase();

const tryParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const extractJsonBlock = (prompt: string) => {
  const fencedMatch = prompt.match(/```(?:json)?\s*([\s\S]+?)```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const firstBraceIndex = prompt.indexOf("{");
  if (firstBraceIndex >= 0) {
    return prompt.slice(firstBraceIndex).trim();
  }

  return "";
};

const toPlanFromPayload = (payload: unknown): AgentExecutionPlan | null => {
  if (Array.isArray(payload)) {
    const calls = payload.filter(
      (item): item is AgentFunctionCall =>
        typeof item === "object" && item !== null && "name" in item
    );

    return calls.length > 0 ? { calls } : null;
  }

  if (typeof payload !== "object" || payload === null) return null;

  if ("calls" in payload && Array.isArray(payload.calls)) {
    const summary =
      "summary" in payload && typeof payload.summary === "string"
        ? payload.summary
        : "Structured plan parsed.";

    return {
      summary,
      calls: payload.calls.filter(
        (item): item is AgentFunctionCall =>
          typeof item === "object" && item !== null && "name" in item
      ),
    };
  }

  if ("name" in payload && typeof payload.name === "string") {
    return {
      summary: "Single structured action parsed.",
      calls: [
        {
          name: payload.name,
          arguments:
            "arguments" in payload && typeof payload.arguments === "object" && payload.arguments !== null
              ? (payload.arguments as Record<string, unknown>)
              : {},
        },
      ],
    };
  }

  return null;
};

const buildDirectActionCall = (
  prompt: string,
  actions: AgentActionDefinition[]
): AgentFunctionCall | null => {
  const matchingAction = actions.find((action) =>
    normalize(prompt).includes(action.name.toLowerCase())
  );
  if (!matchingAction) return null;

  const jsonBlock = extractJsonBlock(prompt);
  const parsedPayload = jsonBlock ? tryParseJson(jsonBlock) : null;
  const parsedArguments =
    parsedPayload && typeof parsedPayload === "object" && !Array.isArray(parsedPayload)
      ? (parsedPayload as Record<string, unknown>)
      : {};

  return {
    name: matchingAction.name,
    arguments: parsedArguments,
  };
};

const createNoopPlan = (summary: string): AgentExecutionPlan => ({
  summary,
  calls: [],
});

export const createHeuristicAgentLlmAdapter = (): AgentLlmAdapter => ({
  name: "heuristic-local-adapter",
  async plan(input: AgentLlmInput) {
    const jsonBlock = extractJsonBlock(input.prompt);
    const parsedPlan = jsonBlock ? toPlanFromPayload(tryParseJson(jsonBlock)) : null;

    if (parsedPlan) {
      return parsedPlan;
    }

    const directActionCall = buildDirectActionCall(input.prompt, input.actions);
    if (directActionCall) {
      return {
        summary: "Direct action reference matched a registered action.",
        calls: [directActionCall],
      };
    }

    return createNoopPlan(
      "No structured action matched. Inject a remote LLM adapter for natural language planning."
    );
  },
});
