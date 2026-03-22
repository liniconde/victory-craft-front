// src/app/agent/api/agentPlannerClient.test.ts
import test from "node:test";
import assert from "node:assert/strict";

// src/app/agent/api/agentPlannerClient.ts
import axios2 from "axios";

// src/utils/api.ts
import axios from "axios";

// src/utils/authSession.ts
var AUTH_INVALIDATED_EVENT = "auth:session-invalidated";
var AUTH_STORAGE_KEYS = ["token", "userId", "email", "role", "exp", "viewRole"];
var clearPersistedAuthSession = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};
var notifyAuthSessionInvalidated = () => {
  window.dispatchEvent(new Event(AUTH_INVALIDATED_EVENT));
};
var clearPersistedAuthSessionAndNotify = () => {
  clearPersistedAuthSession();
  notifyAuthSessionInvalidated();
};

// node_modules/jwt-decode/build/esm/index.js
var InvalidTokenError = class extends Error {
};
InvalidTokenError.prototype.name = "InvalidTokenError";
function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
    let code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = "0" + code;
    }
    return "%" + code;
  }));
}
function base64UrlDecode(str) {
  let output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw new Error("base64 string is not of the correct length");
  }
  try {
    return b64DecodeUnicode(output);
  } catch (err) {
    return atob(output);
  }
}
function jwtDecode(token, options) {
  if (typeof token !== "string") {
    throw new InvalidTokenError("Invalid token specified: must be a string");
  }
  options || (options = {});
  const pos = options.header === true ? 0 : 1;
  const part = token.split(".")[pos];
  if (typeof part !== "string") {
    throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
  }
  let decoded;
  try {
    decoded = base64UrlDecode(part);
  } catch (e) {
    throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
  }
  try {
    return JSON.parse(decoded);
  } catch (e) {
    throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
  }
}

// src/utils/jwtUtil.ts
var getDecodedToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
};
var hasJwtFormat = (token) => {
  const value = token.trim();
  if (!value) return false;
  const parts = value.split(".");
  return parts.length === 3 && parts.every((part) => part.trim().length > 0);
};
var isValidJwtToken = (token) => hasJwtFormat(token) && getDecodedToken(token) !== null;

// src/utils/api.ts
var viteEnv = typeof import.meta !== "undefined" ? import.meta.env : void 0;
var api = axios.create({
  baseURL: viteEnv?.VITE_API_URL || "http://localhost:5001"
  // Cambia esto a la URL de tu API
});
api.interceptors.request.use((config) => {
  const authorization = typeof config.headers?.Authorization === "string" ? config.headers.Authorization : typeof config.headers?.authorization === "string" ? config.headers.authorization : "";
  if (authorization.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim();
    if (!isValidJwtToken(token) && config.headers) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const authorization = typeof error?.config?.headers?.Authorization === "string" ? error.config.headers.Authorization : typeof error?.config?.headers?.authorization === "string" ? error.config.headers.authorization : "";
    if (status === 401 && authorization.startsWith("Bearer ")) {
      clearPersistedAuthSessionAndNotify();
    }
    return Promise.reject(error);
  }
);
var s3Api = axios.create();
function getBaseURLMetadata(path = "") {
  return `https://q8onxhk818.execute-api.us-east-1.amazonaws.com/Prod/${path}`;
}
function getBaseUrlJumbf(path = "") {
  return `http://ec2-3-80-81-251.compute-1.amazonaws.com:8080/${path}`;
}
var apiMetadata = axios.create({
  baseURL: getBaseURLMetadata()
});
var apiJumbf = axios.create({
  baseURL: getBaseUrlJumbf()
});

// src/app/agent/navigation/navigationKnowledge.ts
var APP_NAVIGATION_ENTRIES = [
  {
    id: "home",
    title: "Home",
    path: "/",
    description: "Landing principal de Victory Craft.",
    section: "general",
    aliases: ["inicio", "home", "portada"]
  },
  {
    id: "users",
    title: "Users",
    path: "/users",
    description: "Vista privada de usuarios.",
    section: "general",
    aliases: ["usuarios", "users"]
  },
  {
    id: "fields_list",
    title: "Fields List",
    path: "/fields",
    description: "Listado principal de canchas.",
    section: "fields",
    aliases: ["fields", "canchas", "listado de canchas"]
  },
  {
    id: "field_create",
    title: "Field Create",
    path: "/fields/new",
    description: "Formulario para crear una cancha.",
    section: "fields",
    aliases: ["crear cancha", "nueva cancha", "new field"]
  },
  {
    id: "field_edit",
    title: "Field Edit",
    path: "/fields/edit/:id",
    description: "Formulario para editar una cancha existente.",
    section: "fields",
    aliases: ["editar cancha", "edit field"],
    pathPattern: /^\/fields\/edit\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere id de la cancha."]
  },
  {
    id: "field_reservations",
    title: "Field Reservations",
    path: "/fields/:id/reservations",
    description: "Reservas asociadas a una cancha especifica.",
    section: "fields",
    aliases: ["reservas de cancha", "field reservations"],
    pathPattern: /^\/fields\/[^/]+\/reservations\/?$/,
    notes: ["Ruta dinamica: requiere id de la cancha."]
  },
  {
    id: "reservations_dashboard",
    title: "Reservations",
    path: "/reservations",
    description: "Vista principal de reservas.",
    section: "reservations",
    aliases: ["reservas", "reservations"]
  },
  {
    id: "reservation_create",
    title: "Reservation Create",
    path: "/reservations/new",
    description: "Formulario para crear una reserva sin cancha preseleccionada.",
    section: "reservations",
    aliases: ["nueva reserva", "crear reserva"]
  },
  {
    id: "reservation_create_for_field",
    title: "Reservation Create For Field",
    path: "/reservations/new/:fieldId",
    description: "Formulario para crear una reserva desde una cancha concreta.",
    section: "reservations",
    aliases: ["nueva reserva de cancha", "crear reserva para cancha"],
    pathPattern: /^\/reservations\/new\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere fieldId."]
  },
  {
    id: "reservation_edit",
    title: "Reservation Edit",
    path: "/reservations/edit/:id",
    description: "Formulario para editar una reserva existente.",
    section: "reservations",
    aliases: ["editar reserva", "edit reservation"],
    pathPattern: /^\/reservations\/edit\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere id de la reserva."]
  },
  {
    id: "slots_list",
    title: "Slots",
    path: "/slots",
    description: "Listado principal de slots.",
    section: "slots",
    aliases: ["slots", "horarios", "turnos"]
  },
  {
    id: "slot_create",
    title: "Slot Create",
    path: "/slots/new/:fieldId",
    description: "Formulario para crear un slot para una cancha.",
    section: "slots",
    aliases: ["nuevo slot", "crear slot"],
    pathPattern: /^\/slots\/new\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere fieldId."]
  },
  {
    id: "slot_edit",
    title: "Slot Edit",
    path: "/slots/edit/:id",
    description: "Formulario para editar un slot existente.",
    section: "slots",
    aliases: ["editar slot", "edit slot"],
    pathPattern: /^\/slots\/edit\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere id del slot."]
  },
  {
    id: "videos_dashboard",
    title: "Videos Dashboard",
    path: "/videos/subpages/dashboard",
    description: "Dashboard principal del modulo de videos.",
    section: "videos",
    aliases: ["videos", "dashboard de videos", "videos dashboard"],
    notes: ["Alias de acceso: /fields/videos y /subpages redirigen aqui o al modulo videos."]
  },
  {
    id: "videos_streaming_timeline",
    title: "Videos Streaming Timeline",
    path: "/videos/subpages/streaming/timeline",
    description: "Subpagina de timeline o linea de tiempo para sesiones de streaming.",
    section: "videos",
    aliases: [
      "timeline",
      "linea de tiempo",
      "l\xEDnea de tiempo",
      "session timeline",
      "streaming timeline"
    ],
    notes: ["Suele usarse con query matchSessionId."]
  },
  {
    id: "videos_streaming_recording",
    title: "Videos Streaming Recording",
    path: "/videos/subpages/streaming/recording",
    description: "Subpagina de grabacion o configuracion de recording dentro del modulo de videos.",
    section: "videos",
    aliases: [
      "grabacion",
      "grabaci\xF3n",
      "grabaciones",
      "recording",
      "pagina de grabaciones",
      "pantalla de grabacion",
      "pantalla de grabaci\xF3n",
      "grabar"
    ],
    notes: [
      "Suele usarse con query tournamentMatchId, title y autoCreateSession.",
      "Si el usuario pide grabaciones o recording, esta subpagina es mas especifica que el dashboard de videos."
    ]
  },
  {
    id: "video_update",
    title: "Video Update",
    path: "/videos/:videoId/update",
    description: "Edicion de un video concreto.",
    section: "videos",
    aliases: ["editar video", "update video"],
    pathPattern: /^\/videos\/[^/]+\/update\/?$/,
    notes: ["Ruta dinamica: requiere videoId."]
  },
  {
    id: "videos_field_create",
    title: "Field Video Create",
    path: "/videos/fields/:fieldId/videos/create",
    description: "Creacion de video desde el contexto de una cancha.",
    section: "videos",
    aliases: ["crear video", "subir video para cancha"],
    pathPattern: /^\/videos\/fields\/[^/]+\/videos\/create\/?$/,
    notes: ["Ruta dinamica: requiere fieldId."]
  },
  {
    id: "tournaments_dashboard",
    title: "Tournaments Dashboard",
    path: "/tournaments/subpages/dashboard",
    description: "Pantalla principal del modulo de torneos.",
    section: "tournaments",
    aliases: ["torneos", "tournaments", "dashboard de torneos"],
    notes: ["Puede usarse con hash #tournament-form para abrir el formulario de creacion."]
  },
  {
    id: "tournaments_list",
    title: "Tournaments Subpage",
    path: "/tournaments/subpages/tournaments",
    description: "Subpagina de torneos dentro del modulo de torneos.",
    section: "tournaments",
    aliases: ["subpagina de torneos", "lista de torneos"]
  },
  {
    id: "tournaments_teams",
    title: "Teams Subpage",
    path: "/tournaments/subpages/teams",
    description: "Subpagina de equipos dentro del modulo de torneos.",
    section: "tournaments",
    aliases: ["equipos", "teams"]
  },
  {
    id: "tournaments_players",
    title: "Players Subpage",
    path: "/tournaments/subpages/players",
    description: "Subpagina de jugadores dentro del modulo de torneos.",
    section: "tournaments",
    aliases: ["jugadores de torneos", "players"]
  },
  {
    id: "tournaments_matches",
    title: "Matches Subpage",
    path: "/tournaments/subpages/matches",
    description: "Subpagina de partidos dentro del modulo de torneos.",
    section: "tournaments",
    aliases: ["partidos de torneos", "matches"]
  },
  {
    id: "tournaments_match_stats",
    title: "Match Stats Subpage",
    path: "/tournaments/subpages/match-stats",
    description: "Subpagina de estadisticas de partidos dentro del modulo de torneos.",
    section: "tournaments",
    aliases: ["estadisticas", "match stats", "estadisticas de partidos"]
  },
  {
    id: "scouting_dashboard",
    title: "Scouting Dashboard",
    path: "/scouting/subpages/dashboard",
    description: "Pantalla principal del modulo de scouting o recruiters.",
    section: "scouting",
    aliases: ["scouting", "recruiters", "dashboard de scouting"],
    notes: ["La ruta legacy /recruiters redirige aqui."]
  },
  {
    id: "scouting_library",
    title: "Scouting Library",
    path: "/scouting/subpages/library",
    description: "Subpagina library del modulo de scouting.",
    section: "scouting",
    aliases: ["library", "biblioteca", "scouting library"]
  },
  {
    id: "scouting_player_profiles",
    title: "Player Profiles",
    path: "/scouting/subpages/player-profiles",
    description: "Subpagina de fichas de jugador dentro de scouting.",
    section: "scouting",
    aliases: ["player profiles", "perfiles", "fichas de jugador"]
  },
  {
    id: "scouting_rankings",
    title: "Scouting Rankings",
    path: "/scouting/subpages/rankings",
    description: "Subpagina de rankings o board de scouting.",
    section: "scouting",
    aliases: ["rankings", "board", "scouting board"]
  },
  {
    id: "scouting_profile",
    title: "Scouting Profile",
    path: "/scouting/subpages/profile/:videoId",
    description: "Perfil editorial de scouting para un video concreto.",
    section: "scouting",
    aliases: ["perfil de scouting", "profile"],
    pathPattern: /^\/scouting\/subpages\/profile\/[^/]+(?:\?.*)?$/,
    notes: ["Ruta dinamica: requiere videoId.", "Puede incluir query playerProfileId."]
  },
  {
    id: "scouting_video",
    title: "Scouting Video",
    path: "/scouting/subpages/video/:videoId",
    description: "Vista recruiter para un video concreto dentro de scouting.",
    section: "scouting",
    aliases: ["video scouting", "recruiter view", "video detail"],
    pathPattern: /^\/scouting\/subpages\/video\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere videoId."]
  }
];
var normalize = (value) => value.trim().toLowerCase();
var describeEntry = (entry) => {
  const aliases = entry.aliases?.length ? ` | aliases: ${entry.aliases.join(", ")}` : "";
  const notes = entry.notes?.length ? ` | notes: ${entry.notes.join(" ")}` : "";
  return `- [${entry.section}] ${entry.title} -> ${entry.path} | ${entry.description}${aliases}${notes}`;
};
var findNavigationEntryByPath = (path) => {
  const normalizedPath = path.trim();
  return APP_NAVIGATION_ENTRIES.find((entry) => entry.path === normalizedPath) || APP_NAVIGATION_ENTRIES.find((entry) => entry.pathPattern?.test(normalizedPath));
};
var findNavigationEntriesByPrompt = (prompt) => {
  const normalizedPrompt = normalize(prompt);
  return APP_NAVIGATION_ENTRIES.filter((entry) => {
    const values = [entry.title, entry.path, ...entry.aliases || []].map(normalize);
    return values.some((value) => normalizedPrompt.includes(value));
  });
};
var buildNavigationKnowledgeBlock = (params) => {
  const currentEntry = findNavigationEntryByPath(params.currentPath);
  const relevantEntries = findNavigationEntriesByPrompt(params.prompt);
  const relevantBlock = relevantEntries.length > 0 ? relevantEntries.map((entry) => describeEntry(entry)).join("\n") : "- No direct route alias matched from the user prompt.";
  const fullMapBlock = APP_NAVIGATION_ENTRIES.map((entry) => describeEntry(entry)).join("\n");
  return [
    "Navigation knowledge for Victory Craft:",
    "- Always use absolute internal paths when calling navigation.go_to.",
    "- The application has top-level pages and module-specific subpages. Prefer the exact subpage path when the user asks for a section inside tournaments or scouting.",
    "- For dynamic routes with :id or :videoId, only use them when the prompt or context provides that identifier. Otherwise prefer the parent dashboard or list subpage.",
    "- Legacy aliases exist: /recruiters redirects to /scouting/subpages/dashboard and /subpages is handled by the videos module.",
    `Current route: ${params.currentPath}`,
    currentEntry ? `Current route match: ${currentEntry.title} (${currentEntry.path})` : "Current route match: no exact catalog match found.",
    "Prompt-relevant routes:",
    relevantBlock,
    "Full route catalog:",
    fullMapBlock
  ].join("\n");
};

// src/app/agent/api/buildAgentPlannerPayload.ts
var trimTrailingWhitespace = (value) => value.trim();
var buildAgentPlannerPayload = (input) => {
  const prompt = trimTrailingWhitespace(input.prompt);
  const navigationKnowledge = buildNavigationKnowledgeBlock({
    currentPath: input.currentPath,
    prompt
  });
  return {
    ...input,
    prompt: [
      "User request:",
      prompt,
      "",
      navigationKnowledge,
      "",
      "Plan only with the registered actions provided in this payload."
    ].join("\n")
  };
};

// src/app/agent/api/agentPlannerClient.ts
var AGENT_PLAN_API_URL = "/agent/plan";
var normalizeFunctionCall = (value) => {
  if (typeof value !== "object" || value === null || !("name" in value)) return null;
  const name = typeof value.name === "string" ? value.name : "";
  if (!name) return null;
  return {
    name,
    arguments: "arguments" in value && typeof value.arguments === "object" && value.arguments !== null ? value.arguments : {}
  };
};
var normalizeExecutionPlan = (payload) => {
  if (typeof payload !== "object" || payload === null || !("calls" in payload)) {
    throw new Error("Agent planner returned an invalid payload.");
  }
  const summary = "summary" in payload && typeof payload.summary === "string" ? payload.summary : void 0;
  const rawCalls = Array.isArray(payload.calls) ? payload.calls : [];
  const calls = rawCalls.map((value) => normalizeFunctionCall(value)).filter((value) => value !== null);
  return {
    summary,
    calls
  };
};
var agentPlannerClient = {
  async plan(payload) {
    try {
      const response = await api.post(AGENT_PLAN_API_URL, buildAgentPlannerPayload(payload));
      return normalizeExecutionPlan(response.data);
    } catch (error) {
      if (axios2.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error(
            "Agent planner rejected the request. Check the prompt and registered actions."
          );
        }
        if (error.response?.status === 500) {
          throw new Error("Agent planner failed while building the action plan.");
        }
        if (error.response?.status === 502) {
          throw new Error("Agent planner is temporarily unavailable. Try again shortly.");
        }
      }
      throw new Error("Could not reach the agent planner endpoint.");
    }
  }
};

// src/app/agent/api/agentPlannerClient.test.ts
var originalPost = api.post;
var createAxiosLikeError = (status) => ({
  isAxiosError: true,
  name: "AxiosError",
  message: "Request failed",
  toJSON: () => ({}),
  response: {
    status,
    data: {}
  }
});
var samplePayload = {
  prompt: "open tournaments registration",
  currentPath: "/fields",
  actions: [
    {
      name: "navigation.go_to",
      description: "Navigate to an internal route",
      parameters: [
        {
          name: "path",
          type: "string",
          description: "Target path",
          required: true
        }
      ],
      returns: [
        {
          name: "message",
          type: "string",
          description: "Navigation confirmation"
        }
      ],
      tags: ["navigation"]
    }
  ]
};
test.afterEach(() => {
  api.post = originalPost;
});
test("agentPlannerClient returns a valid plan with one call", async () => {
  let receivedPayload;
  api.post = async (_url, payload) => {
    receivedPayload = payload;
    return {
      data: {
        summary: "Navigate to the requested page.",
        calls: [
          {
            name: "navigation.go_to",
            arguments: {
              path: "/tournaments/subpages/dashboard#tournament-form"
            }
          }
        ]
      }
    };
  };
  const response = await agentPlannerClient.plan(samplePayload);
  assert.deepEqual(receivedPayload, buildAgentPlannerPayload(samplePayload));
  assert.deepEqual(response, {
    summary: "Navigate to the requested page.",
    calls: [
      {
        name: "navigation.go_to",
        arguments: {
          path: "/tournaments/subpages/dashboard#tournament-form"
        }
      }
    ]
  });
});
test("buildAgentPlannerPayload appends route knowledge including subpages", () => {
  const payload = buildAgentPlannerPayload({
    ...samplePayload,
    prompt: "abre la library de scouting y si hace falta usa subpaginas",
    currentPath: "/scouting/subpages/dashboard"
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
    currentPath: "/videos/subpages/dashboard"
  });
  assert.match(payload.prompt, /User request:\nllevame a la pagina de grabaciones/i);
  assert.match(payload.prompt, /\/videos\/subpages\/streaming\/recording/);
  assert.match(payload.prompt, /grabaciones/);
  assert.match(payload.prompt, /Current route: \/videos\/subpages\/dashboard/);
});
test("agentPlannerClient supports the fallback response with empty calls", async () => {
  api.post = async () => ({
    data: {
      summary: "No valid action could be planned.",
      calls: []
    }
  });
  const response = await agentPlannerClient.plan(samplePayload);
  assert.deepEqual(response, {
    summary: "No valid action could be planned.",
    calls: []
  });
});
test("agentPlannerClient maps 400 into a friendly error", async () => {
  api.post = async () => {
    throw createAxiosLikeError(400);
  };
  await assert.rejects(
    () => agentPlannerClient.plan(samplePayload),
    /Agent planner rejected the request/
  );
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FwcC9hZ2VudC9hcGkvYWdlbnRQbGFubmVyQ2xpZW50LnRlc3QudHMiLCAiLi4vc3JjL2FwcC9hZ2VudC9hcGkvYWdlbnRQbGFubmVyQ2xpZW50LnRzIiwgIi4uL3NyYy91dGlscy9hcGkudHMiLCAiLi4vc3JjL3V0aWxzL2F1dGhTZXNzaW9uLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9qd3QtZGVjb2RlL2J1aWxkL2VzbS9pbmRleC5qcyIsICIuLi9zcmMvdXRpbHMvand0VXRpbC50cyIsICIuLi9zcmMvYXBwL2FnZW50L25hdmlnYXRpb24vbmF2aWdhdGlvbktub3dsZWRnZS50cyIsICIuLi9zcmMvYXBwL2FnZW50L2FwaS9idWlsZEFnZW50UGxhbm5lclBheWxvYWQudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB0ZXN0IGZyb20gXCJub2RlOnRlc3RcIjtcbmltcG9ydCBhc3NlcnQgZnJvbSBcIm5vZGU6YXNzZXJ0L3N0cmljdFwiO1xuaW1wb3J0IHR5cGUgeyBBeGlvc0Vycm9yIH0gZnJvbSBcImF4aW9zXCI7XG5pbXBvcnQgeyBhZ2VudFBsYW5uZXJDbGllbnQgfSBmcm9tIFwiLi9hZ2VudFBsYW5uZXJDbGllbnRcIjtcbmltcG9ydCB7IGJ1aWxkQWdlbnRQbGFubmVyUGF5bG9hZCB9IGZyb20gXCIuL2J1aWxkQWdlbnRQbGFubmVyUGF5bG9hZFwiO1xuaW1wb3J0IHsgYXBpIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2FwaVwiO1xuXG5jb25zdCBvcmlnaW5hbFBvc3QgPSBhcGkucG9zdDtcblxuY29uc3QgY3JlYXRlQXhpb3NMaWtlRXJyb3IgPSAoXG4gIHN0YXR1czogbnVtYmVyXG4pOiBBeGlvc0Vycm9yICYge1xuICByZXNwb25zZToge1xuICAgIHN0YXR1czogbnVtYmVyO1xuICAgIGRhdGE6IHtcbiAgICAgIG1lc3NhZ2U/OiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbn0gPT5cbiAgKHtcbiAgICBpc0F4aW9zRXJyb3I6IHRydWUsXG4gICAgbmFtZTogXCJBeGlvc0Vycm9yXCIsXG4gICAgbWVzc2FnZTogXCJSZXF1ZXN0IGZhaWxlZFwiLFxuICAgIHRvSlNPTjogKCkgPT4gKHt9KSxcbiAgICByZXNwb25zZToge1xuICAgICAgc3RhdHVzLFxuICAgICAgZGF0YToge30sXG4gICAgfSxcbiAgfSkgYXMgQXhpb3NFcnJvciAmIHtcbiAgICByZXNwb25zZToge1xuICAgICAgc3RhdHVzOiBudW1iZXI7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIG1lc3NhZ2U/OiBzdHJpbmc7XG4gICAgICB9O1xuICAgIH07XG4gIH07XG5cbmNvbnN0IHNhbXBsZVBheWxvYWQgPSB7XG4gIHByb21wdDogXCJvcGVuIHRvdXJuYW1lbnRzIHJlZ2lzdHJhdGlvblwiLFxuICBjdXJyZW50UGF0aDogXCIvZmllbGRzXCIsXG4gIGFjdGlvbnM6IFtcbiAgICB7XG4gICAgICBuYW1lOiBcIm5hdmlnYXRpb24uZ29fdG9cIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIk5hdmlnYXRlIHRvIGFuIGludGVybmFsIHJvdXRlXCIsXG4gICAgICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcInBhdGhcIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiIGFzIGNvbnN0LFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlRhcmdldCBwYXRoXCIsXG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgcmV0dXJuczogW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJtZXNzYWdlXCIsXG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIiBhcyBjb25zdCxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJOYXZpZ2F0aW9uIGNvbmZpcm1hdGlvblwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIHRhZ3M6IFtcIm5hdmlnYXRpb25cIl0sXG4gICAgfSxcbiAgXSxcbn07XG5cbnRlc3QuYWZ0ZXJFYWNoKCgpID0+IHtcbiAgYXBpLnBvc3QgPSBvcmlnaW5hbFBvc3Q7XG59KTtcblxudGVzdChcImFnZW50UGxhbm5lckNsaWVudCByZXR1cm5zIGEgdmFsaWQgcGxhbiB3aXRoIG9uZSBjYWxsXCIsIGFzeW5jICgpID0+IHtcbiAgbGV0IHJlY2VpdmVkUGF5bG9hZDogdW5rbm93bjtcbiAgYXBpLnBvc3QgPSAoYXN5bmMgKF91cmwsIHBheWxvYWQpID0+IHtcbiAgICByZWNlaXZlZFBheWxvYWQgPSBwYXlsb2FkO1xuICAgIHJldHVybiB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHN1bW1hcnk6IFwiTmF2aWdhdGUgdG8gdGhlIHJlcXVlc3RlZCBwYWdlLlwiLFxuICAgICAgICBjYWxsczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6IFwibmF2aWdhdGlvbi5nb190b1wiLFxuICAgICAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgIHBhdGg6IFwiL3RvdXJuYW1lbnRzL3N1YnBhZ2VzL2Rhc2hib2FyZCN0b3VybmFtZW50LWZvcm1cIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSkgYXMgdHlwZW9mIGFwaS5wb3N0O1xuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYWdlbnRQbGFubmVyQ2xpZW50LnBsYW4oc2FtcGxlUGF5bG9hZCk7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbChyZWNlaXZlZFBheWxvYWQsIGJ1aWxkQWdlbnRQbGFubmVyUGF5bG9hZChzYW1wbGVQYXlsb2FkKSk7XG4gIGFzc2VydC5kZWVwRXF1YWwocmVzcG9uc2UsIHtcbiAgICBzdW1tYXJ5OiBcIk5hdmlnYXRlIHRvIHRoZSByZXF1ZXN0ZWQgcGFnZS5cIixcbiAgICBjYWxsczogW1xuICAgICAge1xuICAgICAgICBuYW1lOiBcIm5hdmlnYXRpb24uZ29fdG9cIixcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgcGF0aDogXCIvdG91cm5hbWVudHMvc3VicGFnZXMvZGFzaGJvYXJkI3RvdXJuYW1lbnQtZm9ybVwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9KTtcbn0pO1xuXG50ZXN0KFwiYnVpbGRBZ2VudFBsYW5uZXJQYXlsb2FkIGFwcGVuZHMgcm91dGUga25vd2xlZGdlIGluY2x1ZGluZyBzdWJwYWdlc1wiLCAoKSA9PiB7XG4gIGNvbnN0IHBheWxvYWQgPSBidWlsZEFnZW50UGxhbm5lclBheWxvYWQoe1xuICAgIC4uLnNhbXBsZVBheWxvYWQsXG4gICAgcHJvbXB0OiBcImFicmUgbGEgbGlicmFyeSBkZSBzY291dGluZyB5IHNpIGhhY2UgZmFsdGEgdXNhIHN1YnBhZ2luYXNcIixcbiAgICBjdXJyZW50UGF0aDogXCIvc2NvdXRpbmcvc3VicGFnZXMvZGFzaGJvYXJkXCIsXG4gIH0pO1xuXG4gIGFzc2VydC5tYXRjaChwYXlsb2FkLnByb21wdCwgL1VzZXIgcmVxdWVzdDpcXG5hYnJlIGxhIGxpYnJhcnkgZGUgc2NvdXRpbmcvaSk7XG4gIGFzc2VydC5tYXRjaChwYXlsb2FkLnByb21wdCwgL0N1cnJlbnQgcm91dGU6IFxcL3Njb3V0aW5nXFwvc3VicGFnZXNcXC9kYXNoYm9hcmQvKTtcbiAgYXNzZXJ0Lm1hdGNoKHBheWxvYWQucHJvbXB0LCAvXFwvc2NvdXRpbmdcXC9zdWJwYWdlc1xcL2xpYnJhcnkvKTtcbiAgYXNzZXJ0Lm1hdGNoKHBheWxvYWQucHJvbXB0LCAvXFwvdG91cm5hbWVudHNcXC9zdWJwYWdlc1xcL21hdGNoZXMvKTtcbiAgYXNzZXJ0Lm1hdGNoKHBheWxvYWQucHJvbXB0LCAvUGxhbiBvbmx5IHdpdGggdGhlIHJlZ2lzdGVyZWQgYWN0aW9ucyBwcm92aWRlZCBpbiB0aGlzIHBheWxvYWRcXC4vKTtcbn0pO1xuXG50ZXN0KFwiYnVpbGRBZ2VudFBsYW5uZXJQYXlsb2FkIGluY2x1ZGVzIHZpZGVvcyByZWNvcmRpbmcgc3VicGFnZSBhbGlhc2VzXCIsICgpID0+IHtcbiAgY29uc3QgcGF5bG9hZCA9IGJ1aWxkQWdlbnRQbGFubmVyUGF5bG9hZCh7XG4gICAgLi4uc2FtcGxlUGF5bG9hZCxcbiAgICBwcm9tcHQ6IFwibGxldmFtZSBhIGxhIHBhZ2luYSBkZSBncmFiYWNpb25lc1wiLFxuICAgIGN1cnJlbnRQYXRoOiBcIi92aWRlb3Mvc3VicGFnZXMvZGFzaGJvYXJkXCIsXG4gIH0pO1xuXG4gIGFzc2VydC5tYXRjaChwYXlsb2FkLnByb21wdCwgL1VzZXIgcmVxdWVzdDpcXG5sbGV2YW1lIGEgbGEgcGFnaW5hIGRlIGdyYWJhY2lvbmVzL2kpO1xuICBhc3NlcnQubWF0Y2gocGF5bG9hZC5wcm9tcHQsIC9cXC92aWRlb3NcXC9zdWJwYWdlc1xcL3N0cmVhbWluZ1xcL3JlY29yZGluZy8pO1xuICBhc3NlcnQubWF0Y2gocGF5bG9hZC5wcm9tcHQsIC9ncmFiYWNpb25lcy8pO1xuICBhc3NlcnQubWF0Y2gocGF5bG9hZC5wcm9tcHQsIC9DdXJyZW50IHJvdXRlOiBcXC92aWRlb3NcXC9zdWJwYWdlc1xcL2Rhc2hib2FyZC8pO1xufSk7XG5cbnRlc3QoXCJhZ2VudFBsYW5uZXJDbGllbnQgc3VwcG9ydHMgdGhlIGZhbGxiYWNrIHJlc3BvbnNlIHdpdGggZW1wdHkgY2FsbHNcIiwgYXN5bmMgKCkgPT4ge1xuICBhcGkucG9zdCA9IChhc3luYyAoKSA9PiAoe1xuICAgIGRhdGE6IHtcbiAgICAgIHN1bW1hcnk6IFwiTm8gdmFsaWQgYWN0aW9uIGNvdWxkIGJlIHBsYW5uZWQuXCIsXG4gICAgICBjYWxsczogW10sXG4gICAgfSxcbiAgfSkpIGFzIHR5cGVvZiBhcGkucG9zdDtcblxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFnZW50UGxhbm5lckNsaWVudC5wbGFuKHNhbXBsZVBheWxvYWQpO1xuXG4gIGFzc2VydC5kZWVwRXF1YWwocmVzcG9uc2UsIHtcbiAgICBzdW1tYXJ5OiBcIk5vIHZhbGlkIGFjdGlvbiBjb3VsZCBiZSBwbGFubmVkLlwiLFxuICAgIGNhbGxzOiBbXSxcbiAgfSk7XG59KTtcblxudGVzdChcImFnZW50UGxhbm5lckNsaWVudCBtYXBzIDQwMCBpbnRvIGEgZnJpZW5kbHkgZXJyb3JcIiwgYXN5bmMgKCkgPT4ge1xuICBhcGkucG9zdCA9IChhc3luYyAoKSA9PiB7XG4gICAgdGhyb3cgY3JlYXRlQXhpb3NMaWtlRXJyb3IoNDAwKTtcbiAgfSkgYXMgdHlwZW9mIGFwaS5wb3N0O1xuXG4gIGF3YWl0IGFzc2VydC5yZWplY3RzKFxuICAgICgpID0+IGFnZW50UGxhbm5lckNsaWVudC5wbGFuKHNhbXBsZVBheWxvYWQpLFxuICAgIC9BZ2VudCBwbGFubmVyIHJlamVjdGVkIHRoZSByZXF1ZXN0L1xuICApO1xufSk7XG4iLCAiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuaW1wb3J0IHsgYXBpIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2FwaVwiO1xuaW1wb3J0IHR5cGUge1xuICBBZ2VudEV4ZWN1dGlvblBsYW4sXG4gIEFnZW50RnVuY3Rpb25DYWxsLFxuICBBZ2VudExsbUlucHV0LFxufSBmcm9tIFwiLi4vLi4vLi4vYWdlbnQtbWZlXCI7XG5pbXBvcnQgeyBidWlsZEFnZW50UGxhbm5lclBheWxvYWQgfSBmcm9tIFwiLi9idWlsZEFnZW50UGxhbm5lclBheWxvYWRcIjtcblxuZXhwb3J0IGNvbnN0IEFHRU5UX1BMQU5fQVBJX1VSTCA9IFwiL2FnZW50L3BsYW5cIjtcblxuY29uc3Qgbm9ybWFsaXplRnVuY3Rpb25DYWxsID0gKHZhbHVlOiB1bmtub3duKTogQWdlbnRGdW5jdGlvbkNhbGwgfCBudWxsID0+IHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCB2YWx1ZSA9PT0gbnVsbCB8fCAhKFwibmFtZVwiIGluIHZhbHVlKSkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgbmFtZSA9IHR5cGVvZiB2YWx1ZS5uYW1lID09PSBcInN0cmluZ1wiID8gdmFsdWUubmFtZSA6IFwiXCI7XG4gIGlmICghbmFtZSkgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lLFxuICAgIGFyZ3VtZW50czpcbiAgICAgIFwiYXJndW1lbnRzXCIgaW4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLmFyZ3VtZW50cyA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZS5hcmd1bWVudHMgIT09IG51bGxcbiAgICAgICAgPyAodmFsdWUuYXJndW1lbnRzIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVxuICAgICAgICA6IHt9LFxuICB9O1xufTtcblxuY29uc3Qgbm9ybWFsaXplRXhlY3V0aW9uUGxhbiA9IChwYXlsb2FkOiB1bmtub3duKTogQWdlbnRFeGVjdXRpb25QbGFuID0+IHtcbiAgaWYgKHR5cGVvZiBwYXlsb2FkICE9PSBcIm9iamVjdFwiIHx8IHBheWxvYWQgPT09IG51bGwgfHwgIShcImNhbGxzXCIgaW4gcGF5bG9hZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJBZ2VudCBwbGFubmVyIHJldHVybmVkIGFuIGludmFsaWQgcGF5bG9hZC5cIik7XG4gIH1cblxuICBjb25zdCBzdW1tYXJ5ID1cbiAgICBcInN1bW1hcnlcIiBpbiBwYXlsb2FkICYmIHR5cGVvZiBwYXlsb2FkLnN1bW1hcnkgPT09IFwic3RyaW5nXCJcbiAgICAgID8gcGF5bG9hZC5zdW1tYXJ5XG4gICAgICA6IHVuZGVmaW5lZDtcbiAgY29uc3QgcmF3Q2FsbHMgPSBBcnJheS5pc0FycmF5KHBheWxvYWQuY2FsbHMpID8gcGF5bG9hZC5jYWxscyA6IFtdO1xuICBjb25zdCBjYWxscyA9IHJhd0NhbGxzXG4gICAgLm1hcCgodmFsdWUpID0+IG5vcm1hbGl6ZUZ1bmN0aW9uQ2FsbCh2YWx1ZSkpXG4gICAgLmZpbHRlcigodmFsdWUpOiB2YWx1ZSBpcyBBZ2VudEZ1bmN0aW9uQ2FsbCA9PiB2YWx1ZSAhPT0gbnVsbCk7XG5cbiAgcmV0dXJuIHtcbiAgICBzdW1tYXJ5LFxuICAgIGNhbGxzLFxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGFnZW50UGxhbm5lckNsaWVudCA9IHtcbiAgYXN5bmMgcGxhbihwYXlsb2FkOiBBZ2VudExsbUlucHV0KTogUHJvbWlzZTxBZ2VudEV4ZWN1dGlvblBsYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucG9zdChBR0VOVF9QTEFOX0FQSV9VUkwsIGJ1aWxkQWdlbnRQbGFubmVyUGF5bG9hZChwYXlsb2FkKSk7XG4gICAgICByZXR1cm4gbm9ybWFsaXplRXhlY3V0aW9uUGxhbihyZXNwb25zZS5kYXRhKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGF4aW9zLmlzQXhpb3NFcnJvcihlcnJvcikpIHtcbiAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlPy5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIFwiQWdlbnQgcGxhbm5lciByZWplY3RlZCB0aGUgcmVxdWVzdC4gQ2hlY2sgdGhlIHByb21wdCBhbmQgcmVnaXN0ZXJlZCBhY3Rpb25zLlwiXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlcnJvci5yZXNwb25zZT8uc3RhdHVzID09PSA1MDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBZ2VudCBwbGFubmVyIGZhaWxlZCB3aGlsZSBidWlsZGluZyB0aGUgYWN0aW9uIHBsYW4uXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVycm9yLnJlc3BvbnNlPy5zdGF0dXMgPT09IDUwMikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFnZW50IHBsYW5uZXIgaXMgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUuIFRyeSBhZ2FpbiBzaG9ydGx5LlwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgcmVhY2ggdGhlIGFnZW50IHBsYW5uZXIgZW5kcG9pbnQuXCIpO1xuICAgIH1cbiAgfSxcbn07XG4iLCAiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuaW1wb3J0IHtcbiAgY2xlYXJQZXJzaXN0ZWRBdXRoU2Vzc2lvbkFuZE5vdGlmeSxcbn0gZnJvbSBcIi4vYXV0aFNlc3Npb25cIjtcbmltcG9ydCB7IGlzVmFsaWRKd3RUb2tlbiB9IGZyb20gXCIuL2p3dFV0aWxcIjtcblxuLy8gXHVEODNEXHVEQ0NDIERlZmluaXIgY29uc3RhbnRlcyBnbG9iYWxlc1xuY29uc3QgSU1BR0VTX0JVQ0tFVCA9IFwiaW1hZ2VzLXRmbTJcIjtcbmNvbnN0IHZpdGVFbnYgPVxuICB0eXBlb2YgaW1wb3J0Lm1ldGEgIT09IFwidW5kZWZpbmVkXCJcbiAgICA/IChpbXBvcnQubWV0YSBhcyBJbXBvcnRNZXRhICYgeyBlbnY/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCB1bmRlZmluZWQ+IH0pLmVudlxuICAgIDogdW5kZWZpbmVkO1xuXG4vLyBcdUQ4M0RcdURDQ0MgVGlwYWRvIHBhcmEgbGEgQVBJIHByaW5jaXBhbFxuZXhwb3J0IGNvbnN0IGFwaSA9IGF4aW9zLmNyZWF0ZSh7XG4gIGJhc2VVUkw6IHZpdGVFbnY/LlZJVEVfQVBJX1VSTCB8fCBcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMVwiLCAvLyBDYW1iaWEgZXN0byBhIGxhIFVSTCBkZSB0dSBBUElcbn0pO1xuXG5hcGkuaW50ZXJjZXB0b3JzLnJlcXVlc3QudXNlKChjb25maWcpID0+IHtcbiAgY29uc3QgYXV0aG9yaXphdGlvbiA9XG4gICAgdHlwZW9mIGNvbmZpZy5oZWFkZXJzPy5BdXRob3JpemF0aW9uID09PSBcInN0cmluZ1wiXG4gICAgICA/IGNvbmZpZy5oZWFkZXJzLkF1dGhvcml6YXRpb25cbiAgICAgIDogdHlwZW9mIGNvbmZpZy5oZWFkZXJzPy5hdXRob3JpemF0aW9uID09PSBcInN0cmluZ1wiXG4gICAgICAgID8gY29uZmlnLmhlYWRlcnMuYXV0aG9yaXphdGlvblxuICAgICAgICA6IFwiXCI7XG5cbiAgaWYgKGF1dGhvcml6YXRpb24uc3RhcnRzV2l0aChcIkJlYXJlciBcIikpIHtcbiAgICBjb25zdCB0b2tlbiA9IGF1dGhvcml6YXRpb24uc2xpY2UoXCJCZWFyZXIgXCIubGVuZ3RoKS50cmltKCk7XG4gICAgaWYgKCFpc1ZhbGlkSnd0VG9rZW4odG9rZW4pICYmIGNvbmZpZy5oZWFkZXJzKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnMuQXV0aG9yaXphdGlvbjtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVycy5hdXRob3JpemF0aW9uO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59KTtcblxuYXBpLmludGVyY2VwdG9ycy5yZXNwb25zZS51c2UoXG4gIChyZXNwb25zZSkgPT4gcmVzcG9uc2UsXG4gIChlcnJvcikgPT4ge1xuICAgIGNvbnN0IHN0YXR1cyA9IGVycm9yPy5yZXNwb25zZT8uc3RhdHVzO1xuICAgIGNvbnN0IGF1dGhvcml6YXRpb24gPVxuICAgICAgdHlwZW9mIGVycm9yPy5jb25maWc/LmhlYWRlcnM/LkF1dGhvcml6YXRpb24gPT09IFwic3RyaW5nXCJcbiAgICAgICAgPyBlcnJvci5jb25maWcuaGVhZGVycy5BdXRob3JpemF0aW9uXG4gICAgICAgIDogdHlwZW9mIGVycm9yPy5jb25maWc/LmhlYWRlcnM/LmF1dGhvcml6YXRpb24gPT09IFwic3RyaW5nXCJcbiAgICAgICAgICA/IGVycm9yLmNvbmZpZy5oZWFkZXJzLmF1dGhvcml6YXRpb25cbiAgICAgICAgICA6IFwiXCI7XG5cbiAgICBpZiAoc3RhdHVzID09PSA0MDEgJiYgYXV0aG9yaXphdGlvbi5zdGFydHNXaXRoKFwiQmVhcmVyIFwiKSkge1xuICAgICAgY2xlYXJQZXJzaXN0ZWRBdXRoU2Vzc2lvbkFuZE5vdGlmeSgpO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cbik7XG5cbmV4cG9ydCBjb25zdCBzM0FwaSA9IGF4aW9zLmNyZWF0ZSgpO1xuXG4vLyBcdUQ4M0RcdURDQ0MgRnVuY2lvbmVzIHBhcmEgb2J0ZW5lciBVUkxzIGJhc2VcbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlVVJMKHBhdGg6IHN0cmluZyA9IFwiXCIpOiBzdHJpbmcge1xuICByZXR1cm4gYGh0dHBzOi8vZG1hZzUucGMuYWMudXBjLmVkdS9hcGkvJHtwYXRofWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlVVJMTWV0YWRhdGEocGF0aDogc3RyaW5nID0gXCJcIik6IHN0cmluZyB7XG4gIHJldHVybiBgaHR0cHM6Ly9xOG9ueGhrODE4LmV4ZWN1dGUtYXBpLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL1Byb2QvJHtwYXRofWA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlVXJsSnVtYmYocGF0aDogc3RyaW5nID0gXCJcIik6IHN0cmluZyB7XG4gIHJldHVybiBgaHR0cDovL2VjMi0zLTgwLTgxLTI1MS5jb21wdXRlLTEuYW1hem9uYXdzLmNvbTo4MDgwLyR7cGF0aH1gO1xufVxuXG4vLyBcdUQ4M0RcdURDQ0MgQ3JlYXIgaW5zdGFuY2lhcyBkZSBBUEkgY29uIGJhc2VVUkwgcGVyc29uYWxpemFkYVxuZXhwb3J0IGNvbnN0IGFwaU1ldGFkYXRhID0gYXhpb3MuY3JlYXRlKHtcbiAgYmFzZVVSTDogZ2V0QmFzZVVSTE1ldGFkYXRhKCksXG59KTtcblxuZXhwb3J0IGNvbnN0IGFwaUp1bWJmID0gYXhpb3MuY3JlYXRlKHtcbiAgYmFzZVVSTDogZ2V0QmFzZVVybEp1bWJmKCksXG59KTtcblxuLy8gXHVEODNEXHVEQ0NDIFRpcGFkbyBkZSBlc3RydWN0dXJhIHBhcmEgcmVzcHVlc3RhcyBBUElcbmludGVyZmFjZSBBcGlSZXNwb25zZTxUPiB7XG4gIGRhdGE6IFQ7XG59XG5cbi8vIFx1RDgzRFx1RENDQyBGdW5jaVx1MDBGM24gcGFyYSBvYnRlbmVyIGltYWdlblxuZXhwb3J0IGNvbnN0IGdldEltYWdlID0gYXN5bmMgKG9iamVjdEtleTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaU1ldGFkYXRhLnBvc3Q8XG4gICAgICBBcGlSZXNwb25zZTx7IGRvd25sb2FkVXJsOiBzdHJpbmcgfT5cbiAgICA+KFxuICAgICAgXCJnZXRJbWFnZVwiLFxuICAgICAge1xuICAgICAgICBidWNrZXROYW1lOiBJTUFHRVNfQlVDS0VULFxuICAgICAgICBvYmplY3RLZXk6IG9iamVjdEtleSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgaW1hZ2VVcmwgPSByZXNwb25zZS5kYXRhLmRhdGEuZG93bmxvYWRVcmw7XG4gICAgY29uc3QgcmVzcG9uc2UyID0gYXdhaXQgYXhpb3MuZ2V0KGltYWdlVXJsKTtcbiAgICByZXR1cm4gcmVzcG9uc2UyLmRhdGE7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGZldGNoaW5nIGltYWdlOlwiLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbi8vIFx1RDgzRFx1RENDQyBGdW5jaVx1MDBGM24gcGFyYSBvYnRlbmVyIGxhIFVSTCBkZSBsYSBpbWFnZW5cbmV4cG9ydCBjb25zdCBnZXRJbWFnZVVybCA9IGFzeW5jIChcbiAgb2JqZWN0S2V5OiBzdHJpbmcsXG4gIHRva2VuOiBzdHJpbmdcbik6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5wb3N0PEFwaVJlc3BvbnNlPHsgZG93bmxvYWRVcmw6IHN0cmluZyB9Pj4oXG4gICAgICBcImh0dHBzOi8vMzFobzU2eXJnaS5leGVjdXRlLWFwaS51cy1lYXN0LTEuYW1hem9uYXdzLmNvbS9wcm9kL2dldEltYWdlXCIsXG4gICAgICB7XG4gICAgICAgIGJ1Y2tldE5hbWU6IElNQUdFU19CVUNLRVQsXG4gICAgICAgIG9iamVjdEtleTogb2JqZWN0S2V5LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt0b2tlbn1gLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgICk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEuZGF0YS5kb3dubG9hZFVybDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZmV0Y2hpbmcgaW1hZ2U6XCIsIGVycm9yKTtcbiAgfVxufTtcblxuLy8gXHVEODNEXHVEQ0NDIFRpcGFkbyBwYXJhIHN1YmlkYSBkZSBhcmNoaXZvc1xuZXhwb3J0IGNvbnN0IHVwbG9hZEp1bWJmU2VydmVyRmlsZSA9IGFzeW5jIChmaWxlOiBGaWxlKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gIGZvcm1EYXRhLmFwcGVuZChcImZpbGVcIiwgZmlsZSk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLnBvc3QoXG4gICAgICBcImh0dHA6Ly9lYzItMy04MC04MS0yNTEuY29tcHV0ZS0xLmFtYXpvbmF3cy5jb206ODA4MC9hcGkvZGVtby91cGxvYWRNZXRhZGF0YUZpbGVcIixcbiAgICAgIGZvcm1EYXRhLFxuICAgICAge1xuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiIH0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnNvbGUubG9nKFwiUmVzcHVlc3RhIGRlbCBzZXJ2aWRvcjpcIiwgcmVzcG9uc2UuZGF0YSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGFsIHN1YmlyIGVsIGFyY2hpdm86XCIsIGVycm9yKTtcbiAgfVxufTtcblxuLy8gXHVEODNEXHVEQ0NDIEZ1bmNpXHUwMEYzbiBwYXJhIGNyZWFyIHVuIHJlZ2lzdHJvIGRlIGltYWdlbiBlbiBsYSBBUElcbmV4cG9ydCBjb25zdCBjcmVhdGVJbWFnZVJlY29yZCA9IGFzeW5jIChcbiAgb2JqZWN0S2V5OiBzdHJpbmcsXG4gIHVzZXJJZDogc3RyaW5nXG4pOiBQcm9taXNlPEFwaVJlc3BvbnNlPGFueT4+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBhcGlVcmwgPVxuICAgICAgXCJodHRwczovL3E4b254aGs4MTguZXhlY3V0ZS1hcGkudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vUHJvZC9pbWFnZXMvY3JlYXRlXCI7XG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7IGtleTogb2JqZWN0S2V5LCB1c2VySWQgfSk7XG5cbiAgICBjb25zdCBkYXRhID0geyBidWNrZXROYW1lOiBJTUFHRVNfQlVDS0VULCBvYmplY3RLZXksIHVzZXJJZCB9O1xuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5wb3N0PEFwaVJlc3BvbnNlPGFueT4+KFxuICAgICAgYCR7YXBpVXJsfT8ke3BhcmFtcy50b1N0cmluZygpfWAsXG4gICAgICBkYXRhLFxuICAgICAge1xuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnNvbGUubG9nKFwiSW1hZ2UgcmVjb3JkIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5OlwiLCByZXNwb25zZS5kYXRhKTtcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgY3JlYXRpbmcgaW1hZ2UgcmVjb3JkOlwiLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbi8vIFx1RDgzRFx1RENDQyBGdW5jaVx1MDBGM24gcGFyYSBwcm9jZXNhciBtZXRhZGF0b3MgRVhJRlxuZXhwb3J0IGNvbnN0IHByb2Nlc3NFeGlmTWV0YWRhdGEgPSBhc3luYyAoXG4gIG9iamVjdEtleTogc3RyaW5nLFxuICB1c2VySWQ6IHN0cmluZ1xuKTogUHJvbWlzZTxBcGlSZXNwb25zZTxhbnk+PiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgYXBpVXJsID1cbiAgICAgIFwiaHR0cHM6Ly9xOG9ueGhrODE4LmV4ZWN1dGUtYXBpLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL1Byb2QvcHJvY2Vzc0V4aWZcIjtcbiAgICBjb25zdCBkYXRhID0geyBidWNrZXROYW1lOiBJTUFHRVNfQlVDS0VULCBvYmplY3RLZXksIHVzZXJJZCB9O1xuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5wb3N0PEFwaVJlc3BvbnNlPGFueT4+KGFwaVVybCwgZGF0YSwge1xuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coXCJFWElGIGRhdGEgcHJvY2Vzc2VkIHN1Y2Nlc3NmdWxseTpcIiwgcmVzcG9uc2UuZGF0YSk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHByb2Nlc3NpbmcgRVhJRiBkYXRhOlwiLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbi8vIFx1RDgzRFx1RENDQyBGdW5jaVx1MDBGM24gcGFyYSBzdWJpciBhcmNoaXZvcyBKU09OIGRlIG1ldGFkYXRvc1xuZXhwb3J0IGNvbnN0IHVwbG9hZE1ldGFkYXRhRmlsZSA9IGFzeW5jIChcbiAgb2JqZWN0S2V5OiBzdHJpbmcsXG4gIGpzb25PYmplY3Q6IG9iamVjdFxuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QganNvbkZpbGVOYW1lID0gb2JqZWN0S2V5LnNwbGl0KFwiLlwiKVswXSArIFwiLmpzb25cIjtcbiAgICBjb25zb2xlLmxvZyhcImpzb24gZmlsZSBuYW1lXCIsIGpzb25GaWxlTmFtZSk7XG5cbiAgICBjb25zdCBhcmNoaXZvSlNPTiA9IG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeShqc29uT2JqZWN0KV0sIHtcbiAgICAgIHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIH0pO1xuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgZm9ybURhdGEuYXBwZW5kKFwiZmlsZVwiLCBhcmNoaXZvSlNPTiwganNvbkZpbGVOYW1lKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MucG9zdChcbiAgICAgIFwiaHR0cDovL2VjMi0zLTgwLTgxLTI1MS5jb21wdXRlLTEuYW1hem9uYXdzLmNvbTo4MDgwL2FwaS9kZW1vL3VwbG9hZE1ldGFkYXRhRmlsZVwiLFxuICAgICAgZm9ybURhdGEsXG4gICAgICB7XG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIgfSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coXCJSZXNwdWVzdGEgZGVsIHNlcnZpZG9yOlwiLCByZXNwb25zZS5kYXRhKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgfVxufTtcblxuLy8gXHVEODNEXHVEQ0NDIEZ1bmNpXHUwMEYzbiBwYXJhIGRlc2NhcmdhciB1biBhcmNoaXZvXG5leHBvcnQgY29uc3QgZG93bmxvYWRGaWxlID0gYXN5bmMgKG9iamVjdEtleTogc3RyaW5nKTogUHJvbWlzZTxCbG9iPiA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdGFyZ2V0RmlsZSA9IFwidGFyZ2V0X1wiICsgb2JqZWN0S2V5O1xuICAgIGNvbnN0IGFwaVVybCA9XG4gICAgICBcImh0dHA6Ly9lYzItMy04MC04MS0yNTEuY29tcHV0ZS0xLmFtYXpvbmF3cy5jb206ODA4MC9hcGkvZGVtby9kb3dubG9hZFwiO1xuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoeyB0YXJnZXRGaWxlIH0pLnRvU3RyaW5nKCk7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldChgJHthcGlVcmx9PyR7cGFyYW1zfWAsIHtcbiAgICAgIHJlc3BvbnNlVHlwZTogXCJibG9iXCIsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IEJsb2IoW3Jlc3BvbnNlLmRhdGFdKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZG93bmxvYWRpbmcgZmlsZTpcIiwgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG4vLyBcdUQ4M0RcdURDQ0MgRnVuY2lcdTAwRjNuIHBhcmEgb2J0ZW5lciBpbVx1MDBFMWdlbmVzIGRlIHVuIHVzdWFyaW9cbmV4cG9ydCBjb25zdCBnZXRJbWFnZXMgPSBhc3luYyAodXNlcklkOiBzdHJpbmcpOiBQcm9taXNlPEFwaVJlc3BvbnNlPGFueT4+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBhcGlVcmwgPVxuICAgICAgXCJodHRwczovL3E4b254aGs4MTguZXhlY3V0ZS1hcGkudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vUHJvZC9nZXRJbWFnZXNcIjtcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHsgdXNlcklkIH0pLnRvU3RyaW5nKCk7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldDxBcGlSZXNwb25zZTxhbnk+PihgJHthcGlVcmx9PyR7cGFyYW1zfWAsIHtcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKFwicmVzcG9uc2U6XCIsIHJlc3BvbnNlLmRhdGEpO1xuICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBmZXRjaGluZyBpbWFnZXM6XCIsIGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcbiIsICJleHBvcnQgY29uc3QgQVVUSF9JTlZBTElEQVRFRF9FVkVOVCA9IFwiYXV0aDpzZXNzaW9uLWludmFsaWRhdGVkXCI7XG5cbmNvbnN0IEFVVEhfU1RPUkFHRV9LRVlTID0gW1widG9rZW5cIiwgXCJ1c2VySWRcIiwgXCJlbWFpbFwiLCBcInJvbGVcIiwgXCJleHBcIiwgXCJ2aWV3Um9sZVwiXSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IGNsZWFyUGVyc2lzdGVkQXV0aFNlc3Npb24gPSAoKTogdm9pZCA9PiB7XG4gIEFVVEhfU1RPUkFHRV9LRVlTLmZvckVhY2goKGtleSkgPT4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KSk7XG59O1xuXG5leHBvcnQgY29uc3Qgbm90aWZ5QXV0aFNlc3Npb25JbnZhbGlkYXRlZCA9ICgpOiB2b2lkID0+IHtcbiAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEFVVEhfSU5WQUxJREFURURfRVZFTlQpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjbGVhclBlcnNpc3RlZEF1dGhTZXNzaW9uQW5kTm90aWZ5ID0gKCk6IHZvaWQgPT4ge1xuICBjbGVhclBlcnNpc3RlZEF1dGhTZXNzaW9uKCk7XG4gIG5vdGlmeUF1dGhTZXNzaW9uSW52YWxpZGF0ZWQoKTtcbn07XG4iLCAiZXhwb3J0IGNsYXNzIEludmFsaWRUb2tlbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xufVxuSW52YWxpZFRva2VuRXJyb3IucHJvdG90eXBlLm5hbWUgPSBcIkludmFsaWRUb2tlbkVycm9yXCI7XG5mdW5jdGlvbiBiNjREZWNvZGVVbmljb2RlKHN0cikge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoYXRvYihzdHIpLnJlcGxhY2UoLyguKS9nLCAobSwgcCkgPT4ge1xuICAgICAgICBsZXQgY29kZSA9IHAuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgICAgICAgaWYgKGNvZGUubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgY29kZSA9IFwiMFwiICsgY29kZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCIlXCIgKyBjb2RlO1xuICAgIH0pKTtcbn1cbmZ1bmN0aW9uIGJhc2U2NFVybERlY29kZShzdHIpIHtcbiAgICBsZXQgb3V0cHV0ID0gc3RyLnJlcGxhY2UoLy0vZywgXCIrXCIpLnJlcGxhY2UoL18vZywgXCIvXCIpO1xuICAgIHN3aXRjaCAob3V0cHV0Lmxlbmd0aCAlIDQpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIG91dHB1dCArPSBcIj09XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgb3V0cHV0ICs9IFwiPVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJiYXNlNjQgc3RyaW5nIGlzIG5vdCBvZiB0aGUgY29ycmVjdCBsZW5ndGhcIik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBiNjREZWNvZGVVbmljb2RlKG91dHB1dCk7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGF0b2Iob3V0cHV0KTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gand0RGVjb2RlKHRva2VuLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiB0b2tlbiAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRva2VuRXJyb3IoXCJJbnZhbGlkIHRva2VuIHNwZWNpZmllZDogbXVzdCBiZSBhIHN0cmluZ1wiKTtcbiAgICB9XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICBjb25zdCBwb3MgPSBvcHRpb25zLmhlYWRlciA9PT0gdHJ1ZSA/IDAgOiAxO1xuICAgIGNvbnN0IHBhcnQgPSB0b2tlbi5zcGxpdChcIi5cIilbcG9zXTtcbiAgICBpZiAodHlwZW9mIHBhcnQgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUb2tlbkVycm9yKGBJbnZhbGlkIHRva2VuIHNwZWNpZmllZDogbWlzc2luZyBwYXJ0ICMke3BvcyArIDF9YCk7XG4gICAgfVxuICAgIGxldCBkZWNvZGVkO1xuICAgIHRyeSB7XG4gICAgICAgIGRlY29kZWQgPSBiYXNlNjRVcmxEZWNvZGUocGFydCk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkVG9rZW5FcnJvcihgSW52YWxpZCB0b2tlbiBzcGVjaWZpZWQ6IGludmFsaWQgYmFzZTY0IGZvciBwYXJ0ICMke3BvcyArIDF9ICgke2UubWVzc2FnZX0pYCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZWQpO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRva2VuRXJyb3IoYEludmFsaWQgdG9rZW4gc3BlY2lmaWVkOiBpbnZhbGlkIGpzb24gZm9yIHBhcnQgIyR7cG9zICsgMX0gKCR7ZS5tZXNzYWdlfSlgKTtcbiAgICB9XG59XG4iLCAiaW1wb3J0IHsgand0RGVjb2RlIH0gZnJvbSBcImp3dC1kZWNvZGVcIjtcblxuLy8gXHVEODNEXHVEQ0NDIEludGVyZmF6IGRlbCB1c3VhcmlvIGRlc3B1XHUwMEU5cyBkZSBkZXNlbmNyaXB0YXIgZWwgdG9rZW5cbmludGVyZmFjZSBEZWNvZGVkVG9rZW4ge1xuICBpZDogc3RyaW5nO1xuICBlbWFpbDogc3RyaW5nO1xuICBleHA6IG51bWJlcjsgLy8gVGllbXBvIGRlIGV4cGlyYWNpXHUwMEYzbiBkZWwgdG9rZW5cbiAgcm9sZTogc3RyaW5nO1xufVxuXG4vLyBcdUQ4M0RcdURDQ0MgRnVuY2lcdTAwRjNuIHBhcmEgb2J0ZW5lciB5IGRlY29kaWZpY2FyIGVsIHRva2VuIEpXVFxuZXhwb3J0IGNvbnN0IGdldERlY29kZWRUb2tlbiA9ICh0b2tlbjogc3RyaW5nKTogRGVjb2RlZFRva2VuIHwgbnVsbCA9PiB7XG4gIHRyeSB7XG4gICAgLy8gRGVzZW5jcmlwdGFyIHRva2VuIGNvbiBganNvbndlYnRva2VuYCAoTWlzbWEgbGlicmVyXHUwMEVEYSBkZWwgYmFja2VuZClcbiAgICBjb25zdCBkZWNvZGVkID0gand0RGVjb2RlKHRva2VuKSBhcyBEZWNvZGVkVG9rZW47XG4gICAgcmV0dXJuIGRlY29kZWQ7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGFsIGRlY29kaWZpY2FyIHRva2VuOlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBoYXNKd3RGb3JtYXQgPSAodG9rZW46IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICBjb25zdCB2YWx1ZSA9IHRva2VuLnRyaW0oKTtcbiAgaWYgKCF2YWx1ZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwYXJ0cyA9IHZhbHVlLnNwbGl0KFwiLlwiKTtcbiAgcmV0dXJuIHBhcnRzLmxlbmd0aCA9PT0gMyAmJiBwYXJ0cy5ldmVyeSgocGFydCkgPT4gcGFydC50cmltKCkubGVuZ3RoID4gMCk7XG59O1xuXG5leHBvcnQgY29uc3QgaXNWYWxpZEp3dFRva2VuID0gKHRva2VuOiBzdHJpbmcpOiBib29sZWFuID0+XG4gIGhhc0p3dEZvcm1hdCh0b2tlbikgJiYgZ2V0RGVjb2RlZFRva2VuKHRva2VuKSAhPT0gbnVsbDtcbiIsICJleHBvcnQgaW50ZXJmYWNlIEFwcE5hdmlnYXRpb25FbnRyeSB7XG4gIGlkOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHBhdGg6IHN0cmluZztcbiAgZGVzY3JpcHRpb246IHN0cmluZztcbiAgc2VjdGlvbjogc3RyaW5nO1xuICBhbGlhc2VzPzogc3RyaW5nW107XG4gIHBhdGhQYXR0ZXJuPzogUmVnRXhwO1xuICBub3Rlcz86IHN0cmluZ1tdO1xufVxuXG5jb25zdCBBUFBfTkFWSUdBVElPTl9FTlRSSUVTOiBBcHBOYXZpZ2F0aW9uRW50cnlbXSA9IFtcbiAge1xuICAgIGlkOiBcImhvbWVcIixcbiAgICB0aXRsZTogXCJIb21lXCIsXG4gICAgcGF0aDogXCIvXCIsXG4gICAgZGVzY3JpcHRpb246IFwiTGFuZGluZyBwcmluY2lwYWwgZGUgVmljdG9yeSBDcmFmdC5cIixcbiAgICBzZWN0aW9uOiBcImdlbmVyYWxcIixcbiAgICBhbGlhc2VzOiBbXCJpbmljaW9cIiwgXCJob21lXCIsIFwicG9ydGFkYVwiXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcInVzZXJzXCIsXG4gICAgdGl0bGU6IFwiVXNlcnNcIixcbiAgICBwYXRoOiBcIi91c2Vyc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlZpc3RhIHByaXZhZGEgZGUgdXN1YXJpb3MuXCIsXG4gICAgc2VjdGlvbjogXCJnZW5lcmFsXCIsXG4gICAgYWxpYXNlczogW1widXN1YXJpb3NcIiwgXCJ1c2Vyc1wiXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcImZpZWxkc19saXN0XCIsXG4gICAgdGl0bGU6IFwiRmllbGRzIExpc3RcIixcbiAgICBwYXRoOiBcIi9maWVsZHNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJMaXN0YWRvIHByaW5jaXBhbCBkZSBjYW5jaGFzLlwiLFxuICAgIHNlY3Rpb246IFwiZmllbGRzXCIsXG4gICAgYWxpYXNlczogW1wiZmllbGRzXCIsIFwiY2FuY2hhc1wiLCBcImxpc3RhZG8gZGUgY2FuY2hhc1wiXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcImZpZWxkX2NyZWF0ZVwiLFxuICAgIHRpdGxlOiBcIkZpZWxkIENyZWF0ZVwiLFxuICAgIHBhdGg6IFwiL2ZpZWxkcy9uZXdcIixcbiAgICBkZXNjcmlwdGlvbjogXCJGb3JtdWxhcmlvIHBhcmEgY3JlYXIgdW5hIGNhbmNoYS5cIixcbiAgICBzZWN0aW9uOiBcImZpZWxkc1wiLFxuICAgIGFsaWFzZXM6IFtcImNyZWFyIGNhbmNoYVwiLCBcIm51ZXZhIGNhbmNoYVwiLCBcIm5ldyBmaWVsZFwiXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcImZpZWxkX2VkaXRcIixcbiAgICB0aXRsZTogXCJGaWVsZCBFZGl0XCIsXG4gICAgcGF0aDogXCIvZmllbGRzL2VkaXQvOmlkXCIsXG4gICAgZGVzY3JpcHRpb246IFwiRm9ybXVsYXJpbyBwYXJhIGVkaXRhciB1bmEgY2FuY2hhIGV4aXN0ZW50ZS5cIixcbiAgICBzZWN0aW9uOiBcImZpZWxkc1wiLFxuICAgIGFsaWFzZXM6IFtcImVkaXRhciBjYW5jaGFcIiwgXCJlZGl0IGZpZWxkXCJdLFxuICAgIHBhdGhQYXR0ZXJuOiAvXlxcL2ZpZWxkc1xcL2VkaXRcXC9bXi9dK1xcLz8kLyxcbiAgICBub3RlczogW1wiUnV0YSBkaW5hbWljYTogcmVxdWllcmUgaWQgZGUgbGEgY2FuY2hhLlwiXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcImZpZWxkX3Jlc2VydmF0aW9uc1wiLFxuICAgIHRpdGxlOiBcIkZpZWxkIFJlc2VydmF0aW9uc1wiLFxuICAgIHBhdGg6IFwiL2ZpZWxkcy86aWQvcmVzZXJ2YXRpb25zXCIsXG4gICAgZGVzY3JpcHRpb246IFwiUmVzZXJ2YXMgYXNvY2lhZGFzIGEgdW5hIGNhbmNoYSBlc3BlY2lmaWNhLlwiLFxuICAgIHNlY3Rpb246IFwiZmllbGRzXCIsXG4gICAgYWxpYXNlczogW1wicmVzZXJ2YXMgZGUgY2FuY2hhXCIsIFwiZmllbGQgcmVzZXJ2YXRpb25zXCJdLFxuICAgIHBhdGhQYXR0ZXJuOiAvXlxcL2ZpZWxkc1xcL1teL10rXFwvcmVzZXJ2YXRpb25zXFwvPyQvLFxuICAgIG5vdGVzOiBbXCJSdXRhIGRpbmFtaWNhOiByZXF1aWVyZSBpZCBkZSBsYSBjYW5jaGEuXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwicmVzZXJ2YXRpb25zX2Rhc2hib2FyZFwiLFxuICAgIHRpdGxlOiBcIlJlc2VydmF0aW9uc1wiLFxuICAgIHBhdGg6IFwiL3Jlc2VydmF0aW9uc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlZpc3RhIHByaW5jaXBhbCBkZSByZXNlcnZhcy5cIixcbiAgICBzZWN0aW9uOiBcInJlc2VydmF0aW9uc1wiLFxuICAgIGFsaWFzZXM6IFtcInJlc2VydmFzXCIsIFwicmVzZXJ2YXRpb25zXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwicmVzZXJ2YXRpb25fY3JlYXRlXCIsXG4gICAgdGl0bGU6IFwiUmVzZXJ2YXRpb24gQ3JlYXRlXCIsXG4gICAgcGF0aDogXCIvcmVzZXJ2YXRpb25zL25ld1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkZvcm11bGFyaW8gcGFyYSBjcmVhciB1bmEgcmVzZXJ2YSBzaW4gY2FuY2hhIHByZXNlbGVjY2lvbmFkYS5cIixcbiAgICBzZWN0aW9uOiBcInJlc2VydmF0aW9uc1wiLFxuICAgIGFsaWFzZXM6IFtcIm51ZXZhIHJlc2VydmFcIiwgXCJjcmVhciByZXNlcnZhXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwicmVzZXJ2YXRpb25fY3JlYXRlX2Zvcl9maWVsZFwiLFxuICAgIHRpdGxlOiBcIlJlc2VydmF0aW9uIENyZWF0ZSBGb3IgRmllbGRcIixcbiAgICBwYXRoOiBcIi9yZXNlcnZhdGlvbnMvbmV3LzpmaWVsZElkXCIsXG4gICAgZGVzY3JpcHRpb246IFwiRm9ybXVsYXJpbyBwYXJhIGNyZWFyIHVuYSByZXNlcnZhIGRlc2RlIHVuYSBjYW5jaGEgY29uY3JldGEuXCIsXG4gICAgc2VjdGlvbjogXCJyZXNlcnZhdGlvbnNcIixcbiAgICBhbGlhc2VzOiBbXCJudWV2YSByZXNlcnZhIGRlIGNhbmNoYVwiLCBcImNyZWFyIHJlc2VydmEgcGFyYSBjYW5jaGFcIl0sXG4gICAgcGF0aFBhdHRlcm46IC9eXFwvcmVzZXJ2YXRpb25zXFwvbmV3XFwvW14vXStcXC8/JC8sXG4gICAgbm90ZXM6IFtcIlJ1dGEgZGluYW1pY2E6IHJlcXVpZXJlIGZpZWxkSWQuXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwicmVzZXJ2YXRpb25fZWRpdFwiLFxuICAgIHRpdGxlOiBcIlJlc2VydmF0aW9uIEVkaXRcIixcbiAgICBwYXRoOiBcIi9yZXNlcnZhdGlvbnMvZWRpdC86aWRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJGb3JtdWxhcmlvIHBhcmEgZWRpdGFyIHVuYSByZXNlcnZhIGV4aXN0ZW50ZS5cIixcbiAgICBzZWN0aW9uOiBcInJlc2VydmF0aW9uc1wiLFxuICAgIGFsaWFzZXM6IFtcImVkaXRhciByZXNlcnZhXCIsIFwiZWRpdCByZXNlcnZhdGlvblwiXSxcbiAgICBwYXRoUGF0dGVybjogL15cXC9yZXNlcnZhdGlvbnNcXC9lZGl0XFwvW14vXStcXC8/JC8sXG4gICAgbm90ZXM6IFtcIlJ1dGEgZGluYW1pY2E6IHJlcXVpZXJlIGlkIGRlIGxhIHJlc2VydmEuXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwic2xvdHNfbGlzdFwiLFxuICAgIHRpdGxlOiBcIlNsb3RzXCIsXG4gICAgcGF0aDogXCIvc2xvdHNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJMaXN0YWRvIHByaW5jaXBhbCBkZSBzbG90cy5cIixcbiAgICBzZWN0aW9uOiBcInNsb3RzXCIsXG4gICAgYWxpYXNlczogW1wic2xvdHNcIiwgXCJob3Jhcmlvc1wiLCBcInR1cm5vc1wiXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcInNsb3RfY3JlYXRlXCIsXG4gICAgdGl0bGU6IFwiU2xvdCBDcmVhdGVcIixcbiAgICBwYXRoOiBcIi9zbG90cy9uZXcvOmZpZWxkSWRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJGb3JtdWxhcmlvIHBhcmEgY3JlYXIgdW4gc2xvdCBwYXJhIHVuYSBjYW5jaGEuXCIsXG4gICAgc2VjdGlvbjogXCJzbG90c1wiLFxuICAgIGFsaWFzZXM6IFtcIm51ZXZvIHNsb3RcIiwgXCJjcmVhciBzbG90XCJdLFxuICAgIHBhdGhQYXR0ZXJuOiAvXlxcL3Nsb3RzXFwvbmV3XFwvW14vXStcXC8/JC8sXG4gICAgbm90ZXM6IFtcIlJ1dGEgZGluYW1pY2E6IHJlcXVpZXJlIGZpZWxkSWQuXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwic2xvdF9lZGl0XCIsXG4gICAgdGl0bGU6IFwiU2xvdCBFZGl0XCIsXG4gICAgcGF0aDogXCIvc2xvdHMvZWRpdC86aWRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJGb3JtdWxhcmlvIHBhcmEgZWRpdGFyIHVuIHNsb3QgZXhpc3RlbnRlLlwiLFxuICAgIHNlY3Rpb246IFwic2xvdHNcIixcbiAgICBhbGlhc2VzOiBbXCJlZGl0YXIgc2xvdFwiLCBcImVkaXQgc2xvdFwiXSxcbiAgICBwYXRoUGF0dGVybjogL15cXC9zbG90c1xcL2VkaXRcXC9bXi9dK1xcLz8kLyxcbiAgICBub3RlczogW1wiUnV0YSBkaW5hbWljYTogcmVxdWllcmUgaWQgZGVsIHNsb3QuXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwidmlkZW9zX2Rhc2hib2FyZFwiLFxuICAgIHRpdGxlOiBcIlZpZGVvcyBEYXNoYm9hcmRcIixcbiAgICBwYXRoOiBcIi92aWRlb3Mvc3VicGFnZXMvZGFzaGJvYXJkXCIsXG4gICAgZGVzY3JpcHRpb246IFwiRGFzaGJvYXJkIHByaW5jaXBhbCBkZWwgbW9kdWxvIGRlIHZpZGVvcy5cIixcbiAgICBzZWN0aW9uOiBcInZpZGVvc1wiLFxuICAgIGFsaWFzZXM6IFtcInZpZGVvc1wiLCBcImRhc2hib2FyZCBkZSB2aWRlb3NcIiwgXCJ2aWRlb3MgZGFzaGJvYXJkXCJdLFxuICAgIG5vdGVzOiBbXCJBbGlhcyBkZSBhY2Nlc286IC9maWVsZHMvdmlkZW9zIHkgL3N1YnBhZ2VzIHJlZGlyaWdlbiBhcXVpIG8gYWwgbW9kdWxvIHZpZGVvcy5cIl0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJ2aWRlb3Nfc3RyZWFtaW5nX3RpbWVsaW5lXCIsXG4gICAgdGl0bGU6IFwiVmlkZW9zIFN0cmVhbWluZyBUaW1lbGluZVwiLFxuICAgIHBhdGg6IFwiL3ZpZGVvcy9zdWJwYWdlcy9zdHJlYW1pbmcvdGltZWxpbmVcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdWJwYWdpbmEgZGUgdGltZWxpbmUgbyBsaW5lYSBkZSB0aWVtcG8gcGFyYSBzZXNpb25lcyBkZSBzdHJlYW1pbmcuXCIsXG4gICAgc2VjdGlvbjogXCJ2aWRlb3NcIixcbiAgICBhbGlhc2VzOiBbXG4gICAgICBcInRpbWVsaW5lXCIsXG4gICAgICBcImxpbmVhIGRlIHRpZW1wb1wiLFxuICAgICAgXCJsXHUwMEVEbmVhIGRlIHRpZW1wb1wiLFxuICAgICAgXCJzZXNzaW9uIHRpbWVsaW5lXCIsXG4gICAgICBcInN0cmVhbWluZyB0aW1lbGluZVwiLFxuICAgIF0sXG4gICAgbm90ZXM6IFtcIlN1ZWxlIHVzYXJzZSBjb24gcXVlcnkgbWF0Y2hTZXNzaW9uSWQuXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwidmlkZW9zX3N0cmVhbWluZ19yZWNvcmRpbmdcIixcbiAgICB0aXRsZTogXCJWaWRlb3MgU3RyZWFtaW5nIFJlY29yZGluZ1wiLFxuICAgIHBhdGg6IFwiL3ZpZGVvcy9zdWJwYWdlcy9zdHJlYW1pbmcvcmVjb3JkaW5nXCIsXG4gICAgZGVzY3JpcHRpb246IFwiU3VicGFnaW5hIGRlIGdyYWJhY2lvbiBvIGNvbmZpZ3VyYWNpb24gZGUgcmVjb3JkaW5nIGRlbnRybyBkZWwgbW9kdWxvIGRlIHZpZGVvcy5cIixcbiAgICBzZWN0aW9uOiBcInZpZGVvc1wiLFxuICAgIGFsaWFzZXM6IFtcbiAgICAgIFwiZ3JhYmFjaW9uXCIsXG4gICAgICBcImdyYWJhY2lcdTAwRjNuXCIsXG4gICAgICBcImdyYWJhY2lvbmVzXCIsXG4gICAgICBcInJlY29yZGluZ1wiLFxuICAgICAgXCJwYWdpbmEgZGUgZ3JhYmFjaW9uZXNcIixcbiAgICAgIFwicGFudGFsbGEgZGUgZ3JhYmFjaW9uXCIsXG4gICAgICBcInBhbnRhbGxhIGRlIGdyYWJhY2lcdTAwRjNuXCIsXG4gICAgICBcImdyYWJhclwiLFxuICAgIF0sXG4gICAgbm90ZXM6IFtcbiAgICAgIFwiU3VlbGUgdXNhcnNlIGNvbiBxdWVyeSB0b3VybmFtZW50TWF0Y2hJZCwgdGl0bGUgeSBhdXRvQ3JlYXRlU2Vzc2lvbi5cIixcbiAgICAgIFwiU2kgZWwgdXN1YXJpbyBwaWRlIGdyYWJhY2lvbmVzIG8gcmVjb3JkaW5nLCBlc3RhIHN1YnBhZ2luYSBlcyBtYXMgZXNwZWNpZmljYSBxdWUgZWwgZGFzaGJvYXJkIGRlIHZpZGVvcy5cIixcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwidmlkZW9fdXBkYXRlXCIsXG4gICAgdGl0bGU6IFwiVmlkZW8gVXBkYXRlXCIsXG4gICAgcGF0aDogXCIvdmlkZW9zLzp2aWRlb0lkL3VwZGF0ZVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkVkaWNpb24gZGUgdW4gdmlkZW8gY29uY3JldG8uXCIsXG4gICAgc2VjdGlvbjogXCJ2aWRlb3NcIixcbiAgICBhbGlhc2VzOiBbXCJlZGl0YXIgdmlkZW9cIiwgXCJ1cGRhdGUgdmlkZW9cIl0sXG4gICAgcGF0aFBhdHRlcm46IC9eXFwvdmlkZW9zXFwvW14vXStcXC91cGRhdGVcXC8/JC8sXG4gICAgbm90ZXM6IFtcIlJ1dGEgZGluYW1pY2E6IHJlcXVpZXJlIHZpZGVvSWQuXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwidmlkZW9zX2ZpZWxkX2NyZWF0ZVwiLFxuICAgIHRpdGxlOiBcIkZpZWxkIFZpZGVvIENyZWF0ZVwiLFxuICAgIHBhdGg6IFwiL3ZpZGVvcy9maWVsZHMvOmZpZWxkSWQvdmlkZW9zL2NyZWF0ZVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkNyZWFjaW9uIGRlIHZpZGVvIGRlc2RlIGVsIGNvbnRleHRvIGRlIHVuYSBjYW5jaGEuXCIsXG4gICAgc2VjdGlvbjogXCJ2aWRlb3NcIixcbiAgICBhbGlhc2VzOiBbXCJjcmVhciB2aWRlb1wiLCBcInN1YmlyIHZpZGVvIHBhcmEgY2FuY2hhXCJdLFxuICAgIHBhdGhQYXR0ZXJuOiAvXlxcL3ZpZGVvc1xcL2ZpZWxkc1xcL1teL10rXFwvdmlkZW9zXFwvY3JlYXRlXFwvPyQvLFxuICAgIG5vdGVzOiBbXCJSdXRhIGRpbmFtaWNhOiByZXF1aWVyZSBmaWVsZElkLlwiXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcInRvdXJuYW1lbnRzX2Rhc2hib2FyZFwiLFxuICAgIHRpdGxlOiBcIlRvdXJuYW1lbnRzIERhc2hib2FyZFwiLFxuICAgIHBhdGg6IFwiL3RvdXJuYW1lbnRzL3N1YnBhZ2VzL2Rhc2hib2FyZFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlBhbnRhbGxhIHByaW5jaXBhbCBkZWwgbW9kdWxvIGRlIHRvcm5lb3MuXCIsXG4gICAgc2VjdGlvbjogXCJ0b3VybmFtZW50c1wiLFxuICAgIGFsaWFzZXM6IFtcInRvcm5lb3NcIiwgXCJ0b3VybmFtZW50c1wiLCBcImRhc2hib2FyZCBkZSB0b3JuZW9zXCJdLFxuICAgIG5vdGVzOiBbXCJQdWVkZSB1c2Fyc2UgY29uIGhhc2ggI3RvdXJuYW1lbnQtZm9ybSBwYXJhIGFicmlyIGVsIGZvcm11bGFyaW8gZGUgY3JlYWNpb24uXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwidG91cm5hbWVudHNfbGlzdFwiLFxuICAgIHRpdGxlOiBcIlRvdXJuYW1lbnRzIFN1YnBhZ2VcIixcbiAgICBwYXRoOiBcIi90b3VybmFtZW50cy9zdWJwYWdlcy90b3VybmFtZW50c1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlN1YnBhZ2luYSBkZSB0b3JuZW9zIGRlbnRybyBkZWwgbW9kdWxvIGRlIHRvcm5lb3MuXCIsXG4gICAgc2VjdGlvbjogXCJ0b3VybmFtZW50c1wiLFxuICAgIGFsaWFzZXM6IFtcInN1YnBhZ2luYSBkZSB0b3JuZW9zXCIsIFwibGlzdGEgZGUgdG9ybmVvc1wiXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcInRvdXJuYW1lbnRzX3RlYW1zXCIsXG4gICAgdGl0bGU6IFwiVGVhbXMgU3VicGFnZVwiLFxuICAgIHBhdGg6IFwiL3RvdXJuYW1lbnRzL3N1YnBhZ2VzL3RlYW1zXCIsXG4gICAgZGVzY3JpcHRpb246IFwiU3VicGFnaW5hIGRlIGVxdWlwb3MgZGVudHJvIGRlbCBtb2R1bG8gZGUgdG9ybmVvcy5cIixcbiAgICBzZWN0aW9uOiBcInRvdXJuYW1lbnRzXCIsXG4gICAgYWxpYXNlczogW1wiZXF1aXBvc1wiLCBcInRlYW1zXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwidG91cm5hbWVudHNfcGxheWVyc1wiLFxuICAgIHRpdGxlOiBcIlBsYXllcnMgU3VicGFnZVwiLFxuICAgIHBhdGg6IFwiL3RvdXJuYW1lbnRzL3N1YnBhZ2VzL3BsYXllcnNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdWJwYWdpbmEgZGUganVnYWRvcmVzIGRlbnRybyBkZWwgbW9kdWxvIGRlIHRvcm5lb3MuXCIsXG4gICAgc2VjdGlvbjogXCJ0b3VybmFtZW50c1wiLFxuICAgIGFsaWFzZXM6IFtcImp1Z2Fkb3JlcyBkZSB0b3JuZW9zXCIsIFwicGxheWVyc1wiXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcInRvdXJuYW1lbnRzX21hdGNoZXNcIixcbiAgICB0aXRsZTogXCJNYXRjaGVzIFN1YnBhZ2VcIixcbiAgICBwYXRoOiBcIi90b3VybmFtZW50cy9zdWJwYWdlcy9tYXRjaGVzXCIsXG4gICAgZGVzY3JpcHRpb246IFwiU3VicGFnaW5hIGRlIHBhcnRpZG9zIGRlbnRybyBkZWwgbW9kdWxvIGRlIHRvcm5lb3MuXCIsXG4gICAgc2VjdGlvbjogXCJ0b3VybmFtZW50c1wiLFxuICAgIGFsaWFzZXM6IFtcInBhcnRpZG9zIGRlIHRvcm5lb3NcIiwgXCJtYXRjaGVzXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwidG91cm5hbWVudHNfbWF0Y2hfc3RhdHNcIixcbiAgICB0aXRsZTogXCJNYXRjaCBTdGF0cyBTdWJwYWdlXCIsXG4gICAgcGF0aDogXCIvdG91cm5hbWVudHMvc3VicGFnZXMvbWF0Y2gtc3RhdHNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdWJwYWdpbmEgZGUgZXN0YWRpc3RpY2FzIGRlIHBhcnRpZG9zIGRlbnRybyBkZWwgbW9kdWxvIGRlIHRvcm5lb3MuXCIsXG4gICAgc2VjdGlvbjogXCJ0b3VybmFtZW50c1wiLFxuICAgIGFsaWFzZXM6IFtcImVzdGFkaXN0aWNhc1wiLCBcIm1hdGNoIHN0YXRzXCIsIFwiZXN0YWRpc3RpY2FzIGRlIHBhcnRpZG9zXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwic2NvdXRpbmdfZGFzaGJvYXJkXCIsXG4gICAgdGl0bGU6IFwiU2NvdXRpbmcgRGFzaGJvYXJkXCIsXG4gICAgcGF0aDogXCIvc2NvdXRpbmcvc3VicGFnZXMvZGFzaGJvYXJkXCIsXG4gICAgZGVzY3JpcHRpb246IFwiUGFudGFsbGEgcHJpbmNpcGFsIGRlbCBtb2R1bG8gZGUgc2NvdXRpbmcgbyByZWNydWl0ZXJzLlwiLFxuICAgIHNlY3Rpb246IFwic2NvdXRpbmdcIixcbiAgICBhbGlhc2VzOiBbXCJzY291dGluZ1wiLCBcInJlY3J1aXRlcnNcIiwgXCJkYXNoYm9hcmQgZGUgc2NvdXRpbmdcIl0sXG4gICAgbm90ZXM6IFtcIkxhIHJ1dGEgbGVnYWN5IC9yZWNydWl0ZXJzIHJlZGlyaWdlIGFxdWkuXCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwic2NvdXRpbmdfbGlicmFyeVwiLFxuICAgIHRpdGxlOiBcIlNjb3V0aW5nIExpYnJhcnlcIixcbiAgICBwYXRoOiBcIi9zY291dGluZy9zdWJwYWdlcy9saWJyYXJ5XCIsXG4gICAgZGVzY3JpcHRpb246IFwiU3VicGFnaW5hIGxpYnJhcnkgZGVsIG1vZHVsbyBkZSBzY291dGluZy5cIixcbiAgICBzZWN0aW9uOiBcInNjb3V0aW5nXCIsXG4gICAgYWxpYXNlczogW1wibGlicmFyeVwiLCBcImJpYmxpb3RlY2FcIiwgXCJzY291dGluZyBsaWJyYXJ5XCJdLFxuICB9LFxuICB7XG4gICAgaWQ6IFwic2NvdXRpbmdfcGxheWVyX3Byb2ZpbGVzXCIsXG4gICAgdGl0bGU6IFwiUGxheWVyIFByb2ZpbGVzXCIsXG4gICAgcGF0aDogXCIvc2NvdXRpbmcvc3VicGFnZXMvcGxheWVyLXByb2ZpbGVzXCIsXG4gICAgZGVzY3JpcHRpb246IFwiU3VicGFnaW5hIGRlIGZpY2hhcyBkZSBqdWdhZG9yIGRlbnRybyBkZSBzY291dGluZy5cIixcbiAgICBzZWN0aW9uOiBcInNjb3V0aW5nXCIsXG4gICAgYWxpYXNlczogW1wicGxheWVyIHByb2ZpbGVzXCIsIFwicGVyZmlsZXNcIiwgXCJmaWNoYXMgZGUganVnYWRvclwiXSxcbiAgfSxcbiAge1xuICAgIGlkOiBcInNjb3V0aW5nX3JhbmtpbmdzXCIsXG4gICAgdGl0bGU6IFwiU2NvdXRpbmcgUmFua2luZ3NcIixcbiAgICBwYXRoOiBcIi9zY291dGluZy9zdWJwYWdlcy9yYW5raW5nc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlN1YnBhZ2luYSBkZSByYW5raW5ncyBvIGJvYXJkIGRlIHNjb3V0aW5nLlwiLFxuICAgIHNlY3Rpb246IFwic2NvdXRpbmdcIixcbiAgICBhbGlhc2VzOiBbXCJyYW5raW5nc1wiLCBcImJvYXJkXCIsIFwic2NvdXRpbmcgYm9hcmRcIl0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJzY291dGluZ19wcm9maWxlXCIsXG4gICAgdGl0bGU6IFwiU2NvdXRpbmcgUHJvZmlsZVwiLFxuICAgIHBhdGg6IFwiL3Njb3V0aW5nL3N1YnBhZ2VzL3Byb2ZpbGUvOnZpZGVvSWRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJQZXJmaWwgZWRpdG9yaWFsIGRlIHNjb3V0aW5nIHBhcmEgdW4gdmlkZW8gY29uY3JldG8uXCIsXG4gICAgc2VjdGlvbjogXCJzY291dGluZ1wiLFxuICAgIGFsaWFzZXM6IFtcInBlcmZpbCBkZSBzY291dGluZ1wiLCBcInByb2ZpbGVcIl0sXG4gICAgcGF0aFBhdHRlcm46IC9eXFwvc2NvdXRpbmdcXC9zdWJwYWdlc1xcL3Byb2ZpbGVcXC9bXi9dKyg/OlxcPy4qKT8kLyxcbiAgICBub3RlczogW1wiUnV0YSBkaW5hbWljYTogcmVxdWllcmUgdmlkZW9JZC5cIiwgXCJQdWVkZSBpbmNsdWlyIHF1ZXJ5IHBsYXllclByb2ZpbGVJZC5cIl0sXG4gIH0sXG4gIHtcbiAgICBpZDogXCJzY291dGluZ192aWRlb1wiLFxuICAgIHRpdGxlOiBcIlNjb3V0aW5nIFZpZGVvXCIsXG4gICAgcGF0aDogXCIvc2NvdXRpbmcvc3VicGFnZXMvdmlkZW8vOnZpZGVvSWRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJWaXN0YSByZWNydWl0ZXIgcGFyYSB1biB2aWRlbyBjb25jcmV0byBkZW50cm8gZGUgc2NvdXRpbmcuXCIsXG4gICAgc2VjdGlvbjogXCJzY291dGluZ1wiLFxuICAgIGFsaWFzZXM6IFtcInZpZGVvIHNjb3V0aW5nXCIsIFwicmVjcnVpdGVyIHZpZXdcIiwgXCJ2aWRlbyBkZXRhaWxcIl0sXG4gICAgcGF0aFBhdHRlcm46IC9eXFwvc2NvdXRpbmdcXC9zdWJwYWdlc1xcL3ZpZGVvXFwvW14vXStcXC8/JC8sXG4gICAgbm90ZXM6IFtcIlJ1dGEgZGluYW1pY2E6IHJlcXVpZXJlIHZpZGVvSWQuXCJdLFxuICB9LFxuXTtcblxuY29uc3Qgbm9ybWFsaXplID0gKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG5jb25zdCBkZXNjcmliZUVudHJ5ID0gKGVudHJ5OiBBcHBOYXZpZ2F0aW9uRW50cnkpID0+IHtcbiAgY29uc3QgYWxpYXNlcyA9IGVudHJ5LmFsaWFzZXM/Lmxlbmd0aCA/IGAgfCBhbGlhc2VzOiAke2VudHJ5LmFsaWFzZXMuam9pbihcIiwgXCIpfWAgOiBcIlwiO1xuICBjb25zdCBub3RlcyA9IGVudHJ5Lm5vdGVzPy5sZW5ndGggPyBgIHwgbm90ZXM6ICR7ZW50cnkubm90ZXMuam9pbihcIiBcIil9YCA6IFwiXCI7XG4gIHJldHVybiBgLSBbJHtlbnRyeS5zZWN0aW9ufV0gJHtlbnRyeS50aXRsZX0gLT4gJHtlbnRyeS5wYXRofSB8ICR7ZW50cnkuZGVzY3JpcHRpb259JHthbGlhc2VzfSR7bm90ZXN9YDtcbn07XG5cbmV4cG9ydCBjb25zdCBmaW5kTmF2aWdhdGlvbkVudHJ5QnlQYXRoID0gKHBhdGg6IHN0cmluZykgPT4ge1xuICBjb25zdCBub3JtYWxpemVkUGF0aCA9IHBhdGgudHJpbSgpO1xuXG4gIHJldHVybiAoXG4gICAgQVBQX05BVklHQVRJT05fRU5UUklFUy5maW5kKChlbnRyeSkgPT4gZW50cnkucGF0aCA9PT0gbm9ybWFsaXplZFBhdGgpIHx8XG4gICAgQVBQX05BVklHQVRJT05fRU5UUklFUy5maW5kKChlbnRyeSkgPT4gZW50cnkucGF0aFBhdHRlcm4/LnRlc3Qobm9ybWFsaXplZFBhdGgpKVxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IGZpbmROYXZpZ2F0aW9uRW50cmllc0J5UHJvbXB0ID0gKHByb21wdDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZWRQcm9tcHQgPSBub3JtYWxpemUocHJvbXB0KTtcblxuICByZXR1cm4gQVBQX05BVklHQVRJT05fRU5UUklFUy5maWx0ZXIoKGVudHJ5KSA9PiB7XG4gICAgY29uc3QgdmFsdWVzID0gW2VudHJ5LnRpdGxlLCBlbnRyeS5wYXRoLCAuLi4oZW50cnkuYWxpYXNlcyB8fCBbXSldLm1hcChub3JtYWxpemUpO1xuICAgIHJldHVybiB2YWx1ZXMuc29tZSgodmFsdWUpID0+IG5vcm1hbGl6ZWRQcm9tcHQuaW5jbHVkZXModmFsdWUpKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgYnVpbGROYXZpZ2F0aW9uS25vd2xlZGdlQmxvY2sgPSAocGFyYW1zOiB7XG4gIGN1cnJlbnRQYXRoOiBzdHJpbmc7XG4gIHByb21wdDogc3RyaW5nO1xufSkgPT4ge1xuICBjb25zdCBjdXJyZW50RW50cnkgPSBmaW5kTmF2aWdhdGlvbkVudHJ5QnlQYXRoKHBhcmFtcy5jdXJyZW50UGF0aCk7XG4gIGNvbnN0IHJlbGV2YW50RW50cmllcyA9IGZpbmROYXZpZ2F0aW9uRW50cmllc0J5UHJvbXB0KHBhcmFtcy5wcm9tcHQpO1xuICBjb25zdCByZWxldmFudEJsb2NrID1cbiAgICByZWxldmFudEVudHJpZXMubGVuZ3RoID4gMFxuICAgICAgPyByZWxldmFudEVudHJpZXMubWFwKChlbnRyeSkgPT4gZGVzY3JpYmVFbnRyeShlbnRyeSkpLmpvaW4oXCJcXG5cIilcbiAgICAgIDogXCItIE5vIGRpcmVjdCByb3V0ZSBhbGlhcyBtYXRjaGVkIGZyb20gdGhlIHVzZXIgcHJvbXB0LlwiO1xuXG4gIGNvbnN0IGZ1bGxNYXBCbG9jayA9IEFQUF9OQVZJR0FUSU9OX0VOVFJJRVMubWFwKChlbnRyeSkgPT4gZGVzY3JpYmVFbnRyeShlbnRyeSkpLmpvaW4oXCJcXG5cIik7XG5cbiAgcmV0dXJuIFtcbiAgICBcIk5hdmlnYXRpb24ga25vd2xlZGdlIGZvciBWaWN0b3J5IENyYWZ0OlwiLFxuICAgIFwiLSBBbHdheXMgdXNlIGFic29sdXRlIGludGVybmFsIHBhdGhzIHdoZW4gY2FsbGluZyBuYXZpZ2F0aW9uLmdvX3RvLlwiLFxuICAgIFwiLSBUaGUgYXBwbGljYXRpb24gaGFzIHRvcC1sZXZlbCBwYWdlcyBhbmQgbW9kdWxlLXNwZWNpZmljIHN1YnBhZ2VzLiBQcmVmZXIgdGhlIGV4YWN0IHN1YnBhZ2UgcGF0aCB3aGVuIHRoZSB1c2VyIGFza3MgZm9yIGEgc2VjdGlvbiBpbnNpZGUgdG91cm5hbWVudHMgb3Igc2NvdXRpbmcuXCIsXG4gICAgXCItIEZvciBkeW5hbWljIHJvdXRlcyB3aXRoIDppZCBvciA6dmlkZW9JZCwgb25seSB1c2UgdGhlbSB3aGVuIHRoZSBwcm9tcHQgb3IgY29udGV4dCBwcm92aWRlcyB0aGF0IGlkZW50aWZpZXIuIE90aGVyd2lzZSBwcmVmZXIgdGhlIHBhcmVudCBkYXNoYm9hcmQgb3IgbGlzdCBzdWJwYWdlLlwiLFxuICAgIFwiLSBMZWdhY3kgYWxpYXNlcyBleGlzdDogL3JlY3J1aXRlcnMgcmVkaXJlY3RzIHRvIC9zY291dGluZy9zdWJwYWdlcy9kYXNoYm9hcmQgYW5kIC9zdWJwYWdlcyBpcyBoYW5kbGVkIGJ5IHRoZSB2aWRlb3MgbW9kdWxlLlwiLFxuICAgIGBDdXJyZW50IHJvdXRlOiAke3BhcmFtcy5jdXJyZW50UGF0aH1gLFxuICAgIGN1cnJlbnRFbnRyeVxuICAgICAgPyBgQ3VycmVudCByb3V0ZSBtYXRjaDogJHtjdXJyZW50RW50cnkudGl0bGV9ICgke2N1cnJlbnRFbnRyeS5wYXRofSlgXG4gICAgICA6IFwiQ3VycmVudCByb3V0ZSBtYXRjaDogbm8gZXhhY3QgY2F0YWxvZyBtYXRjaCBmb3VuZC5cIixcbiAgICBcIlByb21wdC1yZWxldmFudCByb3V0ZXM6XCIsXG4gICAgcmVsZXZhbnRCbG9jayxcbiAgICBcIkZ1bGwgcm91dGUgY2F0YWxvZzpcIixcbiAgICBmdWxsTWFwQmxvY2ssXG4gIF0uam9pbihcIlxcblwiKTtcbn07XG5cbmV4cG9ydCB7IEFQUF9OQVZJR0FUSU9OX0VOVFJJRVMgfTtcbiIsICJpbXBvcnQgdHlwZSB7IEFnZW50TGxtSW5wdXQgfSBmcm9tIFwiLi4vLi4vLi4vYWdlbnQtbWZlXCI7XG5pbXBvcnQgeyBidWlsZE5hdmlnYXRpb25Lbm93bGVkZ2VCbG9jayB9IGZyb20gXCIuLi9uYXZpZ2F0aW9uL25hdmlnYXRpb25Lbm93bGVkZ2VcIjtcblxuY29uc3QgdHJpbVRyYWlsaW5nV2hpdGVzcGFjZSA9ICh2YWx1ZTogc3RyaW5nKSA9PiB2YWx1ZS50cmltKCk7XG5cbmV4cG9ydCBjb25zdCBidWlsZEFnZW50UGxhbm5lclBheWxvYWQgPSAoaW5wdXQ6IEFnZW50TGxtSW5wdXQpOiBBZ2VudExsbUlucHV0ID0+IHtcbiAgY29uc3QgcHJvbXB0ID0gdHJpbVRyYWlsaW5nV2hpdGVzcGFjZShpbnB1dC5wcm9tcHQpO1xuICBjb25zdCBuYXZpZ2F0aW9uS25vd2xlZGdlID0gYnVpbGROYXZpZ2F0aW9uS25vd2xlZGdlQmxvY2soe1xuICAgIGN1cnJlbnRQYXRoOiBpbnB1dC5jdXJyZW50UGF0aCxcbiAgICBwcm9tcHQsXG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgLi4uaW5wdXQsXG4gICAgcHJvbXB0OiBbXG4gICAgICBcIlVzZXIgcmVxdWVzdDpcIixcbiAgICAgIHByb21wdCxcbiAgICAgIFwiXCIsXG4gICAgICBuYXZpZ2F0aW9uS25vd2xlZGdlLFxuICAgICAgXCJcIixcbiAgICAgIFwiUGxhbiBvbmx5IHdpdGggdGhlIHJlZ2lzdGVyZWQgYWN0aW9ucyBwcm92aWRlZCBpbiB0aGlzIHBheWxvYWQuXCIsXG4gICAgXS5qb2luKFwiXFxuXCIpLFxuICB9O1xufTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxPQUFPLFVBQVU7QUFDakIsT0FBTyxZQUFZOzs7QUNEbkIsT0FBT0EsWUFBVzs7O0FDQWxCLE9BQU8sV0FBVzs7O0FDQVgsSUFBTSx5QkFBeUI7QUFFdEMsSUFBTSxvQkFBb0IsQ0FBQyxTQUFTLFVBQVUsU0FBUyxRQUFRLE9BQU8sVUFBVTtBQUV6RSxJQUFNLDRCQUE0QixNQUFZO0FBQ25ELG9CQUFrQixRQUFRLENBQUMsUUFBUSxhQUFhLFdBQVcsR0FBRyxDQUFDO0FBQ2pFO0FBRU8sSUFBTSwrQkFBK0IsTUFBWTtBQUN0RCxTQUFPLGNBQWMsSUFBSSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hEO0FBRU8sSUFBTSxxQ0FBcUMsTUFBWTtBQUM1RCw0QkFBMEI7QUFDMUIsK0JBQTZCO0FBQy9COzs7QUNmTyxJQUFNLG9CQUFOLGNBQWdDLE1BQU07QUFDN0M7QUFDQSxrQkFBa0IsVUFBVSxPQUFPO0FBQ25DLFNBQVMsaUJBQWlCLEtBQUs7QUFDM0IsU0FBTyxtQkFBbUIsS0FBSyxHQUFHLEVBQUUsUUFBUSxRQUFRLENBQUMsR0FBRyxNQUFNO0FBQzFELFFBQUksT0FBTyxFQUFFLFdBQVcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLFlBQVk7QUFDcEQsUUFB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
