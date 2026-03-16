import test from "node:test";
import assert from "node:assert/strict";
import type { AxiosError } from "axios";
import { agentPlannerClient } from "./agentPlannerClient";
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
  api.post = (async () => ({
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
  })) as typeof api.post;

  const response = await agentPlannerClient.plan(samplePayload);

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
