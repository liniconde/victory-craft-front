import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getDecodedToken } from "../utils/jwtUtil";

// 📌 Interfaz para el contexto de autenticación
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string;
  authReady: boolean;
  userId: string | null;
  email: string | null;
  exp: number;
  role: string | null;
  isAdmin: boolean;
  actualRole: string | null;
  viewRole: string | null;
  setViewRole: (role: "user" | "admin" | null) => void;
}

// 📌 Crear contexto con valores iniciales
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 📌 Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    console.log("useAuth debe usarse dentro de un AuthProvider");
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

// 📌 Interfaz para el `AuthProvider`
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [exp, setExp] = useState<number>(0);
  const [token, setToken] = useState<string>("");
  const [actualRole, setActualRole] = useState<string | null>(null);
  const [viewRole, setViewRoleState] = useState<"user" | "admin" | null>(null);

  useEffect(() => {
    const storageToken = localStorage.getItem("token");
    console.log("Token from storage:", storageToken);
    if (storageToken) {
      authenticateFromStorage(storageToken);
    }
    const storedViewRole = localStorage.getItem("viewRole");
    if (storedViewRole === "admin" || storedViewRole === "user") {
      setViewRoleState(storedViewRole);
    }
    setAuthReady(true);
  }, []);

  const authenticateFromStorage = (storageToken: string): void => {
    const decodedToken = getDecodedToken(storageToken);
    // Verificar si el token ha expirado
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken && decodedToken?.exp > currentTime) {
      setToken(storageToken);
      setIsAuthenticated(true);
      setUserId(localStorage.getItem("userId"));
      setEmail(localStorage.getItem("email"));
      setActualRole(localStorage.getItem("role"));
      setExp(
        localStorage.getItem("exp")
          ? parseInt(localStorage.getItem("exp") || "0")
          : 0
      );
      console.log("User ID from storage:", localStorage.getItem("userId"));
    }
  };

  const login = (newToken: string): void => {
    localStorage.setItem("token", newToken || "");
    if (newToken) {
      const decoded = getDecodedToken(newToken);
      console.log("Token decoded:", decoded);
      localStorage.setItem("userId", decoded?.id || "");
      localStorage.setItem("email", decoded?.email || "");
      localStorage.setItem("role", decoded?.role || "");
      localStorage.setItem("exp", decoded?.exp ? decoded?.exp + "" : "0");
      setUserId(decoded?.id || "");
      setEmail(decoded?.id || "");
      setExp(decoded?.exp || 0);
      setActualRole(decoded?.role || "");
    }
    setToken(newToken);
    setIsAuthenticated(true);
    setAuthReady(true);
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("exp");
    localStorage.removeItem("viewRole");
    setIsAuthenticated(false);
    setToken("");
    setUserId(null);
    setActualRole(null);
    setViewRoleState(null);
    setAuthReady(true);
  };

  const setViewRole = (nextRole: "user" | "admin" | null): void => {
    if (nextRole) {
      localStorage.setItem("viewRole", nextRole);
    } else {
      localStorage.removeItem("viewRole");
    }
    setViewRoleState(nextRole);
  };

  const role = viewRole || actualRole || "user";
  const isAdmin = role === "admin";

  const value: AuthContextType = {
    isAuthenticated,
    login,
    logout,
    token,
    authReady,
    userId,
    email,
    exp,
    role,
    isAdmin,
    actualRole,
    viewRole,
    setViewRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
