import type {
  AgentExecutionPlan,
  AgentLlmAdapter,
  AgentLlmInput,
} from "../types";

export interface HttpAgentLlmAdapterOptions {
  endpoint: string;
  name?: string;
  headers?: Record<string, string>;
  mapRequest?: (input: AgentLlmInput) => unknown;
  mapResponse?: (payload: unknown) => AgentExecutionPlan;
}

const defaultMapRequest = (input: AgentLlmInput) => input;

const defaultMapResponse = (payload: unknown): AgentExecutionPlan => {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "calls" in payload &&
    Array.isArray((payload as { calls: unknown }).calls)
  ) {
    return payload as AgentExecutionPlan;
  }

  throw new Error("La respuesta del adaptador HTTP no tiene un plan valido.");
};

export const createHttpAgentLlmAdapter = (
  options: HttpAgentLlmAdapterOptions
): AgentLlmAdapter => ({
  name: options.name || "http-agent-adapter",
  async plan(input: AgentLlmInput) {
    const response = await fetch(options.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify((options.mapRequest || defaultMapRequest)(input)),
    });

    if (!response.ok) {
      throw new Error(`El adaptador HTTP respondio con estado ${response.status}.`);
    }

    const payload = (await response.json()) as unknown;
    return (options.mapResponse || defaultMapResponse)(payload);
  },
});
