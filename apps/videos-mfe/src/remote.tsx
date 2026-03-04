import React, { useEffect, useMemo, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./index.css";
import SubpagesLayout from "./subpages/layout/SubpagesLayout";
import VideosListPage from "./subpages/videos/pages/VideosListPage";
import NewSubpage from "./subpages/new-page/NewSubpage";
import RecordingSubpage from "./subpages/new-page/RecordingSubpage";
import LiveRoomSubpage from "./subpages/new-page/LiveRoomSubpage";
import VideosLibraryPage from "./subpages/videos-library/pages/VideosLibraryPage";
import VideoAnalyzerPage from "./subpages/video-analyzer/pages/VideoAnalyzerPage";
import VideoForm from "./features/videos/form/VideoForm";
import {
  VideosModuleFeedback,
  VideosModuleProvider,
} from "./features/videos/VideosModuleContext";
import { configureVideosApi } from "./features/videos/api";

type RemoteMode = "list" | "create" | "edit";

interface RemoteVideosMountProps {
  mode: RemoteMode;
  path: string;
  search: string;
  params: Record<string, string | undefined>;
  token: string | null;
  apiBaseUrl: string;
  feedback: VideosModuleFeedback;
}

interface RemoteVideosGlobal {
  mount: (
    container: HTMLElement,
    props: RemoteVideosMountProps
  ) => void | (() => void) | { unmount: () => void };
}

declare global {
  interface Window {
    VictoryVideosMfe?: RemoteVideosGlobal;
  }
}

const roots = new WeakMap<HTMLElement, Root>();

const FallbackRouteByMode: React.FC<{ mode: RemoteMode }> = ({ mode }) => {
  if (mode === "create") return <VideoForm mode="create" />;
  if (mode === "edit") return <VideoForm mode="edit" />;
  return <Navigate to="/subpages/videos" replace />;
};

const MFE_ROUTE_MARKERS = ["/subpages/", "/fields/", "/videos/"];

const normalizePath = (pathname: string, search?: string): string => {
  const safePath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${safePath}${search ?? ""}`;
};

const extractMfePath = (pathname: string, search = ""): string | null => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const matchIndex = MFE_ROUTE_MARKERS.reduce<number>((index, marker) => {
    const markerIndex = normalizedPath.indexOf(marker);
    if (markerIndex < 0) return index;
    if (index === -1) return markerIndex;
    return Math.min(index, markerIndex);
  }, -1);

  if (matchIndex < 0) return null;
  return normalizePath(normalizedPath.slice(matchIndex), search);
};

const RouteSyncInterceptor: React.FC<{
  initialPath: string;
  initialSearch: string;
}> = ({ initialPath, initialSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const didInitRef = useRef(false);
  const currentRoute = useMemo(
    () => normalizePath(location.pathname, location.search),
    [location.pathname, location.search]
  );

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const fromBrowser = extractMfePath(window.location.pathname, window.location.search);
    const fromMountProps = extractMfePath(initialPath, initialSearch);
    const targetRoute = fromBrowser || fromMountProps;

    if (targetRoute && targetRoute !== currentRoute) {
      navigate(targetRoute, { replace: true });
    }
  }, [currentRoute, initialPath, initialSearch, navigate]);

  useEffect(() => {
    const onPopState = () => {
      const targetRoute = extractMfePath(window.location.pathname, window.location.search);
      if (targetRoute && targetRoute !== currentRoute) {
        navigate(targetRoute, { replace: true });
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [currentRoute, navigate]);

  return null;
};

const RemoteVideosApp: React.FC<{
  mode: RemoteMode;
  feedback: VideosModuleFeedback;
  initialPath: string;
  initialSearch: string;
}> = ({ mode, feedback, initialPath, initialSearch }) => {
  return (
    <VideosModuleProvider feedback={feedback}>
      <BrowserRouter>
        <RouteSyncInterceptor initialPath={initialPath} initialSearch={initialSearch} />
        <Routes>
          <Route path="/" element={<SubpagesLayout />}>
            <Route path="subpages/videos" element={<VideosListPage />} />
            <Route path="subpages/new-page" element={<NewSubpage />} />
            <Route path="subpages/new-page/recording" element={<RecordingSubpage />} />
            <Route
              path="subpages/new-page/live-room-client"
              element={<LiveRoomSubpage />}
            />
            <Route path="subpages/videos-library" element={<VideosLibraryPage />} />
            <Route path="subpages/video-analyzer" element={<VideoAnalyzerPage />} />
            <Route
              path="fields/:fieldId/videos/create"
              element={<VideoForm mode="create" />}
            />
            <Route path="videos/:videoId/update" element={<VideoForm mode="edit" />} />
            <Route
              path="fields/:fieldId/videos/:videoId/edit"
              element={<VideoForm mode="create" />}
            />
            <Route path="fields/videos/" element={<Navigate to="/subpages/videos" replace />} />
            <Route index element={<Navigate to="/subpages/videos" replace />} />
            <Route path="*" element={<FallbackRouteByMode mode={mode} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </VideosModuleProvider>
  );
};

const mount: RemoteVideosGlobal["mount"] = (container, props) => {
  const { apiBaseUrl, token, feedback, mode, path, search } = props;
  configureVideosApi({ baseURL: apiBaseUrl, token });
  container.classList.add("videos-mfe-scope");

  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }

  root.render(
    <RemoteVideosApp
      mode={mode}
      feedback={feedback}
      initialPath={path}
      initialSearch={search}
    />
  );

  return () => {
    const mountedRoot = roots.get(container);
    if (mountedRoot) {
      mountedRoot.unmount();
      roots.delete(container);
    }
  };
};

window.VictoryVideosMfe = { mount };
