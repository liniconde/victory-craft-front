export interface AppNavigationEntry {
  id: string;
  title: string;
  path: string;
  description: string;
  section: string;
  aliases?: string[];
  pathPattern?: RegExp;
  notes?: string[];
}

const APP_NAVIGATION_ENTRIES: AppNavigationEntry[] = [
  {
    id: "home",
    title: "Home",
    path: "/",
    description: "Landing principal de Victory Craft.",
    section: "general",
    aliases: ["inicio", "home", "portada"],
  },
  {
    id: "users",
    title: "Users",
    path: "/users",
    description: "Vista privada de usuarios.",
    section: "general",
    aliases: ["usuarios", "users"],
  },
  {
    id: "fields_list",
    title: "Fields List",
    path: "/fields",
    description: "Listado principal de canchas.",
    section: "fields",
    aliases: ["fields", "canchas", "listado de canchas"],
  },
  {
    id: "field_create",
    title: "Field Create",
    path: "/fields/new",
    description: "Formulario para crear una cancha.",
    section: "fields",
    aliases: ["crear cancha", "nueva cancha", "new field"],
  },
  {
    id: "field_edit",
    title: "Field Edit",
    path: "/fields/edit/:id",
    description: "Formulario para editar una cancha existente.",
    section: "fields",
    aliases: ["editar cancha", "edit field"],
    pathPattern: /^\/fields\/edit\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere id de la cancha."],
  },
  {
    id: "field_reservations",
    title: "Field Reservations",
    path: "/fields/:id/reservations",
    description: "Reservas asociadas a una cancha especifica.",
    section: "fields",
    aliases: ["reservas de cancha", "field reservations"],
    pathPattern: /^\/fields\/[^/]+\/reservations\/?$/,
    notes: ["Ruta dinamica: requiere id de la cancha."],
  },
  {
    id: "reservations_dashboard",
    title: "Reservations",
    path: "/reservations",
    description: "Vista principal de reservas.",
    section: "reservations",
    aliases: ["reservas", "reservations"],
  },
  {
    id: "reservation_create",
    title: "Reservation Create",
    path: "/reservations/new",
    description: "Formulario para crear una reserva sin cancha preseleccionada.",
    section: "reservations",
    aliases: ["nueva reserva", "crear reserva"],
  },
  {
    id: "reservation_create_for_field",
    title: "Reservation Create For Field",
    path: "/reservations/new/:fieldId",
    description: "Formulario para crear una reserva desde una cancha concreta.",
    section: "reservations",
    aliases: ["nueva reserva de cancha", "crear reserva para cancha"],
    pathPattern: /^\/reservations\/new\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere fieldId."],
  },
  {
    id: "reservation_edit",
    title: "Reservation Edit",
    path: "/reservations/edit/:id",
    description: "Formulario para editar una reserva existente.",
    section: "reservations",
    aliases: ["editar reserva", "edit reservation"],
    pathPattern: /^\/reservations\/edit\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere id de la reserva."],
  },
  {
    id: "slots_list",
    title: "Slots",
    path: "/slots",
    description: "Listado principal de slots.",
    section: "slots",
    aliases: ["slots", "horarios", "turnos"],
  },
  {
    id: "slot_create",
    title: "Slot Create",
    path: "/slots/new/:fieldId",
    description: "Formulario para crear un slot para una cancha.",
    section: "slots",
    aliases: ["nuevo slot", "crear slot"],
    pathPattern: /^\/slots\/new\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere fieldId."],
  },
  {
    id: "slot_edit",
    title: "Slot Edit",
    path: "/slots/edit/:id",
    description: "Formulario para editar un slot existente.",
    section: "slots",
    aliases: ["editar slot", "edit slot"],
    pathPattern: /^\/slots\/edit\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere id del slot."],
  },
  {
    id: "videos_dashboard",
    title: "Videos Dashboard",
    path: "/videos/subpages/dashboard",
    description: "Dashboard principal del modulo de videos.",
    section: "videos",
    aliases: ["videos", "dashboard de videos", "videos dashboard"],
    notes: ["Alias de acceso: /fields/videos y /subpages redirigen aqui o al modulo videos."],
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
      "línea de tiempo",
      "session timeline",
      "streaming timeline",
    ],
    notes: ["Suele usarse con query matchSessionId."],
  },
  {
    id: "videos_streaming_recording",
    title: "Videos Streaming Recording",
    path: "/videos/subpages/streaming/recording",
    description: "Subpagina para grabar o subir videos dentro del modulo de videos.",
    section: "videos",
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
    notes: [
      "Suele usarse con query tournamentMatchId, title y autoCreateSession.",
      "Si el usuario pide grabaciones o subir videos, esta subpagina es mas especifica que el dashboard de videos.",
    ],
  },
  {
    id: "video_update",
    title: "Video Update",
    path: "/videos/:videoId/update",
    description: "Edicion de un video concreto.",
    section: "videos",
    aliases: ["editar video", "update video"],
    pathPattern: /^\/videos\/[^/]+\/update\/?$/,
    notes: ["Ruta dinamica: requiere videoId."],
  },
  {
    id: "videos_field_create",
    title: "Field Video Create",
    path: "/videos/fields/:fieldId/videos/create",
    description: "Creacion de video desde el contexto de una cancha.",
    section: "videos",
    aliases: ["crear video", "subir video para cancha"],
    pathPattern: /^\/videos\/fields\/[^/]+\/videos\/create\/?$/,
    notes: ["Ruta dinamica: requiere fieldId."],
  },
  {
    id: "tournaments_dashboard",
    title: "Tournaments Dashboard",
    path: "/tournaments/subpages/dashboard",
    description: "Pantalla principal del modulo de torneos.",
    section: "tournaments",
    aliases: ["torneos", "tournaments", "dashboard de torneos"],
    notes: ["Puede usarse con hash #tournament-form para abrir el formulario de creacion."],
  },
  {
    id: "tournaments_list",
    title: "Tournaments Subpage",
    path: "/tournaments/subpages/tournaments",
    description: "Subpagina de torneos dentro del modulo de torneos.",
    section: "tournaments",
    aliases: ["subpagina de torneos", "lista de torneos"],
  },
  {
    id: "tournaments_teams",
    title: "Teams Subpage",
    path: "/tournaments/subpages/teams",
    description: "Subpagina de equipos dentro del modulo de torneos.",
    section: "tournaments",
    aliases: ["equipos", "teams"],
  },
  {
    id: "tournaments_players",
    title: "Players Subpage",
    path: "/tournaments/subpages/players",
    description: "Subpagina de jugadores dentro del modulo de torneos.",
    section: "tournaments",
    aliases: ["jugadores de torneos", "players"],
  },
  {
    id: "tournaments_matches",
    title: "Matches Subpage",
    path: "/tournaments/subpages/matches",
    description: "Subpagina de partidos dentro del modulo de torneos.",
    section: "tournaments",
    aliases: ["partidos de torneos", "matches"],
  },
  {
    id: "tournaments_match_stats",
    title: "Match Stats Subpage",
    path: "/tournaments/subpages/match-stats",
    description: "Subpagina de estadisticas de partidos dentro del modulo de torneos.",
    section: "tournaments",
    aliases: ["estadisticas", "match stats", "estadisticas de partidos"],
  },
  {
    id: "scouting_dashboard",
    title: "Scouting Dashboard",
    path: "/scouting/subpages/dashboard",
    description: "Pantalla principal del modulo de scouting o recruiters.",
    section: "scouting",
    aliases: ["scouting", "recruiters", "dashboard de scouting"],
    notes: ["La ruta legacy /recruiters redirige aqui."],
  },
  {
    id: "scouting_library",
    title: "Scouting Library",
    path: "/scouting/subpages/library",
    description: "Subpagina library del modulo de scouting.",
    section: "scouting",
    aliases: ["library", "biblioteca", "scouting library"],
  },
  {
    id: "scouting_player_profiles",
    title: "Player Profiles",
    path: "/scouting/subpages/player-profiles",
    description: "Subpagina de fichas de jugador dentro de scouting.",
    section: "scouting",
    aliases: ["player profiles", "perfiles", "fichas de jugador"],
  },
  {
    id: "scouting_rankings",
    title: "Scouting Rankings",
    path: "/scouting/subpages/rankings",
    description: "Subpagina de rankings o board de scouting.",
    section: "scouting",
    aliases: ["rankings", "board", "scouting board"],
  },
  {
    id: "scouting_profile",
    title: "Scouting Profile",
    path: "/scouting/subpages/profile/:videoId",
    description: "Perfil editorial de scouting para un video concreto.",
    section: "scouting",
    aliases: ["perfil de scouting", "profile"],
    pathPattern: /^\/scouting\/subpages\/profile\/[^/]+(?:\?.*)?$/,
    notes: ["Ruta dinamica: requiere videoId.", "Puede incluir query playerProfileId."],
  },
  {
    id: "scouting_video",
    title: "Scouting Video",
    path: "/scouting/subpages/video/:videoId",
    description: "Vista recruiter para un video concreto dentro de scouting.",
    section: "scouting",
    aliases: ["video scouting", "recruiter view", "video detail"],
    pathPattern: /^\/scouting\/subpages\/video\/[^/]+\/?$/,
    notes: ["Ruta dinamica: requiere videoId."],
  },
];

const normalize = (value: string) => value.trim().toLowerCase();

const describeEntry = (entry: AppNavigationEntry) => {
  const aliases = entry.aliases?.length ? ` | aliases: ${entry.aliases.join(", ")}` : "";
  const notes = entry.notes?.length ? ` | notes: ${entry.notes.join(" ")}` : "";
  return `- [${entry.section}] ${entry.title} -> ${entry.path} | ${entry.description}${aliases}${notes}`;
};

export const findNavigationEntryByPath = (path: string) => {
  const normalizedPath = path.trim();

  return (
    APP_NAVIGATION_ENTRIES.find((entry) => entry.path === normalizedPath) ||
    APP_NAVIGATION_ENTRIES.find((entry) => entry.pathPattern?.test(normalizedPath))
  );
};

export const findNavigationEntriesByPrompt = (prompt: string) => {
  const normalizedPrompt = normalize(prompt);

  return APP_NAVIGATION_ENTRIES.filter((entry) => {
    const values = [entry.title, entry.path, ...(entry.aliases || [])].map(normalize);
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
    "- The application has top-level pages and module-specific subpages. Prefer the exact subpage path when the user asks for a section inside tournaments or scouting.",
    "- For dynamic routes with :id or :videoId, only use them when the prompt or context provides that identifier. Otherwise prefer the parent dashboard or list subpage.",
    "- Legacy aliases exist: /recruiters redirects to /scouting/subpages/dashboard and /subpages is handled by the videos module.",
    `Current route: ${params.currentPath}`,
    currentEntry
      ? `Current route match: ${currentEntry.title} (${currentEntry.path})`
      : "Current route match: no exact catalog match found.",
    "Prompt-relevant routes:",
    relevantBlock,
    "Full route catalog:",
    fullMapBlock,
  ].join("\n");
};

export { APP_NAVIGATION_ENTRIES };
