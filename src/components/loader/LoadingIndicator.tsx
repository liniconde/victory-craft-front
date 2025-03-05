import React from "react";
// Asegúrate de usar el path correcto
import "./index.css"; // Archivo CSS para estilos
import { useLoading } from "../../hooks/useLoading";

const LoadingIndicator: React.FC = () => {
  const { isLoading } = useLoading() || { isLoading: false };

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner-border text-light" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
