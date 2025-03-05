import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// 📌 Interfaz para las props del componente
interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, authReady } = useAuth();

  console.log("Acceso a PrivateRoute - Usuario autenticado:", isAuthenticated);

  if (!authReady) {
    return <div>Cargando...</div>; // O un componente de carga más elaborado
  }

  if (!isAuthenticated) {
    // Redirige al usuario al login si no está autenticado
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
