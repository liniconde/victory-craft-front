import { useEffect, useState } from "react";

export type AppViewportOrientation = "portrait" | "landscape";

export interface UseAppViewportOptions {
  mobileBreakpoint?: number;
}

interface AppViewportState {
  width: number;
  height: number;
  orientation: AppViewportOrientation;
}

const DEFAULT_MOBILE_BREAKPOINT = 880;

const getViewportState = (): AppViewportState => {
  if (typeof window === "undefined") {
    return {
      width: 0,
      height: 0,
      orientation: "landscape",
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    orientation: height > width ? "portrait" : "landscape",
  };
};

export const useAppViewport = (
  options: UseAppViewportOptions = {},
) => {
  const { mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT } = options;
  const [viewport, setViewport] = useState<AppViewportState>(getViewportState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateViewport = () => {
      setViewport((current) => {
        const next = getViewportState();
        if (
          current.width === next.width &&
          current.height === next.height &&
          current.orientation === next.orientation
        ) {
          return current;
        }

        return next;
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  const isMobile = viewport.width > 0 ? viewport.width <= mobileBreakpoint : false;
  const isDesktop = viewport.width > mobileBreakpoint;

  return {
    ...viewport,
    isMobile,
    isDesktop,
    isPortrait: viewport.orientation === "portrait",
    isLandscape: viewport.orientation === "landscape",
    mobileBreakpoint,
  };
};

export default useAppViewport;
