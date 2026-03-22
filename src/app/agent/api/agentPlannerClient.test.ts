import test from "node:test";
import assert from "node:assert/strict";
import type { AxiosError } from "axios";
import { agentPlannerClient } from "./agentPlannerClient";
import { buildAgentPlannerPayload } from "./buildAgentPlannerPayload";
import { api } from "../../../utils/api";

const originalPost = api.post;

const createAxiosLikeError = (
  status: number
): AxiosError & {
  response: {
    status: number;
    data: {
      message?: string;
    };
  };
} =>
  ({
    isAxiosError: true,
    name: "AxiosError",
    message: "Request failed",
    toJSON: () => ({}),
    response: {
      status,
      data: {},
    },
  }) as AxiosError & {
    response: {
      status: number;
      data: {
        message?: string;
      };
    };
  };

const samplePayload = {
  prompt: "open tournaments registration",
  currentPath: "/fields",
  actions: [
    {
      name: "navigation.go_to",
      description: "Navigate to an internal route",
      parameters: [
        {
          name: "path",
          type: "string" as const,
          description: "Target path",
          required: true,
        },
      ],
      returns: [
        {
          name: "message",
          type: "string" as const,
          description: "Navigation confirmation",
        },
      ],
      tags: ["navigation"],
    },
  ],
};

test.afterEach(() => {
  api.post = originalPost;
});

test("agentPlannerClient returns a valid plan with one call", async () => {
  let receivedPayload: unknown;
  api.post = (async (_url, payload) => {
    receivedPayload = payload;
    return {
      data: {
        summary: "Navigate to the requested page.",
        calls: [
          {
            name: "navigation.go_to",
            arguments: {
              path: "/tournaments/subpages/dashboard#tournament-form",
            },
          },
        ],
      },
    };
  }) as typeof api.post;

  const response = await agentPlannerClient.plan(samplePayload);

  assert.deepEqual(receivedPayload, buildAgentPlannerPayload(samplePayload));
  assert.deepEqual(response, {
    summary: "Navigate to the requested page.",
    calls: [
      {
        name: "navigation.go_to",
        arguments: {
          path: "/tournaments/subpages/dashboard#tournament-form",
        },
      },
    ],
  });
});

test("buildAgentPlannerPayload appends route knowledge including subpages", () => {
  const payload = buildAgentPlannerPayload({
    ...samplePayload,
    prompt: "abre la library de scouting y si hace falta usa subpaginas",
    currentPath: "/scouting/subpages/dashboard",
  });

  assert.match(payload.prompt, /User request:\nabre la library de scouting/i);
  assert.match(payload.prompt, /Current route: \/scouting\/subpages\/dashboard/);
  assert.match(payload.prompt, /\/scouting\/subpages\/library/);
  assert.match(payload.prompt, /\/tournaments\/subpages\/matches/);
  assert.match(payload.prompt, /Plan only with the registered actions provided in this payload\./);
});

test("buildAgentPlannerPayload includes videos recording subpage aliases", () => {
  const payload = buildAgentPlannerPayload({
    ...samplePayload,
    prompt: "llevame a la pagina de grabaciones",
    currentPath: "/videos/subpages/dashboard",
  });

  assert.match(payload.prompt, /User request:\nllevame a la pagina de grabaciones/i);
  assert.match(payload.prompt, /\/videos\/subpages\/streaming\/recording/);
  assert.match(payload.prompt, /grabaciones/);
  assert.match(payload.prompt, /Current route: \/videos\/subpages\/dashboard/);
});

test("agentPlannerClient supports the fallback response with empty calls", async () => {
  api.post = (async () => ({
    data: {
      summary: "No valid action could be planned.",
      calls: [],
    },
  })) as typeof api.post;

  const response = await agentPlannerClient.plan(samplePayload);

  assert.deepEqual(response, {
    summary: "No valid action could be planned.",
    calls: [],
  });
});

test("agentPlannerClient maps 400 into a friendly error", async () => {
  api.post = (async () => {
    throw createAxiosLikeError(400);
  }) as typeof api.post;

  await assert.rejects(
    () => agentPlannerClient.plan(samplePayload),
    /Agent planner rejected the request/
  );
});
