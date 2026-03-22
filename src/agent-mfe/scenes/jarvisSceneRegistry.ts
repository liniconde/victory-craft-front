import { ASSISTANT_NAME, ASSISTANT_WELCOME_COPY } from "../constants/assistantBrand";

export type JarvisSceneType = "greeting" | "reminder";

export interface JarvisGreetingSceneDefinition {
  id: string;
  type: "greeting";
  title?: string;
  body: string;
  note?: string;
  bubbleText?: string;
  enableArrival?: boolean;
}

export interface JarvisReminderSceneDefinition {
  id: string;
  type: "reminder";
  title?: string;
  body: string;
}

export type JarvisSceneDefinition =
  | JarvisGreetingSceneDefinition
  | JarvisReminderSceneDefinition;

export interface BuildScoutingWelcomeSceneParams {
  displayName: string;
}

export interface BuildJarvisCapabilityReminderParams {
  title?: string;
}

export const buildScoutingWelcomeScene = ({
  displayName,
}: BuildScoutingWelcomeSceneParams): JarvisGreetingSceneDefinition => ({
  id: "jarvis.scouting.welcome",
  type: "greeting",
  title: ASSISTANT_NAME,
  body: `Hola ${displayName}, soy ${ASSISTANT_NAME}. ${ASSISTANT_WELCOME_COPY} Voy a acompanarte en este recorrido y ayudarte a llegar rapido a cada parte importante de Victory Craft.`,
  bubbleText: "Hola, voy para alla",
  enableArrival: true,
});

export const buildJarvisCapabilityReminderScene = (
  params?: BuildJarvisCapabilityReminderParams
): JarvisReminderSceneDefinition => ({
  id: "jarvis.capabilities.reminder",
  type: "reminder",
  title: params?.title ?? `${ASSISTANT_NAME} sigue contigo`,
  body:
    "Si tienes dudas, no sabes donde hacer algo o quieres ir mas rapido, llamame. Puedo orientarte, llevarte a la seccion correcta y ejecutar acciones dentro de la aplicacion para ayudarte a moverte sin perder tiempo.",
});

export const JARVIS_SCENE_REGISTRY = {
  "jarvis.scouting.welcome": buildScoutingWelcomeScene,
  "jarvis.capabilities.reminder": buildJarvisCapabilityReminderScene,
} as const;
