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
  showWidget?: boolean;
}

const fallbackAdapter = createHeuristicAgentLlmAdapter();

const AgentModule: React.FC<AgentModuleProps> = ({
  children,
  currentPath,
  navigate,
  llmAdapter = fallbackAdapter,
  showWidget = true,
}) => {
  return (
    <AgentProvider
      llmAdapter={llmAdapter}
      navigation={{ path: currentPath, navigate }}
      clickElement={clickTarget}
    >
      <BuiltinAgentActions />
      {children}
      {showWidget ? <AgentWidget /> : null}
    </AgentProvider>
  );
};

export default AgentModule;
