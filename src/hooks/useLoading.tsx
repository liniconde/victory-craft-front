import React, { createContext, useContext, useState, ReactNode } from "react";

// 📌 Interfaz para el contexto de carga
interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

// 📌 Crear el contexto con valores iniciales
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// 📌 Hook personalizado para usar el contexto de carga
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading debe usarse dentro de un LoadingProvider");
  }
  return context;
};

// 📌 Interfaz para las props del proveedor
interface LoadingProviderProps {
  children: ReactNode;
}

// 📌 Proveedor del contexto
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const startLoading = (): void => setIsLoading(true);
  const stopLoading = (): void => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
