import React, { createContext, useContext, useMemo } from "react";

export interface VideosModuleFeedback {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  isLoading: boolean;
}

interface VideosModuleContextValue {
  feedback: VideosModuleFeedback;
}

interface VideosModuleProviderProps {
  children: React.ReactNode;
  feedback?: Partial<VideosModuleFeedback>;
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
});

export const VideosModuleProvider: React.FC<VideosModuleProviderProps> = ({
  children,
  feedback,
}) => {
  const value = useMemo<VideosModuleContextValue>(
    () => ({
      feedback: {
        ...defaultFeedback,
        ...feedback,
      },
    }),
    [feedback],
  );

  return (
    <VideosModuleContext.Provider value={value}>
      {children}
    </VideosModuleContext.Provider>
  );
};

export const useVideosModule = () => useContext(VideosModuleContext);
