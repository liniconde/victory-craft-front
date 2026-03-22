import { useEffect, useState } from "react";

export type JarvisFlightPhase = "idle" | "preparing" | "flying" | "arrived";

export interface JarvisFlightState {
  phase: JarvisFlightPhase;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
}

interface UseJarvisArrivalOptions {
  enabled: boolean;
  targetElement: HTMLElement | null;
  launcherSelector?: string;
  durationMs?: number;
  startOffsetY?: number;
}

const DEFAULT_DURATION_MS = 1450;
const DEFAULT_START_OFFSET_Y = 120;

const createIdleState = (): JarvisFlightState => ({
  phase: "idle",
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
});

export const useJarvisArrival = ({
  enabled,
  launcherSelector = ".agent-widget__launcher",
  targetElement,
  durationMs = DEFAULT_DURATION_MS,
  startOffsetY = DEFAULT_START_OFFSET_Y,
}: UseJarvisArrivalOptions) => {
  const [flightState, setFlightState] = useState<JarvisFlightState>(createIdleState);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !targetElement) {
      setFlightState(createIdleState());
      return;
    }

    let timeoutId: number | null = null;
    const launcher = document.querySelector<HTMLElement>(launcherSelector);
    const launcherRect = launcher?.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

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

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setFlightState((current) => ({ ...current, phase: "flying" }));
      });
    });

    timeoutId = window.setTimeout(() => {
      setFlightState((current) => ({ ...current, phase: "arrived" }));
    }, durationMs);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [durationMs, enabled, launcherSelector, startOffsetY, targetElement]);

  return {
    flightState,
    hasArrived: flightState.phase === "arrived",
    durationMs,
  };
};
