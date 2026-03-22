import type { JarvisFlightState } from "../hooks/useJarvisArrival";

export type JarvisActionLifecycleStatus = "idle" | "running" | "completed";

export interface JarvisFlightRequest {
  bubbleText?: string;
  durationMs?: number;
  launcherSelector?: string;
  startOffsetY?: number;
  targetId: string;
}

export interface JarvisTypingRequest {
  durationMs: number;
  label?: string;
}

export interface JarvisActionExecutionContext {
  hideTyping: () => void;
  revealMessage: (messageId: string) => void;
  runFlight: (request: JarvisFlightRequest) => Promise<void>;
  showTyping: (request: JarvisTypingRequest) => Promise<void>;
  wait: (durationMs: number) => Promise<void>;
}

export interface JarvisAction {
  id: string;
  run: (context: JarvisActionExecutionContext) => Promise<void>;
}

export interface JarvisTypingState {
  label: string;
}

export interface JarvisActionRuntimeState {
  currentActionId: string | null;
  flightState: JarvisFlightState;
  status: JarvisActionLifecycleStatus;
  typing: JarvisTypingState | null;
  visibleMessageIds: string[];
}
