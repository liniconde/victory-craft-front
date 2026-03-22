export type OnboardingSportId = "football" | "basketball" | "volleyball" | "tennis";

export interface OnboardingSportOption {
  id: OnboardingSportId;
  label: string;
  accent: string;
  hero: string;
  promise: string;
  spotlight: string;
  imageUrl: string;
  imageAlt: string;
}

export interface OnboardingSpotlightStep {
  id: string;
  route: string;
  title: string;
  description: string;
  selectors: string[];
}

export const SCOUTING_ONBOARDING_ID = "scouting";
export const SCOUTING_ONBOARDING_VERSION = "v1";

export const SPORT_OPTIONS: OnboardingSportOption[] = [
  {
    id: "football",
    label: "Futbol",
    accent: "#2f9e44",
    hero: "Marca goles, firma asistencias y muestra atajadas que cambien partidos.",
    promise: "Tu scouting puede poner tus mejores jugadas frente a una comunidad global.",
    spotlight: "Cada clip puede convertirse en tu siguiente oportunidad.",
    imageUrl:
      "https://images.pexels.com/photos/29719222/pexels-photo-29719222.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Jugador de futbol pateando un balon en un estadio vacio.",
  },
  {
    id: "basketball",
    label: "Baloncesto",
    accent: "#f77f00",
    hero: "Rompe defensas, encesta puntos decisivos y enseña tu lectura de juego.",
    promise: "Sube jugadas con ritmo, IQ y personalidad competitiva para destacar.",
    spotlight: "Un gran highlight puede abrir conversaciones inesperadas.",
    imageUrl:
      "https://images.pexels.com/photos/12993255/pexels-photo-12993255.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Balon de baloncesto entrando en el aro en formato vertical.",
  },
  {
    id: "volleyball",
    label: "Voleibol",
    accent: "#118ab2",
    hero: "Destaca remates, bloqueos, recepciones y puntos que cambian sets completos.",
    promise: "Convierte tus mejores acciones en una carta de presentación potente.",
    spotlight: "La consistencia tambien se cuenta cuando alguien te esta mirando.",
    imageUrl:
      "https://images.pexels.com/photos/30307748/pexels-photo-30307748.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Balon de voleibol sobre una cancha interior iluminada.",
  },
  {
    id: "tennis",
    label: "Tenis",
    accent: "#8ac926",
    hero: "Haz visibles tus puntos, winners, devoluciones y momentos de caracter.",
    promise: "Presenta tu tecnica, intensidad y talento competitivo en un solo lugar.",
    spotlight: "Tu siguiente espectador podria estar buscando exactamente ese perfil.",
    imageUrl:
      "https://images.pexels.com/photos/22775589/pexels-photo-22775589.jpeg?auto=compress&cs=tinysrgb&w=1200",
    imageAlt: "Pelota de tenis sobre la linea de una cancha azul y verde.",
  },
];

export const SCOUTING_SPOTLIGHT_STEPS: OnboardingSpotlightStep[] = [
  {
    id: "scouting-menu",
    route: "/scouting/subpages/dashboard",
    title: "Este es tu menu de scouting",
    description:
      "Desde aqui entras al dashboard y te mueves por todo el flujo. Siempre podras volver a esta zona desde la navegacion principal.",
    selectors: [
      "[data-onboarding='scouting-sidebar-header']",
      "[data-onboarding='scouting-mobile-trigger']",
    ],
  },
  {
    id: "dashboard",
    route: "/scouting/subpages/dashboard",
    title: "Dashboard",
    description:
      "Es tu punto de partida. Aqui entiendes el ecosistema, ves accesos rapidos y detectas que esta pasando en scouting.",
    selectors: ["[data-onboarding='scouting-menu-dashboard']"],
  },
  {
    id: "player-profiles",
    route: "/scouting/subpages/player-profiles",
    title: "Player Profiles",
    description:
      "Este es el primer paso real del flujo. Crea o completa tu perfil para que cada video tenga contexto de jugador, posicion, categoria y ciudad.",
    selectors: ["[data-onboarding='scouting-menu-player-profiles']"],
  },
  {
    id: "library",
    route: "/scouting/subpages/library",
    title: "Library",
    description:
      "Cuando tu perfil este listo, aqui podras subir videos, organizarlos y preparar el material que despues vas a competir o compartir.",
    selectors: ["[data-onboarding='scouting-menu-library']"],
  },
  {
    id: "rankings",
    route: "/scouting/subpages/rankings",
    title: "Rankings",
    description:
      "En rankings ves los mejores videos del mundo, comparas tu nivel, votas y entiendes como se mueve la competencia global.",
    selectors: ["[data-onboarding='scouting-menu-rankings']"],
  },
];
