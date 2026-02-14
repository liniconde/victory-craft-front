import React, { createContext, useContext, useMemo } from "react";
import { VideosApi } from "./contracts/videosApi";
import { defaultVideosApi } from "./infrastructure/defaultVideosApi";

export interface VideosModuleFeedback {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  isLoading: boolean;
}

interface VideosModuleContextValue {
  feedback: VideosModuleFeedback;
  api: VideosApi;
}

interface VideosModuleProviderProps {
  children: React.ReactNode;
  feedback?: Partial<VideosModuleFeedback>;
  api?: Partial<VideosApi>;
}

const defaultFeedback: VideosModuleFeedback = {
  showLoading: () => undefined,
  hideLoading: () => undefined,
  showError: (message: string) => {
    window.alert(message);
  },
  isLoading: false,
};

const VideosModuleContext = createContext<VideosModuleContextValue>({
  feedback: defaultFeedback,
  api: defaultVideosApi,
});

export const VideosModuleProvider: React.FC<VideosModuleProviderProps> = ({
  children,
  feedback,
  api,
}) => {
  const value = useMemo<VideosModuleContextValue>(
    () => ({
      feedback: {
        ...defaultFeedback,
        ...feedback,
      },
      api: {
        ...defaultVideosApi,
        ...api,
      },
    }),
    [feedback, api],
  );

  return (
    <VideosModuleContext.Provider value={value}>
      {children}
    </VideosModuleContext.Provider>
  );
};

export const useVideosModule = () => useContext(VideosModuleContext);
