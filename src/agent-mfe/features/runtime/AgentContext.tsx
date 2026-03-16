import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AgentAction,
  AgentActionExecutionResult,
  AgentContextValue,
  AgentExecutionPlan,
  AgentLlmAdapter,
  AgentMessage,
  AgentPromptResult,
  AgentRuntimeNavigation,
} from "./types";

const createMessage = (
  role: AgentMessage["role"],
  content: string
): AgentMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
});

export const AgentContext = createContext<AgentContextValue | undefined>(undefined);

interface AgentProviderProps {
  children: React.ReactNode;
  llmAdapter: AgentLlmAdapter;
  navigation: AgentRuntimeNavigation;
  clickElement: (target: { selector?: string; text?: string }) => boolean;
}

export const AgentProvider: React.FC<AgentProviderProps> = ({
  children,
  llmAdapter,
  navigation,
  clickElement,
}) => {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [history, setHistory] = useState<AgentMessage[]>([
    createMessage(
      "assistant",
      "Agent ready. You can ask it to run any registered action."
    ),
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const registerActions = useCallback((nextActions: AgentAction[]) => {
    setActions((current) => {
      const byName = new Map(current.map((action) => [action.name, action]));
      nextActions.forEach((action) => byName.set(action.name, action));
      return Array.from(byName.values());
    });

    return () => {
      setActions((current) =>
        current.filter(
          (currentAction) =>
            !nextActions.some(
              (registeredAction) =>
                registeredAction.name === currentAction.name &&
                registeredAction.handler === currentAction.handler
            )
        )
      );
    };
  }, []);

  const executePlan = useCallback(
    async (plan: AgentExecutionPlan): Promise<AgentActionExecutionResult[]> => {
      const results: AgentActionExecutionResult[] = [];

      for (const call of plan.calls) {
        const action = actions.find((item) => item.name === call.name);

        if (!action) {
          results.push({
            actionName: call.name,
            success: false,
            message: `Action ${call.name} is not registered.`,
          });
          continue;
        }

        const result = await action.handler(
          {
            navigation,
            clickElement,
            document: typeof document === "undefined" ? null : document,
            window: typeof window === "undefined" ? null : window,
          },
          (call.arguments || {}) as Record<string, unknown>
        );

        results.push(result);
      }

      return results;
    },
    [actions, clickElement, navigation]
  );

  const executePrompt = useCallback(
    async (prompt: string): Promise<AgentPromptResult> => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt) {
        return {
          plan: { calls: [], summary: "Prompt is empty." },
          results: [],
        };
      }

      setHistory((current) => [...current, createMessage("user", trimmedPrompt)]);
      setIsRunning(true);

      try {
        const plan = await llmAdapter.plan({
          prompt: trimmedPrompt,
          currentPath: navigation.path,
          actions: actions.map(({ name, description, parameters, returns, tags }) => ({
            name,
            description,
            parameters,
            returns,
            tags,
          })),
        });

        const results = await executePlan(plan);
        const summary =
          plan.summary ||
          (results.length > 0
            ? results.map((result) => result.message).join(" ")
            : "No actions were executed.");

        setHistory((current) => [...current, createMessage("assistant", summary)]);

        return { plan, results };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Agent execution failed.";
        setHistory((current) => [...current, createMessage("assistant", message)]);
        throw error;
      } finally {
        setIsRunning(false);
      }
    },
    [actions, executePlan, llmAdapter, navigation.path]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.FrontAgent = {
      executePrompt,
      getRegisteredActions: () =>
        actions.map(({ name, description, parameters, returns, tags }) => ({
          name,
          description,
          parameters,
          returns,
          tags,
        })),
    };

    return () => {
      delete window.FrontAgent;
    };
  }, [actions, executePrompt]);

  const value = useMemo<AgentContextValue>(
    () => ({
      actions,
      history,
      isRunning,
      llmAdapterName: llmAdapter.name,
      executePrompt,
      executePlan,
      registerActions,
    }),
    [actions, executePlan, executePrompt, history, isRunning, llmAdapter.name, registerActions]
  );

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
};

declare global {
  interface Window {
    FrontAgent?: {
      executePrompt: (prompt: string) => Promise<AgentPromptResult>;
      getRegisteredActions: () => Array<{
        name: string;
        description: string;
        parameters?: AgentAction["parameters"];
        returns?: AgentAction["returns"];
        tags?: string[];
      }>;
    };
  }
}
