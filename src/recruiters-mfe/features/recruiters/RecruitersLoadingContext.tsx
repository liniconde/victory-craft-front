import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import SportsLoader from "../../../components/loader/SportsLoader";

interface RecruitersLoadingContextValue {
  isLoading: boolean;
  message: string;
  showLoader: (message?: string) => symbol;
  hideLoader: (token: symbol) => void;
  trackTask: <T>(task: Promise<T>, message?: string) => Promise<T>;
}

const defaultMessage = "Nuestros sticks siguen entrenando mientras preparamos esta pantalla.";

const RecruitersLoadingContext = createContext<RecruitersLoadingContextValue | undefined>(
  undefined
);

export const RecruitersLoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const activeLoadersRef = useRef(new Set<symbol>());
  const [pendingCount, setPendingCount] = useState(0);
  const [message, setMessage] = useState(defaultMessage);

  const showLoader = useCallback((nextMessage?: string) => {
    const token = Symbol("recruiters-loader");
    activeLoadersRef.current.add(token);
    setPendingCount(activeLoadersRef.current.size);
    setMessage(nextMessage?.trim() || defaultMessage);
    return token;
  }, []);

  const hideLoader = useCallback((token: symbol) => {
    if (!activeLoadersRef.current.has(token)) return;

    activeLoadersRef.current.delete(token);
    setPendingCount(activeLoadersRef.current.size);

    if (activeLoadersRef.current.size === 0) {
      setMessage(defaultMessage);
    }
  }, []);

  const trackTask = useCallback(
    async <T,>(task: Promise<T>, nextMessage?: string) => {
      const token = showLoader(nextMessage);
      try {
        return await task;
      } finally {
        hideLoader(token);
      }
    },
    [hideLoader, showLoader]
  );

  const value = useMemo(
    () => ({
      isLoading: pendingCount > 0,
      message,
      showLoader,
      hideLoader,
      trackTask,
    }),
    [hideLoader, message, pendingCount, showLoader, trackTask]
  );

  return (
    <RecruitersLoadingContext.Provider value={value}>
      {children}
      {pendingCount > 0 ? (
        <div className="recruiters-global-loader" aria-hidden="true">
          <SportsLoader
            compact
            overlay
            message={message}
          />
        </div>
      ) : null}
    </RecruitersLoadingContext.Provider>
  );
};

export const useRecruitersLoading = () => {
  const context = useContext(RecruitersLoadingContext);
  if (!context) {
    throw new Error("useRecruitersLoading must be used within a RecruitersLoadingProvider");
  }
  return context;
};
