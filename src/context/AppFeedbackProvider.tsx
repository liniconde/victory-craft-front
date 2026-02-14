// 📦 useAppFeedback.tsx (versión con hook personalizado)
import React, { createContext, useCallback, useMemo, useState } from "react";
import LoadingSpinner from "../components/loading/LoadingSpinner";
import ErrorModal from "../components/error/ErrorModal";

interface AppFeedbackContextProps {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  isLoading: boolean;
}

export const AppFeedbackContext = createContext<
  AppFeedbackContextProps | undefined
>(undefined);

export const AppFeedbackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Cargando...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showLoading = useCallback((message = "Cargando...") => {
    setLoadingMessage(message);
    setLoading(true);
  }, []);

  const hideLoading = useCallback(() => setLoading(false), []);

  const showError = useCallback((message: string) => setErrorMessage(message), []);
  const hideError = useCallback(() => setErrorMessage(null), []);

  const contextValue = useMemo(
    () => ({ showLoading, hideLoading, showError, isLoading: loading }),
    [showLoading, hideLoading, showError, loading],
  );

  return (
    <AppFeedbackContext.Provider
      value={contextValue}
    >
      {children}
      {loading && <LoadingSpinner message={loadingMessage} />}
      {errorMessage && (
        <ErrorModal message={errorMessage} onClose={hideError} />
      )}
    </AppFeedbackContext.Provider>
  );
};
