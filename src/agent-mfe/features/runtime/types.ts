export type AgentParameterType = "string" | "number" | "boolean" | "object";

export interface AgentActionParameter {
  name: string;
  type: AgentParameterType;
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface AgentActionResultField {
  name: string;
  type: AgentParameterType;
  description: string;
}

export interface AgentActionDefinition {
  name: string;
  description: string;
  parameters?: AgentActionParameter[];
  returns?: AgentActionResultField[];
  tags?: string[];
}

export interface AgentFunctionCall {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface AgentPlannerMetaCandidateRoute {
  route: string;
  score: number;
}

export interface AgentPlannerMeta {
  plannerMode: "deterministic" | "llm" | "llm_repaired" | "fallback" | "cache_hit";
  confidence: number;
  selectedRoute?: string;
  navigationCatalogVersion?: string;
  traceId: string;
  cacheKey?: string;
  cacheHit?: boolean;
  candidateRoutes?: AgentPlannerMetaCandidateRoute[];
  validationWarnings?: string[];
}

export interface AgentExecutionPlan {
  summary?: string;
  calls: AgentFunctionCall[];
  meta?: AgentPlannerMeta;
}

export interface AgentActionExecutionResult {
  actionName: string;
  success: boolean;
  message: string;
  data?: unknown;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentRuntimeNavigation {
  path: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;
}

export interface AgentActionHandlerContext {
  navigation: AgentRuntimeNavigation;
  clickElement: (target: { selector?: string; text?: string }) => boolean;
  document: Document | null;
  window: Window | null;
}

export interface AgentAction<TParams extends Record<string, unknown> = Record<string, unknown>>
  extends AgentActionDefinition {
  handler: (
    context: AgentActionHandlerContext,
    params: TParams
  ) => Promise<AgentActionExecutionResult> | AgentActionExecutionResult;
}

export interface AgentLlmInput {
  prompt: string;
  currentPath: string;
  actions: AgentActionDefinition[];
}

export interface AgentLlmAdapter {
  name: string;
  plan: (input: AgentLlmInput) => Promise<AgentExecutionPlan>;
}

export interface AgentPromptResult {
  plan: AgentExecutionPlan;
  results: AgentActionExecutionResult[];
}

export interface AgentContextValue {
  actions: AgentAction[];
  history: AgentMessage[];
  isRunning: boolean;
  llmAdapterName: string;
  usePlannerV2: boolean;
  executePrompt: (prompt: string) => Promise<AgentPromptResult>;
  executePlan: (plan: AgentExecutionPlan) => Promise<AgentActionExecutionResult[]>;
  registerActions: (actions: AgentAction[]) => () => void;
  setUsePlannerV2: (value: boolean) => void;
}
