export interface PlannerNavigationCatalogEntry {
  route: string;
  actionName: string;
  title: string;
  section: string;
  page: string;
  subpage: string;
  aliases: string[];
  breadcrumbs: string[];
  parents: string[];
  intentTags: string[];
  isLanding: boolean;
  popularity?: number;
}

export interface PlannerNavigationCatalog {
  version: string;
  locale: string;
  entries: PlannerNavigationCatalogEntry[];
}

export interface AppNavigationEntry extends PlannerNavigationCatalogEntry {
  id: string;
  description: string;
  pathPattern?: RegExp;
  notes?: string[];
}

const createEntry = (
  entry: Omit<PlannerNavigationCatalogEntry, "actionName" | "aliases" | "breadcrumbs" | "parents" | "intentTags"> &
    Pick<AppNavigationEntry, "id" | "description"> & {
      aliases?: string[];
      breadcrumbs?: string[];
      parents?: string[];
      intentTags?: string[];
      notes?: string[];
      pathPattern?: RegExp;
    }
): AppNavigationEntry => ({
  actionName: "navigation.go_to",
  aliases: [],
  breadcrumbs: [],
  parents: [],
  intentTags: [],
  ...entry,
});

const APP_NAVIGATION_ENTRIES: AppNavigationEntry[] = [
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
    popularity: 1,
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
    isLanding: false,
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
    isLanding: false,
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
    isLanding: false,
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
    popularity: 0.95,
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
    isLanding: false,
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
    notes: ["Ruta dinamica: requiere id de la cancha."],
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
    notes: ["Ruta dinamica: requiere id de la cancha."],
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
    popularity: 0.9,
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
    notes: ["Ruta dinamica: requiere fieldId."],
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
    isLanding: false,
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
    notes: ["Ruta dinamica: requiere fieldId."],
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
    notes: ["Ruta dinamica: requiere id de la reserva."],
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
    isLanding: true,
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
    notes: ["Ruta dinamica: requiere fieldId."],
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
    notes: ["Ruta dinamica: requiere id del slot."],
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
      "/subpages",
    ],
    breadcrumbs: ["Videos", "Dashboard"],
    intentTags: ["videos", "dashboard"],
    isLanding: true,
    popularity: 0.88,
    notes: ["Alias de acceso: /fields/videos y /subpages redirigen aqui o al modulo videos."],
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
      "línea de tiempo",
      "session timeline",
      "streaming timeline",
    ],
    breadcrumbs: ["Videos", "Streaming", "Timeline"],
    parents: ["/videos/subpages/dashboard"],
    intentTags: ["videos", "streaming", "timeline"],
    isLanding: false,
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
      "grabación",
      "grabaciones",
      "recording",
      "pagina de grabaciones",
      "pantalla de grabacion",
      "pantalla de grabación",
      "grabar",
    ],
    breadcrumbs: ["Videos", "Streaming", "Recording"],
    parents: ["/videos/subpages/dashboard"],
    intentTags: ["videos", "streaming", "recording", "upload"],
    isLanding: false,
    notes: [
      "Suele usarse con query tournamentMatchId, title y autoCreateSession.",
      "Si el usuario pide grabaciones o subir videos, esta subpagina es mas especifica que el dashboard de videos.",
    ],
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
    notes: ["Ruta dinamica: requiere videoId."],
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
    notes: ["Ruta dinamica: requiere fieldId."],
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
    notes: ["Puede usarse con hash #tournament-form para abrir el formulario de creacion."],
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
    isLanding: false,
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
    isLanding: false,
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
    isLanding: false,
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
    isLanding: false,
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
    isLanding: false,
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
    isLanding: false,
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
    notes: ["La ruta legacy /recruiters redirige aqui."],
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
    isLanding: false,
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
    isLanding: false,
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
    isLanding: false,
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
    notes: ["Ruta dinamica: requiere videoId.", "Puede incluir query playerProfileId."],
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
    notes: ["Ruta dinamica: requiere videoId."],
  }),
];

const normalize = (value: string) => value.trim().toLowerCase();

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
      left.localeCompare(right)
    );

    return `{${entries
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
};

const hashString = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
};

const toCatalogEntry = (entry: AppNavigationEntry): PlannerNavigationCatalogEntry => ({
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
  popularity: entry.popularity,
});

const describeEntry = (entry: AppNavigationEntry) => {
  const aliases = entry.aliases.length ? ` | aliases: ${entry.aliases.join(", ")}` : "";
  const notes = entry.notes?.length ? ` | notes: ${entry.notes.join(" ")}` : "";
  return `- [${entry.section}] ${entry.title} -> ${entry.route} | ${entry.description}${aliases}${notes}`;
};

export const getAppNavigationEntries = () => [...APP_NAVIGATION_ENTRIES];

export const buildNavigationCatalog = (locale: string): PlannerNavigationCatalog => {
  const entries = APP_NAVIGATION_ENTRIES.map((entry) => toCatalogEntry(entry)).sort((left, right) =>
    left.route.localeCompare(right.route)
  );
  const version = `nav-${hashString(stableStringify(entries))}`;

  return {
    version,
    locale,
    entries,
  };
};

export const findNavigationEntryByPath = (path: string) => {
  const normalizedPath = path.trim();

  return (
    APP_NAVIGATION_ENTRIES.find((entry) => entry.route === normalizedPath) ||
    APP_NAVIGATION_ENTRIES.find((entry) => entry.pathPattern?.test(normalizedPath))
  );
};

export const findNavigationEntriesByPrompt = (prompt: string) => {
  const normalizedPrompt = normalize(prompt);

  return APP_NAVIGATION_ENTRIES.filter((entry) => {
    const values = [entry.title, entry.route, ...entry.aliases].map(normalize);
    return values.some((value) => normalizedPrompt.includes(value));
  });
};

export const buildNavigationKnowledgeBlock = (params: {
  currentPath: string;
  prompt: string;
}) => {
  const currentEntry = findNavigationEntryByPath(params.currentPath);
  const relevantEntries = findNavigationEntriesByPrompt(params.prompt);
  const relevantBlock =
    relevantEntries.length > 0
      ? relevantEntries.map((entry) => describeEntry(entry)).join("\n")
      : "- No direct route alias matched from the user prompt.";
  const fullMapBlock = APP_NAVIGATION_ENTRIES.map((entry) => describeEntry(entry)).join("\n");

  return [
    "Navigation knowledge for Victory Craft:",
    "- Always use absolute internal paths when calling navigation.go_to.",
    "- The application has top-level pages and module-specific subpages. Prefer the exact subpage path when the user asks for a section inside tournaments, scouting, or videos.",
    "- For dynamic routes with :id, :fieldId or :videoId, only use them when the prompt or context provides that identifier. Otherwise prefer the parent dashboard or list subpage.",
    "- Legacy aliases exist: /recruiters redirects to /scouting/subpages/dashboard and /fields/videos plus /subpages are handled by the videos module.",
    `Current route: ${params.currentPath}`,
    currentEntry
      ? `Current route match: ${currentEntry.title} (${currentEntry.route})`
      : "Current route match: no exact catalog match found.",
    "Prompt-relevant routes:",
    relevantBlock,
    "Full route catalog:",
    fullMapBlock,
  ].join("\n");
};

export { APP_NAVIGATION_ENTRIES };
