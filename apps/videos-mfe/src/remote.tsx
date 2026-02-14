import React from "react";
import { createRoot, Root } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import FieldVideosPage from "./features/videos/FieldVideosPage";
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
  return <FieldVideosPage />;
};

const RemoteVideosApp: React.FC<{ mode: RemoteMode; feedback: VideosModuleFeedback }> = ({
  mode,
  feedback,
}) => {
  return (
    <VideosModuleProvider feedback={feedback}>
      <BrowserRouter>
        <Routes>
          <Route path="/fields/videos/" element={<FieldVideosPage />} />
          <Route
            path="/fields/:fieldId/videos/create"
            element={<VideoForm mode="create" />}
          />
          <Route path="/videos/:videoId/update" element={<VideoForm mode="edit" />} />
          <Route
            path="/fields/:fieldId/videos/:videoId/edit"
            element={<VideoForm mode="create" />}
          />
          <Route path="/" element={<Navigate to="/fields/videos/" replace />} />
          <Route path="*" element={<FallbackRouteByMode mode={mode} />} />
        </Routes>
      </BrowserRouter>
    </VideosModuleProvider>
  );
};

const mount: RemoteVideosGlobal["mount"] = (container, props) => {
  const { apiBaseUrl, token, feedback, mode } = props;
  configureVideosApi({ baseURL: apiBaseUrl, token });

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
