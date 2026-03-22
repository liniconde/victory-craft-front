import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JarvisFlightState } from "./useJarvisArrival";
import type {
  JarvisAction,
  JarvisActionLifecycleStatus,
  JarvisActionRuntimeState,
  JarvisFlightRequest,
  JarvisTypingState,
} from "../actions/jarvisActionTypes";

const DEFAULT_FLIGHT_DURATION_MS = 1450;
const DEFAULT_START_OFFSET_Y = 120;

const createIdleFlightState = (): JarvisFlightState => ({
  phase: "idle",
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
});

interface UseJarvisActionRunnerOptions {
  actions: JarvisAction[];
  active: boolean;
  launcherSelector?: string;
  onActionComplete?: (actionId: string) => void;
  onActionStart?: (actionId: string) => void;
}

const wait = (durationMs: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, durationMs);
  });

export const useJarvisActionRunner = ({
  actions,
  active,
  launcherSelector = ".agent-widget__launcher",
  onActionComplete,
  onActionStart,
}: UseJarvisActionRunnerOptions) => {
  const targetRegistryRef = useRef(new Map<string, HTMLElement>());
  const [currentActionId, setCurrentActionId] = useState<string | null>(null);
  const [flightState, setFlightState] = useState<JarvisFlightState>(createIdleFlightState);
  const [status, setStatus] = useState<JarvisActionLifecycleStatus>("idle");
  const [typing, setTyping] = useState<JarvisTypingState | null>(null);
  const [visibleMessageIds, setVisibleMessageIds] = useState<string[]>([]);
  const [completedActionIds, setCompletedActionIds] = useState<string[]>([]);

  const registerTarget = useCallback(
    (targetId: string) => (node: HTMLElement | null) => {
      if (!node) {
        targetRegistryRef.current.delete(targetId);
        return;
      }

      targetRegistryRef.current.set(targetId, node);
    },
    []
  );

  const resetRuntimeState = useCallback(() => {
    setCurrentActionId(null);
    setFlightState(createIdleFlightState());
    setStatus("idle");
    setTyping(null);
    setVisibleMessageIds([]);
    setCompletedActionIds([]);
  }, []);

  const runFlight = useCallback(
    async (request: JarvisFlightRequest) => {
      const targetElement = targetRegistryRef.current.get(request.targetId);
      if (typeof window === "undefined" || !targetElement) return;

      const launcher = document.querySelector<HTMLElement>(
        request.launcherSelector || launcherSelector
      );
      const launcherRect = launcher?.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const durationMs = request.durationMs ?? DEFAULT_FLIGHT_DURATION_MS;
      const startOffsetY = request.startOffsetY ?? DEFAULT_START_OFFSET_Y;

      const startX =
        launcherRect?.left !== undefined
          ? launcherRect.left + launcherRect.width / 2
          : window.innerWidth - 64;
      const startY =
        launcherRect?.top !== undefined
          ? launcherRect.top + launcherRect.height / 2 + startOffsetY
          : window.innerHeight + startOffsetY;
      const endX = targetRect.left + targetRect.width / 2;
      const endY = targetRect.top + targetRect.height / 2;

      setFlightState({
        phase: "preparing",
        startX,
        startY,
        deltaX: endX - startX,
        deltaY: endY - startY,
      });

      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setFlightState((current) => ({ ...current, phase: "flying" }));
            resolve();
          });
        });
      });

      await wait(durationMs);
      setFlightState((current) => ({ ...current, phase: "arrived" }));
    },
    [launcherSelector]
  );

  const showTyping = useCallback(async (request: { durationMs: number; label?: string }) => {
    setTyping({
      label: request.label || "Jarvis esta escribiendo...",
    });

    await wait(request.durationMs);
    setTyping(null);
  }, []);

  const hideTyping = useCallback(() => {
    setTyping(null);
  }, []);

  const revealMessage = useCallback((messageId: string) => {
    setVisibleMessageIds((current) =>
      current.includes(messageId) ? current : [...current, messageId]
    );
  }, []);

  useEffect(() => {
    if (!active || actions.length === 0) {
      resetRuntimeState();
      return;
    }

    let cancelled = false;

    const run = async () => {
      setStatus("running");

      for (const action of actions) {
        if (cancelled) return;

        setCurrentActionId(action.id);
        onActionStart?.(action.id);

        await action.run({
          hideTyping,
          revealMessage,
          runFlight,
          showTyping,
          wait,
        });

        if (cancelled) return;

        setCompletedActionIds((current) => [...current, action.id]);
        onActionComplete?.(action.id);
      }

      setCurrentActionId(null);
      setStatus("completed");
    };

    void run();

    return () => {
      cancelled = true;
      resetRuntimeState();
    };
  }, [
    actions,
    active,
    hideTyping,
    onActionComplete,
    onActionStart,
    resetRuntimeState,
    revealMessage,
    runFlight,
    showTyping,
  ]);

  const runtimeState = useMemo<JarvisActionRuntimeState>(
    () => ({
      currentActionId,
      flightState,
      status,
      typing,
      visibleMessageIds,
    }),
    [currentActionId, flightState, status, typing, visibleMessageIds]
  );

  return {
    completedActionIds,
    isMessageVisible: (messageId: string) => visibleMessageIds.includes(messageId),
    registerTarget,
    runtimeState,
  };
};
