import React from "react";
import { createRoot, Root } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import SubpagesLayout from "./subpages/layout/SubpagesLayout";
import VideosListPage from "./subpages/videos/pages/VideosListPage";
import NewSubpage from "./subpages/new-page/NewSubpage";
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

const RemoteVideosApp: React.FC<{ mode: RemoteMode; feedback: VideosModuleFeedback }> = ({
  mode,
  feedback,
}) => {
  return (
    <VideosModuleProvider feedback={feedback}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SubpagesLayout />}>
            <Route path="subpages/videos" element={<VideosListPage />} />
            <Route path="subpages/new-page" element={<NewSubpage />} />
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
  const { apiBaseUrl, token, feedback, mode } = props;
  configureVideosApi({ baseURL: apiBaseUrl, token });
  container.classList.add("videos-mfe-scope");

  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }

  root.render(<RemoteVideosApp mode={mode} feedback={feedback} />);

  return () => {
    const mountedRoot = roots.get(container);
    if (mountedRoot) {
      mountedRoot.unmount();
      roots.delete(container);
    }
  };
};

window.VictoryVideosMfe = { mount };
