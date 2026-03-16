# Agent MFE

Reusable frontend agent module centered on action registration and execution.

## Parts

- `features/runtime`: contracts, provider, runtime, and LLM adapters.
- `components/AgentWidget.tsx`: optional floating chat UI.
- `features/runtime/builtinActions.ts`: generic built-in browser actions.

## Library Contract

This module is designed to be portable to a separate repository:

- The runtime only knows about `actions`, `plans`, and `adapters`.
- Natural language planning should usually come from an injected remote LLM adapter.
- Domain integrations must live outside this module and register themselves as plugins.

## Action Standard

Actions are registered with this structure:

- `name`: stable identifier the planner can call.
- `description`: what the action does and when to use it.
- `parameters`: typed inputs with name, type, description, and `required`.
- `returns`: typed outputs that describe the action result.
- `handler`: actual frontend implementation.

Example:

```ts
registerActions([
  {
    name: "navigation.go_to",
    description: "Navigate to an internal route",
    parameters: [{ name: "path", type: "string", description: "Target path", required: true }],
    returns: [{ name: "message", type: "string", description: "Navigation confirmation" }],
    handler: async ({ navigation }, { path }) => {
      navigation.navigate(path);
      return { actionName: "navigation.go_to", success: true, message: `Navigating to ${path}` };
    },
  },
]);
```

This metadata is what you send to a backend planner or LLM adapter so it knows exactly which actions are available.

## Global API

The provider exposes `window.FrontAgent` with:

- `executePrompt(prompt)`
- `getRegisteredActions()`

This is useful for debugging, browser automation, or app-level integrations.
