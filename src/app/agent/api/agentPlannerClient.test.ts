import test from "node:test";
import assert from "node:assert/strict";
import type { AxiosError } from "axios";
import { agentPlannerClient, AGENT_PLAN_API_URL, AGENT_PLAN_V2_API_URL } from "./agentPlannerClient";
import { buildAgentPlannerPayload } from "./buildAgentPlannerPayload";
import { buildNavigationCatalog } from "../navigation/navigationKnowledge";
import { api } from "../../../utils/api";

const originalPost = api.post;
const originalWindow = globalThis.window as unknown;
const originalNavigator = globalThis.navigator as unknown;

const createAxiosLikeError = (
  status: number,
  message?: string
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
      data: {
        message,
      },
    },
  }) as AxiosError & {
    response: {
      status: number;
      data: {
        message?: string;
      };
    };
  };

const createStorage = () => {
  const storage = new Map<string, string>();

  return {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
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

test.beforeEach(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: createStorage(),
    } as unknown,
  });

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      language: "es-ES",
    } as unknown,
  });
});

test.afterEach(() => {
  api.post = originalPost;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
  });

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: originalNavigator,
  });
});

test("agentPlannerClient returns a valid v1 plan with one call", async () => {
  let receivedUrl = "";
  let receivedPayload: unknown;
  api.post = (async (url, payload) => {
    receivedUrl = String(url);
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

  const response = await agentPlannerClient.plan(samplePayload, { usePlannerV2: false });

  assert.equal(receivedUrl, AGENT_PLAN_API_URL);
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
    meta: undefined,
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

test("agentPlannerClient sends v2 catalog and meta on first request", async () => {
  const expectedCatalog = buildNavigationCatalog("es-ES");
  let receivedUrl = "";
  let receivedPayload: Record<string, unknown> | undefined;

  api.post = (async (url, payload) => {
    receivedUrl = String(url);
    receivedPayload = payload as Record<string, unknown>;

    return {
      data: {
        summary: "Navigate using v2.",
        calls: [
          {
            name: "navigation.go_to",
            arguments: {
              path: "/scouting/subpages/library",
            },
          },
        ],
        meta: {
          plannerMode: "deterministic",
          confidence: 0.98,
          selectedRoute: "/scouting/subpages/library",
          traceId: "trace-v2-1",
          cacheHit: false,
        },
      },
    };
  }) as typeof api.post;

  const response = await agentPlannerClient.plan(samplePayload, { usePlannerV2: true });

  assert.equal(receivedUrl, AGENT_PLAN_V2_API_URL);
  assert.equal(receivedPayload?.locale, "es-ES");
  assert.equal(receivedPayload?.navigationCatalogVersion, expectedCatalog.version);
  assert.deepEqual(receivedPayload?.navigationCatalog, expectedCatalog);
  assert.equal(response.meta?.plannerMode, "deterministic");
  assert.equal(response.meta?.traceId, "trace-v2-1");
});

test("agentPlannerClient skips v2 catalog when backend already knows the version", async () => {
  const calls: Array<Record<string, unknown>> = [];

  api.post = (async (_url, payload) => {
    calls.push(payload as Record<string, unknown>);
    return {
      data: {
        summary: "Navigate using v2.",
        calls: [],
        meta: {
          plannerMode: "cache_hit",
          confidence: 0.95,
          traceId: `trace-${calls.length}`,
          cacheHit: true,
        },
      },
    };
  }) as typeof api.post;

  await agentPlannerClient.plan(samplePayload, { usePlannerV2: true });
  await agentPlannerClient.plan(samplePayload, { usePlannerV2: true });

  assert.equal(calls.length, 2);
  assert.ok("navigationCatalog" in calls[0]);
  assert.ok(!("navigationCatalog" in calls[1]));
});

test("agentPlannerClient retries v2 with catalog when backend does not know the version", async () => {
  const calls: Array<Record<string, unknown>> = [];
  const catalogVersion = buildNavigationCatalog("es-ES").version;

  globalThis.window?.localStorage.setItem(
    "victory-craft.agent.lastSuccessfulNavigationCatalogVersion",
    catalogVersion
  );

  api.post = (async (_url, payload) => {
    calls.push(payload as Record<string, unknown>);

    if (calls.length === 1) {
      throw createAxiosLikeError(400, "Unknown navigationCatalogVersion. Please sync catalog.");
    }

    return {
      data: {
        summary: "Retry succeeded.",
        calls: [],
        meta: {
          plannerMode: "fallback",
          confidence: 0.8,
          traceId: "trace-retry",
        },
      },
    };
  }) as typeof api.post;

  const response = await agentPlannerClient.plan(samplePayload, { usePlannerV2: true });

  assert.equal(calls.length, 2);
  assert.ok(!("navigationCatalog" in calls[0]));
  assert.ok("navigationCatalog" in calls[1]);
  assert.equal(response.meta?.traceId, "trace-retry");
});

test("agentPlannerClient supports the fallback response with empty calls", async () => {
  api.post = (async () => ({
    data: {
      summary: "No valid action could be planned.",
      calls: [],
    },
  })) as typeof api.post;

  const response = await agentPlannerClient.plan(samplePayload, { usePlannerV2: false });

  assert.deepEqual(response, {
    summary: "No valid action could be planned.",
    calls: [],
    meta: undefined,
  });
});

test("agentPlannerClient maps 400 into a friendly error", async () => {
  api.post = (async () => {
    throw createAxiosLikeError(400);
  }) as typeof api.post;

  await assert.rejects(
    () => agentPlannerClient.plan(samplePayload, { usePlannerV2: false }),
    /Agent planner rejected the request/
  );
});
