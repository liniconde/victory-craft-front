import { useEffect } from "react";
import { useAgent } from "../../hooks/useAgent";
import type { AgentAction } from "./types";

const findElementByText = (text: string) => {
  const targetText = text.trim().toLowerCase();
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(
      "button, a, [role='button'], input[type='button'], input[type='submit']"
    )
  );

  return (
    elements.find((element) => element.innerText.trim().toLowerCase() === targetText) ||
    elements.find((element) => element.innerText.trim().toLowerCase().includes(targetText)) ||
    null
  );
};

export const clickTarget = (target: { selector?: string; text?: string }) => {
  const element =
    (target.selector
      ? document.querySelector<HTMLElement>(target.selector)
      : null) || (target.text ? findElementByText(target.text) : null);

  if (!element) return false;

  element.click();
  return true;
};

const BUILTIN_AGENT_ACTIONS: AgentAction[] = [
  {
    name: "navigation.go_to",
    description: "Navigate to an internal application route.",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Absolute internal application path.",
        required: true,
      },
      {
        name: "replace",
        type: "boolean",
        description: "Replace the current browser history entry.",
      },
    ],
    returns: [
      {
        name: "message",
        type: "string",
        description: "Text confirmation of the navigation result.",
      },
    ],
    handler: (context, params) => {
      const path = typeof params.path === "string" ? params.path : "";
      if (!path) {
        return {
          actionName: "navigation.go_to",
          success: false,
          message: "The action requires a path argument.",
        };
      }

      context.navigation.navigate(path, {
        replace: params.replace === true,
      });

      return {
        actionName: "navigation.go_to",
        success: true,
        message: `Navigating to ${path}.`,
      };
    },
  },
  {
    name: "dom.click",
    description: "Click a DOM element by CSS selector or visible text.",
    parameters: [
      {
        name: "selector",
        type: "string",
        description: "Element CSS selector.",
      },
      {
        name: "text",
        type: "string",
        description: "Visible button or link text.",
      },
    ],
    returns: [
      {
        name: "message",
        type: "string",
        description: "Result of the click attempt.",
      },
    ],
    handler: (_context, params) => {
      const selector = typeof params.selector === "string" ? params.selector : undefined;
      const text = typeof params.text === "string" ? params.text : undefined;
      const clicked = clickTarget({ selector, text });

      return {
        actionName: "dom.click",
        success: clicked,
        message: clicked
          ? "Click executed successfully."
          : "No matching element was found for the provided selector or text.",
      };
    },
  },
];

export const BuiltinAgentActions = () => {
  const { registerActions } = useAgent();

  useEffect(() => registerActions(BUILTIN_AGENT_ACTIONS), [registerActions]);

  return null;
};
