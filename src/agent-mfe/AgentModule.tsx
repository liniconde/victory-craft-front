import type { PropsWithChildren } from "react";
import { AgentProvider } from "./features/runtime/AgentContext";
import { createHeuristicAgentLlmAdapter } from "./features/runtime/adapters/heuristicAdapter";
import { BuiltinAgentActions, clickTarget } from "./features/runtime/builtinActions";
import { AgentWidget } from "./components/AgentWidget";
import type { AgentLlmAdapter } from "./features/runtime/types";
import "./index.css";

interface AgentModuleProps extends PropsWithChildren {
  currentPath: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  llmAdapter?: AgentLlmAdapter;
}

const fallbackAdapter = createHeuristicAgentLlmAdapter();

const AgentModule: React.FC<AgentModuleProps> = ({
  children,
  currentPath,
  navigate,
  llmAdapter = fallbackAdapter,
}) => {
  return (
    <AgentProvider
      llmAdapter={llmAdapter}
      navigation={{ path: currentPath, navigate }}
      clickElement={clickTarget}
    >
      <BuiltinAgentActions />
      {children}
      <AgentWidget />
    </AgentProvider>
  );
};

export default AgentModule;
