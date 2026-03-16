import { useState } from "react";
import { useAgent } from "../hooks/useAgent";

const HISTORY_LIMIT = 6;
const ACTIONS_LIMIT = 5;

const getRoleLabel = (role: "assistant" | "system" | "user") => {
  if (role === "user") return "You";
  if (role === "system") return "System";
  return "Agent";
};

const RobotIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="agent-widget__robot-icon"
  >
    <path
      d="M12 2a1 1 0 0 1 1 1v2.126A7.002 7.002 0 0 1 19 12v4a3 3 0 0 1-3 3h-1.268l.58 1.45a1 1 0 1 1-1.856.742L12.732 19h-1.464l-.724 2.192a1 1 0 1 1-1.856-.742l.58-1.45H8a3 3 0 0 1-3-3v-4a7.002 7.002 0 0 1 6-6.874V3a1 1 0 0 1 1-1Zm0 5a5 5 0 0 0-5 5v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4a5 5 0 0 0-5-5Zm-2 4a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 10 11Zm4 0a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 14 11Zm-4.5 4h5a1 1 0 1 1 0 2h-5a1 1 0 1 1 0-2Z"
      fill="currentColor"
    />
  </svg>
);

export const AgentWidget = () => {
  const { actions, executePrompt, history, isRunning, llmAdapterName } = useAgent();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  const recentHistory = history.slice(-HISTORY_LIMIT);
  const featuredActions = actions.slice(0, ACTIONS_LIMIT);
  const remainingActions = actions.length - featuredActions.length;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim() || isRunning) return;

    const currentPrompt = prompt;
    setPrompt("");
    try {
      await executePrompt(currentPrompt);
    } catch {
      // The runtime already records the backend error in the conversation history.
    }
  };

  return (
    <div className={`agent-widget ${isOpen ? "agent-widget--open" : ""}`}>
      <button
        type="button"
        className="agent-widget__launcher"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close agent" : "Open agent"}
      >
        <RobotIcon />
      </button>

      {isOpen && (
        <section className="agent-widget__panel" aria-label="Floating agent chat">
          <header className="agent-widget__header">
            <div>
              <strong>Front Agent</strong>
              <p>Floating action chat for the current app</p>
            </div>
            <div className="agent-widget__header-actions">
              <span>{llmAdapterName}</span>
              <button
                type="button"
                className="agent-widget__minimize"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize agent"
                title="Minimize"
              >
                _
              </button>
            </div>
          </header>

          <div className="agent-widget__capabilities">
            <div className="agent-widget__capabilities-header">
              <strong>Available actions</strong>
              <span>{actions.length}</span>
            </div>
            <div className="agent-widget__capabilities-list">
              {featuredActions.map((action) => (
                <article key={action.name} className="agent-widget__capability">
                  <strong>{action.name}</strong>
                  <p>{action.description}</p>
                  {action.parameters && action.parameters.length > 0 && (
                    <small>
                      Inputs:{" "}
                      {action.parameters
                        .map((parameter) =>
                          `${parameter.name}:${parameter.type}${parameter.required ? "*" : ""}`
                        )
                        .join(", ")}
                    </small>
                  )}
                  {action.returns && action.returns.length > 0 && (
                    <small>
                      Outputs:{" "}
                      {action.returns
                        .map((field) => `${field.name}:${field.type}`)
                        .join(", ")}
                    </small>
                  )}
                </article>
              ))}
              {remainingActions > 0 && (
                <div className="agent-widget__capabilities-more">
                  +{remainingActions} more registered actions
                </div>
              )}
            </div>
          </div>

          <div className="agent-widget__history">
            {recentHistory.map((entry) => (
              <article key={entry.id} className={`agent-widget__message agent-widget__message--${entry.role}`}>
                <strong>{getRoleLabel(entry.role)}</strong>
                <p>{entry.content}</p>
              </article>
            ))}
          </div>

          <form className="agent-widget__form" onSubmit={handleSubmit}>
            <textarea
              className="agent-widget__input"
              placeholder='Example: {"name":"navigation.go_to","arguments":{"path":"/fields"}}'
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
            />
            <button className="agent-widget__submit" type="submit" disabled={isRunning}>
              {isRunning ? "Running..." : "Run"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
};
