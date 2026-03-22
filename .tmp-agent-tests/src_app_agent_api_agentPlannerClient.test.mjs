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

// src/app/agent/config/agentPlannerConfig.ts
var getAgentPlannerLocale = () => {
  if (typeof navigator === "undefined" || !navigator.language) return "en";
  return navigator.language;
};

// src/app/agent/navigation/navigationKnowledge.ts
var createEntry = (entry) => ({
  actionName: "navigation.go_to",
  aliases: [],
  breadcrumbs: [],
  parents: [],
  intentTags: [],
  ...entry
});
var APP_NAVIGATION_ENTRIES = [
  createEntry({
    id: "home",
    title: "Home",
    route: "/",
    description: "Landing principal de Victory Craft.",
    section: "general",
    page: "home",
    subpage: "landing",
    aliases: ["inicio", "home", "portada"],
    breadcrumbs: ["Home"],
    intentTags: ["home", "landing", "general"],
    isLanding: true,
    popularity: 1
  }),
  createEntry({
    id: "login",
    title: "Login",
    route: "/login",
    description: "Acceso de usuarios.",
    section: "general",
    page: "auth",
    subpage: "login",
    aliases: ["login", "iniciar sesion", "acceso"],
    breadcrumbs: ["Login"],
    intentTags: ["auth", "login"],
    isLanding: false
  }),
  createEntry({
    id: "register",
    title: "Register",
    route: "/register",
    description: "Registro de usuarios.",
    section: "general",
    page: "auth",
    subpage: "register",
    aliases: ["registro", "register", "crear cuenta"],
    breadcrumbs: ["Register"],
    intentTags: ["auth", "register"],
    isLanding: false
  }),
  createEntry({
    id: "users",
    title: "Users",
    route: "/users",
    description: "Vista privada de usuarios.",
    section: "general",
    page: "users",
    subpage: "list",
    aliases: ["usuarios", "users"],
    breadcrumbs: ["Users"],
    intentTags: ["users", "admin"],
    isLanding: false
  }),
  createEntry({
    id: "fields_list",
    title: "Fields List",
    route: "/fields",
    description: "Listado principal de canchas.",
    section: "fields",
    page: "fields",
    subpage: "list",
    aliases: ["fields", "canchas", "listado de canchas"],
    breadcrumbs: ["Fields"],
    intentTags: ["fields", "list"],
    isLanding: true,
    popularity: 0.95
  }),
  createEntry({
    id: "field_create",
    title: "Field Create",
    route: "/fields/new",
    description: "Formulario para crear una cancha.",
    section: "fields",
    page: "fields",
    subpage: "create",
    aliases: ["crear cancha", "nueva cancha", "new field"],
    breadcrumbs: ["Fields", "Create"],
    parents: ["/fields"],
    intentTags: ["fields", "create"],
    isLanding: false
  }),
  createEntry({
    id: "field_edit",
    title: "Field Edit",
    route: "/fields/edit/:id",
    description: "Formulario para editar una cancha existente.",
    section: "fields",
    page: "fields",
    subpage: "edit",
    aliases: ["editar cancha", "edit field"],
    breadcrumbs: ["Fields", "Edit"],
    parents: ["/fields"],
    intentTags: ["fields", "edit"],
    isLanding: false,
    pathPattern: /^\/fields\/edit\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere id de la cancha."]
  }),
  createEntry({
    id: "field_reservations",
    title: "Field Reservations",
    route: "/fields/:id/reservations",
    description: "Reservas asociadas a una cancha especifica.",
    section: "fields",
    page: "fields",
    subpage: "reservations",
    aliases: ["reservas de cancha", "field reservations"],
    breadcrumbs: ["Fields", "Reservations"],
    parents: ["/fields"],
    intentTags: ["fields", "reservations"],
    isLanding: false,
    pathPattern: /^\/fields\/[^/]+\/reservations\/?$/,
    notes: ["Ruta dinamica: requiere id de la cancha."]
  }),
  createEntry({
    id: "reservations_dashboard",
    title: "Reservations",
    route: "/reservations",
    description: "Vista principal de reservas.",
    section: "reservations",
    page: "reservations",
    subpage: "dashboard",
    aliases: ["reservas", "reservations"],
    breadcrumbs: ["Reservations"],
    intentTags: ["reservations", "dashboard"],
    isLanding: true,
    popularity: 0.9
  }),
  createEntry({
    id: "reservations_for_field",
    title: "Reservations For Field",
    route: "/reservations/:fieldId",
    description: "Vista de reservas para una cancha concreta.",
    section: "reservations",
    page: "reservations",
    subpage: "field",
    aliases: ["reservas por cancha", "reservations for field"],
    breadcrumbs: ["Reservations", "Field"],
    parents: ["/reservations", "/fields"],
    intentTags: ["reservations", "field"],
    isLanding: false,
    pathPattern: /^\/reservations\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere fieldId."]
  }),
  createEntry({
    id: "reservation_create",
    title: "Reservation Create",
    route: "/reservations/new",
    description: "Formulario para crear una reserva sin cancha preseleccionada.",
    section: "reservations",
    page: "reservations",
    subpage: "create",
    aliases: ["nueva reserva", "crear reserva"],
    breadcrumbs: ["Reservations", "Create"],
    parents: ["/reservations"],
    intentTags: ["reservations", "create"],
    isLanding: false
  }),
  createEntry({
    id: "reservation_create_for_field",
    title: "Reservation Create For Field",
    route: "/reservations/new/:fieldId",
    description: "Formulario para crear una reserva desde una cancha concreta.",
    section: "reservations",
    page: "reservations",
    subpage: "create-field",
    aliases: ["nueva reserva de cancha", "crear reserva para cancha"],
    breadcrumbs: ["Reservations", "Create", "Field"],
    parents: ["/reservations", "/fields"],
    intentTags: ["reservations", "create", "field"],
    isLanding: false,
    pathPattern: /^\/reservations\/new\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere fieldId."]
  }),
  createEntry({
    id: "reservation_edit",
    title: "Reservation Edit",
    route: "/reservations/edit/:id",
    description: "Formulario para editar una reserva existente.",
    section: "reservations",
    page: "reservations",
    subpage: "edit",
    aliases: ["editar reserva", "edit reservation"],
    breadcrumbs: ["Reservations", "Edit"],
    parents: ["/reservations"],
    intentTags: ["reservations", "edit"],
    isLanding: false,
    pathPattern: /^\/reservations\/edit\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere id de la reserva."]
  }),
  createEntry({
    id: "slots_list",
    title: "Slots",
    route: "/slots",
    description: "Listado principal de slots.",
    section: "slots",
    page: "slots",
    subpage: "list",
    aliases: ["slots", "horarios", "turnos"],
    breadcrumbs: ["Slots"],
    intentTags: ["slots", "list"],
    isLanding: true
  }),
  createEntry({
    id: "slot_create",
    title: "Slot Create",
    route: "/slots/new/:fieldId",
    description: "Formulario para crear un slot para una cancha.",
    section: "slots",
    page: "slots",
    subpage: "create",
    aliases: ["nuevo slot", "crear slot"],
    breadcrumbs: ["Slots", "Create"],
    parents: ["/slots", "/fields"],
    intentTags: ["slots", "create"],
    isLanding: false,
    pathPattern: /^\/slots\/new\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere fieldId."]
  }),
  createEntry({
    id: "slot_edit",
    title: "Slot Edit",
    route: "/slots/edit/:id",
    description: "Formulario para editar un slot existente.",
    section: "slots",
    page: "slots",
    subpage: "edit",
    aliases: ["editar slot", "edit slot"],
    breadcrumbs: ["Slots", "Edit"],
    parents: ["/slots"],
    intentTags: ["slots", "edit"],
    isLanding: false,
    pathPattern: /^\/slots\/edit\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere id del slot."]
  }),
  createEntry({
    id: "videos_dashboard",
    title: "Videos Dashboard",
    route: "/videos/subpages/dashboard",
    description: "Dashboard principal del modulo de videos.",
    section: "videos",
    page: "videos",
    subpage: "dashboard",
    aliases: [
      "videos",
      "dashboard de videos",
      "videos dashboard",
      "/fields/videos",
      "/subpages"
    ],
    breadcrumbs: ["Videos", "Dashboard"],
    intentTags: ["videos", "dashboard"],
    isLanding: true,
    popularity: 0.88,
    notes: ["Alias de acceso: /fields/videos y /subpages redirigen aqui o al modulo videos."]
  }),
  createEntry({
    id: "videos_streaming_timeline",
    title: "Videos Streaming Timeline",
    route: "/videos/subpages/streaming/timeline",
    description: "Subpagina de timeline o linea de tiempo para sesiones de streaming.",
    section: "videos",
    page: "videos",
    subpage: "streaming-timeline",
    aliases: [
      "timeline",
      "linea de tiempo",
      "l\xEDnea de tiempo",
      "session timeline",
      "streaming timeline"
    ],
    breadcrumbs: ["Videos", "Streaming", "Timeline"],
    parents: ["/videos/subpages/dashboard"],
    intentTags: ["videos", "streaming", "timeline"],
    isLanding: false
  }),
  createEntry({
    id: "videos_streaming_recording",
    title: "Videos Streaming Recording",
    route: "/videos/subpages/streaming/recording",
    description: "Subpagina para grabar o subir videos dentro del modulo de videos.",
    section: "videos",
    page: "videos",
    subpage: "streaming-recording",
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
    breadcrumbs: ["Videos", "Streaming", "Recording"],
    parents: ["/videos/subpages/dashboard"],
    intentTags: ["videos", "streaming", "recording", "upload"],
    isLanding: false,
    notes: [
      "Suele usarse con query tournamentMatchId, title y autoCreateSession.",
      "Si el usuario pide grabaciones o subir videos, esta subpagina es mas especifica que el dashboard de videos."
    ]
  }),
  createEntry({
    id: "video_update",
    title: "Video Update",
    route: "/videos/:videoId/update",
    description: "Edicion de un video concreto.",
    section: "videos",
    page: "videos",
    subpage: "edit",
    aliases: ["editar video", "update video"],
    breadcrumbs: ["Videos", "Edit"],
    parents: ["/videos/subpages/dashboard"],
    intentTags: ["videos", "edit"],
    isLanding: false,
    pathPattern: /^\/videos\/[^/]+\/update\/?$/,
    notes: ["Ruta dinamica: requiere videoId."]
  }),
  createEntry({
    id: "videos_field_create",
    title: "Field Video Create",
    route: "/videos/fields/:fieldId/videos/create",
    description: "Creacion de video desde el contexto de una cancha.",
    section: "videos",
    page: "videos",
    subpage: "field-create",
    aliases: ["crear video", "subir video para cancha"],
    breadcrumbs: ["Videos", "Create"],
    parents: ["/videos/subpages/dashboard", "/fields"],
    intentTags: ["videos", "create", "field"],
    isLanding: false,
    pathPattern: /^\/videos\/fields\/[^/]+\/videos\/create\/?$/,
    notes: ["Ruta dinamica: requiere fieldId."]
  }),
  createEntry({
    id: "tournaments_dashboard",
    title: "Tournaments Dashboard",
    route: "/tournaments/subpages/dashboard",
    description: "Pantalla principal del modulo de torneos.",
    section: "tournaments",
    page: "tournaments",
    subpage: "dashboard",
    aliases: ["torneos", "tournaments", "dashboard de torneos"],
    breadcrumbs: ["Tournaments", "Dashboard"],
    intentTags: ["tournaments", "dashboard"],
    isLanding: true,
    popularity: 0.82,
    notes: ["Puede usarse con hash #tournament-form para abrir el formulario de creacion."]
  }),
  createEntry({
    id: "tournaments_list",
    title: "Tournaments Subpage",
    route: "/tournaments/subpages/tournaments",
    description: "Subpagina de torneos dentro del modulo de torneos.",
    section: "tournaments",
    page: "tournaments",
    subpage: "tournaments",
    aliases: ["subpagina de torneos", "lista de torneos"],
    breadcrumbs: ["Tournaments", "Tournaments"],
    parents: ["/tournaments/subpages/dashboard"],
    intentTags: ["tournaments", "list"],
    isLanding: false
  }),
  createEntry({
    id: "tournaments_teams",
    title: "Teams Subpage",
    route: "/tournaments/subpages/teams",
    description: "Subpagina de equipos dentro del modulo de torneos.",
    section: "tournaments",
    page: "tournaments",
    subpage: "teams",
    aliases: ["equipos", "teams"],
    breadcrumbs: ["Tournaments", "Teams"],
    parents: ["/tournaments/subpages/dashboard"],
    intentTags: ["tournaments", "teams"],
    isLanding: false
  }),
  createEntry({
    id: "tournaments_players",
    title: "Players Subpage",
    route: "/tournaments/subpages/players",
    description: "Subpagina de jugadores dentro del modulo de torneos.",
    section: "tournaments",
    page: "tournaments",
    subpage: "players",
    aliases: ["jugadores de torneos", "players"],
    breadcrumbs: ["Tournaments", "Players"],
    parents: ["/tournaments/subpages/dashboard"],
    intentTags: ["tournaments", "players"],
    isLanding: false
  }),
  createEntry({
    id: "tournaments_matches",
    title: "Matches Subpage",
    route: "/tournaments/subpages/matches",
    description: "Subpagina de partidos dentro del modulo de torneos.",
    section: "tournaments",
    page: "tournaments",
    subpage: "matches",
    aliases: ["partidos de torneos", "matches"],
    breadcrumbs: ["Tournaments", "Matches"],
    parents: ["/tournaments/subpages/dashboard"],
    intentTags: ["tournaments", "matches"],
    isLanding: false
  }),
  createEntry({
    id: "tournaments_match_stats",
    title: "Match Stats Subpage",
    route: "/tournaments/subpages/match-stats",
    description: "Subpagina de estadisticas de partidos dentro del modulo de torneos.",
    section: "tournaments",
    page: "tournaments",
    subpage: "match-stats",
    aliases: ["estadisticas", "match stats", "estadisticas de partidos"],
    breadcrumbs: ["Tournaments", "Match Stats"],
    parents: ["/tournaments/subpages/dashboard"],
    intentTags: ["tournaments", "stats"],
    isLanding: false
  }),
  createEntry({
    id: "scouting_intro",
    title: "Scouting Intro",
    route: "/scouting/intro",
    description: "Pantalla de entrada u onboarding de scouting.",
    section: "scouting",
    page: "scouting",
    subpage: "intro",
    aliases: ["intro scouting", "onboarding scouting"],
    breadcrumbs: ["Scouting", "Intro"],
    parents: ["/scouting/subpages/dashboard"],
    intentTags: ["scouting", "intro", "onboarding"],
    isLanding: false
  }),
  createEntry({
    id: "scouting_dashboard",
    title: "Scouting Dashboard",
    route: "/scouting/subpages/dashboard",
    description: "Pantalla principal del modulo de scouting o recruiters.",
    section: "scouting",
    page: "scouting",
    subpage: "dashboard",
    aliases: ["scouting", "recruiters", "dashboard de scouting", "/recruiters"],
    breadcrumbs: ["Scouting", "Dashboard"],
    intentTags: ["scouting", "dashboard", "recruiters"],
    isLanding: true,
    popularity: 0.86,
    notes: ["La ruta legacy /recruiters redirige aqui."]
  }),
  createEntry({
    id: "scouting_library",
    title: "Scouting Library",
    route: "/scouting/subpages/library",
    description: "Subpagina library del modulo de scouting.",
    section: "scouting",
    page: "scouting",
    subpage: "library",
    aliases: ["library", "biblioteca", "scouting library"],
    breadcrumbs: ["Scouting", "Library"],
    parents: ["/scouting/subpages/dashboard"],
    intentTags: ["scouting", "library"],
    isLanding: false
  }),
  createEntry({
    id: "scouting_player_profiles",
    title: "Player Profiles",
    route: "/scouting/subpages/player-profiles",
    description: "Subpagina de fichas de jugador dentro de scouting.",
    section: "scouting",
    page: "scouting",
    subpage: "player-profiles",
    aliases: ["player profiles", "perfiles", "fichas de jugador"],
    breadcrumbs: ["Scouting", "Player Profiles"],
    parents: ["/scouting/subpages/dashboard"],
    intentTags: ["scouting", "players", "profiles"],
    isLanding: false
  }),
  createEntry({
    id: "scouting_rankings",
    title: "Scouting Rankings",
    route: "/scouting/subpages/rankings",
    description: "Subpagina de rankings o board de scouting.",
    section: "scouting",
    page: "scouting",
    subpage: "rankings",
    aliases: ["rankings", "board", "scouting board"],
    breadcrumbs: ["Scouting", "Rankings"],
    parents: ["/scouting/subpages/dashboard"],
    intentTags: ["scouting", "rankings"],
    isLanding: false
  }),
  createEntry({
    id: "scouting_profile",
    title: "Scouting Profile",
    route: "/scouting/subpages/profile/:videoId",
    description: "Perfil editorial de scouting para un video concreto.",
    section: "scouting",
    page: "scouting",
    subpage: "profile",
    aliases: ["perfil de scouting", "profile"],
    breadcrumbs: ["Scouting", "Profile"],
    parents: ["/scouting/subpages/rankings", "/scouting/subpages/library"],
    intentTags: ["scouting", "profile"],
    isLanding: false,
    pathPattern: /^\/scouting\/subpages\/profile\/[^/]+(?:\?.*)?$/,
    notes: ["Ruta dinamica: requiere videoId.", "Puede incluir query playerProfileId."]
  }),
  createEntry({
    id: "scouting_video",
    title: "Scouting Video",
    route: "/scouting/subpages/video/:videoId",
    description: "Vista recruiter para un video concreto dentro de scouting.",
    section: "scouting",
    page: "scouting",
    subpage: "video",
    aliases: ["video scouting", "recruiter view", "video detail"],
    breadcrumbs: ["Scouting", "Video"],
    parents: ["/scouting/subpages/rankings", "/scouting/subpages/library"],
    intentTags: ["scouting", "video"],
    isLanding: false,
    pathPattern: /^\/scouting\/subpages\/video\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere videoId."]
  })
];
var normalize = (value) => value.trim().toLowerCase();
var stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(
      ([left], [right]) => left.localeCompare(right)
    );
    return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`).join(",")}}`;
  }
  return JSON.stringify(value);
};
var hashString = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};
var toCatalogEntry = (entry) => ({
  route: entry.route,
  actionName: entry.actionName,
  title: entry.title,
  section: entry.section,
  page: entry.page,
  subpage: entry.subpage,
  aliases: [...entry.aliases].sort((left, right) => left.localeCompare(right)),
  breadcrumbs: [...entry.breadcrumbs],
  parents: [...entry.parents],
  intentTags: [...entry.intentTags].sort((left, right) => left.localeCompare(right)),
  isLanding: entry.isLanding,
  popularity: entry.popularity
});
var describeEntry = (entry) => {
  const aliases = entry.aliases.length ? ` | aliases: ${entry.aliases.join(", ")}` : "";
  const notes = entry.notes?.length ? ` | notes: ${entry.notes.join(" ")}` : "";
  return `- [${entry.section}] ${entry.title} -> ${entry.route} | ${entry.description}${aliases}${notes}`;
};
var buildNavigationCatalog = (locale) => {
  const entries = APP_NAVIGATION_ENTRIES.map((entry) => toCatalogEntry(entry)).sort(
    (left, right) => left.route.localeCompare(right.route)
  );
  const version = `nav-${hashString(stableStringify(entries))}`;
  return {
    version,
    locale,
    entries
  };
};
var findNavigationEntryByPath = (path) => {
  const normalizedPath = path.trim();
  return APP_NAVIGATION_ENTRIES.find((entry) => entry.route === normalizedPath) || APP_NAVIGATION_ENTRIES.find((entry) => entry.pathPattern?.test(normalizedPath));
};
var findNavigationEntriesByPrompt = (prompt) => {
  const normalizedPrompt = normalize(prompt);
  return APP_NAVIGATION_ENTRIES.filter((entry) => {
    const values = [entry.title, entry.route, ...entry.aliases].map(normalize);
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
    "- The application has top-level pages and module-specific subpages. Prefer the exact subpage path when the user asks for a section inside tournaments, scouting, or videos.",
    "- For dynamic routes with :id, :fieldId or :videoId, only use them when the prompt or context provides that identifier. Otherwise prefer the parent dashboard or list subpage.",
    "- Legacy aliases exist: /recruiters redirects to /scouting/subpages/dashboard and /fields/videos plus /subpages are handled by the videos module.",
    `Current route: ${params.currentPath}`,
    currentEntry ? `Current route match: ${currentEntry.title} (${currentEntry.route})` : "Current route match: no exact catalog match found.",
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
var AGENT_PLAN_V2_API_URL = "/agent/v2/plan";
var LAST_SUCCESSFUL_CATALOG_VERSION_STORAGE_KEY = "victory-craft.agent.lastSuccessfulNavigationCatalogVersion";
var normalizeFunctionCall = (value) => {
  if (typeof value !== "object" || value === null || !("name" in value)) return null;
  const name = typeof value.name === "string" ? value.name : "";
  if (!name) return null;
  return {
    name,
    arguments: "arguments" in value && typeof value.arguments === "object" && value.arguments !== null ? value.arguments : {}
  };
};
var normalizeMeta = (value) => {
  if (typeof value !== "object" || value === null) return void 0;
  const plannerMode = "plannerMode" in value && typeof value.plannerMode === "string" ? value.plannerMode : null;
  const confidence = "confidence" in value && typeof value.confidence === "number" ? value.confidence : null;
  const traceId = "traceId" in value && typeof value.traceId === "string" ? value.traceId : null;
  if (!plannerMode || confidence === null || !traceId) return void 0;
  return {
    plannerMode,
    confidence,
    traceId,
    selectedRoute: "selectedRoute" in value && typeof value.selectedRoute === "string" ? value.selectedRoute : void 0,
    navigationCatalogVersion: "navigationCatalogVersion" in value && typeof value.navigationCatalogVersion === "string" ? value.navigationCatalogVersion : void 0,
    cacheKey: "cacheKey" in value && typeof value.cacheKey === "string" ? value.cacheKey : void 0,
    cacheHit: "cacheHit" in value && typeof value.cacheHit === "boolean" ? value.cacheHit : void 0,
    candidateRoutes: "candidateRoutes" in value && Array.isArray(value.candidateRoutes) ? value.candidateRoutes.filter(
      (candidate) => typeof candidate === "object" && candidate !== null && "route" in candidate && typeof candidate.route === "string" && "score" in candidate && typeof candidate.score === "number"
    ).map((candidate) => ({
      route: candidate.route,
      score: candidate.score
    })) : void 0,
    validationWarnings: "validationWarnings" in value && Array.isArray(value.validationWarnings) ? value.validationWarnings.filter(
      (warning) => typeof warning === "string"
    ) : void 0
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
    calls,
    meta: "meta" in payload ? normalizeMeta(payload.meta) : void 0
  };
};
var getLastSuccessfulCatalogVersion = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(LAST_SUCCESSFUL_CATALOG_VERSION_STORAGE_KEY) || "";
};
var setLastSuccessfulCatalogVersion = (version) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SUCCESSFUL_CATALOG_VERSION_STORAGE_KEY, version);
};
var readErrorMessage = (error) => {
  if (!axios2.isAxiosError(error)) return "";
  const responseMessage = typeof error.response?.data?.message === "string" ? error.response.data.message : "";
  return responseMessage || error.message || "";
};
var isUnknownCatalogVersionError = (error) => {
  const message = readErrorMessage(error).toLowerCase();
  if (!message) return false;
  return /(navigationcatalogversion|catalog version|catalogo|catálogo)/i.test(message) && /(unknown|missing|not found|not registered|unrecognized|desconoc|sincroniz|sync)/i.test(
    message
  );
};
var shouldFallbackToLegacyPlanner = (error) => {
  if (!axios2.isAxiosError(error)) return false;
  const status = error.response?.status;
  if (status === 404 || status === 405 || status === 501) return true;
  const message = readErrorMessage(error).toLowerCase();
  return /not implemented|unsupported|no implementado/.test(message);
};
var mapPlannerError = (error) => {
  if (axios2.isAxiosError(error)) {
    if (error.response?.status === 400) {
      throw new Error(
        "Agent planner rejected the request. Check the prompt, navigation catalog, and registered actions."
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
};
var postLegacyPlan = async (input) => {
  const response = await api.post(AGENT_PLAN_API_URL, buildAgentPlannerPayload(input));
  return normalizeExecutionPlan(response.data);
};
var postV2Plan = async (input) => {
  const payload = buildAgentPlannerPayload(input);
  const locale = getAgentPlannerLocale();
  const navigationCatalog = buildNavigationCatalog(locale);
  const shouldSendCatalog = getLastSuccessfulCatalogVersion() !== navigationCatalog.version;
  const requestBody = {
    ...payload,
    locale,
    navigationCatalogVersion: navigationCatalog.version,
    ...shouldSendCatalog ? { navigationCatalog } : {}
  };
  try {
    const response = await api.post(AGENT_PLAN_V2_API_URL, requestBody);
    setLastSuccessfulCatalogVersion(navigationCatalog.version);
    return normalizeExecutionPlan(response.data);
  } catch (error) {
    if (!shouldSendCatalog && isUnknownCatalogVersionError(error)) {
      const retryResponse = await api.post(AGENT_PLAN_V2_API_URL, {
        ...requestBody,
        navigationCatalog
      });
      setLastSuccessfulCatalogVersion(navigationCatalog.version);
      return normalizeExecutionPlan(retryResponse.data);
    }
    throw error;
  }
};
var planAgentActions = async (params) => {
  const { input, usePlannerV2 } = params;
  if (!usePlannerV2) {
    try {
      return await postLegacyPlan(input);
    } catch (error) {
      mapPlannerError(error);
    }
  }
  try {
    return await postV2Plan(input);
  } catch (error) {
    if (shouldFallbackToLegacyPlanner(error)) {
      console.warn("Planner v2 unavailable, falling back to legacy planner.", error);
      try {
        return await postLegacyPlan(input);
      } catch (legacyError) {
        mapPlannerError(legacyError);
      }
    }
    mapPlannerError(error);
  }
};
var agentPlannerClient = {
  async plan(input, options) {
    return planAgentActions({
      input,
      usePlannerV2: options?.usePlannerV2 === true
    });
  }
};

// src/app/agent/api/agentPlannerClient.test.ts
var originalPost = api.post;
var originalWindow = globalThis.window;
var originalNavigator = globalThis.navigator;
var createAxiosLikeError = (status, message) => ({
  isAxiosError: true,
  name: "AxiosError",
  message: "Request failed",
  toJSON: () => ({}),
  response: {
    status,
    data: {
      message
    }
  }
});
var createStorage = () => {
  const storage = /* @__PURE__ */ new Map();
  return {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value);
    },
    removeItem: (key) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    }
  };
};
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
test.beforeEach(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: createStorage()
    }
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      language: "es-ES"
    }
  });
});
test.afterEach(() => {
  api.post = originalPost;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: originalNavigator
  });
});
test("agentPlannerClient returns a valid v1 plan with one call", async () => {
  let receivedUrl = "";
  let receivedPayload;
  api.post = async (url, payload) => {
    receivedUrl = String(url);
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
  const response = await agentPlannerClient.plan(samplePayload, { usePlannerV2: false });
  assert.equal(receivedUrl, AGENT_PLAN_API_URL);
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
    ],
    meta: void 0
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
test("agentPlannerClient sends v2 catalog and meta on first request", async () => {
  const expectedCatalog = buildNavigationCatalog("es-ES");
  let receivedUrl = "";
  let receivedPayload;
  api.post = async (url, payload) => {
    receivedUrl = String(url);
    receivedPayload = payload;
    return {
      data: {
        summary: "Navigate using v2.",
        calls: [
          {
            name: "navigation.go_to",
            arguments: {
              path: "/scouting/subpages/library"
            }
          }
        ],
        meta: {
          plannerMode: "deterministic",
          confidence: 0.98,
          selectedRoute: "/scouting/subpages/library",
          traceId: "trace-v2-1",
          cacheHit: false
        }
      }
    };
  };
  const response = await agentPlannerClient.plan(samplePayload, { usePlannerV2: true });
  assert.equal(receivedUrl, AGENT_PLAN_V2_API_URL);
  assert.equal(receivedPayload?.locale, "es-ES");
  assert.equal(receivedPayload?.navigationCatalogVersion, expectedCatalog.version);
  assert.deepEqual(receivedPayload?.navigationCatalog, expectedCatalog);
  assert.equal(response.meta?.plannerMode, "deterministic");
  assert.equal(response.meta?.traceId, "trace-v2-1");
});
test("agentPlannerClient skips v2 catalog when backend already knows the version", async () => {
  const calls = [];
  api.post = async (_url, payload) => {
    calls.push(payload);
    return {
      data: {
        summary: "Navigate using v2.",
        calls: [],
        meta: {
          plannerMode: "cache_hit",
          confidence: 0.95,
          traceId: `trace-${calls.length}`,
          cacheHit: true
        }
      }
    };
  };
  await agentPlannerClient.plan(samplePayload, { usePlannerV2: true });
  await agentPlannerClient.plan(samplePayload, { usePlannerV2: true });
  assert.equal(calls.length, 2);
  assert.ok("navigationCatalog" in calls[0]);
  assert.ok(!("navigationCatalog" in calls[1]));
});
test("agentPlannerClient retries v2 with catalog when backend does not know the version", async () => {
  const calls = [];
  const catalogVersion = buildNavigationCatalog("es-ES").version;
  globalThis.window?.localStorage.setItem(
    "victory-craft.agent.lastSuccessfulNavigationCatalogVersion",
    catalogVersion
  );
  api.post = async (_url, payload) => {
    calls.push(payload);
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
          traceId: "trace-retry"
        }
      }
    };
  };
  const response = await agentPlannerClient.plan(samplePayload, { usePlannerV2: true });
  assert.equal(calls.length, 2);
  assert.ok(!("navigationCatalog" in calls[0]));
  assert.ok("navigationCatalog" in calls[1]);
  assert.equal(response.meta?.traceId, "trace-retry");
});
test("agentPlannerClient supports the fallback response with empty calls", async () => {
  api.post = async () => ({
    data: {
      summary: "No valid action could be planned.",
      calls: []
    }
  });
  const response = await agentPlannerClient.plan(samplePayload, { usePlannerV2: false });
  assert.deepEqual(response, {
    summary: "No valid action could be planned.",
    calls: [],
    meta: void 0
  });
});
test("agentPlannerClient maps 400 into a friendly error", async () => {
  api.post = async () => {
    throw createAxiosLikeError(400);
  };
  await assert.rejects(
    () => agentPlannerClient.plan(samplePayload, { usePlannerV2: false }),
    /Agent planner rejected the request/
  );
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2FwcC9hZ2VudC9hcGkvYWdlbnRQbGFubmVyQ2xpZW50LnRlc3QudHMiLCAiLi4vc3JjL2FwcC9hZ2VudC9hcGkvYWdlbnRQbGFubmVyQ2xpZW50LnRzIiwgIi4uL3NyYy91dGlscy9hcGkudHMiLCAiLi4vc3JjL3V0aWxzL2F1dGhTZXNzaW9uLnRzIiwgIi4uL25vZGVfbW9kdWxlcy9qd3QtZGVjb2RlL2J1aWxkL2VzbS9pbmRleC5qcyIsICIuLi9zcmMvdXRpbHMvand0VXRpbC50cyIsICIuLi9zcmMvYXBwL2FnZW50L2NvbmZpZy9hZ2VudFBsYW5uZXJDb25maWcudHMiLCAiLi4vc3JjL2FwcC9hZ2VudC9uYXZpZ2F0aW9uL25hdmlnYXRpb25Lbm93bGVkZ2UudHMiLCAiLi4vc3JjL2FwcC9hZ2VudC9hcGkvYnVpbGRBZ2VudFBsYW5uZXJQYXlsb2FkLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgdGVzdCBmcm9tIFwibm9kZTp0ZXN0XCI7XG5pbXBvcnQgYXNzZXJ0IGZyb20gXCJub2RlOmFzc2VydC9zdHJpY3RcIjtcbmltcG9ydCB0eXBlIHsgQXhpb3NFcnJvciB9IGZyb20gXCJheGlvc1wiO1xuaW1wb3J0IHsgYWdlbnRQbGFubmVyQ2xpZW50LCBBR0VOVF9QTEFOX0FQSV9VUkwsIEFHRU5UX1BMQU5fVjJfQVBJX1VSTCB9IGZyb20gXCIuL2FnZW50UGxhbm5lckNsaWVudFwiO1xuaW1wb3J0IHsgYnVpbGRBZ2VudFBsYW5uZXJQYXlsb2FkIH0gZnJvbSBcIi4vYnVpbGRBZ2VudFBsYW5uZXJQYXlsb2FkXCI7XG5pbXBvcnQgeyBidWlsZE5hdmlnYXRpb25DYXRhbG9nIH0gZnJvbSBcIi4uL25hdmlnYXRpb24vbmF2aWdhdGlvbktub3dsZWRnZVwiO1xuaW1wb3J0IHsgYXBpIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL2FwaVwiO1xuXG5jb25zdCBvcmlnaW5hbFBvc3QgPSBhcGkucG9zdDtcbmNvbnN0IG9yaWdpbmFsV2luZG93ID0gZ2xvYmFsVGhpcy53aW5kb3cgYXMgdW5rbm93bjtcbmNvbnN0IG9yaWdpbmFsTmF2aWdhdG9yID0gZ2xvYmFsVGhpcy5uYXZpZ2F0b3IgYXMgdW5rbm93bjtcblxuY29uc3QgY3JlYXRlQXhpb3NMaWtlRXJyb3IgPSAoXG4gIHN0YXR1czogbnVtYmVyLFxuICBtZXNzYWdlPzogc3RyaW5nXG4pOiBBeGlvc0Vycm9yICYge1xuICByZXNwb25zZToge1xuICAgIHN0YXR1czogbnVtYmVyO1xuICAgIGRhdGE6IHtcbiAgICAgIG1lc3NhZ2U/OiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbn0gPT5cbiAgKHtcbiAgICBpc0F4aW9zRXJyb3I6IHRydWUsXG4gICAgbmFtZTogXCJBeGlvc0Vycm9yXCIsXG4gICAgbWVzc2FnZTogXCJSZXF1ZXN0IGZhaWxlZFwiLFxuICAgIHRvSlNPTjogKCkgPT4gKHt9KSxcbiAgICByZXNwb25zZToge1xuICAgICAgc3RhdHVzLFxuICAgICAgZGF0YToge1xuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSxcbiAgICB9LFxuICB9KSBhcyBBeGlvc0Vycm9yICYge1xuICAgIHJlc3BvbnNlOiB7XG4gICAgICBzdGF0dXM6IG51bWJlcjtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgbWVzc2FnZT86IHN0cmluZztcbiAgICAgIH07XG4gICAgfTtcbiAgfTtcblxuY29uc3QgY3JlYXRlU3RvcmFnZSA9ICgpID0+IHtcbiAgY29uc3Qgc3RvcmFnZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRJdGVtOiAoa2V5OiBzdHJpbmcpID0+IHN0b3JhZ2UuZ2V0KGtleSkgPz8gbnVsbCxcbiAgICBzZXRJdGVtOiAoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgICAgIHN0b3JhZ2Uuc2V0KGtleSwgdmFsdWUpO1xuICAgIH0sXG4gICAgcmVtb3ZlSXRlbTogKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICBzdG9yYWdlLmRlbGV0ZShrZXkpO1xuICAgIH0sXG4gICAgY2xlYXI6ICgpID0+IHtcbiAgICAgIHN0b3JhZ2UuY2xlYXIoKTtcbiAgICB9LFxuICB9O1xufTtcblxuY29uc3Qgc2FtcGxlUGF5bG9hZCA9IHtcbiAgcHJvbXB0OiBcIm9wZW4gdG91cm5hbWVudHMgcmVnaXN0cmF0aW9uXCIsXG4gIGN1cnJlbnRQYXRoOiBcIi9maWVsZHNcIixcbiAgYWN0aW9uczogW1xuICAgIHtcbiAgICAgIG5hbWU6IFwibmF2aWdhdGlvbi5nb190b1wiLFxuICAgICAgZGVzY3JpcHRpb246IFwiTmF2aWdhdGUgdG8gYW4gaW50ZXJuYWwgcm91dGVcIixcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IFwicGF0aFwiLFxuICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIgYXMgY29uc3QsXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiVGFyZ2V0IHBhdGhcIixcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICByZXR1cm5zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiIGFzIGNvbnN0LFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIk5hdmlnYXRpb24gY29uZmlybWF0aW9uXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgdGFnczogW1wibmF2aWdhdGlvblwiXSxcbiAgICB9LFxuICBdLFxufTtcblxudGVzdC5iZWZvcmVFYWNoKCgpID0+IHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGdsb2JhbFRoaXMsIFwid2luZG93XCIsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgdmFsdWU6IHtcbiAgICAgIGxvY2FsU3RvcmFnZTogY3JlYXRlU3RvcmFnZSgpLFxuICAgIH0gYXMgdW5rbm93bixcbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGdsb2JhbFRoaXMsIFwibmF2aWdhdG9yXCIsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgdmFsdWU6IHtcbiAgICAgIGxhbmd1YWdlOiBcImVzLUVTXCIsXG4gICAgfSBhcyB1bmtub3duLFxuICB9KTtcbn0pO1xuXG50ZXN0LmFmdGVyRWFjaCgoKSA9PiB7XG4gIGFwaS5wb3N0ID0gb3JpZ2luYWxQb3N0O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbG9iYWxUaGlzLCBcIndpbmRvd1wiLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBvcmlnaW5hbFdpbmRvdyxcbiAgfSk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGdsb2JhbFRoaXMsIFwibmF2aWdhdG9yXCIsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgdmFsdWU6IG9yaWdpbmFsTmF2aWdhdG9yLFxuICB9KTtcbn0pO1xuXG50ZXN0KFwiYWdlbnRQbGFubmVyQ2xpZW50IHJldHVybnMgYSB2YWxpZCB2MSBwbGFuIHdpdGggb25lIGNhbGxcIiwgYXN5bmMgKCkgPT4ge1xuICBsZXQgcmVjZWl2ZWRVcmwgPSBcIlwiO1xuICBsZXQgcmVjZWl2ZWRQYXlsb2FkOiB1bmtub3duO1xuICBhcGkucG9zdCA9IChhc3luYyAodXJsLCBwYXlsb2FkKSA9PiB7XG4gICAgcmVjZWl2ZWRVcmwgPSBTdHJpbmcodXJsKTtcbiAgICByZWNlaXZlZFBheWxvYWQgPSBwYXlsb2FkO1xuICAgIHJldHVybiB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHN1bW1hcnk6IFwiTmF2aWdhdGUgdG8gdGhlIHJlcXVlc3RlZCBwYWdlLlwiLFxuICAgICAgICBjYWxsczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6IFwibmF2aWdhdGlvbi5nb190b1wiLFxuICAgICAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgIHBhdGg6IFwiL3RvdXJuYW1lbnRzL3N1YnBhZ2VzL2Rhc2hib2FyZCN0b3VybmFtZW50LWZvcm1cIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSkgYXMgdHlwZW9mIGFwaS5wb3N0O1xuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYWdlbnRQbGFubmVyQ2xpZW50LnBsYW4oc2FtcGxlUGF5bG9hZCwgeyB1c2VQbGFubmVyVjI6IGZhbHNlIH0pO1xuXG4gIGFzc2VydC5lcXVhbChyZWNlaXZlZFVybCwgQUdFTlRfUExBTl9BUElfVVJMKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbChyZWNlaXZlZFBheWxvYWQsIGJ1aWxkQWdlbnRQbGFubmVyUGF5bG9hZChzYW1wbGVQYXlsb2FkKSk7XG4gIGFzc2VydC5kZWVwRXF1YWwocmVzcG9uc2UsIHtcbiAgICBzdW1tYXJ5OiBcIk5hdmlnYXRlIHRvIHRoZSByZXF1ZXN0ZWQgcGFnZS5cIixcbiAgICBjYWxsczogW1xuICAgICAge1xuICAgICAgICBuYW1lOiBcIm5hdmlnYXRpb24uZ29fdG9cIixcbiAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgcGF0aDogXCIvdG91cm5hbWVudHMvc3VicGFnZXMvZGFzaGJvYXJkI3RvdXJuYW1lbnQtZm9ybVwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICAgIG1ldGE6IHVuZGVmaW5lZCxcbiAgfSk7XG59KTtcblxudGVzdChcImJ1aWxkQWdlbnRQbGFubmVyUGF5bG9hZCBhcHBlbmRzIHJvdXRlIGtub3dsZWRnZSBpbmNsdWRpbmcgc3VicGFnZXNcIiwgKCkgPT4ge1xuICBjb25zdCBwYXlsb2FkID0gYnVpbGRBZ2VudFBsYW5uZXJQYXlsb2FkKHtcbiAgICAuLi5zYW1wbGVQYXlsb2FkLFxuICAgIHByb21wdDogXCJhYnJlIGxhIGxpYnJhcnkgZGUgc2NvdXRpbmcgeSBzaSBoYWNlIGZhbHRhIHVzYSBzdWJwYWdpbmFzXCIsXG4gICAgY3VycmVudFBhdGg6IFwiL3Njb3V0aW5nL3N1YnBhZ2VzL2Rhc2hib2FyZFwiLFxuICB9KTtcblxuICBhc3NlcnQubWF0Y2gocGF5bG9hZC5wcm9tcHQsIC9Vc2VyIHJlcXVlc3Q6XFxuYWJyZSBsYSBsaWJyYXJ5IGRlIHNjb3V0aW5nL2kpO1xuICBhc3NlcnQubWF0Y2gocGF5bG9hZC5wcm9tcHQsIC9DdXJyZW50IHJvdXRlOiBcXC9zY291dGluZ1xcL3N1YnBhZ2VzXFwvZGFzaGJvYXJkLyk7XG4gIGFzc2VydC5tYXRjaChwYXlsb2FkLnByb21wdCwgL1xcL3Njb3V0aW5nXFwvc3VicGFnZXNcXC9saWJyYXJ5Lyk7XG4gIGFzc2VydC5tYXRjaChwYXlsb2FkLnByb21wdCwgL1xcL3RvdXJuYW1lbnRzXFwvc3VicGFnZXNcXC9tYXRjaGVzLyk7XG4gIGFzc2VydC5tYXRjaChwYXlsb2FkLnByb21wdCwgL1BsYW4gb25seSB3aXRoIHRoZSByZWdpc3RlcmVkIGFjdGlvbnMgcHJvdmlkZWQgaW4gdGhpcyBwYXlsb2FkXFwuLyk7XG59KTtcblxudGVzdChcImJ1aWxkQWdlbnRQbGFubmVyUGF5bG9hZCBpbmNsdWRlcyB2aWRlb3MgcmVjb3JkaW5nIHN1YnBhZ2UgYWxpYXNlc1wiLCAoKSA9PiB7XG4gIGNvbnN0IHBheWxvYWQgPSBidWlsZEFnZW50UGxhbm5lclBheWxvYWQoe1xuICAgIC4uLnNhbXBsZVBheWxvYWQsXG4gICAgcHJvbXB0OiBcImxsZXZhbWUgYSBsYSBwYWdpbmEgZGUgZ3JhYmFjaW9uZXNcIixcbiAgICBjdXJyZW50UGF0aDogXCIvdmlkZW9zL3N1YnBhZ2VzL2Rhc2hib2FyZFwiLFxuICB9KTtcblxuICBhc3NlcnQubWF0Y2gocGF5bG9hZC5wcm9tcHQsIC9Vc2VyIHJlcXVlc3Q6XFxubGxldmFtZSBhIGxhIHBhZ2luYSBkZSBncmFiYWNpb25lcy9pKTtcbiAgYXNzZXJ0Lm1hdGNoKHBheWxvYWQucHJvbXB0LCAvXFwvdmlkZW9zXFwvc3VicGFnZXNcXC9zdHJlYW1pbmdcXC9yZWNvcmRpbmcvKTtcbiAgYXNzZXJ0Lm1hdGNoKHBheWxvYWQucHJvbXB0LCAvZ3JhYmFjaW9uZXMvKTtcbiAgYXNzZXJ0Lm1hdGNoKHBheWxvYWQucHJvbXB0LCAvQ3VycmVudCByb3V0ZTogXFwvdmlkZW9zXFwvc3VicGFnZXNcXC9kYXNoYm9hcmQvKTtcbn0pO1xuXG50ZXN0KFwiYWdlbnRQbGFubmVyQ2xpZW50IHNlbmRzIHYyIGNhdGFsb2cgYW5kIG1ldGEgb24gZmlyc3QgcmVxdWVzdFwiLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGV4cGVjdGVkQ2F0YWxvZyA9IGJ1aWxkTmF2aWdhdGlvbkNhdGFsb2coXCJlcy1FU1wiKTtcbiAgbGV0IHJlY2VpdmVkVXJsID0gXCJcIjtcbiAgbGV0IHJlY2VpdmVkUGF5bG9hZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQ7XG5cbiAgYXBpLnBvc3QgPSAoYXN5bmMgKHVybCwgcGF5bG9hZCkgPT4ge1xuICAgIHJlY2VpdmVkVXJsID0gU3RyaW5nKHVybCk7XG4gICAgcmVjZWl2ZWRQYXlsb2FkID0gcGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAgIHJldHVybiB7XG4gICAgICBkYXRhOiB7XG4gICAgICAgIHN1bW1hcnk6IFwiTmF2aWdhdGUgdXNpbmcgdjIuXCIsXG4gICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJuYXZpZ2F0aW9uLmdvX3RvXCIsXG4gICAgICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICAgICAgcGF0aDogXCIvc2NvdXRpbmcvc3VicGFnZXMvbGlicmFyeVwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBtZXRhOiB7XG4gICAgICAgICAgcGxhbm5lck1vZGU6IFwiZGV0ZXJtaW5pc3RpY1wiLFxuICAgICAgICAgIGNvbmZpZGVuY2U6IDAuOTgsXG4gICAgICAgICAgc2VsZWN0ZWRSb3V0ZTogXCIvc2NvdXRpbmcvc3VicGFnZXMvbGlicmFyeVwiLFxuICAgICAgICAgIHRyYWNlSWQ6IFwidHJhY2UtdjItMVwiLFxuICAgICAgICAgIGNhY2hlSGl0OiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSkgYXMgdHlwZW9mIGFwaS5wb3N0O1xuXG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYWdlbnRQbGFubmVyQ2xpZW50LnBsYW4oc2FtcGxlUGF5bG9hZCwgeyB1c2VQbGFubmVyVjI6IHRydWUgfSk7XG5cbiAgYXNzZXJ0LmVxdWFsKHJlY2VpdmVkVXJsLCBBR0VOVF9QTEFOX1YyX0FQSV9VUkwpO1xuICBhc3NlcnQuZXF1YWwocmVjZWl2ZWRQYXlsb2FkPy5sb2NhbGUsIFwiZXMtRVNcIik7XG4gIGFzc2VydC5lcXVhbChyZWNlaXZlZFBheWxvYWQ/Lm5hdmlnYXRpb25DYXRhbG9nVmVyc2lvbiwgZXhwZWN0ZWRDYXRhbG9nLnZlcnNpb24pO1xuICBhc3NlcnQuZGVlcEVxdWFsKHJlY2VpdmVkUGF5bG9hZD8ubmF2aWdhdGlvbkNhdGFsb2csIGV4cGVjdGVkQ2F0YWxvZyk7XG4gIGFzc2VydC5lcXVhbChyZXNwb25zZS5tZXRhPy5wbGFubmVyTW9kZSwgXCJkZXRlcm1pbmlzdGljXCIpO1xuICBhc3NlcnQuZXF1YWwocmVzcG9uc2UubWV0YT8udHJhY2VJZCwgXCJ0cmFjZS12Mi0xXCIpO1xufSk7XG5cbnRlc3QoXCJhZ2VudFBsYW5uZXJDbGllbnQgc2tpcHMgdjIgY2F0YWxvZyB3aGVuIGJhY2tlbmQgYWxyZWFkeSBrbm93cyB0aGUgdmVyc2lvblwiLCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGNhbGxzOiBBcnJheTxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4gPSBbXTtcblxuICBhcGkucG9zdCA9IChhc3luYyAoX3VybCwgcGF5bG9hZCkgPT4ge1xuICAgIGNhbGxzLnB1c2gocGF5bG9hZCBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgc3VtbWFyeTogXCJOYXZpZ2F0ZSB1c2luZyB2Mi5cIixcbiAgICAgICAgY2FsbHM6IFtdLFxuICAgICAgICBtZXRhOiB7XG4gICAgICAgICAgcGxhbm5lck1vZGU6IFwiY2FjaGVfaGl0XCIsXG4gICAgICAgICAgY29uZmlkZW5jZTogMC45NSxcbiAgICAgICAgICB0cmFjZUlkOiBgdHJhY2UtJHtjYWxscy5sZW5ndGh9YCxcbiAgICAgICAgICBjYWNoZUhpdDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSkgYXMgdHlwZW9mIGFwaS5wb3N0O1xuXG4gIGF3YWl0IGFnZW50UGxhbm5lckNsaWVudC5wbGFuKHNhbXBsZVBheWxvYWQsIHsgdXNlUGxhbm5lclYyOiB0cnVlIH0pO1xuICBhd2FpdCBhZ2VudFBsYW5uZXJDbGllbnQucGxhbihzYW1wbGVQYXlsb2FkLCB7IHVzZVBsYW5uZXJWMjogdHJ1ZSB9KTtcblxuICBhc3NlcnQuZXF1YWwoY2FsbHMubGVuZ3RoLCAyKTtcbiAgYXNzZXJ0Lm9rKFwibmF2aWdhdGlvbkNhdGFsb2dcIiBpbiBjYWxsc1swXSk7XG4gIGFzc2VydC5vayghKFwibmF2aWdhdGlvbkNhdGFsb2dcIiBpbiBjYWxsc1sxXSkpO1xufSk7XG5cbnRlc3QoXCJhZ2VudFBsYW5uZXJDbGllbnQgcmV0cmllcyB2MiB3aXRoIGNhdGFsb2cgd2hlbiBiYWNrZW5kIGRvZXMgbm90IGtub3cgdGhlIHZlcnNpb25cIiwgYXN5bmMgKCkgPT4ge1xuICBjb25zdCBjYWxsczogQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+ID0gW107XG4gIGNvbnN0IGNhdGFsb2dWZXJzaW9uID0gYnVpbGROYXZpZ2F0aW9uQ2F0YWxvZyhcImVzLUVTXCIpLnZlcnNpb247XG5cbiAgZ2xvYmFsVGhpcy53aW5kb3c/LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgIFwidmljdG9yeS1jcmFmdC5hZ2VudC5sYXN0U3VjY2Vzc2Z1bE5hdmlnYXRpb25DYXRhbG9nVmVyc2lvblwiLFxuICAgIGNhdGFsb2dWZXJzaW9uXG4gICk7XG5cbiAgYXBpLnBvc3QgPSAoYXN5bmMgKF91cmwsIHBheWxvYWQpID0+IHtcbiAgICBjYWxscy5wdXNoKHBheWxvYWQgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuXG4gICAgaWYgKGNhbGxzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdGhyb3cgY3JlYXRlQXhpb3NMaWtlRXJyb3IoNDAwLCBcIlVua25vd24gbmF2aWdhdGlvbkNhdGFsb2dWZXJzaW9uLiBQbGVhc2Ugc3luYyBjYXRhbG9nLlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZGF0YToge1xuICAgICAgICBzdW1tYXJ5OiBcIlJldHJ5IHN1Y2NlZWRlZC5cIixcbiAgICAgICAgY2FsbHM6IFtdLFxuICAgICAgICBtZXRhOiB7XG4gICAgICAgICAgcGxhbm5lck1vZGU6IFwiZmFsbGJhY2tcIixcbiAgICAgICAgICBjb25maWRlbmNlOiAwLjgsXG4gICAgICAgICAgdHJhY2VJZDogXCJ0cmFjZS1yZXRyeVwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9O1xuICB9KSBhcyB0eXBlb2YgYXBpLnBvc3Q7XG5cbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhZ2VudFBsYW5uZXJDbGllbnQucGxhbihzYW1wbGVQYXlsb2FkLCB7IHVzZVBsYW5uZXJWMjogdHJ1ZSB9KTtcblxuICBhc3NlcnQuZXF1YWwoY2FsbHMubGVuZ3RoLCAyKTtcbiAgYXNzZXJ0Lm9rKCEoXCJuYXZpZ2F0aW9uQ2F0YWxvZ1wiIGluIGNhbGxzWzBdKSk7XG4gIGFzc2VydC5vayhcIm5hdmlnYXRpb25DYXRhbG9nXCIgaW4gY2FsbHNbMV0pO1xuICBhc3NlcnQuZXF1YWwocmVzcG9uc2UubWV0YT8udHJhY2VJZCwgXCJ0cmFjZS1yZXRyeVwiKTtcbn0pO1xuXG50ZXN0KFwiYWdlbnRQbGFubmVyQ2xpZW50IHN1cHBvcnRzIHRoZSBmYWxsYmFjayByZXNwb25zZSB3aXRoIGVtcHR5IGNhbGxzXCIsIGFzeW5jICgpID0+IHtcbiAgYXBpLnBvc3QgPSAoYXN5bmMgKCkgPT4gKHtcbiAgICBkYXRhOiB7XG4gICAgICBzdW1tYXJ5OiBcIk5vIHZhbGlkIGFjdGlvbiBjb3VsZCBiZSBwbGFubmVkLlwiLFxuICAgICAgY2FsbHM6IFtdLFxuICAgIH0sXG4gIH0pKSBhcyB0eXBlb2YgYXBpLnBvc3Q7XG5cbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhZ2VudFBsYW5uZXJDbGllbnQucGxhbihzYW1wbGVQYXlsb2FkLCB7IHVzZVBsYW5uZXJWMjogZmFsc2UgfSk7XG5cbiAgYXNzZXJ0LmRlZXBFcXVhbChyZXNwb25zZSwge1xuICAgIHN1bW1hcnk6IFwiTm8gdmFsaWQgYWN0aW9uIGNvdWxkIGJlIHBsYW5uZWQuXCIsXG4gICAgY2FsbHM6IFtdLFxuICAgIG1ldGE6IHVuZGVmaW5lZCxcbiAgfSk7XG59KTtcblxudGVzdChcImFnZW50UGxhbm5lckNsaWVudCBtYXBzIDQwMCBpbnRvIGEgZnJpZW5kbHkgZXJyb3JcIiwgYXN5bmMgKCkgPT4ge1xuICBhcGkucG9zdCA9IChhc3luYyAoKSA9PiB7XG4gICAgdGhyb3cgY3JlYXRlQXhpb3NMaWtlRXJyb3IoNDAwKTtcbiAgfSkgYXMgdHlwZW9mIGFwaS5wb3N0O1xuXG4gIGF3YWl0IGFzc2VydC5yZWplY3RzKFxuICAgICgpID0+IGFnZW50UGxhbm5lckNsaWVudC5wbGFuKHNhbXBsZVBheWxvYWQsIHsgdXNlUGxhbm5lclYyOiBmYWxzZSB9KSxcbiAgICAvQWdlbnQgcGxhbm5lciByZWplY3RlZCB0aGUgcmVxdWVzdC9cbiAgKTtcbn0pO1xuIiwgImltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcbmltcG9ydCB7IGFwaSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9hcGlcIjtcbmltcG9ydCB0eXBlIHtcbiAgQWdlbnRFeGVjdXRpb25QbGFuLFxuICBBZ2VudEZ1bmN0aW9uQ2FsbCxcbiAgQWdlbnRMbG1JbnB1dCxcbiAgQWdlbnRQbGFubmVyTWV0YSxcbn0gZnJvbSBcIi4uLy4uLy4uL2FnZW50LW1mZVwiO1xuaW1wb3J0IHsgZ2V0QWdlbnRQbGFubmVyTG9jYWxlIH0gZnJvbSBcIi4uL2NvbmZpZy9hZ2VudFBsYW5uZXJDb25maWdcIjtcbmltcG9ydCB7IGJ1aWxkTmF2aWdhdGlvbkNhdGFsb2cgfSBmcm9tIFwiLi4vbmF2aWdhdGlvbi9uYXZpZ2F0aW9uS25vd2xlZGdlXCI7XG5pbXBvcnQgeyBidWlsZEFnZW50UGxhbm5lclBheWxvYWQgfSBmcm9tIFwiLi9idWlsZEFnZW50UGxhbm5lclBheWxvYWRcIjtcblxuZXhwb3J0IGNvbnN0IEFHRU5UX1BMQU5fQVBJX1VSTCA9IFwiL2FnZW50L3BsYW5cIjtcbmV4cG9ydCBjb25zdCBBR0VOVF9QTEFOX1YyX0FQSV9VUkwgPSBcIi9hZ2VudC92Mi9wbGFuXCI7XG5cbmNvbnN0IExBU1RfU1VDQ0VTU0ZVTF9DQVRBTE9HX1ZFUlNJT05fU1RPUkFHRV9LRVkgPVxuICBcInZpY3RvcnktY3JhZnQuYWdlbnQubGFzdFN1Y2Nlc3NmdWxOYXZpZ2F0aW9uQ2F0YWxvZ1ZlcnNpb25cIjtcblxuY29uc3Qgbm9ybWFsaXplRnVuY3Rpb25DYWxsID0gKHZhbHVlOiB1bmtub3duKTogQWdlbnRGdW5jdGlvbkNhbGwgfCBudWxsID0+IHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCB2YWx1ZSA9PT0gbnVsbCB8fCAhKFwibmFtZVwiIGluIHZhbHVlKSkgcmV0dXJuIG51bGw7XG5cbiAgY29uc3QgbmFtZSA9IHR5cGVvZiB2YWx1ZS5uYW1lID09PSBcInN0cmluZ1wiID8gdmFsdWUubmFtZSA6IFwiXCI7XG4gIGlmICghbmFtZSkgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lLFxuICAgIGFyZ3VtZW50czpcbiAgICAgIFwiYXJndW1lbnRzXCIgaW4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLmFyZ3VtZW50cyA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZS5hcmd1bWVudHMgIT09IG51bGxcbiAgICAgICAgPyAodmFsdWUuYXJndW1lbnRzIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVxuICAgICAgICA6IHt9LFxuICB9O1xufTtcblxuY29uc3Qgbm9ybWFsaXplTWV0YSA9ICh2YWx1ZTogdW5rbm93bik6IEFnZW50UGxhbm5lck1ldGEgfCB1bmRlZmluZWQgPT4ge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiIHx8IHZhbHVlID09PSBudWxsKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHBsYW5uZXJNb2RlID1cbiAgICBcInBsYW5uZXJNb2RlXCIgaW4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnBsYW5uZXJNb2RlID09PSBcInN0cmluZ1wiID8gdmFsdWUucGxhbm5lck1vZGUgOiBudWxsO1xuICBjb25zdCBjb25maWRlbmNlID1cbiAgICBcImNvbmZpZGVuY2VcIiBpbiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUuY29uZmlkZW5jZSA9PT0gXCJudW1iZXJcIiA/IHZhbHVlLmNvbmZpZGVuY2UgOiBudWxsO1xuICBjb25zdCB0cmFjZUlkID0gXCJ0cmFjZUlkXCIgaW4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRyYWNlSWQgPT09IFwic3RyaW5nXCIgPyB2YWx1ZS50cmFjZUlkIDogbnVsbDtcblxuICBpZiAoIXBsYW5uZXJNb2RlIHx8IGNvbmZpZGVuY2UgPT09IG51bGwgfHwgIXRyYWNlSWQpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgcmV0dXJuIHtcbiAgICBwbGFubmVyTW9kZTogcGxhbm5lck1vZGUgYXMgQWdlbnRQbGFubmVyTWV0YVtcInBsYW5uZXJNb2RlXCJdLFxuICAgIGNvbmZpZGVuY2UsXG4gICAgdHJhY2VJZCxcbiAgICBzZWxlY3RlZFJvdXRlOlxuICAgICAgXCJzZWxlY3RlZFJvdXRlXCIgaW4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnNlbGVjdGVkUm91dGUgPT09IFwic3RyaW5nXCJcbiAgICAgICAgPyB2YWx1ZS5zZWxlY3RlZFJvdXRlXG4gICAgICAgIDogdW5kZWZpbmVkLFxuICAgIG5hdmlnYXRpb25DYXRhbG9nVmVyc2lvbjpcbiAgICAgIFwibmF2aWdhdGlvbkNhdGFsb2dWZXJzaW9uXCIgaW4gdmFsdWUgJiZcbiAgICAgIHR5cGVvZiB2YWx1ZS5uYXZpZ2F0aW9uQ2F0YWxvZ1ZlcnNpb24gPT09IFwic3RyaW5nXCJcbiAgICAgICAgPyB2YWx1ZS5uYXZpZ2F0aW9uQ2F0YWxvZ1ZlcnNpb25cbiAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgY2FjaGVLZXk6XG4gICAgICBcImNhY2hlS2V5XCIgaW4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLmNhY2hlS2V5ID09PSBcInN0cmluZ1wiID8gdmFsdWUuY2FjaGVLZXkgOiB1bmRlZmluZWQsXG4gICAgY2FjaGVIaXQ6XG4gICAgICBcImNhY2hlSGl0XCIgaW4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLmNhY2hlSGl0ID09PSBcImJvb2xlYW5cIiA/IHZhbHVlLmNhY2hlSGl0IDogdW5kZWZpbmVkLFxuICAgIGNhbmRpZGF0ZVJvdXRlczpcbiAgICAgIFwiY2FuZGlkYXRlUm91dGVzXCIgaW4gdmFsdWUgJiYgQXJyYXkuaXNBcnJheSh2YWx1ZS5jYW5kaWRhdGVSb3V0ZXMpXG4gICAgICAgID8gdmFsdWUuY2FuZGlkYXRlUm91dGVzXG4gICAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgICAoY2FuZGlkYXRlKTogY2FuZGlkYXRlIGlzIHsgcm91dGU6IHN0cmluZzsgc2NvcmU6IG51bWJlciB9ID0+XG4gICAgICAgICAgICAgICAgdHlwZW9mIGNhbmRpZGF0ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgICAgIGNhbmRpZGF0ZSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIFwicm91dGVcIiBpbiBjYW5kaWRhdGUgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgY2FuZGlkYXRlLnJvdXRlID09PSBcInN0cmluZ1wiICYmXG4gICAgICAgICAgICAgICAgXCJzY29yZVwiIGluIGNhbmRpZGF0ZSAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiBjYW5kaWRhdGUuc2NvcmUgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5tYXAoKGNhbmRpZGF0ZSkgPT4gKHtcbiAgICAgICAgICAgICAgcm91dGU6IGNhbmRpZGF0ZS5yb3V0ZSxcbiAgICAgICAgICAgICAgc2NvcmU6IGNhbmRpZGF0ZS5zY29yZSxcbiAgICAgICAgICAgIH0pKVxuICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICB2YWxpZGF0aW9uV2FybmluZ3M6XG4gICAgICBcInZhbGlkYXRpb25XYXJuaW5nc1wiIGluIHZhbHVlICYmIEFycmF5LmlzQXJyYXkodmFsdWUudmFsaWRhdGlvbldhcm5pbmdzKVxuICAgICAgICA/IHZhbHVlLnZhbGlkYXRpb25XYXJuaW5ncy5maWx0ZXIoXG4gICAgICAgICAgICAod2FybmluZyk6IHdhcm5pbmcgaXMgc3RyaW5nID0+IHR5cGVvZiB3YXJuaW5nID09PSBcInN0cmluZ1wiXG4gICAgICAgICAgKVxuICAgICAgICA6IHVuZGVmaW5lZCxcbiAgfTtcbn07XG5cbmNvbnN0IG5vcm1hbGl6ZUV4ZWN1dGlvblBsYW4gPSAocGF5bG9hZDogdW5rbm93bik6IEFnZW50RXhlY3V0aW9uUGxhbiA9PiB7XG4gIGlmICh0eXBlb2YgcGF5bG9hZCAhPT0gXCJvYmplY3RcIiB8fCBwYXlsb2FkID09PSBudWxsIHx8ICEoXCJjYWxsc1wiIGluIHBheWxvYWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQWdlbnQgcGxhbm5lciByZXR1cm5lZCBhbiBpbnZhbGlkIHBheWxvYWQuXCIpO1xuICB9XG5cbiAgY29uc3Qgc3VtbWFyeSA9XG4gICAgXCJzdW1tYXJ5XCIgaW4gcGF5bG9hZCAmJiB0eXBlb2YgcGF5bG9hZC5zdW1tYXJ5ID09PSBcInN0cmluZ1wiXG4gICAgICA/IHBheWxvYWQuc3VtbWFyeVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHJhd0NhbGxzID0gQXJyYXkuaXNBcnJheShwYXlsb2FkLmNhbGxzKSA/IHBheWxvYWQuY2FsbHMgOiBbXTtcbiAgY29uc3QgY2FsbHMgPSByYXdDYWxsc1xuICAgIC5tYXAoKHZhbHVlKSA9PiBub3JtYWxpemVGdW5jdGlvbkNhbGwodmFsdWUpKVxuICAgIC5maWx0ZXIoKHZhbHVlKTogdmFsdWUgaXMgQWdlbnRGdW5jdGlvbkNhbGwgPT4gdmFsdWUgIT09IG51bGwpO1xuXG4gIHJldHVybiB7XG4gICAgc3VtbWFyeSxcbiAgICBjYWxscyxcbiAgICBtZXRhOiBcIm1ldGFcIiBpbiBwYXlsb2FkID8gbm9ybWFsaXplTWV0YShwYXlsb2FkLm1ldGEpIDogdW5kZWZpbmVkLFxuICB9O1xufTtcblxuY29uc3QgZ2V0TGFzdFN1Y2Nlc3NmdWxDYXRhbG9nVmVyc2lvbiA9ICgpID0+IHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBcIlwiO1xuICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKExBU1RfU1VDQ0VTU0ZVTF9DQVRBTE9HX1ZFUlNJT05fU1RPUkFHRV9LRVkpIHx8IFwiXCI7XG59O1xuXG5jb25zdCBzZXRMYXN0U3VjY2Vzc2Z1bENhdGFsb2dWZXJzaW9uID0gKHZlcnNpb246IHN0cmluZykgPT4ge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuO1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oTEFTVF9TVUNDRVNTRlVMX0NBVEFMT0dfVkVSU0lPTl9TVE9SQUdFX0tFWSwgdmVyc2lvbik7XG59O1xuXG5jb25zdCByZWFkRXJyb3JNZXNzYWdlID0gKGVycm9yOiB1bmtub3duKSA9PiB7XG4gIGlmICghYXhpb3MuaXNBeGlvc0Vycm9yKGVycm9yKSkgcmV0dXJuIFwiXCI7XG5cbiAgY29uc3QgcmVzcG9uc2VNZXNzYWdlID1cbiAgICB0eXBlb2YgZXJyb3IucmVzcG9uc2U/LmRhdGE/Lm1lc3NhZ2UgPT09IFwic3RyaW5nXCIgPyBlcnJvci5yZXNwb25zZS5kYXRhLm1lc3NhZ2UgOiBcIlwiO1xuICByZXR1cm4gcmVzcG9uc2VNZXNzYWdlIHx8IGVycm9yLm1lc3NhZ2UgfHwgXCJcIjtcbn07XG5cbmNvbnN0IGlzVW5rbm93bkNhdGFsb2dWZXJzaW9uRXJyb3IgPSAoZXJyb3I6IHVua25vd24pID0+IHtcbiAgY29uc3QgbWVzc2FnZSA9IHJlYWRFcnJvck1lc3NhZ2UoZXJyb3IpLnRvTG93ZXJDYXNlKCk7XG4gIGlmICghbWVzc2FnZSkgcmV0dXJuIGZhbHNlO1xuXG4gIHJldHVybiAoXG4gICAgLyhuYXZpZ2F0aW9uY2F0YWxvZ3ZlcnNpb258Y2F0YWxvZyB2ZXJzaW9ufGNhdGFsb2dvfGNhdFx1MDBFMWxvZ28pL2kudGVzdChtZXNzYWdlKSAmJlxuICAgIC8odW5rbm93bnxtaXNzaW5nfG5vdCBmb3VuZHxub3QgcmVnaXN0ZXJlZHx1bnJlY29nbml6ZWR8ZGVzY29ub2N8c2luY3Jvbml6fHN5bmMpL2kudGVzdChcbiAgICAgIG1lc3NhZ2VcbiAgICApXG4gICk7XG59O1xuXG5jb25zdCBzaG91bGRGYWxsYmFja1RvTGVnYWN5UGxhbm5lciA9IChlcnJvcjogdW5rbm93bikgPT4ge1xuICBpZiAoIWF4aW9zLmlzQXhpb3NFcnJvcihlcnJvcikpIHJldHVybiBmYWxzZTtcblxuICBjb25zdCBzdGF0dXMgPSBlcnJvci5yZXNwb25zZT8uc3RhdHVzO1xuICBpZiAoc3RhdHVzID09PSA0MDQgfHwgc3RhdHVzID09PSA0MDUgfHwgc3RhdHVzID09PSA1MDEpIHJldHVybiB0cnVlO1xuXG4gIGNvbnN0IG1lc3NhZ2UgPSByZWFkRXJyb3JNZXNzYWdlKGVycm9yKS50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4gL25vdCBpbXBsZW1lbnRlZHx1bnN1cHBvcnRlZHxubyBpbXBsZW1lbnRhZG8vLnRlc3QobWVzc2FnZSk7XG59O1xuXG5jb25zdCBtYXBQbGFubmVyRXJyb3IgPSAoZXJyb3I6IHVua25vd24pOiBuZXZlciA9PiB7XG4gIGlmIChheGlvcy5pc0F4aW9zRXJyb3IoZXJyb3IpKSB7XG4gICAgaWYgKGVycm9yLnJlc3BvbnNlPy5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIkFnZW50IHBsYW5uZXIgcmVqZWN0ZWQgdGhlIHJlcXVlc3QuIENoZWNrIHRoZSBwcm9tcHQsIG5hdmlnYXRpb24gY2F0YWxvZywgYW5kIHJlZ2lzdGVyZWQgYWN0aW9ucy5cIlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3IucmVzcG9uc2U/LnN0YXR1cyA9PT0gNTAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBZ2VudCBwbGFubmVyIGZhaWxlZCB3aGlsZSBidWlsZGluZyB0aGUgYWN0aW9uIHBsYW4uXCIpO1xuICAgIH1cblxuICAgIGlmIChlcnJvci5yZXNwb25zZT8uc3RhdHVzID09PSA1MDIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkFnZW50IHBsYW5uZXIgaXMgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUuIFRyeSBhZ2FpbiBzaG9ydGx5LlwiKTtcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgcmVhY2ggdGhlIGFnZW50IHBsYW5uZXIgZW5kcG9pbnQuXCIpO1xufTtcblxuY29uc3QgcG9zdExlZ2FjeVBsYW4gPSBhc3luYyAoaW5wdXQ6IEFnZW50TGxtSW5wdXQpID0+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucG9zdChBR0VOVF9QTEFOX0FQSV9VUkwsIGJ1aWxkQWdlbnRQbGFubmVyUGF5bG9hZChpbnB1dCkpO1xuICByZXR1cm4gbm9ybWFsaXplRXhlY3V0aW9uUGxhbihyZXNwb25zZS5kYXRhKTtcbn07XG5cbmNvbnN0IHBvc3RWMlBsYW4gPSBhc3luYyAoaW5wdXQ6IEFnZW50TGxtSW5wdXQpID0+IHtcbiAgY29uc3QgcGF5bG9hZCA9IGJ1aWxkQWdlbnRQbGFubmVyUGF5bG9hZChpbnB1dCk7XG4gIGNvbnN0IGxvY2FsZSA9IGdldEFnZW50UGxhbm5lckxvY2FsZSgpO1xuICBjb25zdCBuYXZpZ2F0aW9uQ2F0YWxvZyA9IGJ1aWxkTmF2aWdhdGlvbkNhdGFsb2cobG9jYWxlKTtcbiAgY29uc3Qgc2hvdWxkU2VuZENhdGFsb2cgPVxuICAgIGdldExhc3RTdWNjZXNzZnVsQ2F0YWxvZ1ZlcnNpb24oKSAhPT0gbmF2aWdhdGlvbkNhdGFsb2cudmVyc2lvbjtcblxuICBjb25zdCByZXF1ZXN0Qm9keSA9IHtcbiAgICAuLi5wYXlsb2FkLFxuICAgIGxvY2FsZSxcbiAgICBuYXZpZ2F0aW9uQ2F0YWxvZ1ZlcnNpb246IG5hdmlnYXRpb25DYXRhbG9nLnZlcnNpb24sXG4gICAgLi4uKHNob3VsZFNlbmRDYXRhbG9nID8geyBuYXZpZ2F0aW9uQ2F0YWxvZyB9IDoge30pLFxuICB9O1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucG9zdChBR0VOVF9QTEFOX1YyX0FQSV9VUkwsIHJlcXVlc3RCb2R5KTtcbiAgICBzZXRMYXN0U3VjY2Vzc2Z1bENhdGFsb2dWZXJzaW9uKG5hdmlnYXRpb25DYXRhbG9nLnZlcnNpb24pO1xuICAgIHJldHVybiBub3JtYWxpemVFeGVjdXRpb25QbGFuKHJlc3BvbnNlLmRhdGEpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmICghc2hvdWxkU2VuZENhdGFsb2cgJiYgaXNVbmtub3duQ2F0YWxvZ1ZlcnNpb25FcnJvcihlcnJvcikpIHtcbiAgICAgIGNvbnN0IHJldHJ5UmVzcG9uc2UgPSBhd2FpdCBhcGkucG9zdChBR0VOVF9QTEFOX1YyX0FQSV9VUkwsIHtcbiAgICAgICAgLi4ucmVxdWVzdEJvZHksXG4gICAgICAgIG5hdmlnYXRpb25DYXRhbG9nLFxuICAgICAgfSk7XG5cbiAgICAgIHNldExhc3RTdWNjZXNzZnVsQ2F0YWxvZ1ZlcnNpb24obmF2aWdhdGlvbkNhdGFsb2cudmVyc2lvbik7XG4gICAgICByZXR1cm4gbm9ybWFsaXplRXhlY3V0aW9uUGxhbihyZXRyeVJlc3BvbnNlLmRhdGEpO1xuICAgIH1cblxuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcGxhbkFnZW50QWN0aW9ucyA9IGFzeW5jIChwYXJhbXM6IHtcbiAgaW5wdXQ6IEFnZW50TGxtSW5wdXQ7XG4gIHVzZVBsYW5uZXJWMjogYm9vbGVhbjtcbn0pOiBQcm9taXNlPEFnZW50RXhlY3V0aW9uUGxhbj4gPT4ge1xuICBjb25zdCB7IGlucHV0LCB1c2VQbGFubmVyVjIgfSA9IHBhcmFtcztcblxuICBpZiAoIXVzZVBsYW5uZXJWMikge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgcG9zdExlZ2FjeVBsYW4oaW5wdXQpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBtYXBQbGFubmVyRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IHBvc3RWMlBsYW4oaW5wdXQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChzaG91bGRGYWxsYmFja1RvTGVnYWN5UGxhbm5lcihlcnJvcikpIHtcbiAgICAgIGNvbnNvbGUud2FybihcIlBsYW5uZXIgdjIgdW5hdmFpbGFibGUsIGZhbGxpbmcgYmFjayB0byBsZWdhY3kgcGxhbm5lci5cIiwgZXJyb3IpO1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgcG9zdExlZ2FjeVBsYW4oaW5wdXQpO1xuICAgICAgfSBjYXRjaCAobGVnYWN5RXJyb3IpIHtcbiAgICAgICAgbWFwUGxhbm5lckVycm9yKGxlZ2FjeUVycm9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtYXBQbGFubmVyRXJyb3IoZXJyb3IpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgYWdlbnRQbGFubmVyQ2xpZW50ID0ge1xuICBhc3luYyBwbGFuKGlucHV0OiBBZ2VudExsbUlucHV0LCBvcHRpb25zPzogeyB1c2VQbGFubmVyVjI/OiBib29sZWFuIH0pIHtcbiAgICByZXR1cm4gcGxhbkFnZW50QWN0aW9ucyh7XG4gICAgICBpbnB1dCxcbiAgICAgIHVzZVBsYW5uZXJWMjogb3B0aW9ucz8udXNlUGxhbm5lclYyID09PSB0cnVlLFxuICAgIH0pO1xuICB9LFxufTtcbiIsICJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5pbXBvcnQge1xuICBjbGVhclBlcnNpc3RlZEF1dGhTZXNzaW9uQW5kTm90aWZ5LFxufSBmcm9tIFwiLi9hdXRoU2Vzc2lvblwiO1xuaW1wb3J0IHsgaXNWYWxpZEp3dFRva2VuIH0gZnJvbSBcIi4vand0VXRpbFwiO1xuXG4vLyBcdUQ4M0RcdURDQ0MgRGVmaW5pciBjb25zdGFudGVzIGdsb2JhbGVzXG5jb25zdCBJTUFHRVNfQlVDS0VUID0gXCJpbWFnZXMtdGZtMlwiO1xuY29uc3Qgdml0ZUVudiA9XG4gIHR5cGVvZiBpbXBvcnQubWV0YSAhPT0gXCJ1bmRlZmluZWRcIlxuICAgID8gKGltcG9ydC5tZXRhIGFzIEltcG9ydE1ldGEgJiB7IGVudj86IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHVuZGVmaW5lZD4gfSkuZW52XG4gICAgOiB1bmRlZmluZWQ7XG5cbi8vIFx1RDgzRFx1RENDQyBUaXBhZG8gcGFyYSBsYSBBUEkgcHJpbmNpcGFsXG5leHBvcnQgY29uc3QgYXBpID0gYXhpb3MuY3JlYXRlKHtcbiAgYmFzZVVSTDogdml0ZUVudj8uVklURV9BUElfVVJMIHx8IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAxXCIsIC8vIENhbWJpYSBlc3RvIGEgbGEgVVJMIGRlIHR1IEFQSVxufSk7XG5cbmFwaS5pbnRlcmNlcHRvcnMucmVxdWVzdC51c2UoKGNvbmZpZykgPT4ge1xuICBjb25zdCBhdXRob3JpemF0aW9uID1cbiAgICB0eXBlb2YgY29uZmlnLmhlYWRlcnM/LkF1dGhvcml6YXRpb24gPT09IFwic3RyaW5nXCJcbiAgICAgID8gY29uZmlnLmhlYWRlcnMuQXV0aG9yaXphdGlvblxuICAgICAgOiB0eXBlb2YgY29uZmlnLmhlYWRlcnM/LmF1dGhvcml6YXRpb24gPT09IFwic3RyaW5nXCJcbiAgICAgICAgPyBjb25maWcuaGVhZGVycy5hdXRob3JpemF0aW9uXG4gICAgICAgIDogXCJcIjtcblxuICBpZiAoYXV0aG9yaXphdGlvbi5zdGFydHNXaXRoKFwiQmVhcmVyIFwiKSkge1xuICAgIGNvbnN0IHRva2VuID0gYXV0aG9yaXphdGlvbi5zbGljZShcIkJlYXJlciBcIi5sZW5ndGgpLnRyaW0oKTtcbiAgICBpZiAoIWlzVmFsaWRKd3RUb2tlbih0b2tlbikgJiYgY29uZmlnLmhlYWRlcnMpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVycy5BdXRob3JpemF0aW9uO1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzLmF1dGhvcml6YXRpb247XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbmZpZztcbn0pO1xuXG5hcGkuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLnVzZShcbiAgKHJlc3BvbnNlKSA9PiByZXNwb25zZSxcbiAgKGVycm9yKSA9PiB7XG4gICAgY29uc3Qgc3RhdHVzID0gZXJyb3I/LnJlc3BvbnNlPy5zdGF0dXM7XG4gICAgY29uc3QgYXV0aG9yaXphdGlvbiA9XG4gICAgICB0eXBlb2YgZXJyb3I/LmNvbmZpZz8uaGVhZGVycz8uQXV0aG9yaXphdGlvbiA9PT0gXCJzdHJpbmdcIlxuICAgICAgICA/IGVycm9yLmNvbmZpZy5oZWFkZXJzLkF1dGhvcml6YXRpb25cbiAgICAgICAgOiB0eXBlb2YgZXJyb3I/LmNvbmZpZz8uaGVhZGVycz8uYXV0aG9yaXphdGlvbiA9PT0gXCJzdHJpbmdcIlxuICAgICAgICAgID8gZXJyb3IuY29uZmlnLmhlYWRlcnMuYXV0aG9yaXphdGlvblxuICAgICAgICAgIDogXCJcIjtcblxuICAgIGlmIChzdGF0dXMgPT09IDQwMSAmJiBhdXRob3JpemF0aW9uLnN0YXJ0c1dpdGgoXCJCZWFyZXIgXCIpKSB7XG4gICAgICBjbGVhclBlcnNpc3RlZEF1dGhTZXNzaW9uQW5kTm90aWZ5KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuKTtcblxuZXhwb3J0IGNvbnN0IHMzQXBpID0gYXhpb3MuY3JlYXRlKCk7XG5cbi8vIFx1RDgzRFx1RENDQyBGdW5jaW9uZXMgcGFyYSBvYnRlbmVyIFVSTHMgYmFzZVxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VVUkwocGF0aDogc3RyaW5nID0gXCJcIik6IHN0cmluZyB7XG4gIHJldHVybiBgaHR0cHM6Ly9kbWFnNS5wYy5hYy51cGMuZWR1L2FwaS8ke3BhdGh9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VVUkxNZXRhZGF0YShwYXRoOiBzdHJpbmcgPSBcIlwiKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBodHRwczovL3E4b254aGs4MTguZXhlY3V0ZS1hcGkudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vUHJvZC8ke3BhdGh9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VVcmxKdW1iZihwYXRoOiBzdHJpbmcgPSBcIlwiKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBodHRwOi8vZWMyLTMtODAtODEtMjUxLmNvbXB1dGUtMS5hbWF6b25hd3MuY29tOjgwODAvJHtwYXRofWA7XG59XG5cbi8vIFx1RDgzRFx1RENDQyBDcmVhciBpbnN0YW5jaWFzIGRlIEFQSSBjb24gYmFzZVVSTCBwZXJzb25hbGl6YWRhXG5leHBvcnQgY29uc3QgYXBpTWV0YWRhdGEgPSBheGlvcy5jcmVhdGUoe1xuICBiYXNlVVJMOiBnZXRCYXNlVVJMTWV0YWRhdGEoKSxcbn0pO1xuXG5leHBvcnQgY29uc3QgYXBpSnVtYmYgPSBheGlvcy5jcmVhdGUoe1xuICBiYXNlVVJMOiBnZXRCYXNlVXJsSnVtYmYoKSxcbn0pO1xuXG4vLyBcdUQ4M0RcdURDQ0MgVGlwYWRvIGRlIGVzdHJ1Y3R1cmEgcGFyYSByZXNwdWVzdGFzIEFQSVxuaW50ZXJmYWNlIEFwaVJlc3BvbnNlPFQ+IHtcbiAgZGF0YTogVDtcbn1cblxuLy8gXHVEODNEXHVEQ0NDIEZ1bmNpXHUwMEYzbiBwYXJhIG9idGVuZXIgaW1hZ2VuXG5leHBvcnQgY29uc3QgZ2V0SW1hZ2UgPSBhc3luYyAob2JqZWN0S2V5OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpTWV0YWRhdGEucG9zdDxcbiAgICAgIEFwaVJlc3BvbnNlPHsgZG93bmxvYWRVcmw6IHN0cmluZyB9PlxuICAgID4oXG4gICAgICBcImdldEltYWdlXCIsXG4gICAgICB7XG4gICAgICAgIGJ1Y2tldE5hbWU6IElNQUdFU19CVUNLRVQsXG4gICAgICAgIG9iamVjdEtleTogb2JqZWN0S2V5LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zdCBpbWFnZVVybCA9IHJlc3BvbnNlLmRhdGEuZGF0YS5kb3dubG9hZFVybDtcbiAgICBjb25zdCByZXNwb25zZTIgPSBhd2FpdCBheGlvcy5nZXQoaW1hZ2VVcmwpO1xuICAgIHJldHVybiByZXNwb25zZTIuZGF0YTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZmV0Y2hpbmcgaW1hZ2U6XCIsIGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxuLy8gXHVEODNEXHVEQ0NDIEZ1bmNpXHUwMEYzbiBwYXJhIG9idGVuZXIgbGEgVVJMIGRlIGxhIGltYWdlblxuZXhwb3J0IGNvbnN0IGdldEltYWdlVXJsID0gYXN5bmMgKFxuICBvYmplY3RLZXk6IHN0cmluZyxcbiAgdG9rZW46IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLnBvc3Q8QXBpUmVzcG9uc2U8eyBkb3dubG9hZFVybDogc3RyaW5nIH0+PihcbiAgICAgIFwiaHR0cHM6Ly8zMWhvNTZ5cmdpLmV4ZWN1dGUtYXBpLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3Byb2QvZ2V0SW1hZ2VcIixcbiAgICAgIHtcbiAgICAgICAgYnVja2V0TmFtZTogSU1BR0VTX0JVQ0tFVCxcbiAgICAgICAgb2JqZWN0S2V5OiBvYmplY3RLZXksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Rva2VufWAsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgKTtcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5kYXRhLmRvd25sb2FkVXJsO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBmZXRjaGluZyBpbWFnZTpcIiwgZXJyb3IpO1xuICB9XG59O1xuXG4vLyBcdUQ4M0RcdURDQ0MgVGlwYWRvIHBhcmEgc3ViaWRhIGRlIGFyY2hpdm9zXG5leHBvcnQgY29uc3QgdXBsb2FkSnVtYmZTZXJ2ZXJGaWxlID0gYXN5bmMgKGZpbGU6IEZpbGUpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgZm9ybURhdGEuYXBwZW5kKFwiZmlsZVwiLCBmaWxlKTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MucG9zdChcbiAgICAgIFwiaHR0cDovL2VjMi0zLTgwLTgxLTI1MS5jb21wdXRlLTEuYW1hem9uYXdzLmNvbTo4MDgwL2FwaS9kZW1vL3VwbG9hZE1ldGFkYXRhRmlsZVwiLFxuICAgICAgZm9ybURhdGEsXG4gICAgICB7XG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIgfSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coXCJSZXNwdWVzdGEgZGVsIHNlcnZpZG9yOlwiLCByZXNwb25zZS5kYXRhKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgYWwgc3ViaXIgZWwgYXJjaGl2bzpcIiwgZXJyb3IpO1xuICB9XG59O1xuXG4vLyBcdUQ4M0RcdURDQ0MgRnVuY2lcdTAwRjNuIHBhcmEgY3JlYXIgdW4gcmVnaXN0cm8gZGUgaW1hZ2VuIGVuIGxhIEFQSVxuZXhwb3J0IGNvbnN0IGNyZWF0ZUltYWdlUmVjb3JkID0gYXN5bmMgKFxuICBvYmplY3RLZXk6IHN0cmluZyxcbiAgdXNlcklkOiBzdHJpbmdcbik6IFByb21pc2U8QXBpUmVzcG9uc2U8YW55Pj4gPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGFwaVVybCA9XG4gICAgICBcImh0dHBzOi8vcThvbnhoazgxOC5leGVjdXRlLWFwaS51cy1lYXN0LTEuYW1hem9uYXdzLmNvbS9Qcm9kL2ltYWdlcy9jcmVhdGVcIjtcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHsga2V5OiBvYmplY3RLZXksIHVzZXJJZCB9KTtcblxuICAgIGNvbnN0IGRhdGEgPSB7IGJ1Y2tldE5hbWU6IElNQUdFU19CVUNLRVQsIG9iamVjdEtleSwgdXNlcklkIH07XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLnBvc3Q8QXBpUmVzcG9uc2U8YW55Pj4oXG4gICAgICBgJHthcGlVcmx9PyR7cGFyYW1zLnRvU3RyaW5nKCl9YCxcbiAgICAgIGRhdGEsXG4gICAgICB7XG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coXCJJbWFnZSByZWNvcmQgY3JlYXRlZCBzdWNjZXNzZnVsbHk6XCIsIHJlc3BvbnNlLmRhdGEpO1xuICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBjcmVhdGluZyBpbWFnZSByZWNvcmQ6XCIsIGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxuLy8gXHVEODNEXHVEQ0NDIEZ1bmNpXHUwMEYzbiBwYXJhIHByb2Nlc2FyIG1ldGFkYXRvcyBFWElGXG5leHBvcnQgY29uc3QgcHJvY2Vzc0V4aWZNZXRhZGF0YSA9IGFzeW5jIChcbiAgb2JqZWN0S2V5OiBzdHJpbmcsXG4gIHVzZXJJZDogc3RyaW5nXG4pOiBQcm9taXNlPEFwaVJlc3BvbnNlPGFueT4+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBhcGlVcmwgPVxuICAgICAgXCJodHRwczovL3E4b254aGs4MTguZXhlY3V0ZS1hcGkudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vUHJvZC9wcm9jZXNzRXhpZlwiO1xuICAgIGNvbnN0IGRhdGEgPSB7IGJ1Y2tldE5hbWU6IElNQUdFU19CVUNLRVQsIG9iamVjdEtleSwgdXNlcklkIH07XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLnBvc3Q8QXBpUmVzcG9uc2U8YW55Pj4oYXBpVXJsLCBkYXRhLCB7XG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZyhcIkVYSUYgZGF0YSBwcm9jZXNzZWQgc3VjY2Vzc2Z1bGx5OlwiLCByZXNwb25zZS5kYXRhKTtcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcHJvY2Vzc2luZyBFWElGIGRhdGE6XCIsIGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxuLy8gXHVEODNEXHVEQ0NDIEZ1bmNpXHUwMEYzbiBwYXJhIHN1YmlyIGFyY2hpdm9zIEpTT04gZGUgbWV0YWRhdG9zXG5leHBvcnQgY29uc3QgdXBsb2FkTWV0YWRhdGFGaWxlID0gYXN5bmMgKFxuICBvYmplY3RLZXk6IHN0cmluZyxcbiAganNvbk9iamVjdDogb2JqZWN0XG4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCBqc29uRmlsZU5hbWUgPSBvYmplY3RLZXkuc3BsaXQoXCIuXCIpWzBdICsgXCIuanNvblwiO1xuICAgIGNvbnNvbGUubG9nKFwianNvbiBmaWxlIG5hbWVcIiwganNvbkZpbGVOYW1lKTtcblxuICAgIGNvbnN0IGFyY2hpdm9KU09OID0gbmV3IEJsb2IoW0pTT04uc3RyaW5naWZ5KGpzb25PYmplY3QpXSwge1xuICAgICAgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgfSk7XG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICBmb3JtRGF0YS5hcHBlbmQoXCJmaWxlXCIsIGFyY2hpdm9KU09OLCBqc29uRmlsZU5hbWUpO1xuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5wb3N0KFxuICAgICAgXCJodHRwOi8vZWMyLTMtODAtODEtMjUxLmNvbXB1dGUtMS5hbWF6b25hd3MuY29tOjgwODAvYXBpL2RlbW8vdXBsb2FkTWV0YWRhdGFGaWxlXCIsXG4gICAgICBmb3JtRGF0YSxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcIm11bHRpcGFydC9mb3JtLWRhdGFcIiB9LFxuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zb2xlLmxvZyhcIlJlc3B1ZXN0YSBkZWwgc2Vydmlkb3I6XCIsIHJlc3BvbnNlLmRhdGEpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICB9XG59O1xuXG4vLyBcdUQ4M0RcdURDQ0MgRnVuY2lcdTAwRjNuIHBhcmEgZGVzY2FyZ2FyIHVuIGFyY2hpdm9cbmV4cG9ydCBjb25zdCBkb3dubG9hZEZpbGUgPSBhc3luYyAob2JqZWN0S2V5OiBzdHJpbmcpOiBQcm9taXNlPEJsb2I+ID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB0YXJnZXRGaWxlID0gXCJ0YXJnZXRfXCIgKyBvYmplY3RLZXk7XG4gICAgY29uc3QgYXBpVXJsID1cbiAgICAgIFwiaHR0cDovL2VjMi0zLTgwLTgxLTI1MS5jb21wdXRlLTEuYW1hem9uYXdzLmNvbTo4MDgwL2FwaS9kZW1vL2Rvd25sb2FkXCI7XG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7IHRhcmdldEZpbGUgfSkudG9TdHJpbmcoKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KGAke2FwaVVybH0/JHtwYXJhbXN9YCwge1xuICAgICAgcmVzcG9uc2VUeXBlOiBcImJsb2JcIixcbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgQmxvYihbcmVzcG9uc2UuZGF0YV0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBkb3dubG9hZGluZyBmaWxlOlwiLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbi8vIFx1RDgzRFx1RENDQyBGdW5jaVx1MDBGM24gcGFyYSBvYnRlbmVyIGltXHUwMEUxZ2VuZXMgZGUgdW4gdXN1YXJpb1xuZXhwb3J0IGNvbnN0IGdldEltYWdlcyA9IGFzeW5jICh1c2VySWQ6IHN0cmluZyk6IFByb21pc2U8QXBpUmVzcG9uc2U8YW55Pj4gPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGFwaVVybCA9XG4gICAgICBcImh0dHBzOi8vcThvbnhoazgxOC5leGVjdXRlLWFwaS51cy1lYXN0LTEuYW1hem9uYXdzLmNvbS9Qcm9kL2dldEltYWdlc1wiO1xuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoeyB1c2VySWQgfSkudG9TdHJpbmcoKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0PEFwaVJlc3BvbnNlPGFueT4+KGAke2FwaVVybH0/JHtwYXJhbXN9YCwge1xuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coXCJyZXNwb25zZTpcIiwgcmVzcG9uc2UuZGF0YSk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGZldGNoaW5nIGltYWdlczpcIiwgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuIiwgImV4cG9ydCBjb25zdCBBVVRIX0lOVkFMSURBVEVEX0VWRU5UID0gXCJhdXRoOnNlc3Npb24taW52YWxpZGF0ZWRcIjtcblxuY29uc3QgQVVUSF9TVE9SQUdFX0tFWVMgPSBbXCJ0b2tlblwiLCBcInVzZXJJZFwiLCBcImVtYWlsXCIsIFwicm9sZVwiLCBcImV4cFwiLCBcInZpZXdSb2xlXCJdIGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgY2xlYXJQZXJzaXN0ZWRBdXRoU2Vzc2lvbiA9ICgpOiB2b2lkID0+IHtcbiAgQVVUSF9TVE9SQUdFX0tFWVMuZm9yRWFjaCgoa2V5KSA9PiBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBub3RpZnlBdXRoU2Vzc2lvbkludmFsaWRhdGVkID0gKCk6IHZvaWQgPT4ge1xuICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoQVVUSF9JTlZBTElEQVRFRF9FVkVOVCkpO1xufTtcblxuZXhwb3J0IGNvbnN0IGNsZWFyUGVyc2lzdGVkQXV0aFNlc3Npb25BbmROb3RpZnkgPSAoKTogdm9pZCA9PiB7XG4gIGNsZWFyUGVyc2lzdGVkQXV0aFNlc3Npb24oKTtcbiAgbm90aWZ5QXV0aFNlc3Npb25JbnZhbGlkYXRlZCgpO1xufTtcbiIsICJleHBvcnQgY2xhc3MgSW52YWxpZFRva2VuRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG59XG5JbnZhbGlkVG9rZW5FcnJvci5wcm90b3R5cGUubmFtZSA9IFwiSW52YWxpZFRva2VuRXJyb3JcIjtcbmZ1bmN0aW9uIGI2NERlY29kZVVuaWNvZGUoc3RyKSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChhdG9iKHN0cikucmVwbGFjZSgvKC4pL2csIChtLCBwKSA9PiB7XG4gICAgICAgIGxldCBjb2RlID0gcC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICBpZiAoY29kZS5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICBjb2RlID0gXCIwXCIgKyBjb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcIiVcIiArIGNvZGU7XG4gICAgfSkpO1xufVxuZnVuY3Rpb24gYmFzZTY0VXJsRGVjb2RlKHN0cikge1xuICAgIGxldCBvdXRwdXQgPSBzdHIucmVwbGFjZSgvLS9nLCBcIitcIikucmVwbGFjZSgvXy9nLCBcIi9cIik7XG4gICAgc3dpdGNoIChvdXRwdXQubGVuZ3RoICUgNCkge1xuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgb3V0cHV0ICs9IFwiPT1cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBvdXRwdXQgKz0gXCI9XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImJhc2U2NCBzdHJpbmcgaXMgbm90IG9mIHRoZSBjb3JyZWN0IGxlbmd0aFwiKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGI2NERlY29kZVVuaWNvZGUob3V0cHV0KTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gYXRvYihvdXRwdXQpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBqd3REZWNvZGUodG9rZW4sIG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIHRva2VuICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkVG9rZW5FcnJvcihcIkludmFsaWQgdG9rZW4gc3BlY2lmaWVkOiBtdXN0IGJlIGEgc3RyaW5nXCIpO1xuICAgIH1cbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIGNvbnN0IHBvcyA9IG9wdGlvbnMuaGVhZGVyID09PSB0cnVlID8gMCA6IDE7XG4gICAgY29uc3QgcGFydCA9IHRva2VuLnNwbGl0KFwiLlwiKVtwb3NdO1xuICAgIGlmICh0eXBlb2YgcGFydCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFRva2VuRXJyb3IoYEludmFsaWQgdG9rZW4gc3BlY2lmaWVkOiBtaXNzaW5nIHBhcnQgIyR7cG9zICsgMX1gKTtcbiAgICB9XG4gICAgbGV0IGRlY29kZWQ7XG4gICAgdHJ5IHtcbiAgICAgICAgZGVjb2RlZCA9IGJhc2U2NFVybERlY29kZShwYXJ0KTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRUb2tlbkVycm9yKGBJbnZhbGlkIHRva2VuIHNwZWNpZmllZDogaW52YWxpZCBiYXNlNjQgZm9yIHBhcnQgIyR7cG9zICsgMX0gKCR7ZS5tZXNzYWdlfSlgKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2RlZCk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkVG9rZW5FcnJvcihgSW52YWxpZCB0b2tlbiBzcGVjaWZpZWQ6IGludmFsaWQganNvbiBmb3IgcGFydCAjJHtwb3MgKyAxfSAoJHtlLm1lc3NhZ2V9KWApO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgeyBqd3REZWNvZGUgfSBmcm9tIFwiand0LWRlY29kZVwiO1xuXG4vLyBcdUQ4M0RcdURDQ0MgSW50ZXJmYXogZGVsIHVzdWFyaW8gZGVzcHVcdTAwRTlzIGRlIGRlc2VuY3JpcHRhciBlbCB0b2tlblxuaW50ZXJmYWNlIERlY29kZWRUb2tlbiB7XG4gIGlkOiBzdHJpbmc7XG4gIGVtYWlsOiBzdHJpbmc7XG4gIGV4cDogbnVtYmVyOyAvLyBUaWVtcG8gZGUgZXhwaXJhY2lcdTAwRjNuIGRlbCB0b2tlblxuICByb2xlOiBzdHJpbmc7XG59XG5cbi8vIFx1RDgzRFx1RENDQyBGdW5jaVx1MDBGM24gcGFyYSBvYnRlbmVyIHkgZGVjb2RpZmljYXIgZWwgdG9rZW4gSldUXG5leHBvcnQgY29uc3QgZ2V0RGVjb2RlZFRva2VuID0gKHRva2VuOiBzdHJpbmcpOiBEZWNvZGVkVG9rZW4gfCBudWxsID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBEZXNlbmNyaXB0YXIgdG9rZW4gY29uIGBqc29ud2VidG9rZW5gIChNaXNtYSBsaWJyZXJcdTAwRURhIGRlbCBiYWNrZW5kKVxuICAgIGNvbnN0IGRlY29kZWQgPSBqd3REZWNvZGUodG9rZW4pIGFzIERlY29kZWRUb2tlbjtcbiAgICByZXR1cm4gZGVjb2RlZDtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgYWwgZGVjb2RpZmljYXIgdG9rZW46XCIsIGVycm9yKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGhhc0p3dEZvcm1hdCA9ICh0b2tlbjogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gIGNvbnN0IHZhbHVlID0gdG9rZW4udHJpbSgpO1xuICBpZiAoIXZhbHVlKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IHBhcnRzID0gdmFsdWUuc3BsaXQoXCIuXCIpO1xuICByZXR1cm4gcGFydHMubGVuZ3RoID09PSAzICYmIHBhcnRzLmV2ZXJ5KChwYXJ0KSA9PiBwYXJ0LnRyaW0oKS5sZW5ndGggPiAwKTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1ZhbGlkSnd0VG9rZW4gPSAodG9rZW46IHN0cmluZyk6IGJvb2xlYW4gPT5cbiAgaGFzSnd0Rm9ybWF0KHRva2VuKSAmJiBnZXREZWNvZGVkVG9rZW4odG9rZW4pICE9PSBudWxsO1xuIiwgImNvbnN0IEFHRU5UX1BMQU5ORVJfVjJfU1RPUkFHRV9LRVkgPSBcInZpY3RvcnktY3JhZnQuYWdlbnQudXNlUGxhbm5lclYyXCI7XG5cbmNvbnN0IHJlYWRFbnZEZWZhdWx0ID0gKCkgPT4ge1xuICBjb25zdCBjb25maWd1cmVkVmFsdWUgPSBpbXBvcnQubWV0YS5lbnYuVklURV9BR0VOVF9VU0VfUExBTk5FUl9WMj8udHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiBjb25maWd1cmVkVmFsdWUgPT09IFwiMVwiIHx8IGNvbmZpZ3VyZWRWYWx1ZSA9PT0gXCJ0cnVlXCI7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RGVmYXVsdFBsYW5uZXJWMlZhbHVlID0gKCkgPT4gcmVhZEVudkRlZmF1bHQoKTtcblxuZXhwb3J0IGNvbnN0IGdldFN0b3JlZFBsYW5uZXJWMlZhbHVlID0gKCkgPT4ge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIGdldERlZmF1bHRQbGFubmVyVjJWYWx1ZSgpO1xuXG4gIGNvbnN0IHN0b3JlZFZhbHVlID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKEFHRU5UX1BMQU5ORVJfVjJfU1RPUkFHRV9LRVkpO1xuICBpZiAoc3RvcmVkVmFsdWUgPT09IFwidHJ1ZVwiKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKHN0b3JlZFZhbHVlID09PSBcImZhbHNlXCIpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIGdldERlZmF1bHRQbGFubmVyVjJWYWx1ZSgpO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFN0b3JlZFBsYW5uZXJWMlZhbHVlID0gKHZhbHVlOiBib29sZWFuKSA9PiB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiKSByZXR1cm47XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShBR0VOVF9QTEFOTkVSX1YyX1NUT1JBR0VfS0VZLCBTdHJpbmcodmFsdWUpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBZ2VudFBsYW5uZXJMb2NhbGUgPSAoKSA9PiB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSBcInVuZGVmaW5lZFwiIHx8ICFuYXZpZ2F0b3IubGFuZ3VhZ2UpIHJldHVybiBcImVuXCI7XG4gIHJldHVybiBuYXZpZ2F0b3IubGFuZ3VhZ2U7XG59O1xuIiwgImV4cG9ydCBpbnRlcmZhY2UgUGxhbm5lck5hdmlnYXRpb25DYXRhbG9nRW50cnkge1xuICByb3V0ZTogc3RyaW5nO1xuICBhY3Rpb25OYW1lOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHNlY3Rpb246IHN0cmluZztcbiAgcGFnZTogc3RyaW5nO1xuICBzdWJwYWdlOiBzdHJpbmc7XG4gIGFsaWFzZXM6IHN0cmluZ1tdO1xuICBicmVhZGNydW1iczogc3RyaW5nW107XG4gIHBhcmVudHM6IHN0cmluZ1tdO1xuICBpbnRlbnRUYWdzOiBzdHJpbmdbXTtcbiAgaXNMYW5kaW5nOiBib29sZWFuO1xuICBwb3B1bGFyaXR5PzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBsYW5uZXJOYXZpZ2F0aW9uQ2F0YWxvZyB7XG4gIHZlcnNpb246IHN0cmluZztcbiAgbG9jYWxlOiBzdHJpbmc7XG4gIGVudHJpZXM6IFBsYW5uZXJOYXZpZ2F0aW9uQ2F0YWxvZ0VudHJ5W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwTmF2aWdhdGlvbkVudHJ5IGV4dGVuZHMgUGxhbm5lck5hdmlnYXRpb25DYXRhbG9nRW50cnkge1xuICBpZDogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICBwYXRoUGF0dGVybj86IFJlZ0V4cDtcbiAgbm90ZXM/OiBzdHJpbmdbXTtcbn1cblxuY29uc3QgY3JlYXRlRW50cnkgPSAoXG4gIGVudHJ5OiBPbWl0PFBsYW5uZXJOYXZpZ2F0aW9uQ2F0YWxvZ0VudHJ5LCBcImFjdGlvbk5hbWVcIiB8IFwiYWxpYXNlc1wiIHwgXCJicmVhZGNydW1ic1wiIHwgXCJwYXJlbnRzXCIgfCBcImludGVudFRhZ3NcIj4gJlxuICAgIFBpY2s8QXBwTmF2aWdhdGlvbkVudHJ5LCBcImlkXCIgfCBcImRlc2NyaXB0aW9uXCI+ICYge1xuICAgICAgYWxpYXNlcz86IHN0cmluZ1tdO1xuICAgICAgYnJlYWRjcnVtYnM/OiBzdHJpbmdbXTtcbiAgICAgIHBhcmVudHM/OiBzdHJpbmdbXTtcbiAgICAgIGludGVudFRhZ3M/OiBzdHJpbmdbXTtcbiAgICAgIG5vdGVzPzogc3RyaW5nW107XG4gICAgICBwYXRoUGF0dGVybj86IFJlZ0V4cDtcbiAgICB9XG4pOiBBcHBOYXZpZ2F0aW9uRW50cnkgPT4gKHtcbiAgYWN0aW9uTmFtZTogXCJuYXZpZ2F0aW9uLmdvX3RvXCIsXG4gIGFsaWFzZXM6IFtdLFxuICBicmVhZGNydW1iczogW10sXG4gIHBhcmVudHM6IFtdLFxuICBpbnRlbnRUYWdzOiBbXSxcbiAgLi4uZW50cnksXG59KTtcblxuY29uc3QgQVBQX05BVklHQVRJT05fRU5UUklFUzogQXBwTmF2aWdhdGlvbkVudHJ5W10gPSBbXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJob21lXCIsXG4gICAgdGl0bGU6IFwiSG9tZVwiLFxuICAgIHJvdXRlOiBcIi9cIixcbiAgICBkZXNjcmlwdGlvbjogXCJMYW5kaW5nIHByaW5jaXBhbCBkZSBWaWN0b3J5IENyYWZ0LlwiLFxuICAgIHNlY3Rpb246IFwiZ2VuZXJhbFwiLFxuICAgIHBhZ2U6IFwiaG9tZVwiLFxuICAgIHN1YnBhZ2U6IFwibGFuZGluZ1wiLFxuICAgIGFsaWFzZXM6IFtcImluaWNpb1wiLCBcImhvbWVcIiwgXCJwb3J0YWRhXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJIb21lXCJdLFxuICAgIGludGVudFRhZ3M6IFtcImhvbWVcIiwgXCJsYW5kaW5nXCIsIFwiZ2VuZXJhbFwiXSxcbiAgICBpc0xhbmRpbmc6IHRydWUsXG4gICAgcG9wdWxhcml0eTogMSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJsb2dpblwiLFxuICAgIHRpdGxlOiBcIkxvZ2luXCIsXG4gICAgcm91dGU6IFwiL2xvZ2luXCIsXG4gICAgZGVzY3JpcHRpb246IFwiQWNjZXNvIGRlIHVzdWFyaW9zLlwiLFxuICAgIHNlY3Rpb246IFwiZ2VuZXJhbFwiLFxuICAgIHBhZ2U6IFwiYXV0aFwiLFxuICAgIHN1YnBhZ2U6IFwibG9naW5cIixcbiAgICBhbGlhc2VzOiBbXCJsb2dpblwiLCBcImluaWNpYXIgc2VzaW9uXCIsIFwiYWNjZXNvXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJMb2dpblwiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJhdXRoXCIsIFwibG9naW5cIl0sXG4gICAgaXNMYW5kaW5nOiBmYWxzZSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJyZWdpc3RlclwiLFxuICAgIHRpdGxlOiBcIlJlZ2lzdGVyXCIsXG4gICAgcm91dGU6IFwiL3JlZ2lzdGVyXCIsXG4gICAgZGVzY3JpcHRpb246IFwiUmVnaXN0cm8gZGUgdXN1YXJpb3MuXCIsXG4gICAgc2VjdGlvbjogXCJnZW5lcmFsXCIsXG4gICAgcGFnZTogXCJhdXRoXCIsXG4gICAgc3VicGFnZTogXCJyZWdpc3RlclwiLFxuICAgIGFsaWFzZXM6IFtcInJlZ2lzdHJvXCIsIFwicmVnaXN0ZXJcIiwgXCJjcmVhciBjdWVudGFcIl0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIlJlZ2lzdGVyXCJdLFxuICAgIGludGVudFRhZ3M6IFtcImF1dGhcIiwgXCJyZWdpc3RlclwiXSxcbiAgICBpc0xhbmRpbmc6IGZhbHNlLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcInVzZXJzXCIsXG4gICAgdGl0bGU6IFwiVXNlcnNcIixcbiAgICByb3V0ZTogXCIvdXNlcnNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJWaXN0YSBwcml2YWRhIGRlIHVzdWFyaW9zLlwiLFxuICAgIHNlY3Rpb246IFwiZ2VuZXJhbFwiLFxuICAgIHBhZ2U6IFwidXNlcnNcIixcbiAgICBzdWJwYWdlOiBcImxpc3RcIixcbiAgICBhbGlhc2VzOiBbXCJ1c3Vhcmlvc1wiLCBcInVzZXJzXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJVc2Vyc1wiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJ1c2Vyc1wiLCBcImFkbWluXCJdLFxuICAgIGlzTGFuZGluZzogZmFsc2UsXG4gIH0pLFxuICBjcmVhdGVFbnRyeSh7XG4gICAgaWQ6IFwiZmllbGRzX2xpc3RcIixcbiAgICB0aXRsZTogXCJGaWVsZHMgTGlzdFwiLFxuICAgIHJvdXRlOiBcIi9maWVsZHNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJMaXN0YWRvIHByaW5jaXBhbCBkZSBjYW5jaGFzLlwiLFxuICAgIHNlY3Rpb246IFwiZmllbGRzXCIsXG4gICAgcGFnZTogXCJmaWVsZHNcIixcbiAgICBzdWJwYWdlOiBcImxpc3RcIixcbiAgICBhbGlhc2VzOiBbXCJmaWVsZHNcIiwgXCJjYW5jaGFzXCIsIFwibGlzdGFkbyBkZSBjYW5jaGFzXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJGaWVsZHNcIl0sXG4gICAgaW50ZW50VGFnczogW1wiZmllbGRzXCIsIFwibGlzdFwiXSxcbiAgICBpc0xhbmRpbmc6IHRydWUsXG4gICAgcG9wdWxhcml0eTogMC45NSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJmaWVsZF9jcmVhdGVcIixcbiAgICB0aXRsZTogXCJGaWVsZCBDcmVhdGVcIixcbiAgICByb3V0ZTogXCIvZmllbGRzL25ld1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkZvcm11bGFyaW8gcGFyYSBjcmVhciB1bmEgY2FuY2hhLlwiLFxuICAgIHNlY3Rpb246IFwiZmllbGRzXCIsXG4gICAgcGFnZTogXCJmaWVsZHNcIixcbiAgICBzdWJwYWdlOiBcImNyZWF0ZVwiLFxuICAgIGFsaWFzZXM6IFtcImNyZWFyIGNhbmNoYVwiLCBcIm51ZXZhIGNhbmNoYVwiLCBcIm5ldyBmaWVsZFwiXSxcbiAgICBicmVhZGNydW1iczogW1wiRmllbGRzXCIsIFwiQ3JlYXRlXCJdLFxuICAgIHBhcmVudHM6IFtcIi9maWVsZHNcIl0sXG4gICAgaW50ZW50VGFnczogW1wiZmllbGRzXCIsIFwiY3JlYXRlXCJdLFxuICAgIGlzTGFuZGluZzogZmFsc2UsXG4gIH0pLFxuICBjcmVhdGVFbnRyeSh7XG4gICAgaWQ6IFwiZmllbGRfZWRpdFwiLFxuICAgIHRpdGxlOiBcIkZpZWxkIEVkaXRcIixcbiAgICByb3V0ZTogXCIvZmllbGRzL2VkaXQvOmlkXCIsXG4gICAgZGVzY3JpcHRpb246IFwiRm9ybXVsYXJpbyBwYXJhIGVkaXRhciB1bmEgY2FuY2hhIGV4aXN0ZW50ZS5cIixcbiAgICBzZWN0aW9uOiBcImZpZWxkc1wiLFxuICAgIHBhZ2U6IFwiZmllbGRzXCIsXG4gICAgc3VicGFnZTogXCJlZGl0XCIsXG4gICAgYWxpYXNlczogW1wiZWRpdGFyIGNhbmNoYVwiLCBcImVkaXQgZmllbGRcIl0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIkZpZWxkc1wiLCBcIkVkaXRcIl0sXG4gICAgcGFyZW50czogW1wiL2ZpZWxkc1wiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJmaWVsZHNcIiwgXCJlZGl0XCJdLFxuICAgIGlzTGFuZGluZzogZmFsc2UsXG4gICAgcGF0aFBhdHRlcm46IC9eXFwvZmllbGRzXFwvZWRpdFxcL1teL10rXFwvPyQvLFxuICAgIG5vdGVzOiBbXCJSdXRhIGRpbmFtaWNhOiByZXF1aWVyZSBpZCBkZSBsYSBjYW5jaGEuXCJdLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcImZpZWxkX3Jlc2VydmF0aW9uc1wiLFxuICAgIHRpdGxlOiBcIkZpZWxkIFJlc2VydmF0aW9uc1wiLFxuICAgIHJvdXRlOiBcIi9maWVsZHMvOmlkL3Jlc2VydmF0aW9uc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlc2VydmFzIGFzb2NpYWRhcyBhIHVuYSBjYW5jaGEgZXNwZWNpZmljYS5cIixcbiAgICBzZWN0aW9uOiBcImZpZWxkc1wiLFxuICAgIHBhZ2U6IFwiZmllbGRzXCIsXG4gICAgc3VicGFnZTogXCJyZXNlcnZhdGlvbnNcIixcbiAgICBhbGlhc2VzOiBbXCJyZXNlcnZhcyBkZSBjYW5jaGFcIiwgXCJmaWVsZCByZXNlcnZhdGlvbnNcIl0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIkZpZWxkc1wiLCBcIlJlc2VydmF0aW9uc1wiXSxcbiAgICBwYXJlbnRzOiBbXCIvZmllbGRzXCJdLFxuICAgIGludGVudFRhZ3M6IFtcImZpZWxkc1wiLCBcInJlc2VydmF0aW9uc1wiXSxcbiAgICBpc0xhbmRpbmc6IGZhbHNlLFxuICAgIHBhdGhQYXR0ZXJuOiAvXlxcL2ZpZWxkc1xcL1teL10rXFwvcmVzZXJ2YXRpb25zXFwvPyQvLFxuICAgIG5vdGVzOiBbXCJSdXRhIGRpbmFtaWNhOiByZXF1aWVyZSBpZCBkZSBsYSBjYW5jaGEuXCJdLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcInJlc2VydmF0aW9uc19kYXNoYm9hcmRcIixcbiAgICB0aXRsZTogXCJSZXNlcnZhdGlvbnNcIixcbiAgICByb3V0ZTogXCIvcmVzZXJ2YXRpb25zXCIsXG4gICAgZGVzY3JpcHRpb246IFwiVmlzdGEgcHJpbmNpcGFsIGRlIHJlc2VydmFzLlwiLFxuICAgIHNlY3Rpb246IFwicmVzZXJ2YXRpb25zXCIsXG4gICAgcGFnZTogXCJyZXNlcnZhdGlvbnNcIixcbiAgICBzdWJwYWdlOiBcImRhc2hib2FyZFwiLFxuICAgIGFsaWFzZXM6IFtcInJlc2VydmFzXCIsIFwicmVzZXJ2YXRpb25zXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJSZXNlcnZhdGlvbnNcIl0sXG4gICAgaW50ZW50VGFnczogW1wicmVzZXJ2YXRpb25zXCIsIFwiZGFzaGJvYXJkXCJdLFxuICAgIGlzTGFuZGluZzogdHJ1ZSxcbiAgICBwb3B1bGFyaXR5OiAwLjksXG4gIH0pLFxuICBjcmVhdGVFbnRyeSh7XG4gICAgaWQ6IFwicmVzZXJ2YXRpb25zX2Zvcl9maWVsZFwiLFxuICAgIHRpdGxlOiBcIlJlc2VydmF0aW9ucyBGb3IgRmllbGRcIixcbiAgICByb3V0ZTogXCIvcmVzZXJ2YXRpb25zLzpmaWVsZElkXCIsXG4gICAgZGVzY3JpcHRpb246IFwiVmlzdGEgZGUgcmVzZXJ2YXMgcGFyYSB1bmEgY2FuY2hhIGNvbmNyZXRhLlwiLFxuICAgIHNlY3Rpb246IFwicmVzZXJ2YXRpb25zXCIsXG4gICAgcGFnZTogXCJyZXNlcnZhdGlvbnNcIixcbiAgICBzdWJwYWdlOiBcImZpZWxkXCIsXG4gICAgYWxpYXNlczogW1wicmVzZXJ2YXMgcG9yIGNhbmNoYVwiLCBcInJlc2VydmF0aW9ucyBmb3IgZmllbGRcIl0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIlJlc2VydmF0aW9uc1wiLCBcIkZpZWxkXCJdLFxuICAgIHBhcmVudHM6IFtcIi9yZXNlcnZhdGlvbnNcIiwgXCIvZmllbGRzXCJdLFxuICAgIGludGVudFRhZ3M6IFtcInJlc2VydmF0aW9uc1wiLCBcImZpZWxkXCJdLFxuICAgIGlzTGFuZGluZzogZmFsc2UsXG4gICAgcGF0aFBhdHRlcm46IC9eXFwvcmVzZXJ2YXRpb25zXFwvW14vXStcXC8/JC8sXG4gICAgbm90ZXM6IFtcIlJ1dGEgZGluYW1pY2E6IHJlcXVpZXJlIGZpZWxkSWQuXCJdLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcInJlc2VydmF0aW9uX2NyZWF0ZVwiLFxuICAgIHRpdGxlOiBcIlJlc2VydmF0aW9uIENyZWF0ZVwiLFxuICAgIHJvdXRlOiBcIi9yZXNlcnZhdGlvbnMvbmV3XCIsXG4gICAgZGVzY3JpcHRpb246IFwiRm9ybXVsYXJpbyBwYXJhIGNyZWFyIHVuYSByZXNlcnZhIHNpbiBjYW5jaGEgcHJlc2VsZWNjaW9uYWRhLlwiLFxuICAgIHNlY3Rpb246IFwicmVzZXJ2YXRpb25zXCIsXG4gICAgcGFnZTogXCJyZXNlcnZhdGlvbnNcIixcbiAgICBzdWJwYWdlOiBcImNyZWF0ZVwiLFxuICAgIGFsaWFzZXM6IFtcIm51ZXZhIHJlc2VydmFcIiwgXCJjcmVhciByZXNlcnZhXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJSZXNlcnZhdGlvbnNcIiwgXCJDcmVhdGVcIl0sXG4gICAgcGFyZW50czogW1wiL3Jlc2VydmF0aW9uc1wiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJyZXNlcnZhdGlvbnNcIiwgXCJjcmVhdGVcIl0sXG4gICAgaXNMYW5kaW5nOiBmYWxzZSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJyZXNlcnZhdGlvbl9jcmVhdGVfZm9yX2ZpZWxkXCIsXG4gICAgdGl0bGU6IFwiUmVzZXJ2YXRpb24gQ3JlYXRlIEZvciBGaWVsZFwiLFxuICAgIHJvdXRlOiBcIi9yZXNlcnZhdGlvbnMvbmV3LzpmaWVsZElkXCIsXG4gICAgZGVzY3JpcHRpb246IFwiRm9ybXVsYXJpbyBwYXJhIGNyZWFyIHVuYSByZXNlcnZhIGRlc2RlIHVuYSBjYW5jaGEgY29uY3JldGEuXCIsXG4gICAgc2VjdGlvbjogXCJyZXNlcnZhdGlvbnNcIixcbiAgICBwYWdlOiBcInJlc2VydmF0aW9uc1wiLFxuICAgIHN1YnBhZ2U6IFwiY3JlYXRlLWZpZWxkXCIsXG4gICAgYWxpYXNlczogW1wibnVldmEgcmVzZXJ2YSBkZSBjYW5jaGFcIiwgXCJjcmVhciByZXNlcnZhIHBhcmEgY2FuY2hhXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJSZXNlcnZhdGlvbnNcIiwgXCJDcmVhdGVcIiwgXCJGaWVsZFwiXSxcbiAgICBwYXJlbnRzOiBbXCIvcmVzZXJ2YXRpb25zXCIsIFwiL2ZpZWxkc1wiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJyZXNlcnZhdGlvbnNcIiwgXCJjcmVhdGVcIiwgXCJmaWVsZFwiXSxcbiAgICBpc0xhbmRpbmc6IGZhbHNlLFxuICAgIHBhdGhQYXR0ZXJuOiAvXlxcL3Jlc2VydmF0aW9uc1xcL25ld1xcL1teL10rXFwvPyQvLFxuICAgIG5vdGVzOiBbXCJSdXRhIGRpbmFtaWNhOiByZXF1aWVyZSBmaWVsZElkLlwiXSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJyZXNlcnZhdGlvbl9lZGl0XCIsXG4gICAgdGl0bGU6IFwiUmVzZXJ2YXRpb24gRWRpdFwiLFxuICAgIHJvdXRlOiBcIi9yZXNlcnZhdGlvbnMvZWRpdC86aWRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJGb3JtdWxhcmlvIHBhcmEgZWRpdGFyIHVuYSByZXNlcnZhIGV4aXN0ZW50ZS5cIixcbiAgICBzZWN0aW9uOiBcInJlc2VydmF0aW9uc1wiLFxuICAgIHBhZ2U6IFwicmVzZXJ2YXRpb25zXCIsXG4gICAgc3VicGFnZTogXCJlZGl0XCIsXG4gICAgYWxpYXNlczogW1wiZWRpdGFyIHJlc2VydmFcIiwgXCJlZGl0IHJlc2VydmF0aW9uXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJSZXNlcnZhdGlvbnNcIiwgXCJFZGl0XCJdLFxuICAgIHBhcmVudHM6IFtcIi9yZXNlcnZhdGlvbnNcIl0sXG4gICAgaW50ZW50VGFnczogW1wicmVzZXJ2YXRpb25zXCIsIFwiZWRpdFwiXSxcbiAgICBpc0xhbmRpbmc6IGZhbHNlLFxuICAgIHBhdGhQYXR0ZXJuOiAvXlxcL3Jlc2VydmF0aW9uc1xcL2VkaXRcXC9bXi9dK1xcLz8kLyxcbiAgICBub3RlczogW1wiUnV0YSBkaW5hbWljYTogcmVxdWllcmUgaWQgZGUgbGEgcmVzZXJ2YS5cIl0sXG4gIH0pLFxuICBjcmVhdGVFbnRyeSh7XG4gICAgaWQ6IFwic2xvdHNfbGlzdFwiLFxuICAgIHRpdGxlOiBcIlNsb3RzXCIsXG4gICAgcm91dGU6IFwiL3Nsb3RzXCIsXG4gICAgZGVzY3JpcHRpb246IFwiTGlzdGFkbyBwcmluY2lwYWwgZGUgc2xvdHMuXCIsXG4gICAgc2VjdGlvbjogXCJzbG90c1wiLFxuICAgIHBhZ2U6IFwic2xvdHNcIixcbiAgICBzdWJwYWdlOiBcImxpc3RcIixcbiAgICBhbGlhc2VzOiBbXCJzbG90c1wiLCBcImhvcmFyaW9zXCIsIFwidHVybm9zXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJTbG90c1wiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJzbG90c1wiLCBcImxpc3RcIl0sXG4gICAgaXNMYW5kaW5nOiB0cnVlLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcInNsb3RfY3JlYXRlXCIsXG4gICAgdGl0bGU6IFwiU2xvdCBDcmVhdGVcIixcbiAgICByb3V0ZTogXCIvc2xvdHMvbmV3LzpmaWVsZElkXCIsXG4gICAgZGVzY3JpcHRpb246IFwiRm9ybXVsYXJpbyBwYXJhIGNyZWFyIHVuIHNsb3QgcGFyYSB1bmEgY2FuY2hhLlwiLFxuICAgIHNlY3Rpb246IFwic2xvdHNcIixcbiAgICBwYWdlOiBcInNsb3RzXCIsXG4gICAgc3VicGFnZTogXCJjcmVhdGVcIixcbiAgICBhbGlhc2VzOiBbXCJudWV2byBzbG90XCIsIFwiY3JlYXIgc2xvdFwiXSxcbiAgICBicmVhZGNydW1iczogW1wiU2xvdHNcIiwgXCJDcmVhdGVcIl0sXG4gICAgcGFyZW50czogW1wiL3Nsb3RzXCIsIFwiL2ZpZWxkc1wiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJzbG90c1wiLCBcImNyZWF0ZVwiXSxcbiAgICBpc0xhbmRpbmc6IGZhbHNlLFxuICAgIHBhdGhQYXR0ZXJuOiAvXlxcL3Nsb3RzXFwvbmV3XFwvW14vXStcXC8/JC8sXG4gICAgbm90ZXM6IFtcIlJ1dGEgZGluYW1pY2E6IHJlcXVpZXJlIGZpZWxkSWQuXCJdLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcInNsb3RfZWRpdFwiLFxuICAgIHRpdGxlOiBcIlNsb3QgRWRpdFwiLFxuICAgIHJvdXRlOiBcIi9zbG90cy9lZGl0LzppZFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkZvcm11bGFyaW8gcGFyYSBlZGl0YXIgdW4gc2xvdCBleGlzdGVudGUuXCIsXG4gICAgc2VjdGlvbjogXCJzbG90c1wiLFxuICAgIHBhZ2U6IFwic2xvdHNcIixcbiAgICBzdWJwYWdlOiBcImVkaXRcIixcbiAgICBhbGlhc2VzOiBbXCJlZGl0YXIgc2xvdFwiLCBcImVkaXQgc2xvdFwiXSxcbiAgICBicmVhZGNydW1iczogW1wiU2xvdHNcIiwgXCJFZGl0XCJdLFxuICAgIHBhcmVudHM6IFtcIi9zbG90c1wiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJzbG90c1wiLCBcImVkaXRcIl0sXG4gICAgaXNMYW5kaW5nOiBmYWxzZSxcbiAgICBwYXRoUGF0dGVybjogL15cXC9zbG90c1xcL2VkaXRcXC9bXi9dK1xcLz8kLyxcbiAgICBub3RlczogW1wiUnV0YSBkaW5hbWljYTogcmVxdWllcmUgaWQgZGVsIHNsb3QuXCJdLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcInZpZGVvc19kYXNoYm9hcmRcIixcbiAgICB0aXRsZTogXCJWaWRlb3MgRGFzaGJvYXJkXCIsXG4gICAgcm91dGU6IFwiL3ZpZGVvcy9zdWJwYWdlcy9kYXNoYm9hcmRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJEYXNoYm9hcmQgcHJpbmNpcGFsIGRlbCBtb2R1bG8gZGUgdmlkZW9zLlwiLFxuICAgIHNlY3Rpb246IFwidmlkZW9zXCIsXG4gICAgcGFnZTogXCJ2aWRlb3NcIixcbiAgICBzdWJwYWdlOiBcImRhc2hib2FyZFwiLFxuICAgIGFsaWFzZXM6IFtcbiAgICAgIFwidmlkZW9zXCIsXG4gICAgICBcImRhc2hib2FyZCBkZSB2aWRlb3NcIixcbiAgICAgIFwidmlkZW9zIGRhc2hib2FyZFwiLFxuICAgICAgXCIvZmllbGRzL3ZpZGVvc1wiLFxuICAgICAgXCIvc3VicGFnZXNcIixcbiAgICBdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJWaWRlb3NcIiwgXCJEYXNoYm9hcmRcIl0sXG4gICAgaW50ZW50VGFnczogW1widmlkZW9zXCIsIFwiZGFzaGJvYXJkXCJdLFxuICAgIGlzTGFuZGluZzogdHJ1ZSxcbiAgICBwb3B1bGFyaXR5OiAwLjg4LFxuICAgIG5vdGVzOiBbXCJBbGlhcyBkZSBhY2Nlc286IC9maWVsZHMvdmlkZW9zIHkgL3N1YnBhZ2VzIHJlZGlyaWdlbiBhcXVpIG8gYWwgbW9kdWxvIHZpZGVvcy5cIl0sXG4gIH0pLFxuICBjcmVhdGVFbnRyeSh7XG4gICAgaWQ6IFwidmlkZW9zX3N0cmVhbWluZ190aW1lbGluZVwiLFxuICAgIHRpdGxlOiBcIlZpZGVvcyBTdHJlYW1pbmcgVGltZWxpbmVcIixcbiAgICByb3V0ZTogXCIvdmlkZW9zL3N1YnBhZ2VzL3N0cmVhbWluZy90aW1lbGluZVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlN1YnBhZ2luYSBkZSB0aW1lbGluZSBvIGxpbmVhIGRlIHRpZW1wbyBwYXJhIHNlc2lvbmVzIGRlIHN0cmVhbWluZy5cIixcbiAgICBzZWN0aW9uOiBcInZpZGVvc1wiLFxuICAgIHBhZ2U6IFwidmlkZW9zXCIsXG4gICAgc3VicGFnZTogXCJzdHJlYW1pbmctdGltZWxpbmVcIixcbiAgICBhbGlhc2VzOiBbXG4gICAgICBcInRpbWVsaW5lXCIsXG4gICAgICBcImxpbmVhIGRlIHRpZW1wb1wiLFxuICAgICAgXCJsXHUwMEVEbmVhIGRlIHRpZW1wb1wiLFxuICAgICAgXCJzZXNzaW9uIHRpbWVsaW5lXCIsXG4gICAgICBcInN0cmVhbWluZyB0aW1lbGluZVwiLFxuICAgIF0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIlZpZGVvc1wiLCBcIlN0cmVhbWluZ1wiLCBcIlRpbWVsaW5lXCJdLFxuICAgIHBhcmVudHM6IFtcIi92aWRlb3Mvc3VicGFnZXMvZGFzaGJvYXJkXCJdLFxuICAgIGludGVudFRhZ3M6IFtcInZpZGVvc1wiLCBcInN0cmVhbWluZ1wiLCBcInRpbWVsaW5lXCJdLFxuICAgIGlzTGFuZGluZzogZmFsc2UsXG4gIH0pLFxuICBjcmVhdGVFbnRyeSh7XG4gICAgaWQ6IFwidmlkZW9zX3N0cmVhbWluZ19yZWNvcmRpbmdcIixcbiAgICB0aXRsZTogXCJWaWRlb3MgU3RyZWFtaW5nIFJlY29yZGluZ1wiLFxuICAgIHJvdXRlOiBcIi92aWRlb3Mvc3VicGFnZXMvc3RyZWFtaW5nL3JlY29yZGluZ1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlN1YnBhZ2luYSBwYXJhIGdyYWJhciBvIHN1YmlyIHZpZGVvcyBkZW50cm8gZGVsIG1vZHVsbyBkZSB2aWRlb3MuXCIsXG4gICAgc2VjdGlvbjogXCJ2aWRlb3NcIixcbiAgICBwYWdlOiBcInZpZGVvc1wiLFxuICAgIHN1YnBhZ2U6IFwic3RyZWFtaW5nLXJlY29yZGluZ1wiLFxuICAgIGFsaWFzZXM6IFtcbiAgICAgIFwiZ3JhYmFjaW9uXCIsXG4gICAgICBcImdyYWJhY2lcdTAwRjNuXCIsXG4gICAgICBcImdyYWJhY2lvbmVzXCIsXG4gICAgICBcInJlY29yZGluZ1wiLFxuICAgICAgXCJwYWdpbmEgZGUgZ3JhYmFjaW9uZXNcIixcbiAgICAgIFwicGFudGFsbGEgZGUgZ3JhYmFjaW9uXCIsXG4gICAgICBcInBhbnRhbGxhIGRlIGdyYWJhY2lcdTAwRjNuXCIsXG4gICAgICBcImdyYWJhclwiLFxuICAgIF0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIlZpZGVvc1wiLCBcIlN0cmVhbWluZ1wiLCBcIlJlY29yZGluZ1wiXSxcbiAgICBwYXJlbnRzOiBbXCIvdmlkZW9zL3N1YnBhZ2VzL2Rhc2hib2FyZFwiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJ2aWRlb3NcIiwgXCJzdHJlYW1pbmdcIiwgXCJyZWNvcmRpbmdcIiwgXCJ1cGxvYWRcIl0sXG4gICAgaXNMYW5kaW5nOiBmYWxzZSxcbiAgICBub3RlczogW1xuICAgICAgXCJTdWVsZSB1c2Fyc2UgY29uIHF1ZXJ5IHRvdXJuYW1lbnRNYXRjaElkLCB0aXRsZSB5IGF1dG9DcmVhdGVTZXNzaW9uLlwiLFxuICAgICAgXCJTaSBlbCB1c3VhcmlvIHBpZGUgZ3JhYmFjaW9uZXMgbyBzdWJpciB2aWRlb3MsIGVzdGEgc3VicGFnaW5hIGVzIG1hcyBlc3BlY2lmaWNhIHF1ZSBlbCBkYXNoYm9hcmQgZGUgdmlkZW9zLlwiLFxuICAgIF0sXG4gIH0pLFxuICBjcmVhdGVFbnRyeSh7XG4gICAgaWQ6IFwidmlkZW9fdXBkYXRlXCIsXG4gICAgdGl0bGU6IFwiVmlkZW8gVXBkYXRlXCIsXG4gICAgcm91dGU6IFwiL3ZpZGVvcy86dmlkZW9JZC91cGRhdGVcIixcbiAgICBkZXNjcmlwdGlvbjogXCJFZGljaW9uIGRlIHVuIHZpZGVvIGNvbmNyZXRvLlwiLFxuICAgIHNlY3Rpb246IFwidmlkZW9zXCIsXG4gICAgcGFnZTogXCJ2aWRlb3NcIixcbiAgICBzdWJwYWdlOiBcImVkaXRcIixcbiAgICBhbGlhc2VzOiBbXCJlZGl0YXIgdmlkZW9cIiwgXCJ1cGRhdGUgdmlkZW9cIl0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIlZpZGVvc1wiLCBcIkVkaXRcIl0sXG4gICAgcGFyZW50czogW1wiL3ZpZGVvcy9zdWJwYWdlcy9kYXNoYm9hcmRcIl0sXG4gICAgaW50ZW50VGFnczogW1widmlkZW9zXCIsIFwiZWRpdFwiXSxcbiAgICBpc0xhbmRpbmc6IGZhbHNlLFxuICAgIHBhdGhQYXR0ZXJuOiAvXlxcL3ZpZGVvc1xcL1teL10rXFwvdXBkYXRlXFwvPyQvLFxuICAgIG5vdGVzOiBbXCJSdXRhIGRpbmFtaWNhOiByZXF1aWVyZSB2aWRlb0lkLlwiXSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJ2aWRlb3NfZmllbGRfY3JlYXRlXCIsXG4gICAgdGl0bGU6IFwiRmllbGQgVmlkZW8gQ3JlYXRlXCIsXG4gICAgcm91dGU6IFwiL3ZpZGVvcy9maWVsZHMvOmZpZWxkSWQvdmlkZW9zL2NyZWF0ZVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkNyZWFjaW9uIGRlIHZpZGVvIGRlc2RlIGVsIGNvbnRleHRvIGRlIHVuYSBjYW5jaGEuXCIsXG4gICAgc2VjdGlvbjogXCJ2aWRlb3NcIixcbiAgICBwYWdlOiBcInZpZGVvc1wiLFxuICAgIHN1YnBhZ2U6IFwiZmllbGQtY3JlYXRlXCIsXG4gICAgYWxpYXNlczogW1wiY3JlYXIgdmlkZW9cIiwgXCJzdWJpciB2aWRlbyBwYXJhIGNhbmNoYVwiXSxcbiAgICBicmVhZGNydW1iczogW1wiVmlkZW9zXCIsIFwiQ3JlYXRlXCJdLFxuICAgIHBhcmVudHM6IFtcIi92aWRlb3Mvc3VicGFnZXMvZGFzaGJvYXJkXCIsIFwiL2ZpZWxkc1wiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJ2aWRlb3NcIiwgXCJjcmVhdGVcIiwgXCJmaWVsZFwiXSxcbiAgICBpc0xhbmRpbmc6IGZhbHNlLFxuICAgIHBhdGhQYXR0ZXJuOiAvXlxcL3ZpZGVvc1xcL2ZpZWxkc1xcL1teL10rXFwvdmlkZW9zXFwvY3JlYXRlXFwvPyQvLFxuICAgIG5vdGVzOiBbXCJSdXRhIGRpbmFtaWNhOiByZXF1aWVyZSBmaWVsZElkLlwiXSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJ0b3VybmFtZW50c19kYXNoYm9hcmRcIixcbiAgICB0aXRsZTogXCJUb3VybmFtZW50cyBEYXNoYm9hcmRcIixcbiAgICByb3V0ZTogXCIvdG91cm5hbWVudHMvc3VicGFnZXMvZGFzaGJvYXJkXCIsXG4gICAgZGVzY3JpcHRpb246IFwiUGFudGFsbGEgcHJpbmNpcGFsIGRlbCBtb2R1bG8gZGUgdG9ybmVvcy5cIixcbiAgICBzZWN0aW9uOiBcInRvdXJuYW1lbnRzXCIsXG4gICAgcGFnZTogXCJ0b3VybmFtZW50c1wiLFxuICAgIHN1YnBhZ2U6IFwiZGFzaGJvYXJkXCIsXG4gICAgYWxpYXNlczogW1widG9ybmVvc1wiLCBcInRvdXJuYW1lbnRzXCIsIFwiZGFzaGJvYXJkIGRlIHRvcm5lb3NcIl0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIlRvdXJuYW1lbnRzXCIsIFwiRGFzaGJvYXJkXCJdLFxuICAgIGludGVudFRhZ3M6IFtcInRvdXJuYW1lbnRzXCIsIFwiZGFzaGJvYXJkXCJdLFxuICAgIGlzTGFuZGluZzogdHJ1ZSxcbiAgICBwb3B1bGFyaXR5OiAwLjgyLFxuICAgIG5vdGVzOiBbXCJQdWVkZSB1c2Fyc2UgY29uIGhhc2ggI3RvdXJuYW1lbnQtZm9ybSBwYXJhIGFicmlyIGVsIGZvcm11bGFyaW8gZGUgY3JlYWNpb24uXCJdLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcInRvdXJuYW1lbnRzX2xpc3RcIixcbiAgICB0aXRsZTogXCJUb3VybmFtZW50cyBTdWJwYWdlXCIsXG4gICAgcm91dGU6IFwiL3RvdXJuYW1lbnRzL3N1YnBhZ2VzL3RvdXJuYW1lbnRzXCIsXG4gICAgZGVzY3JpcHRpb246IFwiU3VicGFnaW5hIGRlIHRvcm5lb3MgZGVudHJvIGRlbCBtb2R1bG8gZGUgdG9ybmVvcy5cIixcbiAgICBzZWN0aW9uOiBcInRvdXJuYW1lbnRzXCIsXG4gICAgcGFnZTogXCJ0b3VybmFtZW50c1wiLFxuICAgIHN1YnBhZ2U6IFwidG91cm5hbWVudHNcIixcbiAgICBhbGlhc2VzOiBbXCJzdWJwYWdpbmEgZGUgdG9ybmVvc1wiLCBcImxpc3RhIGRlIHRvcm5lb3NcIl0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIlRvdXJuYW1lbnRzXCIsIFwiVG91cm5hbWVudHNcIl0sXG4gICAgcGFyZW50czogW1wiL3RvdXJuYW1lbnRzL3N1YnBhZ2VzL2Rhc2hib2FyZFwiXSxcbiAgICBpbnRlbnRUYWdzOiBbXCJ0b3VybmFtZW50c1wiLCBcImxpc3RcIl0sXG4gICAgaXNMYW5kaW5nOiBmYWxzZSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJ0b3VybmFtZW50c190ZWFtc1wiLFxuICAgIHRpdGxlOiBcIlRlYW1zIFN1YnBhZ2VcIixcbiAgICByb3V0ZTogXCIvdG91cm5hbWVudHMvc3VicGFnZXMvdGVhbXNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdWJwYWdpbmEgZGUgZXF1aXBvcyBkZW50cm8gZGVsIG1vZHVsbyBkZSB0b3JuZW9zLlwiLFxuICAgIHNlY3Rpb246IFwidG91cm5hbWVudHNcIixcbiAgICBwYWdlOiBcInRvdXJuYW1lbnRzXCIsXG4gICAgc3VicGFnZTogXCJ0ZWFtc1wiLFxuICAgIGFsaWFzZXM6IFtcImVxdWlwb3NcIiwgXCJ0ZWFtc1wiXSxcbiAgICBicmVhZGNydW1iczogW1wiVG91cm5hbWVudHNcIiwgXCJUZWFtc1wiXSxcbiAgICBwYXJlbnRzOiBbXCIvdG91cm5hbWVudHMvc3VicGFnZXMvZGFzaGJvYXJkXCJdLFxuICAgIGludGVudFRhZ3M6IFtcInRvdXJuYW1lbnRzXCIsIFwidGVhbXNcIl0sXG4gICAgaXNMYW5kaW5nOiBmYWxzZSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJ0b3VybmFtZW50c19wbGF5ZXJzXCIsXG4gICAgdGl0bGU6IFwiUGxheWVycyBTdWJwYWdlXCIsXG4gICAgcm91dGU6IFwiL3RvdXJuYW1lbnRzL3N1YnBhZ2VzL3BsYXllcnNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdWJwYWdpbmEgZGUganVnYWRvcmVzIGRlbnRybyBkZWwgbW9kdWxvIGRlIHRvcm5lb3MuXCIsXG4gICAgc2VjdGlvbjogXCJ0b3VybmFtZW50c1wiLFxuICAgIHBhZ2U6IFwidG91cm5hbWVudHNcIixcbiAgICBzdWJwYWdlOiBcInBsYXllcnNcIixcbiAgICBhbGlhc2VzOiBbXCJqdWdhZG9yZXMgZGUgdG9ybmVvc1wiLCBcInBsYXllcnNcIl0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIlRvdXJuYW1lbnRzXCIsIFwiUGxheWVyc1wiXSxcbiAgICBwYXJlbnRzOiBbXCIvdG91cm5hbWVudHMvc3VicGFnZXMvZGFzaGJvYXJkXCJdLFxuICAgIGludGVudFRhZ3M6IFtcInRvdXJuYW1lbnRzXCIsIFwicGxheWVyc1wiXSxcbiAgICBpc0xhbmRpbmc6IGZhbHNlLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcInRvdXJuYW1lbnRzX21hdGNoZXNcIixcbiAgICB0aXRsZTogXCJNYXRjaGVzIFN1YnBhZ2VcIixcbiAgICByb3V0ZTogXCIvdG91cm5hbWVudHMvc3VicGFnZXMvbWF0Y2hlc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlN1YnBhZ2luYSBkZSBwYXJ0aWRvcyBkZW50cm8gZGVsIG1vZHVsbyBkZSB0b3JuZW9zLlwiLFxuICAgIHNlY3Rpb246IFwidG91cm5hbWVudHNcIixcbiAgICBwYWdlOiBcInRvdXJuYW1lbnRzXCIsXG4gICAgc3VicGFnZTogXCJtYXRjaGVzXCIsXG4gICAgYWxpYXNlczogW1wicGFydGlkb3MgZGUgdG9ybmVvc1wiLCBcIm1hdGNoZXNcIl0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIlRvdXJuYW1lbnRzXCIsIFwiTWF0Y2hlc1wiXSxcbiAgICBwYXJlbnRzOiBbXCIvdG91cm5hbWVudHMvc3VicGFnZXMvZGFzaGJvYXJkXCJdLFxuICAgIGludGVudFRhZ3M6IFtcInRvdXJuYW1lbnRzXCIsIFwibWF0Y2hlc1wiXSxcbiAgICBpc0xhbmRpbmc6IGZhbHNlLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcInRvdXJuYW1lbnRzX21hdGNoX3N0YXRzXCIsXG4gICAgdGl0bGU6IFwiTWF0Y2ggU3RhdHMgU3VicGFnZVwiLFxuICAgIHJvdXRlOiBcIi90b3VybmFtZW50cy9zdWJwYWdlcy9tYXRjaC1zdGF0c1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlN1YnBhZ2luYSBkZSBlc3RhZGlzdGljYXMgZGUgcGFydGlkb3MgZGVudHJvIGRlbCBtb2R1bG8gZGUgdG9ybmVvcy5cIixcbiAgICBzZWN0aW9uOiBcInRvdXJuYW1lbnRzXCIsXG4gICAgcGFnZTogXCJ0b3VybmFtZW50c1wiLFxuICAgIHN1YnBhZ2U6IFwibWF0Y2gtc3RhdHNcIixcbiAgICBhbGlhc2VzOiBbXCJlc3RhZGlzdGljYXNcIiwgXCJtYXRjaCBzdGF0c1wiLCBcImVzdGFkaXN0aWNhcyBkZSBwYXJ0aWRvc1wiXSxcbiAgICBicmVhZGNydW1iczogW1wiVG91cm5hbWVudHNcIiwgXCJNYXRjaCBTdGF0c1wiXSxcbiAgICBwYXJlbnRzOiBbXCIvdG91cm5hbWVudHMvc3VicGFnZXMvZGFzaGJvYXJkXCJdLFxuICAgIGludGVudFRhZ3M6IFtcInRvdXJuYW1lbnRzXCIsIFwic3RhdHNcIl0sXG4gICAgaXNMYW5kaW5nOiBmYWxzZSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJzY291dGluZ19pbnRyb1wiLFxuICAgIHRpdGxlOiBcIlNjb3V0aW5nIEludHJvXCIsXG4gICAgcm91dGU6IFwiL3Njb3V0aW5nL2ludHJvXCIsXG4gICAgZGVzY3JpcHRpb246IFwiUGFudGFsbGEgZGUgZW50cmFkYSB1IG9uYm9hcmRpbmcgZGUgc2NvdXRpbmcuXCIsXG4gICAgc2VjdGlvbjogXCJzY291dGluZ1wiLFxuICAgIHBhZ2U6IFwic2NvdXRpbmdcIixcbiAgICBzdWJwYWdlOiBcImludHJvXCIsXG4gICAgYWxpYXNlczogW1wiaW50cm8gc2NvdXRpbmdcIiwgXCJvbmJvYXJkaW5nIHNjb3V0aW5nXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJTY291dGluZ1wiLCBcIkludHJvXCJdLFxuICAgIHBhcmVudHM6IFtcIi9zY291dGluZy9zdWJwYWdlcy9kYXNoYm9hcmRcIl0sXG4gICAgaW50ZW50VGFnczogW1wic2NvdXRpbmdcIiwgXCJpbnRyb1wiLCBcIm9uYm9hcmRpbmdcIl0sXG4gICAgaXNMYW5kaW5nOiBmYWxzZSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJzY291dGluZ19kYXNoYm9hcmRcIixcbiAgICB0aXRsZTogXCJTY291dGluZyBEYXNoYm9hcmRcIixcbiAgICByb3V0ZTogXCIvc2NvdXRpbmcvc3VicGFnZXMvZGFzaGJvYXJkXCIsXG4gICAgZGVzY3JpcHRpb246IFwiUGFudGFsbGEgcHJpbmNpcGFsIGRlbCBtb2R1bG8gZGUgc2NvdXRpbmcgbyByZWNydWl0ZXJzLlwiLFxuICAgIHNlY3Rpb246IFwic2NvdXRpbmdcIixcbiAgICBwYWdlOiBcInNjb3V0aW5nXCIsXG4gICAgc3VicGFnZTogXCJkYXNoYm9hcmRcIixcbiAgICBhbGlhc2VzOiBbXCJzY291dGluZ1wiLCBcInJlY3J1aXRlcnNcIiwgXCJkYXNoYm9hcmQgZGUgc2NvdXRpbmdcIiwgXCIvcmVjcnVpdGVyc1wiXSxcbiAgICBicmVhZGNydW1iczogW1wiU2NvdXRpbmdcIiwgXCJEYXNoYm9hcmRcIl0sXG4gICAgaW50ZW50VGFnczogW1wic2NvdXRpbmdcIiwgXCJkYXNoYm9hcmRcIiwgXCJyZWNydWl0ZXJzXCJdLFxuICAgIGlzTGFuZGluZzogdHJ1ZSxcbiAgICBwb3B1bGFyaXR5OiAwLjg2LFxuICAgIG5vdGVzOiBbXCJMYSBydXRhIGxlZ2FjeSAvcmVjcnVpdGVycyByZWRpcmlnZSBhcXVpLlwiXSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJzY291dGluZ19saWJyYXJ5XCIsXG4gICAgdGl0bGU6IFwiU2NvdXRpbmcgTGlicmFyeVwiLFxuICAgIHJvdXRlOiBcIi9zY291dGluZy9zdWJwYWdlcy9saWJyYXJ5XCIsXG4gICAgZGVzY3JpcHRpb246IFwiU3VicGFnaW5hIGxpYnJhcnkgZGVsIG1vZHVsbyBkZSBzY291dGluZy5cIixcbiAgICBzZWN0aW9uOiBcInNjb3V0aW5nXCIsXG4gICAgcGFnZTogXCJzY291dGluZ1wiLFxuICAgIHN1YnBhZ2U6IFwibGlicmFyeVwiLFxuICAgIGFsaWFzZXM6IFtcImxpYnJhcnlcIiwgXCJiaWJsaW90ZWNhXCIsIFwic2NvdXRpbmcgbGlicmFyeVwiXSxcbiAgICBicmVhZGNydW1iczogW1wiU2NvdXRpbmdcIiwgXCJMaWJyYXJ5XCJdLFxuICAgIHBhcmVudHM6IFtcIi9zY291dGluZy9zdWJwYWdlcy9kYXNoYm9hcmRcIl0sXG4gICAgaW50ZW50VGFnczogW1wic2NvdXRpbmdcIiwgXCJsaWJyYXJ5XCJdLFxuICAgIGlzTGFuZGluZzogZmFsc2UsXG4gIH0pLFxuICBjcmVhdGVFbnRyeSh7XG4gICAgaWQ6IFwic2NvdXRpbmdfcGxheWVyX3Byb2ZpbGVzXCIsXG4gICAgdGl0bGU6IFwiUGxheWVyIFByb2ZpbGVzXCIsXG4gICAgcm91dGU6IFwiL3Njb3V0aW5nL3N1YnBhZ2VzL3BsYXllci1wcm9maWxlc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlN1YnBhZ2luYSBkZSBmaWNoYXMgZGUganVnYWRvciBkZW50cm8gZGUgc2NvdXRpbmcuXCIsXG4gICAgc2VjdGlvbjogXCJzY291dGluZ1wiLFxuICAgIHBhZ2U6IFwic2NvdXRpbmdcIixcbiAgICBzdWJwYWdlOiBcInBsYXllci1wcm9maWxlc1wiLFxuICAgIGFsaWFzZXM6IFtcInBsYXllciBwcm9maWxlc1wiLCBcInBlcmZpbGVzXCIsIFwiZmljaGFzIGRlIGp1Z2Fkb3JcIl0sXG4gICAgYnJlYWRjcnVtYnM6IFtcIlNjb3V0aW5nXCIsIFwiUGxheWVyIFByb2ZpbGVzXCJdLFxuICAgIHBhcmVudHM6IFtcIi9zY291dGluZy9zdWJwYWdlcy9kYXNoYm9hcmRcIl0sXG4gICAgaW50ZW50VGFnczogW1wic2NvdXRpbmdcIiwgXCJwbGF5ZXJzXCIsIFwicHJvZmlsZXNcIl0sXG4gICAgaXNMYW5kaW5nOiBmYWxzZSxcbiAgfSksXG4gIGNyZWF0ZUVudHJ5KHtcbiAgICBpZDogXCJzY291dGluZ19yYW5raW5nc1wiLFxuICAgIHRpdGxlOiBcIlNjb3V0aW5nIFJhbmtpbmdzXCIsXG4gICAgcm91dGU6IFwiL3Njb3V0aW5nL3N1YnBhZ2VzL3JhbmtpbmdzXCIsXG4gICAgZGVzY3JpcHRpb246IFwiU3VicGFnaW5hIGRlIHJhbmtpbmdzIG8gYm9hcmQgZGUgc2NvdXRpbmcuXCIsXG4gICAgc2VjdGlvbjogXCJzY291dGluZ1wiLFxuICAgIHBhZ2U6IFwic2NvdXRpbmdcIixcbiAgICBzdWJwYWdlOiBcInJhbmtpbmdzXCIsXG4gICAgYWxpYXNlczogW1wicmFua2luZ3NcIiwgXCJib2FyZFwiLCBcInNjb3V0aW5nIGJvYXJkXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJTY291dGluZ1wiLCBcIlJhbmtpbmdzXCJdLFxuICAgIHBhcmVudHM6IFtcIi9zY291dGluZy9zdWJwYWdlcy9kYXNoYm9hcmRcIl0sXG4gICAgaW50ZW50VGFnczogW1wic2NvdXRpbmdcIiwgXCJyYW5raW5nc1wiXSxcbiAgICBpc0xhbmRpbmc6IGZhbHNlLFxuICB9KSxcbiAgY3JlYXRlRW50cnkoe1xuICAgIGlkOiBcInNjb3V0aW5nX3Byb2ZpbGVcIixcbiAgICB0aXRsZTogXCJTY291dGluZyBQcm9maWxlXCIsXG4gICAgcm91dGU6IFwiL3Njb3V0aW5nL3N1YnBhZ2VzL3Byb2ZpbGUvOnZpZGVvSWRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJQZXJmaWwgZWRpdG9yaWFsIGRlIHNjb3V0aW5nIHBhcmEgdW4gdmlkZW8gY29uY3JldG8uXCIsXG4gICAgc2VjdGlvbjogXCJzY291dGluZ1wiLFxuICAgIHBhZ2U6IFwic2NvdXRpbmdcIixcbiAgICBzdWJwYWdlOiBcInByb2ZpbGVcIixcbiAgICBhbGlhc2VzOiBbXCJwZXJmaWwgZGUgc2NvdXRpbmdcIiwgXCJwcm9maWxlXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJTY291dGluZ1wiLCBcIlByb2ZpbGVcIl0sXG4gICAgcGFyZW50czogW1wiL3Njb3V0aW5nL3N1YnBhZ2VzL3JhbmtpbmdzXCIsIFwiL3Njb3V0aW5nL3N1YnBhZ2VzL2xpYnJhcnlcIl0sXG4gICAgaW50ZW50VGFnczogW1wic2NvdXRpbmdcIiwgXCJwcm9maWxlXCJdLFxuICAgIGlzTGFuZGluZzogZmFsc2UsXG4gICAgcGF0aFBhdHRlcm46IC9eXFwvc2NvdXRpbmdcXC9zdWJwYWdlc1xcL3Byb2ZpbGVcXC9bXi9dKyg/OlxcPy4qKT8kLyxcbiAgICBub3RlczogW1wiUnV0YSBkaW5hbWljYTogcmVxdWllcmUgdmlkZW9JZC5cIiwgXCJQdWVkZSBpbmNsdWlyIHF1ZXJ5IHBsYXllclByb2ZpbGVJZC5cIl0sXG4gIH0pLFxuICBjcmVhdGVFbnRyeSh7XG4gICAgaWQ6IFwic2NvdXRpbmdfdmlkZW9cIixcbiAgICB0aXRsZTogXCJTY291dGluZyBWaWRlb1wiLFxuICAgIHJvdXRlOiBcIi9zY291dGluZy9zdWJwYWdlcy92aWRlby86dmlkZW9JZFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlZpc3RhIHJlY3J1aXRlciBwYXJhIHVuIHZpZGVvIGNvbmNyZXRvIGRlbnRybyBkZSBzY291dGluZy5cIixcbiAgICBzZWN0aW9uOiBcInNjb3V0aW5nXCIsXG4gICAgcGFnZTogXCJzY291dGluZ1wiLFxuICAgIHN1YnBhZ2U6IFwidmlkZW9cIixcbiAgICBhbGlhc2VzOiBbXCJ2aWRlbyBzY291dGluZ1wiLCBcInJlY3J1aXRlciB2aWV3XCIsIFwidmlkZW8gZGV0YWlsXCJdLFxuICAgIGJyZWFkY3J1bWJzOiBbXCJTY291dGluZ1wiLCBcIlZpZGVvXCJdLFxuICAgIHBhcmVudHM6IFtcIi9zY291dGluZy9zdWJwYWdlcy9yYW5raW5nc1wiLCBcIi9zY291dGluZy9zdWJwYWdlcy9saWJyYXJ5XCJdLFxuICAgIGludGVudFRhZ3M6IFtcInNjb3V0aW5nXCIsIFwidmlkZW9cIl0sXG4gICAgaXNMYW5kaW5nOiBmYWxzZSxcbiAgICBwYXRoUGF0dGVybjogL15cXC9zY291dGluZ1xcL3N1YnBhZ2VzXFwvdmlkZW9cXC9bXi9dK1xcLz8kLyxcbiAgICBub3RlczogW1wiUnV0YSBkaW5hbWljYTogcmVxdWllcmUgdmlkZW9JZC5cIl0sXG4gIH0pLFxuXTtcblxuY29uc3Qgbm9ybWFsaXplID0gKHZhbHVlOiBzdHJpbmcpID0+IHZhbHVlLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuXG5jb25zdCBzdGFibGVTdHJpbmdpZnkgPSAodmFsdWU6IHVua25vd24pOiBzdHJpbmcgPT4ge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gYFske3ZhbHVlLm1hcCgoaXRlbSkgPT4gc3RhYmxlU3RyaW5naWZ5KGl0ZW0pKS5qb2luKFwiLFwiKX1dYDtcbiAgfVxuXG4gIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLnNvcnQoKFtsZWZ0XSwgW3JpZ2h0XSkgPT5cbiAgICAgIGxlZnQubG9jYWxlQ29tcGFyZShyaWdodClcbiAgICApO1xuXG4gICAgcmV0dXJuIGB7JHtlbnRyaWVzXG4gICAgICAubWFwKChba2V5LCBlbnRyeVZhbHVlXSkgPT4gYCR7SlNPTi5zdHJpbmdpZnkoa2V5KX06JHtzdGFibGVTdHJpbmdpZnkoZW50cnlWYWx1ZSl9YClcbiAgICAgIC5qb2luKFwiLFwiKX19YDtcbiAgfVxuXG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG59O1xuXG5jb25zdCBoYXNoU3RyaW5nID0gKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgbGV0IGhhc2ggPSAyMTY2MTM2MjYxO1xuXG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB2YWx1ZS5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBoYXNoIF49IHZhbHVlLmNoYXJDb2RlQXQoaW5kZXgpO1xuICAgIGhhc2ggPSBNYXRoLmltdWwoaGFzaCwgMTY3Nzc2MTkpO1xuICB9XG5cbiAgcmV0dXJuIChoYXNoID4+PiAwKS50b1N0cmluZygxNikucGFkU3RhcnQoOCwgXCIwXCIpO1xufTtcblxuY29uc3QgdG9DYXRhbG9nRW50cnkgPSAoZW50cnk6IEFwcE5hdmlnYXRpb25FbnRyeSk6IFBsYW5uZXJOYXZpZ2F0aW9uQ2F0YWxvZ0VudHJ5ID0+ICh7XG4gIHJvdXRlOiBlbnRyeS5yb3V0ZSxcbiAgYWN0aW9uTmFtZTogZW50cnkuYWN0aW9uTmFtZSxcbiAgdGl0bGU6IGVudHJ5LnRpdGxlLFxuICBzZWN0aW9uOiBlbnRyeS5zZWN0aW9uLFxuICBwYWdlOiBlbnRyeS5wYWdlLFxuICBzdWJwYWdlOiBlbnRyeS5zdWJwYWdlLFxuICBhbGlhc2VzOiBbLi4uZW50cnkuYWxpYXNlc10uc29ydCgobGVmdCwgcmlnaHQpID0+IGxlZnQubG9jYWxlQ29tcGFyZShyaWdodCkpLFxuICBicmVhZGNydW1iczogWy4uLmVudHJ5LmJyZWFkY3J1bWJzXSxcbiAgcGFyZW50czogWy4uLmVudHJ5LnBhcmVudHNdLFxuICBpbnRlbnRUYWdzOiBbLi4uZW50cnkuaW50ZW50VGFnc10uc29ydCgobGVmdCwgcmlnaHQpID0+IGxlZnQubG9jYWxlQ29tcGFyZShyaWdodCkpLFxuICBpc0xhbmRpbmc6IGVudHJ5LmlzTGFuZGluZyxcbiAgcG9wdWxhcml0eTogZW50cnkucG9wdWxhcml0eSxcbn0pO1xuXG5jb25zdCBkZXNjcmliZUVudHJ5ID0gKGVudHJ5OiBBcHBOYXZpZ2F0aW9uRW50cnkpID0+IHtcbiAgY29uc3QgYWxpYXNlcyA9IGVudHJ5LmFsaWFzZXMubGVuZ3RoID8gYCB8IGFsaWFzZXM6ICR7ZW50cnkuYWxpYXNlcy5qb2luKFwiLCBcIil9YCA6IFwiXCI7XG4gIGNvbnN0IG5vdGVzID0gZW50cnkubm90ZXM/Lmxlbmd0aCA/IGAgfCBub3RlczogJHtlbnRyeS5ub3Rlcy5qb2luKFwiIFwiKX1gIDogXCJcIjtcbiAgcmV0dXJuIGAtIFske2VudHJ5LnNlY3Rpb259XSAke2VudHJ5LnRpdGxlfSAtPiAke2VudHJ5LnJvdXRlfSB8ICR7ZW50cnkuZGVzY3JpcHRpb259JHthbGlhc2VzfSR7bm90ZXN9YDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBcHBOYXZpZ2F0aW9uRW50cmllcyA9ICgpID0+IFsuLi5BUFBfTkFWSUdBVElPTl9FTlRSSUVTXTtcblxuZXhwb3J0IGNvbnN0IGJ1aWxkTmF2aWdhdGlvbkNhdGFsb2cgPSAobG9jYWxlOiBzdHJpbmcpOiBQbGFubmVyTmF2aWdhdGlvbkNhdGFsb2cgPT4ge1xuICBjb25zdCBlbnRyaWVzID0gQVBQX05BVklHQVRJT05fRU5UUklFUy5tYXAoKGVudHJ5KSA9PiB0b0NhdGFsb2dFbnRyeShlbnRyeSkpLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PlxuICAgIGxlZnQucm91dGUubG9jYWxlQ29tcGFyZShyaWdodC5yb3V0ZSlcbiAgKTtcbiAgY29uc3QgdmVyc2lvbiA9IGBuYXYtJHtoYXNoU3RyaW5nKHN0YWJsZVN0cmluZ2lmeShlbnRyaWVzKSl9YDtcblxuICByZXR1cm4ge1xuICAgIHZlcnNpb24sXG4gICAgbG9jYWxlLFxuICAgIGVudHJpZXMsXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZmluZE5hdmlnYXRpb25FbnRyeUJ5UGF0aCA9IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBwYXRoLnRyaW0oKTtcblxuICByZXR1cm4gKFxuICAgIEFQUF9OQVZJR0FUSU9OX0VOVFJJRVMuZmluZCgoZW50cnkpID0+IGVudHJ5LnJvdXRlID09PSBub3JtYWxpemVkUGF0aCkgfHxcbiAgICBBUFBfTkFWSUdBVElPTl9FTlRSSUVTLmZpbmQoKGVudHJ5KSA9PiBlbnRyeS5wYXRoUGF0dGVybj8udGVzdChub3JtYWxpemVkUGF0aCkpXG4gICk7XG59O1xuXG5leHBvcnQgY29uc3QgZmluZE5hdmlnYXRpb25FbnRyaWVzQnlQcm9tcHQgPSAocHJvbXB0OiBzdHJpbmcpID0+IHtcbiAgY29uc3Qgbm9ybWFsaXplZFByb21wdCA9IG5vcm1hbGl6ZShwcm9tcHQpO1xuXG4gIHJldHVybiBBUFBfTkFWSUdBVElPTl9FTlRSSUVTLmZpbHRlcigoZW50cnkpID0+IHtcbiAgICBjb25zdCB2YWx1ZXMgPSBbZW50cnkudGl0bGUsIGVudHJ5LnJvdXRlLCAuLi5lbnRyeS5hbGlhc2VzXS5tYXAobm9ybWFsaXplKTtcbiAgICByZXR1cm4gdmFsdWVzLnNvbWUoKHZhbHVlKSA9PiBub3JtYWxpemVkUHJvbXB0LmluY2x1ZGVzKHZhbHVlKSk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGJ1aWxkTmF2aWdhdGlvbktub3dsZWRnZUJsb2NrID0gKHBhcmFtczoge1xuICBjdXJyZW50UGF0aDogc3RyaW5nO1xuICBwcm9tcHQ6IHN0cmluZztcbn0pID0+IHtcbiAgY29uc3QgY3VycmVudEVudHJ5ID0gZmluZE5hdmlnYXRpb25FbnRyeUJ5UGF0aChwYXJhbXMuY3VycmVudFBhdGgpO1xuICBjb25zdCByZWxldmFudEVudHJpZXMgPSBmaW5kTmF2aWdhdGlvbkVudHJpZXNCeVByb21wdChwYXJhbXMucHJvbXB0KTtcbiAgY29uc3QgcmVsZXZhbnRCbG9jayA9XG4gICAgcmVsZXZhbnRFbnRyaWVzLmxlbmd0aCA+IDBcbiAgICAgID8gcmVsZXZhbnRFbnRyaWVzLm1hcCgoZW50cnkpID0+IGRlc2NyaWJlRW50cnkoZW50cnkpKS5qb2luKFwiXFxuXCIpXG4gICAgICA6IFwiLSBObyBkaXJlY3Qgcm91dGUgYWxpYXMgbWF0Y2hlZCBmcm9tIHRoZSB1c2VyIHByb21wdC5cIjtcbiAgY29uc3QgZnVsbE1hcEJsb2NrID0gQVBQX05BVklHQVRJT05fRU5UUklFUy5tYXAoKGVudHJ5KSA9PiBkZXNjcmliZUVudHJ5KGVudHJ5KSkuam9pbihcIlxcblwiKTtcblxuICByZXR1cm4gW1xuICAgIFwiTmF2aWdhdGlvbiBrbm93bGVkZ2UgZm9yIFZpY3RvcnkgQ3JhZnQ6XCIsXG4gICAgXCItIEFsd2F5cyB1c2UgYWJzb2x1dGUgaW50ZXJuYWwgcGF0aHMgd2hlbiBjYWxsaW5nIG5hdmlnYXRpb24uZ29fdG8uXCIsXG4gICAgXCItIFRoZSBhcHBsaWNhdGlvbiBoYXMgdG9wLWxldmVsIHBhZ2VzIGFuZCBtb2R1bGUtc3BlY2lmaWMgc3VicGFnZXMuIFByZWZlciB0aGUgZXhhY3Qgc3VicGFnZSBwYXRoIHdoZW4gdGhlIHVzZXIgYXNrcyBmb3IgYSBzZWN0aW9uIGluc2lkZSB0b3VybmFtZW50cywgc2NvdXRpbmcsIG9yIHZpZGVvcy5cIixcbiAgICBcIi0gRm9yIGR5bmFtaWMgcm91dGVzIHdpdGggOmlkLCA6ZmllbGRJZCBvciA6dmlkZW9JZCwgb25seSB1c2UgdGhlbSB3aGVuIHRoZSBwcm9tcHQgb3IgY29udGV4dCBwcm92aWRlcyB0aGF0IGlkZW50aWZpZXIuIE90aGVyd2lzZSBwcmVmZXIgdGhlIHBhcmVudCBkYXNoYm9hcmQgb3IgbGlzdCBzdWJwYWdlLlwiLFxuICAgIFwiLSBMZWdhY3kgYWxpYXNlcyBleGlzdDogL3JlY3J1aXRlcnMgcmVkaXJlY3RzIHRvIC9zY291dGluZy9zdWJwYWdlcy9kYXNoYm9hcmQgYW5kIC9maWVsZHMvdmlkZW9zIHBsdXMgL3N1YnBhZ2VzIGFyZSBoYW5kbGVkIGJ5IHRoZSB2aWRlb3MgbW9kdWxlLlwiLFxuICAgIGBDdXJyZW50IHJvdXRlOiAke3BhcmFtcy5jdXJyZW50UGF0aH1gLFxuICAgIGN1cnJlbnRFbnRyeVxuICAgICAgPyBgQ3VycmVudCByb3V0ZSBtYXRjaDogJHtjdXJyZW50RW50cnkudGl0bGV9ICgke2N1cnJlbnRFbnRyeS5yb3V0ZX0pYFxuICAgICAgOiBcIkN1cnJlbnQgcm91dGUgbWF0Y2g6IG5vIGV4YWN0IGNhdGFsb2cgbWF0Y2ggZm91bmQuXCIsXG4gICAgXCJQcm9tcHQtcmVsZXZhbnQgcm91dGVzOlwiLFxuICAgIHJlbGV2YW50QmxvY2ssXG4gICAgXCJGdWxsIHJvdXRlIGNhdGFsb2c6XCIsXG4gICAgZnVsbE1hcEJsb2NrLFxuICBdLmpvaW4oXCJcXG5cIik7XG59O1xuXG5leHBvcnQgeyBBUFBfTkFWSUdBVElPTl9FTlRSSUVTIH07XG4iLCAiaW1wb3J0IHR5cGUgeyBBZ2VudExsbUlucHV0IH0gZnJvbSBcIi4uLy4uLy4uL2FnZW50LW1mZVwiO1xuaW1wb3J0IHsgYnVpbGROYXZpZ2F0aW9uS25vd2xlZGdlQmxvY2sgfSBmcm9tIFwiLi4vbmF2aWdhdGlvbi9uYXZpZ2F0aW9uS25vd2xlZGdlXCI7XG5cbmNvbnN0IHRyaW1UcmFpbGluZ1doaXRlc3BhY2UgPSAodmFsdWU6IHN0cmluZykgPT4gdmFsdWUudHJpbSgpO1xuXG5leHBvcnQgY29uc3QgYnVpbGRBZ2VudFBsYW5uZXJQYXlsb2FkID0gKGlucHV0OiBBZ2VudExsbUlucHV0KTogQWdlbnRMbG1JbnB1dCA9PiB7XG4gIGNvbnN0IHByb21wdCA9IHRyaW1UcmFpbGluZ1doaXRlc3BhY2UoaW5wdXQucHJvbXB0KTtcbiAgY29uc3QgbmF2aWdhdGlvbktub3dsZWRnZSA9IGJ1aWxkTmF2aWdhdGlvbktub3dsZWRnZUJsb2NrKHtcbiAgICBjdXJyZW50UGF0aDogaW5wdXQuY3VycmVudFBhdGgsXG4gICAgcHJvbXB0LFxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIC4uLmlucHV0LFxuICAgIHByb21wdDogW1xuICAgICAgXCJVc2VyIHJlcXVlc3Q6XCIsXG4gICAgICBwcm9tcHQsXG4gICAgICBcIlwiLFxuICAgICAgbmF2aWdhdGlvbktub3dsZWRnZSxcbiAgICAgIFwiXCIsXG4gICAgICBcIlBsYW4gb25seSB3aXRoIHRoZSByZWdpc3RlcmVkIGFjdGlvbnMgcHJvdmlkZWQgaW4gdGhpcyBwYXlsb2FkLlwiLFxuICAgIF0uam9pbihcIlxcblwiKSxcbiAgfTtcbn07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUEsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sWUFBWTs7O0FDRG5CLE9BQU9BLFlBQVc7OztBQ0FsQixPQUFPLFdBQVc7OztBQ0FYLElBQU0seUJBQXlCO0FBRXRDLElBQU0sb0JBQW9CLENBQUMsU0FBUyxVQUFVLFNBQVMsUUFBUSxPQUFPLFVBQVU7QUFFekUsSUFBTSw0QkFBNEIsTUFBWTtBQUNuRCxvQkFBa0IsUUFBUSxDQUFDLFFBQVEsYUFBYSxXQUFXLEdBQUcsQ0FBQztBQUNqRTtBQUVPLElBQU0sK0JBQStCLE1BQVk7QUFDdEQsU0FBTyxjQUFjLElBQUksTUFBTSxzQkFBc0IsQ0FBQztBQUN4RDtBQUVPLElBQU0scUNBQXFDLE1BQVk7QUFDNUQsNEJBQTBCO0FBQzFCLCtCQUE2QjtBQUMvQjs7O0FDZk8sSUFBTSxvQkFBTixjQUFnQyxNQUFNO0FBQzdDO0FBQ0Esa0JBQWtCLFVBQVUsT0FBTztBQUNuQyxTQUFTLGlCQUFpQixLQUFLO0FBQzNCLFNBQU8sbUJBQW1CLEtBQUssR0FBRyxFQUFFLFFBQVEsUUFBUSxDQUFDLEdBQUcsTUFBTTtBQUMxRCxRQUFJLE9BQU8sRUFBRSxXQUFXLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxZQUFZO0FBQ3BELFFBQUksS0FBSyxTQUFTLEdBQUc7QUFDakIsYUFBTyxNQUFNO0FBQUEsSUFDakI7QUFDQSxXQUFPLE1BQU07QUFBQSxFQUNqQixDQUFDLENBQUM7QUFDTjtBQUNBLFNBQVMsZ0JBQWdCLEtBQUs7QUFDMUIsTUFBSSxTQUFTLElBQUksUUFBUSxNQUFNLEdBQUcsRUFBRSxRQUFRLE1BQU0sR0FBRztBQUNyRCxVQUFRLE9BQU8sU0FBUyxHQUFHO0FBQUEsSUFDdkIsS0FBSztBQUNEO0FBQUEsSUFDSixLQUFLO0FBQ0QsZ0JBQVU7QUFDVjtBQUFBLElBQ0osS0FBSztBQUNELGdCQUFVO0FBQ1Y7QUFBQSxJQUNKO0FBQ0ksWUFBTSxJQUFJLE1BQU0sNENBQTRDO0FBQUEsRUFDcEU7QUFDQSxNQUFJO0FBQ0EsV0FBTyxpQkFBaUIsTUFBTTtBQUFBLEVBQ2xDLFNBQ08sS0FBSztBQUNSLFdBQU8sS0FBSyxNQUFNO0FBQUEsRUFDdEI7QUFDSjtBQUNPLFNBQVMsVUFBVSxPQUFPLFNBQVM7QUFDdEMsTUFBSSxPQUFPLFVBQVUsVUFBVTtBQUMzQixVQUFNLElBQUksa0JBQWtCLDJDQUEyQztBQUFBLEVBQzNFO0FBQ0EsY0FBWSxVQUFVLENBQUM7QUFDdkIsUUFBTSxNQUFNLFFBQVEsV0FBVyxPQUFPLElBQUk7QUFDMUMsUUFBTSxPQUFPLE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRztBQUNqQyxNQUFJLE9BQU8sU0FBUyxVQUFVO0FBQzFCLFVBQU0sSUFBSSxrQkFBa0IsMENBQTBDLE1BQU0sQ0FBQyxFQUFFO0FBQUEsRUFDbkY7QUFDQSxNQUFJO0FBQ0osTUFBSTtBQUNBLGNBQVUsZ0JBQWdCLElBQUk7QUFBQSxFQUNsQyxTQUNPLEdBQUc7QUFDTixVQUFNLElBQUksa0JBQWtCLHFEQUFxRCxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sR0FBRztBQUFBLEVBQzdHO0FBQ0EsTUFBSTtBQUNBLFdBQU8sS0FBSyxNQUFNLE9BQU87QUFBQSxFQUM3QixTQUNPLEdBQUc7QUFDTixVQUFNLElBQUksa0JBQWtCLG1EQUFtRCxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sR0FBRztBQUFBLEVBQzNHO0FBQ0o7OztBQzdDTyxJQUFNLGtCQUFrQixDQUFDLFVBQXVDO0FBQ3JFLE1BQUk7QUFFRixVQUFNLFVBQVUsVUFBVSxLQUFLO0FBQy9CLFdBQU87QUFBQSxFQUNULFNBQVMsT0FBTztBQUNkLFlBQVEsTUFBTSwrQkFBK0IsS0FBSztBQUNsRCxXQUFPO0FBQUEsRUFDVDtBQUNGO0FBRU8sSUFBTSxlQUFlLENBQUMsVUFBMkI7QUFDdEQsUUFBTSxRQUFRLE1BQU0sS0FBSztBQUN6QixNQUFJLENBQUMsTUFBTyxRQUFPO0FBQ25CLFFBQU0sUUFBUSxNQUFNLE1BQU0sR0FBRztBQUM3QixTQUFPLE1BQU0sV0FBVyxLQUFLLE1BQU0sTUFBTSxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUUsU0FBUyxDQUFDO0FBQzNFO0FBRU8sSUFBTSxrQkFBa0IsQ0FBQyxVQUM5QixhQUFhLEtBQUssS0FBSyxnQkFBZ0IsS0FBSyxNQUFNOzs7QUh0QnBELElBQU0sVUFDSixPQUFPLGdCQUFnQixjQUNsQixZQUEwRSxNQUMzRTtBQUdDLElBQU0sTUFBTSxNQUFNLE9BQU87QUFBQSxFQUM5QixTQUFTLFNBQVMsZ0JBQWdCO0FBQUE7QUFDcEMsQ0FBQztBQUVELElBQUksYUFBYSxRQUFRLElBQUksQ0FBQyxXQUFXO0FBQ3ZDLFFBQU0sZ0JBQ0osT0FBTyxPQUFPLFNBQVMsa0JBQWtCLFdBQ3JDLE9BQU8sUUFBUSxnQkFDZixPQUFPLE9BQU8sU0FBUyxrQkFBa0IsV0FDdkMsT0FBTyxRQUFRLGdCQUNmO0FBRVIsTUFBSSxjQUFjLFdBQVcsU0FBUyxHQUFHO0FBQ3ZDLFVBQU0sUUFBUSxjQUFjLE1BQU0sVUFBVSxNQUFNLEVBQUUsS0FBSztBQUN6RCxRQUFJLENBQUMsZ0JBQWdCLEtBQUssS0FBSyxPQUFPLFNBQVM7QUFDN0MsYUFBTyxPQUFPLFFBQVE7QUFDdEIsYUFBTyxPQUFPLFFBQVE7QUFBQSxJQUN4QjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQ1QsQ0FBQztBQUVELElBQUksYUFBYSxTQUFTO0FBQUEsRUFDeEIsQ0FBQyxhQUFhO0FBQUEsRUFDZCxDQUFDLFVBQVU7QUFDVCxVQUFNLFNBQVMsT0FBTyxVQUFVO0FBQ2hDLFVBQU0sZ0JBQ0osT0FBTyxPQUFPLFFBQVEsU0FBUyxrQkFBa0IsV0FDN0MsTUFBTSxPQUFPLFFBQVEsZ0JBQ3JCLE9BQU8sT0FBTyxRQUFRLFNBQVMsa0JBQWtCLFdBQy9DLE1BQU0sT0FBTyxRQUFRLGdCQUNyQjtBQUVSLFFBQUksV0FBVyxPQUFPLGNBQWMsV0FBVyxTQUFTLEdBQUc7QUFDekQseUNBQW1DO0FBQUEsSUFDckM7QUFFQSxXQUFPLFFBQVEsT0FBTyxLQUFLO0FBQUEsRUFDN0I7QUFDRjtBQUVPLElBQU0sUUFBUSxNQUFNLE9BQU87QUFPM0IsU0FBUyxtQkFBbUIsT0FBZSxJQUFZO0FBQzVELFNBQU8sK0RBQStELElBQUk7QUFDNUU7QUFFTyxTQUFTLGdCQUFnQixPQUFlLElBQVk7QUFDekQsU0FBTyx1REFBdUQsSUFBSTtBQUNwRTtBQUdPLElBQU0sY0FBYyxNQUFNLE9BQU87QUFBQSxFQUN0QyxTQUFTLG1CQUFtQjtBQUM5QixDQUFDO0FBRU0sSUFBTSxXQUFXLE1BQU0sT0FBTztBQUFBLEVBQ25DLFNBQVMsZ0JBQWdCO0FBQzNCLENBQUM7OztBSXZETSxJQUFNLHdCQUF3QixNQUFNO0FBQ3pDLE1BQUksT0FBTyxjQUFjLGVBQWUsQ0FBQyxVQUFVLFNBQVUsUUFBTztBQUNwRSxTQUFPLFVBQVU7QUFDbkI7OztBQ0VBLElBQU0sY0FBYyxDQUNsQixXQVN3QjtBQUFBLEVBQ3hCLFlBQVk7QUFBQSxFQUNaLFNBQVMsQ0FBQztBQUFBLEVBQ1YsYUFBYSxDQUFDO0FBQUEsRUFDZCxTQUFTLENBQUM7QUFBQSxFQUNWLFlBQVksQ0FBQztBQUFBLEVBQ2IsR0FBRztBQUNMO0FBRUEsSUFBTSx5QkFBK0M7QUFBQSxFQUNuRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsVUFBVSxRQUFRLFNBQVM7QUFBQSxJQUNyQyxhQUFhLENBQUMsTUFBTTtBQUFBLElBQ3BCLFlBQVksQ0FBQyxRQUFRLFdBQVcsU0FBUztBQUFBLElBQ3pDLFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxFQUNkLENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxTQUFTLGtCQUFrQixRQUFRO0FBQUEsSUFDN0MsYUFBYSxDQUFDLE9BQU87QUFBQSxJQUNyQixZQUFZLENBQUMsUUFBUSxPQUFPO0FBQUEsSUFDNUIsV0FBVztBQUFBLEVBQ2IsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUyxDQUFDLFlBQVksWUFBWSxjQUFjO0FBQUEsSUFDaEQsYUFBYSxDQUFDLFVBQVU7QUFBQSxJQUN4QixZQUFZLENBQUMsUUFBUSxVQUFVO0FBQUEsSUFDL0IsV0FBVztBQUFBLEVBQ2IsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUyxDQUFDLFlBQVksT0FBTztBQUFBLElBQzdCLGFBQWEsQ0FBQyxPQUFPO0FBQUEsSUFDckIsWUFBWSxDQUFDLFNBQVMsT0FBTztBQUFBLElBQzdCLFdBQVc7QUFBQSxFQUNiLENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxVQUFVLFdBQVcsb0JBQW9CO0FBQUEsSUFDbkQsYUFBYSxDQUFDLFFBQVE7QUFBQSxJQUN0QixZQUFZLENBQUMsVUFBVSxNQUFNO0FBQUEsSUFDN0IsV0FBVztBQUFBLElBQ1gsWUFBWTtBQUFBLEVBQ2QsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUyxDQUFDLGdCQUFnQixnQkFBZ0IsV0FBVztBQUFBLElBQ3JELGFBQWEsQ0FBQyxVQUFVLFFBQVE7QUFBQSxJQUNoQyxTQUFTLENBQUMsU0FBUztBQUFBLElBQ25CLFlBQVksQ0FBQyxVQUFVLFFBQVE7QUFBQSxJQUMvQixXQUFXO0FBQUEsRUFDYixDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsaUJBQWlCLFlBQVk7QUFBQSxJQUN2QyxhQUFhLENBQUMsVUFBVSxNQUFNO0FBQUEsSUFDOUIsU0FBUyxDQUFDLFNBQVM7QUFBQSxJQUNuQixZQUFZLENBQUMsVUFBVSxNQUFNO0FBQUEsSUFDN0IsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsT0FBTyxDQUFDLDBDQUEwQztBQUFBLEVBQ3BELENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxzQkFBc0Isb0JBQW9CO0FBQUEsSUFDcEQsYUFBYSxDQUFDLFVBQVUsY0FBYztBQUFBLElBQ3RDLFNBQVMsQ0FBQyxTQUFTO0FBQUEsSUFDbkIsWUFBWSxDQUFDLFVBQVUsY0FBYztBQUFBLElBQ3JDLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLE9BQU8sQ0FBQywwQ0FBMEM7QUFBQSxFQUNwRCxDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsWUFBWSxjQUFjO0FBQUEsSUFDcEMsYUFBYSxDQUFDLGNBQWM7QUFBQSxJQUM1QixZQUFZLENBQUMsZ0JBQWdCLFdBQVc7QUFBQSxJQUN4QyxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsRUFDZCxDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsdUJBQXVCLHdCQUF3QjtBQUFBLElBQ3pELGFBQWEsQ0FBQyxnQkFBZ0IsT0FBTztBQUFBLElBQ3JDLFNBQVMsQ0FBQyxpQkFBaUIsU0FBUztBQUFBLElBQ3BDLFlBQVksQ0FBQyxnQkFBZ0IsT0FBTztBQUFBLElBQ3BDLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLE9BQU8sQ0FBQyxrQ0FBa0M7QUFBQSxFQUM1QyxDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsaUJBQWlCLGVBQWU7QUFBQSxJQUMxQyxhQUFhLENBQUMsZ0JBQWdCLFFBQVE7QUFBQSxJQUN0QyxTQUFTLENBQUMsZUFBZTtBQUFBLElBQ3pCLFlBQVksQ0FBQyxnQkFBZ0IsUUFBUTtBQUFBLElBQ3JDLFdBQVc7QUFBQSxFQUNiLENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQywyQkFBMkIsMkJBQTJCO0FBQUEsSUFDaEUsYUFBYSxDQUFDLGdCQUFnQixVQUFVLE9BQU87QUFBQSxJQUMvQyxTQUFTLENBQUMsaUJBQWlCLFNBQVM7QUFBQSxJQUNwQyxZQUFZLENBQUMsZ0JBQWdCLFVBQVUsT0FBTztBQUFBLElBQzlDLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLE9BQU8sQ0FBQyxrQ0FBa0M7QUFBQSxFQUM1QyxDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsa0JBQWtCLGtCQUFrQjtBQUFBLElBQzlDLGFBQWEsQ0FBQyxnQkFBZ0IsTUFBTTtBQUFBLElBQ3BDLFNBQVMsQ0FBQyxlQUFlO0FBQUEsSUFDekIsWUFBWSxDQUFDLGdCQUFnQixNQUFNO0FBQUEsSUFDbkMsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsT0FBTyxDQUFDLDJDQUEyQztBQUFBLEVBQ3JELENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxTQUFTLFlBQVksUUFBUTtBQUFBLElBQ3ZDLGFBQWEsQ0FBQyxPQUFPO0FBQUEsSUFDckIsWUFBWSxDQUFDLFNBQVMsTUFBTTtBQUFBLElBQzVCLFdBQVc7QUFBQSxFQUNiLENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxjQUFjLFlBQVk7QUFBQSxJQUNwQyxhQUFhLENBQUMsU0FBUyxRQUFRO0FBQUEsSUFDL0IsU0FBUyxDQUFDLFVBQVUsU0FBUztBQUFBLElBQzdCLFlBQVksQ0FBQyxTQUFTLFFBQVE7QUFBQSxJQUM5QixXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixPQUFPLENBQUMsa0NBQWtDO0FBQUEsRUFDNUMsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUyxDQUFDLGVBQWUsV0FBVztBQUFBLElBQ3BDLGFBQWEsQ0FBQyxTQUFTLE1BQU07QUFBQSxJQUM3QixTQUFTLENBQUMsUUFBUTtBQUFBLElBQ2xCLFlBQVksQ0FBQyxTQUFTLE1BQU07QUFBQSxJQUM1QixXQUFXO0FBQUEsSUFDWCxhQUFhO0FBQUEsSUFDYixPQUFPLENBQUMsc0NBQXNDO0FBQUEsRUFDaEQsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsYUFBYSxDQUFDLFVBQVUsV0FBVztBQUFBLElBQ25DLFlBQVksQ0FBQyxVQUFVLFdBQVc7QUFBQSxJQUNsQyxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixPQUFPLENBQUMsZ0ZBQWdGO0FBQUEsRUFDMUYsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsYUFBYSxDQUFDLFVBQVUsYUFBYSxVQUFVO0FBQUEsSUFDL0MsU0FBUyxDQUFDLDRCQUE0QjtBQUFBLElBQ3RDLFlBQVksQ0FBQyxVQUFVLGFBQWEsVUFBVTtBQUFBLElBQzlDLFdBQVc7QUFBQSxFQUNiLENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLGFBQWEsQ0FBQyxVQUFVLGFBQWEsV0FBVztBQUFBLElBQ2hELFNBQVMsQ0FBQyw0QkFBNEI7QUFBQSxJQUN0QyxZQUFZLENBQUMsVUFBVSxhQUFhLGFBQWEsUUFBUTtBQUFBLElBQ3pELFdBQVc7QUFBQSxJQUNYLE9BQU87QUFBQSxNQUNMO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxnQkFBZ0IsY0FBYztBQUFBLElBQ3hDLGFBQWEsQ0FBQyxVQUFVLE1BQU07QUFBQSxJQUM5QixTQUFTLENBQUMsNEJBQTRCO0FBQUEsSUFDdEMsWUFBWSxDQUFDLFVBQVUsTUFBTTtBQUFBLElBQzdCLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLE9BQU8sQ0FBQyxrQ0FBa0M7QUFBQSxFQUM1QyxDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsZUFBZSx5QkFBeUI7QUFBQSxJQUNsRCxhQUFhLENBQUMsVUFBVSxRQUFRO0FBQUEsSUFDaEMsU0FBUyxDQUFDLDhCQUE4QixTQUFTO0FBQUEsSUFDakQsWUFBWSxDQUFDLFVBQVUsVUFBVSxPQUFPO0FBQUEsSUFDeEMsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsT0FBTyxDQUFDLGtDQUFrQztBQUFBLEVBQzVDLENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxXQUFXLGVBQWUsc0JBQXNCO0FBQUEsSUFDMUQsYUFBYSxDQUFDLGVBQWUsV0FBVztBQUFBLElBQ3hDLFlBQVksQ0FBQyxlQUFlLFdBQVc7QUFBQSxJQUN2QyxXQUFXO0FBQUEsSUFDWCxZQUFZO0FBQUEsSUFDWixPQUFPLENBQUMsOEVBQThFO0FBQUEsRUFDeEYsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUyxDQUFDLHdCQUF3QixrQkFBa0I7QUFBQSxJQUNwRCxhQUFhLENBQUMsZUFBZSxhQUFhO0FBQUEsSUFDMUMsU0FBUyxDQUFDLGlDQUFpQztBQUFBLElBQzNDLFlBQVksQ0FBQyxlQUFlLE1BQU07QUFBQSxJQUNsQyxXQUFXO0FBQUEsRUFDYixDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsV0FBVyxPQUFPO0FBQUEsSUFDNUIsYUFBYSxDQUFDLGVBQWUsT0FBTztBQUFBLElBQ3BDLFNBQVMsQ0FBQyxpQ0FBaUM7QUFBQSxJQUMzQyxZQUFZLENBQUMsZUFBZSxPQUFPO0FBQUEsSUFDbkMsV0FBVztBQUFBLEVBQ2IsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUyxDQUFDLHdCQUF3QixTQUFTO0FBQUEsSUFDM0MsYUFBYSxDQUFDLGVBQWUsU0FBUztBQUFBLElBQ3RDLFNBQVMsQ0FBQyxpQ0FBaUM7QUFBQSxJQUMzQyxZQUFZLENBQUMsZUFBZSxTQUFTO0FBQUEsSUFDckMsV0FBVztBQUFBLEVBQ2IsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUyxDQUFDLHVCQUF1QixTQUFTO0FBQUEsSUFDMUMsYUFBYSxDQUFDLGVBQWUsU0FBUztBQUFBLElBQ3RDLFNBQVMsQ0FBQyxpQ0FBaUM7QUFBQSxJQUMzQyxZQUFZLENBQUMsZUFBZSxTQUFTO0FBQUEsSUFDckMsV0FBVztBQUFBLEVBQ2IsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUyxDQUFDLGdCQUFnQixlQUFlLDBCQUEwQjtBQUFBLElBQ25FLGFBQWEsQ0FBQyxlQUFlLGFBQWE7QUFBQSxJQUMxQyxTQUFTLENBQUMsaUNBQWlDO0FBQUEsSUFDM0MsWUFBWSxDQUFDLGVBQWUsT0FBTztBQUFBLElBQ25DLFdBQVc7QUFBQSxFQUNiLENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxrQkFBa0IscUJBQXFCO0FBQUEsSUFDakQsYUFBYSxDQUFDLFlBQVksT0FBTztBQUFBLElBQ2pDLFNBQVMsQ0FBQyw4QkFBOEI7QUFBQSxJQUN4QyxZQUFZLENBQUMsWUFBWSxTQUFTLFlBQVk7QUFBQSxJQUM5QyxXQUFXO0FBQUEsRUFDYixDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsWUFBWSxjQUFjLHlCQUF5QixhQUFhO0FBQUEsSUFDMUUsYUFBYSxDQUFDLFlBQVksV0FBVztBQUFBLElBQ3JDLFlBQVksQ0FBQyxZQUFZLGFBQWEsWUFBWTtBQUFBLElBQ2xELFdBQVc7QUFBQSxJQUNYLFlBQVk7QUFBQSxJQUNaLE9BQU8sQ0FBQywyQ0FBMkM7QUFBQSxFQUNyRCxDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsV0FBVyxjQUFjLGtCQUFrQjtBQUFBLElBQ3JELGFBQWEsQ0FBQyxZQUFZLFNBQVM7QUFBQSxJQUNuQyxTQUFTLENBQUMsOEJBQThCO0FBQUEsSUFDeEMsWUFBWSxDQUFDLFlBQVksU0FBUztBQUFBLElBQ2xDLFdBQVc7QUFBQSxFQUNiLENBQUM7QUFBQSxFQUNELFlBQVk7QUFBQSxJQUNWLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxtQkFBbUIsWUFBWSxtQkFBbUI7QUFBQSxJQUM1RCxhQUFhLENBQUMsWUFBWSxpQkFBaUI7QUFBQSxJQUMzQyxTQUFTLENBQUMsOEJBQThCO0FBQUEsSUFDeEMsWUFBWSxDQUFDLFlBQVksV0FBVyxVQUFVO0FBQUEsSUFDOUMsV0FBVztBQUFBLEVBQ2IsQ0FBQztBQUFBLEVBQ0QsWUFBWTtBQUFBLElBQ1YsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsU0FBUyxDQUFDLFlBQVksU0FBUyxnQkFBZ0I7QUFBQSxJQUMvQyxhQUFhLENBQUMsWUFBWSxVQUFVO0FBQUEsSUFDcEMsU0FBUyxDQUFDLDhCQUE4QjtBQUFBLElBQ3hDLFlBQVksQ0FBQyxZQUFZLFVBQVU7QUFBQSxJQUNuQyxXQUFXO0FBQUEsRUFDYixDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsc0JBQXNCLFNBQVM7QUFBQSxJQUN6QyxhQUFhLENBQUMsWUFBWSxTQUFTO0FBQUEsSUFDbkMsU0FBUyxDQUFDLCtCQUErQiw0QkFBNEI7QUFBQSxJQUNyRSxZQUFZLENBQUMsWUFBWSxTQUFTO0FBQUEsSUFDbEMsV0FBVztBQUFBLElBQ1gsYUFBYTtBQUFBLElBQ2IsT0FBTyxDQUFDLG9DQUFvQyxzQ0FBc0M7QUFBQSxFQUNwRixDQUFDO0FBQUEsRUFDRCxZQUFZO0FBQUEsSUFDVixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUMsa0JBQWtCLGtCQUFrQixjQUFjO0FBQUEsSUFDNUQsYUFBYSxDQUFDLFlBQVksT0FBTztBQUFBLElBQ2pDLFNBQVMsQ0FBQywrQkFBK0IsNEJBQTRCO0FBQUEsSUFDckUsWUFBWSxDQUFDLFlBQVksT0FBTztBQUFBLElBQ2hDLFdBQVc7QUFBQSxJQUNYLGFBQWE7QUFBQSxJQUNiLE9BQU8sQ0FBQyxrQ0FBa0M7QUFBQSxFQUM1QyxDQUFDO0FBQ0g7QUFFQSxJQUFNLFlBQVksQ0FBQyxVQUFrQixNQUFNLEtBQUssRUFBRSxZQUFZO0FBRTlELElBQU0sa0JBQWtCLENBQUMsVUFBMkI7QUFDbEQsTUFBSSxNQUFNLFFBQVEsS0FBSyxHQUFHO0FBQ3hCLFdBQU8sSUFBSSxNQUFNLElBQUksQ0FBQyxTQUFTLGdCQUFnQixJQUFJLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQztBQUFBLEVBQ2pFO0FBRUEsTUFBSSxTQUFTLE9BQU8sVUFBVSxVQUFVO0FBQ3RDLFVBQU0sVUFBVSxPQUFPLFFBQVEsS0FBZ0MsRUFBRTtBQUFBLE1BQUssQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssTUFDbkYsS0FBSyxjQUFjLEtBQUs7QUFBQSxJQUMxQjtBQUVBLFdBQU8sSUFBSSxRQUNSLElBQUksQ0FBQyxDQUFDLEtBQUssVUFBVSxNQUFNLEdBQUcsS0FBSyxVQUFVLEdBQUcsQ0FBQyxJQUFJLGdCQUFnQixVQUFVLENBQUMsRUFBRSxFQUNsRixLQUFLLEdBQUcsQ0FBQztBQUFBLEVBQ2Q7QUFFQSxTQUFPLEtBQUssVUFBVSxLQUFLO0FBQzdCO0FBRUEsSUFBTSxhQUFhLENBQUMsVUFBa0I7QUFDcEMsTUFBSSxPQUFPO0FBRVgsV0FBUyxRQUFRLEdBQUcsUUFBUSxNQUFNLFFBQVEsU0FBUyxHQUFHO0FBQ3BELFlBQVEsTUFBTSxXQUFXLEtBQUs7QUFDOUIsV0FBTyxLQUFLLEtBQUssTUFBTSxRQUFRO0FBQUEsRUFDakM7QUFFQSxVQUFRLFNBQVMsR0FBRyxTQUFTLEVBQUUsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNsRDtBQUVBLElBQU0saUJBQWlCLENBQUMsV0FBOEQ7QUFBQSxFQUNwRixPQUFPLE1BQU07QUFBQSxFQUNiLFlBQVksTUFBTTtBQUFBLEVBQ2xCLE9BQU8sTUFBTTtBQUFBLEVBQ2IsU0FBUyxNQUFNO0FBQUEsRUFDZixNQUFNLE1BQU07QUFBQSxFQUNaLFNBQVMsTUFBTTtBQUFBLEVBQ2YsU0FBUyxDQUFDLEdBQUcsTUFBTSxPQUFPLEVBQUUsS0FBSyxDQUFDLE1BQU0sVUFBVSxLQUFLLGNBQWMsS0FBSyxDQUFDO0FBQUEsRUFDM0UsYUFBYSxDQUFDLEdBQUcsTUFBTSxXQUFXO0FBQUEsRUFDbEMsU0FBUyxDQUFDLEdBQUcsTUFBTSxPQUFPO0FBQUEsRUFDMUIsWUFBWSxDQUFDLEdBQUcsTUFBTSxVQUFVLEVBQUUsS0FBSyxDQUFDLE1BQU0sVUFBVSxLQUFLLGNBQWMsS0FBSyxDQUFDO0FBQUEsRUFDakYsV0FBVyxNQUFNO0FBQUEsRUFDakIsWUFBWSxNQUFNO0FBQ3BCO0FBRUEsSUFBTSxnQkFBZ0IsQ0FBQyxVQUE4QjtBQUNuRCxRQUFNLFVBQVUsTUFBTSxRQUFRLFNBQVMsZUFBZSxNQUFNLFFBQVEsS0FBSyxJQUFJLENBQUMsS0FBSztBQUNuRixRQUFNLFFBQVEsTUFBTSxPQUFPLFNBQVMsYUFBYSxNQUFNLE1BQU0sS0FBSyxHQUFHLENBQUMsS0FBSztBQUMzRSxTQUFPLE1BQU0sTUFBTSxPQUFPLEtBQUssTUFBTSxLQUFLLE9BQU8sTUFBTSxLQUFLLE1BQU0sTUFBTSxXQUFXLEdBQUcsT0FBTyxHQUFHLEtBQUs7QUFDdkc7QUFJTyxJQUFNLHlCQUF5QixDQUFDLFdBQTZDO0FBQ2xGLFFBQU0sVUFBVSx1QkFBdUIsSUFBSSxDQUFDLFVBQVUsZUFBZSxLQUFLLENBQUMsRUFBRTtBQUFBLElBQUssQ0FBQyxNQUFNLFVBQ3ZGLEtBQUssTUFBTSxjQUFjLE1BQU0sS0FBSztBQUFBLEVBQ3RDO0FBQ0EsUUFBTSxVQUFVLE9BQU8sV0FBVyxnQkFBZ0IsT0FBTyxDQUFDLENBQUM7QUFFM0QsU0FBTztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFDRjtBQUVPLElBQU0sNEJBQTRCLENBQUMsU0FBaUI7QUFDekQsUUFBTSxpQkFBaUIsS0FBSyxLQUFLO0FBRWpDLFNBQ0UsdUJBQXVCLEtBQUssQ0FBQyxVQUFVLE1BQU0sVUFBVSxjQUFjLEtBQ3JFLHVCQUF1QixLQUFLLENBQUMsVUFBVSxNQUFNLGFBQWEsS0FBSyxjQUFjLENBQUM7QUFFbEY7QUFFTyxJQUFNLGdDQUFnQyxDQUFDLFdBQW1CO0FBQy9ELFFBQU0sbUJBQW1CLFVBQVUsTUFBTTtBQUV6QyxTQUFPLHVCQUF1QixPQUFPLENBQUMsVUFBVTtBQUM5QyxVQUFNLFNBQVMsQ0FBQyxNQUFNLE9BQU8sTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLEVBQUUsSUFBSSxTQUFTO0FBQ3pFLFdBQU8sT0FBTyxLQUFLLENBQUMsVUFBVSxpQkFBaUIsU0FBUyxLQUFLLENBQUM7QUFBQSxFQUNoRSxDQUFDO0FBQ0g7QUFFTyxJQUFNLGdDQUFnQyxDQUFDLFdBR3hDO0FBQ0osUUFBTSxlQUFlLDBCQUEwQixPQUFPLFdBQVc7QUFDakUsUUFBTSxrQkFBa0IsOEJBQThCLE9BQU8sTUFBTTtBQUNuRSxRQUFNLGdCQUNKLGdCQUFnQixTQUFTLElBQ3JCLGdCQUFnQixJQUFJLENBQUMsVUFBVSxjQUFjLEtBQUssQ0FBQyxFQUFFLEtBQUssSUFBSSxJQUM5RDtBQUNOLFFBQU0sZUFBZSx1QkFBdUIsSUFBSSxDQUFDLFVBQVUsY0FBYyxLQUFLLENBQUMsRUFBRSxLQUFLLElBQUk7QUFFMUYsU0FBTztBQUFBLElBQ0w7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxrQkFBa0IsT0FBTyxXQUFXO0FBQUEsSUFDcEMsZUFDSSx3QkFBd0IsYUFBYSxLQUFLLEtBQUssYUFBYSxLQUFLLE1BQ2pFO0FBQUEsSUFDSjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0YsRUFBRSxLQUFLLElBQUk7QUFDYjs7O0FDenFCQSxJQUFNLHlCQUF5QixDQUFDLFVBQWtCLE1BQU0sS0FBSztBQUV0RCxJQUFNLDJCQUEyQixDQUFDLFVBQXdDO0FBQy9FLFFBQU0sU0FBUyx1QkFBdUIsTUFBTSxNQUFNO0FBQ2xELFFBQU0sc0JBQXNCLDhCQUE4QjtBQUFBLElBQ3hELGFBQWEsTUFBTTtBQUFBLElBQ25CO0FBQUEsRUFDRixDQUFDO0FBRUQsU0FBTztBQUFBLElBQ0wsR0FBRztBQUFBLElBQ0gsUUFBUTtBQUFBLE1BQ047QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0YsRUFBRSxLQUFLLElBQUk7QUFBQSxFQUNiO0FBQ0Y7OztBUFhPLElBQU0scUJBQXFCO0FBQzNCLElBQU0sd0JBQXdCO0FBRXJDLElBQU0sOENBQ0o7QUFFRixJQUFNLHdCQUF3QixDQUFDLFVBQTZDO0FBQzFFLE1BQUksT0FBTyxVQUFVLFlBQVksVUFBVSxRQUFRLEVBQUUsVUFBVSxPQUFRLFFBQU87QUFFOUUsUUFBTSxPQUFPLE9BQU8sTUFBTSxTQUFTLFdBQVcsTUFBTSxPQUFPO0FBQzNELE1BQUksQ0FBQyxLQUFNLFFBQU87QUFFbEIsU0FBTztBQUFBLElBQ0w7QUFBQSxJQUNBLFdBQ0UsZUFBZSxTQUFTLE9BQU8sTUFBTSxjQUFjLFlBQVksTUFBTSxjQUFjLE9BQzlFLE1BQU0sWUFDUCxDQUFDO0FBQUEsRUFDVDtBQUNGO0FBRUEsSUFBTSxnQkFBZ0IsQ0FBQyxVQUFpRDtBQUN0RSxNQUFJLE9BQU8sVUFBVSxZQUFZLFVBQVUsS0FBTSxRQUFPO0FBRXhELFFBQU0sY0FDSixpQkFBaUIsU0FBUyxPQUFPLE1BQU0sZ0JBQWdCLFdBQVcsTUFBTSxjQUFjO0FBQ3hGLFFBQU0sYUFDSixnQkFBZ0IsU0FBUyxPQUFPLE1BQU0sZUFBZSxXQUFXLE1BQU0sYUFBYTtBQUNyRixRQUFNLFVBQVUsYUFBYSxTQUFTLE9BQU8sTUFBTSxZQUFZLFdBQVcsTUFBTSxVQUFVO0FBRTFGLE1BQUksQ0FBQyxlQUFlLGVBQWUsUUFBUSxDQUFDLFFBQVMsUUFBTztBQUU1RCxTQUFPO0FBQUEsSUFDTDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxlQUNFLG1CQUFtQixTQUFTLE9BQU8sTUFBTSxrQkFBa0IsV0FDdkQsTUFBTSxnQkFDTjtBQUFBLElBQ04sMEJBQ0UsOEJBQThCLFNBQzlCLE9BQU8sTUFBTSw2QkFBNkIsV0FDdEMsTUFBTSwyQkFDTjtBQUFBLElBQ04sVUFDRSxjQUFjLFNBQVMsT0FBTyxNQUFNLGFBQWEsV0FBVyxNQUFNLFdBQVc7QUFBQSxJQUMvRSxVQUNFLGNBQWMsU0FBUyxPQUFPLE1BQU0sYUFBYSxZQUFZLE1BQU0sV0FBVztBQUFBLElBQ2hGLGlCQUNFLHFCQUFxQixTQUFTLE1BQU0sUUFBUSxNQUFNLGVBQWUsSUFDN0QsTUFBTSxnQkFDSDtBQUFBLE1BQ0MsQ0FBQyxjQUNDLE9BQU8sY0FBYyxZQUNyQixjQUFjLFFBQ2QsV0FBVyxhQUNYLE9BQU8sVUFBVSxVQUFVLFlBQzNCLFdBQVcsYUFDWCxPQUFPLFVBQVUsVUFBVTtBQUFBLElBQy9CLEVBQ0MsSUFBSSxDQUFDLGVBQWU7QUFBQSxNQUNuQixPQUFPLFVBQVU7QUFBQSxNQUNqQixPQUFPLFVBQVU7QUFBQSxJQUNuQixFQUFFLElBQ0o7QUFBQSxJQUNOLG9CQUNFLHdCQUF3QixTQUFTLE1BQU0sUUFBUSxNQUFNLGtCQUFrQixJQUNuRSxNQUFNLG1CQUFtQjtBQUFBLE1BQ3ZCLENBQUMsWUFBK0IsT0FBTyxZQUFZO0FBQUEsSUFDckQsSUFDQTtBQUFBLEVBQ1I7QUFDRjtBQUVBLElBQU0seUJBQXlCLENBQUMsWUFBeUM7QUFDdkUsTUFBSSxPQUFPLFlBQVksWUFBWSxZQUFZLFFBQVEsRUFBRSxXQUFXLFVBQVU7QUFDNUUsVUFBTSxJQUFJLE1BQU0sNENBQTRDO0FBQUEsRUFDOUQ7QUFFQSxRQUFNLFVBQ0osYUFBYSxXQUFXLE9BQU8sUUFBUSxZQUFZLFdBQy9DLFFBQVEsVUFDUjtBQUNOLFFBQU0sV0FBVyxNQUFNLFFBQVEsUUFBUSxLQUFLLElBQUksUUFBUSxRQUFRLENBQUM7QUFDakUsUUFBTSxRQUFRLFNBQ1gsSUFBSSxDQUFDLFVBQVUsc0JBQXNCLEtBQUssQ0FBQyxFQUMzQyxPQUFPLENBQUMsVUFBc0MsVUFBVSxJQUFJO0FBRS9ELFNBQU87QUFBQSxJQUNMO0FBQUEsSUFDQTtBQUFBLElBQ0EsTUFBTSxVQUFVLFVBQVUsY0FBYyxRQUFRLElBQUksSUFBSTtBQUFBLEVBQzFEO0FBQ0Y7QUFFQSxJQUFNLGtDQUFrQyxNQUFNO0FBQzVDLE1BQUksT0FBTyxXQUFXLFlBQWEsUUFBTztBQUMxQyxTQUFPLE9BQU8sYUFBYSxRQUFRLDJDQUEyQyxLQUFLO0FBQ3JGO0FBRUEsSUFBTSxrQ0FBa0MsQ0FBQyxZQUFvQjtBQUMzRCxNQUFJLE9BQU8sV0FBVyxZQUFhO0FBQ25DLFNBQU8sYUFBYSxRQUFRLDZDQUE2QyxPQUFPO0FBQ2xGO0FBRUEsSUFBTSxtQkFBbUIsQ0FBQyxVQUFtQjtBQUMzQyxNQUFJLENBQUNDLE9BQU0sYUFBYSxLQUFLLEVBQUcsUUFBTztBQUV2QyxRQUFNLGtCQUNKLE9BQU8sTUFBTSxVQUFVLE1BQU0sWUFBWSxXQUFXLE1BQU0sU0FBUyxLQUFLLFVBQVU7QUFDcEYsU0FBTyxtQkFBbUIsTUFBTSxXQUFXO0FBQzdDO0FBRUEsSUFBTSwrQkFBK0IsQ0FBQyxVQUFtQjtBQUN2RCxRQUFNLFVBQVUsaUJBQWlCLEtBQUssRUFBRSxZQUFZO0FBQ3BELE1BQUksQ0FBQyxRQUFTLFFBQU87QUFFckIsU0FDRSxnRUFBZ0UsS0FBSyxPQUFPLEtBQzVFLG1GQUFtRjtBQUFBLElBQ2pGO0FBQUEsRUFDRjtBQUVKO0FBRUEsSUFBTSxnQ0FBZ0MsQ0FBQyxVQUFtQjtBQUN4RCxNQUFJLENBQUNBLE9BQU0sYUFBYSxLQUFLLEVBQUcsUUFBTztBQUV2QyxRQUFNLFNBQVMsTUFBTSxVQUFVO0FBQy9CLE1BQUksV0FBVyxPQUFPLFdBQVcsT0FBTyxXQUFXLElBQUssUUFBTztBQUUvRCxRQUFNLFVBQVUsaUJBQWlCLEtBQUssRUFBRSxZQUFZO0FBQ3BELFNBQU8sOENBQThDLEtBQUssT0FBTztBQUNuRTtBQUVBLElBQU0sa0JBQWtCLENBQUMsVUFBMEI7QUFDakQsTUFBSUEsT0FBTSxhQUFhLEtBQUssR0FBRztBQUM3QixRQUFJLE1BQU0sVUFBVSxXQUFXLEtBQUs7QUFDbEMsWUFBTSxJQUFJO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBRUEsUUFBSSxNQUFNLFVBQVUsV0FBVyxLQUFLO0FBQ2xDLFlBQU0sSUFBSSxNQUFNLHNEQUFzRDtBQUFBLElBQ3hFO0FBRUEsUUFBSSxNQUFNLFVBQVUsV0FBVyxLQUFLO0FBQ2xDLFlBQU0sSUFBSSxNQUFNLDhEQUE4RDtBQUFBLElBQ2hGO0FBQUEsRUFDRjtBQUVBLFFBQU0sSUFBSSxNQUFNLDZDQUE2QztBQUMvRDtBQUVBLElBQU0saUJBQWlCLE9BQU8sVUFBeUI7QUFDckQsUUFBTSxXQUFXLE1BQU0sSUFBSSxLQUFLLG9CQUFvQix5QkFBeUIsS0FBSyxDQUFDO0FBQ25GLFNBQU8sdUJBQXVCLFNBQVMsSUFBSTtBQUM3QztBQUVBLElBQU0sYUFBYSxPQUFPLFVBQXlCO0FBQ2pELFFBQU0sVUFBVSx5QkFBeUIsS0FBSztBQUM5QyxRQUFNLFNBQVMsc0JBQXNCO0FBQ3JDLFFBQU0sb0JBQW9CLHVCQUF1QixNQUFNO0FBQ3ZELFFBQU0sb0JBQ0osZ0NBQWdDLE1BQU0sa0JBQWtCO0FBRTFELFFBQU0sY0FBYztBQUFBLElBQ2xCLEdBQUc7QUFBQSxJQUNIO0FBQUEsSUFDQSwwQkFBMEIsa0JBQWtCO0FBQUEsSUFDNUMsR0FBSSxvQkFBb0IsRUFBRSxrQkFBa0IsSUFBSSxDQUFDO0FBQUEsRUFDbkQ7QUFFQSxNQUFJO0FBQ0YsVUFBTSxXQUFXLE1BQU0sSUFBSSxLQUFLLHVCQUF1QixXQUFXO0FBQ2xFLG9DQUFnQyxrQkFBa0IsT0FBTztBQUN6RCxXQUFPLHVCQUF1QixTQUFTLElBQUk7QUFBQSxFQUM3QyxTQUFTLE9BQU87QUFDZCxRQUFJLENBQUMscUJBQXFCLDZCQUE2QixLQUFLLEdBQUc7QUFDN0QsWUFBTSxnQkFBZ0IsTUFBTSxJQUFJLEtBQUssdUJBQXVCO0FBQUEsUUFDMUQsR0FBRztBQUFBLFFBQ0g7QUFBQSxNQUNGLENBQUM7QUFFRCxzQ0FBZ0Msa0JBQWtCLE9BQU87QUFDekQsYUFBTyx1QkFBdUIsY0FBYyxJQUFJO0FBQUEsSUFDbEQ7QUFFQSxVQUFNO0FBQUEsRUFDUjtBQUNGO0FBRU8sSUFBTSxtQkFBbUIsT0FBTyxXQUdKO0FBQ2pDLFFBQU0sRUFBRSxPQUFPLGFBQWEsSUFBSTtBQUVoQyxNQUFJLENBQUMsY0FBYztBQUNqQixRQUFJO0FBQ0YsYUFBTyxNQUFNLGVBQWUsS0FBSztBQUFBLElBQ25DLFNBQVMsT0FBTztBQUNkLHNCQUFnQixLQUFLO0FBQUEsSUFDdkI7QUFBQSxFQUNGO0FBRUEsTUFBSTtBQUNGLFdBQU8sTUFBTSxXQUFXLEtBQUs7QUFBQSxFQUMvQixTQUFTLE9BQU87QUFDZCxRQUFJLDhCQUE4QixLQUFLLEdBQUc7QUFDeEMsY0FBUSxLQUFLLDJEQUEyRCxLQUFLO0FBRTdFLFVBQUk7QUFDRixlQUFPLE1BQU0sZUFBZSxLQUFLO0FBQUEsTUFDbkMsU0FBUyxhQUFhO0FBQ3BCLHdCQUFnQixXQUFXO0FBQUEsTUFDN0I7QUFBQSxJQUNGO0FBRUEsb0JBQWdCLEtBQUs7QUFBQSxFQUN2QjtBQUNGO0FBRU8sSUFBTSxxQkFBcUI7QUFBQSxFQUNoQyxNQUFNLEtBQUssT0FBc0IsU0FBc0M7QUFDckUsV0FBTyxpQkFBaUI7QUFBQSxNQUN0QjtBQUFBLE1BQ0EsY0FBYyxTQUFTLGlCQUFpQjtBQUFBLElBQzFDLENBQUM7QUFBQSxFQUNIO0FBQ0Y7OztBRDVPQSxJQUFNLGVBQWUsSUFBSTtBQUN6QixJQUFNLGlCQUFpQixXQUFXO0FBQ2xDLElBQU0sb0JBQW9CLFdBQVc7QUFFckMsSUFBTSx1QkFBdUIsQ0FDM0IsUUFDQSxhQVNDO0FBQUEsRUFDQyxjQUFjO0FBQUEsRUFDZCxNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsRUFDVCxRQUFRLE9BQU8sQ0FBQztBQUFBLEVBQ2hCLFVBQVU7QUFBQSxJQUNSO0FBQUEsSUFDQSxNQUFNO0FBQUEsTUFDSjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFTRixJQUFNLGdCQUFnQixNQUFNO0FBQzFCLFFBQU0sVUFBVSxvQkFBSSxJQUFvQjtBQUV4QyxTQUFPO0FBQUEsSUFDTCxTQUFTLENBQUMsUUFBZ0IsUUFBUSxJQUFJLEdBQUcsS0FBSztBQUFBLElBQzlDLFNBQVMsQ0FBQyxLQUFhLFVBQWtCO0FBQ3ZDLGNBQVEsSUFBSSxLQUFLLEtBQUs7QUFBQSxJQUN4QjtBQUFBLElBQ0EsWUFBWSxDQUFDLFFBQWdCO0FBQzNCLGNBQVEsT0FBTyxHQUFHO0FBQUEsSUFDcEI7QUFBQSxJQUNBLE9BQU8sTUFBTTtBQUNYLGNBQVEsTUFBTTtBQUFBLElBQ2hCO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBTSxnQkFBZ0I7QUFBQSxFQUNwQixRQUFRO0FBQUEsRUFDUixhQUFhO0FBQUEsRUFDYixTQUFTO0FBQUEsSUFDUDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sYUFBYTtBQUFBLE1BQ2IsWUFBWTtBQUFBLFFBQ1Y7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOLGFBQWE7QUFBQSxVQUNiLFVBQVU7QUFBQSxRQUNaO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1A7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLE1BQU07QUFBQSxVQUNOLGFBQWE7QUFBQSxRQUNmO0FBQUEsTUFDRjtBQUFBLE1BQ0EsTUFBTSxDQUFDLFlBQVk7QUFBQSxJQUNyQjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLEtBQUssV0FBVyxNQUFNO0FBQ3BCLFNBQU8sZUFBZSxZQUFZLFVBQVU7QUFBQSxJQUMxQyxjQUFjO0FBQUEsSUFDZCxPQUFPO0FBQUEsTUFDTCxjQUFjLGNBQWM7QUFBQSxJQUM5QjtBQUFBLEVBQ0YsQ0FBQztBQUVELFNBQU8sZUFBZSxZQUFZLGFBQWE7QUFBQSxJQUM3QyxjQUFjO0FBQUEsSUFDZCxPQUFPO0FBQUEsTUFDTCxVQUFVO0FBQUEsSUFDWjtBQUFBLEVBQ0YsQ0FBQztBQUNILENBQUM7QUFFRCxLQUFLLFVBQVUsTUFBTTtBQUNuQixNQUFJLE9BQU87QUFFWCxTQUFPLGVBQWUsWUFBWSxVQUFVO0FBQUEsSUFDMUMsY0FBYztBQUFBLElBQ2QsT0FBTztBQUFBLEVBQ1QsQ0FBQztBQUVELFNBQU8sZUFBZSxZQUFZLGFBQWE7QUFBQSxJQUM3QyxjQUFjO0FBQUEsSUFDZCxPQUFPO0FBQUEsRUFDVCxDQUFDO0FBQ0gsQ0FBQztBQUVELEtBQUssNERBQTRELFlBQVk7QUFDM0UsTUFBSSxjQUFjO0FBQ2xCLE1BQUk7QUFDSixNQUFJLE9BQVEsT0FBTyxLQUFLLFlBQVk7QUFDbEMsa0JBQWMsT0FBTyxHQUFHO0FBQ3hCLHNCQUFrQjtBQUNsQixXQUFPO0FBQUEsTUFDTCxNQUFNO0FBQUEsUUFDSixTQUFTO0FBQUEsUUFDVCxPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sV0FBVztBQUFBLGNBQ1QsTUFBTTtBQUFBLFlBQ1I7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFFBQU0sV0FBVyxNQUFNLG1CQUFtQixLQUFLLGVBQWUsRUFBRSxjQUFjLE1BQU0sQ0FBQztBQUVyRixTQUFPLE1BQU0sYUFBYSxrQkFBa0I7QUFDNUMsU0FBTyxVQUFVLGlCQUFpQix5QkFBeUIsYUFBYSxDQUFDO0FBQ3pFLFNBQU8sVUFBVSxVQUFVO0FBQUEsSUFDekIsU0FBUztBQUFBLElBQ1QsT0FBTztBQUFBLE1BQ0w7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFdBQVc7QUFBQSxVQUNULE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQSxFQUNSLENBQUM7QUFDSCxDQUFDO0FBRUQsS0FBSyx1RUFBdUUsTUFBTTtBQUNoRixRQUFNLFVBQVUseUJBQXlCO0FBQUEsSUFDdkMsR0FBRztBQUFBLElBQ0gsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLEVBQ2YsQ0FBQztBQUVELFNBQU8sTUFBTSxRQUFRLFFBQVEsNkNBQTZDO0FBQzFFLFNBQU8sTUFBTSxRQUFRLFFBQVEsZ0RBQWdEO0FBQzdFLFNBQU8sTUFBTSxRQUFRLFFBQVEsK0JBQStCO0FBQzVELFNBQU8sTUFBTSxRQUFRLFFBQVEsa0NBQWtDO0FBQy9ELFNBQU8sTUFBTSxRQUFRLFFBQVEsa0VBQWtFO0FBQ2pHLENBQUM7QUFFRCxLQUFLLHNFQUFzRSxNQUFNO0FBQy9FLFFBQU0sVUFBVSx5QkFBeUI7QUFBQSxJQUN2QyxHQUFHO0FBQUEsSUFDSCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDZixDQUFDO0FBRUQsU0FBTyxNQUFNLFFBQVEsUUFBUSxvREFBb0Q7QUFDakYsU0FBTyxNQUFNLFFBQVEsUUFBUSwwQ0FBMEM7QUFDdkUsU0FBTyxNQUFNLFFBQVEsUUFBUSxhQUFhO0FBQzFDLFNBQU8sTUFBTSxRQUFRLFFBQVEsOENBQThDO0FBQzdFLENBQUM7QUFFRCxLQUFLLGlFQUFpRSxZQUFZO0FBQ2hGLFFBQU0sa0JBQWtCLHVCQUF1QixPQUFPO0FBQ3RELE1BQUksY0FBYztBQUNsQixNQUFJO0FBRUosTUFBSSxPQUFRLE9BQU8sS0FBSyxZQUFZO0FBQ2xDLGtCQUFjLE9BQU8sR0FBRztBQUN4QixzQkFBa0I7QUFFbEIsV0FBTztBQUFBLE1BQ0wsTUFBTTtBQUFBLFFBQ0osU0FBUztBQUFBLFFBQ1QsT0FBTztBQUFBLFVBQ0w7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFdBQVc7QUFBQSxjQUNULE1BQU07QUFBQSxZQUNSO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBLE1BQU07QUFBQSxVQUNKLGFBQWE7QUFBQSxVQUNiLFlBQVk7QUFBQSxVQUNaLGVBQWU7QUFBQSxVQUNmLFNBQVM7QUFBQSxVQUNULFVBQVU7QUFBQSxRQUNaO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsUUFBTSxXQUFXLE1BQU0sbUJBQW1CLEtBQUssZUFBZSxFQUFFLGNBQWMsS0FBSyxDQUFDO0FBRXBGLFNBQU8sTUFBTSxhQUFhLHFCQUFxQjtBQUMvQyxTQUFPLE1BQU0saUJBQWlCLFFBQVEsT0FBTztBQUM3QyxTQUFPLE1BQU0saUJBQWlCLDBCQUEwQixnQkFBZ0IsT0FBTztBQUMvRSxTQUFPLFVBQVUsaUJBQWlCLG1CQUFtQixlQUFlO0FBQ3BFLFNBQU8sTUFBTSxTQUFTLE1BQU0sYUFBYSxlQUFlO0FBQ3hELFNBQU8sTUFBTSxTQUFTLE1BQU0sU0FBUyxZQUFZO0FBQ25ELENBQUM7QUFFRCxLQUFLLDhFQUE4RSxZQUFZO0FBQzdGLFFBQU0sUUFBd0MsQ0FBQztBQUUvQyxNQUFJLE9BQVEsT0FBTyxNQUFNLFlBQVk7QUFDbkMsVUFBTSxLQUFLLE9BQWtDO0FBQzdDLFdBQU87QUFBQSxNQUNMLE1BQU07QUFBQSxRQUNKLFNBQVM7QUFBQSxRQUNULE9BQU8sQ0FBQztBQUFBLFFBQ1IsTUFBTTtBQUFBLFVBQ0osYUFBYTtBQUFBLFVBQ2IsWUFBWTtBQUFBLFVBQ1osU0FBUyxTQUFTLE1BQU0sTUFBTTtBQUFBLFVBQzlCLFVBQVU7QUFBQSxRQUNaO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsUUFBTSxtQkFBbUIsS0FBSyxlQUFlLEVBQUUsY0FBYyxLQUFLLENBQUM7QUFDbkUsUUFBTSxtQkFBbUIsS0FBSyxlQUFlLEVBQUUsY0FBYyxLQUFLLENBQUM7QUFFbkUsU0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQzVCLFNBQU8sR0FBRyx1QkFBdUIsTUFBTSxDQUFDLENBQUM7QUFDekMsU0FBTyxHQUFHLEVBQUUsdUJBQXVCLE1BQU0sQ0FBQyxFQUFFO0FBQzlDLENBQUM7QUFFRCxLQUFLLHFGQUFxRixZQUFZO0FBQ3BHLFFBQU0sUUFBd0MsQ0FBQztBQUMvQyxRQUFNLGlCQUFpQix1QkFBdUIsT0FBTyxFQUFFO0FBRXZELGFBQVcsUUFBUSxhQUFhO0FBQUEsSUFDOUI7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUVBLE1BQUksT0FBUSxPQUFPLE1BQU0sWUFBWTtBQUNuQyxVQUFNLEtBQUssT0FBa0M7QUFFN0MsUUFBSSxNQUFNLFdBQVcsR0FBRztBQUN0QixZQUFNLHFCQUFxQixLQUFLLHdEQUF3RDtBQUFBLElBQzFGO0FBRUEsV0FBTztBQUFBLE1BQ0wsTUFBTTtBQUFBLFFBQ0osU0FBUztBQUFBLFFBQ1QsT0FBTyxDQUFDO0FBQUEsUUFDUixNQUFNO0FBQUEsVUFDSixhQUFhO0FBQUEsVUFDYixZQUFZO0FBQUEsVUFDWixTQUFTO0FBQUEsUUFDWDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFFBQU0sV0FBVyxNQUFNLG1CQUFtQixLQUFLLGVBQWUsRUFBRSxjQUFjLEtBQUssQ0FBQztBQUVwRixTQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsU0FBTyxHQUFHLEVBQUUsdUJBQXVCLE1BQU0sQ0FBQyxFQUFFO0FBQzVDLFNBQU8sR0FBRyx1QkFBdUIsTUFBTSxDQUFDLENBQUM7QUFDekMsU0FBTyxNQUFNLFNBQVMsTUFBTSxTQUFTLGFBQWE7QUFDcEQsQ0FBQztBQUVELEtBQUssc0VBQXNFLFlBQVk7QUFDckYsTUFBSSxPQUFRLGFBQWE7QUFBQSxJQUN2QixNQUFNO0FBQUEsTUFDSixTQUFTO0FBQUEsTUFDVCxPQUFPLENBQUM7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUVBLFFBQU0sV0FBVyxNQUFNLG1CQUFtQixLQUFLLGVBQWUsRUFBRSxjQUFjLE1BQU0sQ0FBQztBQUVyRixTQUFPLFVBQVUsVUFBVTtBQUFBLElBQ3pCLFNBQVM7QUFBQSxJQUNULE9BQU8sQ0FBQztBQUFBLElBQ1IsTUFBTTtBQUFBLEVBQ1IsQ0FBQztBQUNILENBQUM7QUFFRCxLQUFLLHFEQUFxRCxZQUFZO0FBQ3BFLE1BQUksT0FBUSxZQUFZO0FBQ3RCLFVBQU0scUJBQXFCLEdBQUc7QUFBQSxFQUNoQztBQUVBLFFBQU0sT0FBTztBQUFBLElBQ1gsTUFBTSxtQkFBbUIsS0FBSyxlQUFlLEVBQUUsY0FBYyxNQUFNLENBQUM7QUFBQSxJQUNwRTtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJheGlvcyIsICJheGlvcyJdCn0K
