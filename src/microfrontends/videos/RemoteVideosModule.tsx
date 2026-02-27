import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useAppFeedback } from "../../hooks/useAppFeedback";

type RemoteMode = "list" | "create" | "edit";

interface RemoteVideosModuleProps {
  mode: RemoteMode;
}

interface RemoteVideosMountProps {
  mode: RemoteMode;
  path: string;
  search: string;
  params: Record<string, string | undefined>;
  token: string | null;
  apiBaseUrl: string;
  feedback: {
    showLoading: (message?: string) => void;
    hideLoading: () => void;
    showError: (message: string) => void;
    isLoading: boolean;
  };
}

interface RemoteVideosGlobal {
  mount: (
    container: HTMLElement,
    props: RemoteVideosMountProps,
  ) => void | (() => void) | { unmount: () => void };
}

declare global {
  interface Window {
    VictoryVideosMfe?: RemoteVideosGlobal;
  }
}

const remoteScriptPromises = new Map<string, Promise<void>>();
const remoteStylePromises = new Map<string, Promise<void>>();

type RemoteLoadErrorMeta = {
  kind: "script" | "style";
  resourceUrl: string;
  eventType: string;
  fetchStatus?: number;
  fetchOk?: boolean;
  fetchContentType?: string | null;
  fetchError?: string;
  currentUrl: string;
};

const buildRemoteLoadError = async (
  kind: "script" | "style",
  resourceUrl: string,
  event: Event | string,
) => {
  const meta: RemoteLoadErrorMeta = {
    kind,
    resourceUrl,
    eventType: typeof event === "string" ? event : event.type,
    currentUrl: window.location.href,
  };

  try {
    const response = await fetch(resourceUrl, {
      method: "GET",
      cache: "no-store",
    });
    meta.fetchStatus = response.status;
    meta.fetchOk = response.ok;
    meta.fetchContentType = response.headers.get("content-type");
  } catch (fetchErr) {
    meta.fetchError =
      fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
  }

  const error = new Error(
    `Remote ${kind} load error (${resourceUrl}). Check console for diagnostics.`,
  ) as Error & { meta?: RemoteLoadErrorMeta };
  error.meta = meta;
  return error;
};

const loadRemoteScript = (scriptUrl: string) => {
  if (remoteScriptPromises.has(scriptUrl)) {
    return remoteScriptPromises.get(scriptUrl)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-videos-mfe="${scriptUrl}"]`,
    );

    if (existing) {
      if (window.VictoryVideosMfe?.mount) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        async (event) => reject(await buildRemoteLoadError("script", scriptUrl, event)),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.dataset.videosMfe = scriptUrl;
    script.onload = () => resolve();
    script.onerror = async (event) =>
      reject(await buildRemoteLoadError("script", scriptUrl, event));
    document.head.appendChild(script);
  });

  remoteScriptPromises.set(scriptUrl, promise);
  return promise;
};

const loadRemoteStyle = (scriptUrl: string) => {
  const styleUrl = scriptUrl.replace(/\.js($|\?)/, ".css$1");
  if (remoteStylePromises.has(styleUrl)) {
    return remoteStylePromises.get(styleUrl)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLLinkElement>(
      `link[data-videos-mfe-style="${styleUrl}"]`,
    );

    if (existing) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = styleUrl;
    link.dataset.videosMfeStyle = styleUrl;
    link.onload = () => resolve();
    link.onerror = async (event) =>
      reject(await buildRemoteLoadError("style", styleUrl, event));
    document.head.appendChild(link);
  });

  remoteStylePromises.set(styleUrl, promise);
  return promise;
};

export const RemoteVideosModule: React.FC<RemoteVideosModuleProps> = ({
  mode,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [remoteReady, setRemoteReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const location = useLocation();
  const params = useParams();
  const feedback = useAppFeedback();
  const remoteScriptUrl = import.meta.env.VITE_VIDEOS_MFE_SCRIPT_URL as
    | string
    | undefined;

  // Keep feedback callbacks stable so loading state changes in shell do not remount the MFE.
  const feedbackBridge = useMemo(
    () => ({
      showLoading: feedback.showLoading,
      hideLoading: feedback.hideLoading,
      showError: feedback.showError,
      // Remote module manages its own loading usage via callbacks.
      isLoading: false,
    }),
    [feedback.showLoading, feedback.hideLoading, feedback.showError],
  );

  // Capture initial location once to avoid re-mount when MFE changes internal state
  const initialLocationRef = useRef({
    pathname: location.pathname,
    search: location.search,
    params: params,
  });

  const mountProps = useMemo<RemoteVideosMountProps>(
    () => ({
      mode,
      path: initialLocationRef.current.pathname,
      search: initialLocationRef.current.search,
      params: initialLocationRef.current.params,
      token: localStorage.getItem("token"),
      apiBaseUrl: import.meta.env.VITE_API_URL || "",
      feedback: feedbackBridge,
    }),
    [mode, feedbackBridge],
  );

  useEffect(() => {
    console.debug("RemoteVideosModule: effect start", { remoteScriptUrl });

    if (!remoteScriptUrl) {
      setLoadError("No se configuró VITE_VIDEOS_MFE_SCRIPT_URL.");
      return;
    }

    let cleanup: (() => void) | undefined;
    let isMounted = true;

    loadRemoteScript(remoteScriptUrl)
      .then(() => {
        console.debug("RemoteVideosModule: script loaded", { remoteScriptUrl });
        // Try to load the stylesheet but do not fail the whole flow if it errors
        return loadRemoteStyle(remoteScriptUrl).catch((err) => {
          console.warn(
            "RemoteVideosModule: style failed to load, continuing without styles",
            err,
          );
        });
      })
      .then(() => {
        if (!isMounted || !containerRef.current) return;

        console.debug("RemoteVideosModule: attempting mount", {
          container: containerRef.current,
        });

        const remote = window.VictoryVideosMfe;
        if (!remote?.mount) {
          throw new Error("VictoryVideosMfe.mount not found");
        }

        try {
          const mounted = remote.mount(containerRef.current, mountProps);
          if (typeof mounted === "function") cleanup = mounted;
          if (mounted && typeof mounted === "object" && "unmount" in mounted) {
            cleanup = mounted.unmount;
          }
          console.debug("RemoteVideosModule: mount invoked successfully");
          setRemoteReady(true);
        } catch (err) {
          console.error("RemoteVideosModule: mount threw an error", err);
          throw err;
        }
      })
      .catch((error) => {
        console.error("Failed to load videos remote:", error);
        const loadErrorMeta = (error as Error & { meta?: RemoteLoadErrorMeta })
          .meta;
        if (loadErrorMeta) {
          console.error("RemoteVideosModule diagnostics:", loadErrorMeta);
        }
        setLoadError("No se pudo cargar el microfrontend de videos.");
      });

    return () => {
      isMounted = false;
      try {
        cleanup?.();
      } catch (e) {
        console.warn("RemoteVideosModule: cleanup threw", e);
      }
    };
  }, [mountProps, remoteScriptUrl]);

  if (loadError) {
    return <p className="text-red-600 text-center py-6">{loadError}</p>;
  }

  return (
    <>
      {!remoteReady && <p className="text-center py-6">Cargando videos...</p>}
      <div
        ref={containerRef}
        style={{ display: remoteReady ? "block" : "none" }}
      />
    </>
  );
};
