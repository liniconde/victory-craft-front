import { useState } from "react";
import { useAgent } from "../hooks/useAgent";
import { ASSISTANT_NAME, ASSISTANT_WIDGET_COPY } from "../constants/assistantBrand";
import { JarvisAvatar } from "./JarvisAvatar";

const HISTORY_LIMIT = 6;
const ACTIONS_LIMIT = 5;

const getRoleLabel = (role: "assistant" | "system" | "user") => {
  if (role === "user") return "You";
  if (role === "system") return "System";
  return "Agent";
};

export const AgentWidget = () => {
  const { actions, executePrompt, history, isRunning, setUsePlannerV2, usePlannerV2 } =
    useAgent();
  const [isOpen, setIsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
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
        <JarvisAvatar className="agent-widget__robot-icon" />
      </button>

      {isOpen && (
        <section className="agent-widget__panel" aria-label="Floating agent chat">
          <header className="agent-widget__header">
            <div>
              <strong>{ASSISTANT_NAME}</strong>
              <p>{ASSISTANT_WIDGET_COPY}</p>
            </div>
            <div className="agent-widget__header-actions">
              <label className="agent-widget__planner-toggle" title="Toggle planner backend version">
                <span>{usePlannerV2 ? "v2" : "v1"}</span>
                <input
                  type="checkbox"
                  checked={usePlannerV2}
                  onChange={(event) => setUsePlannerV2(event.target.checked)}
                  aria-label={`Planner ${usePlannerV2 ? "v2" : "v1"} active`}
                />
              </label>
              <button
                type="button"
                className="agent-widget__minimize"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize agent"
                title="Minimize"
              >
                -
              </button>
            </div>
          </header>

          <div className="agent-widget__capabilities">
            <button
              type="button"
              className="agent-widget__capabilities-toggle"
              onClick={() => setIsToolsOpen((current) => !current)}
              aria-expanded={isToolsOpen}
            >
              <strong>Tools</strong>
              <span>{isToolsOpen ? "Hide" : `Show (${actions.length})`}</span>
            </button>
            {isToolsOpen && (
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
            )}
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
              placeholder="Example: go to videos page"
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
