// 📦 useAppFeedback.tsx (versión con hook personalizado)
import React, { createContext, useState } from "react";
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

  const showLoading = (message = "Cargando...") => {
    setLoadingMessage(message);
    setLoading(true);
  };

  const hideLoading = () => setLoading(false);

  const showError = (message: string) => setErrorMessage(message);
  const hideError = () => setErrorMessage(null);

  return (
    <AppFeedbackContext.Provider
      value={{ showLoading, hideLoading, showError, isLoading: loading }}
    >
      {children}
      {loading && <LoadingSpinner message={loadingMessage} />}
      {errorMessage && (
        <ErrorModal message={errorMessage} onClose={hideError} />
      )}
    </AppFeedbackContext.Provider>
  );
};
