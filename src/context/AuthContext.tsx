import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  clearPersistedAuthSession,
  AUTH_INVALIDATED_EVENT,
} from "../utils/authSession";
import { getDecodedToken, isValidJwtToken } from "../utils/jwtUtil";

// 📌 Interfaz para el contexto de autenticación
interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => boolean;
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

  const resetAuthState = useCallback((): void => {
    setIsAuthenticated(false);
    setToken("");
    setUserId(null);
    setEmail(null);
    setExp(0);
    setActualRole(null);
    setViewRoleState(null);
    setAuthReady(true);
  }, []);

  const authenticateFromStorage = useCallback((storageToken: string): void => {
    if (!isValidJwtToken(storageToken)) {
      clearPersistedAuthSession();
      resetAuthState();
      return;
    }

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
      return;
    }

    clearPersistedAuthSession();
    resetAuthState();
  }, [resetAuthState]);

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

    const handleSessionInvalidated = () => {
      resetAuthState();
    };

    window.addEventListener(AUTH_INVALIDATED_EVENT, handleSessionInvalidated);
    setAuthReady(true);

    return () => {
      window.removeEventListener(AUTH_INVALIDATED_EVENT, handleSessionInvalidated);
    };
  }, [authenticateFromStorage, resetAuthState]);

  const login = (newToken: string): boolean => {
    if (!isValidJwtToken(newToken)) {
      clearPersistedAuthSession();
      resetAuthState();
      return false;
    }

    const decoded = getDecodedToken(newToken);
    if (!decoded) {
      clearPersistedAuthSession();
      resetAuthState();
      return false;
    }

    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", decoded.id || "");
    localStorage.setItem("email", decoded.email || "");
    localStorage.setItem("role", decoded.role || "");
    localStorage.setItem("exp", decoded.exp ? `${decoded.exp}` : "0");
    setUserId(decoded.id || "");
    setEmail(decoded.email || "");
    setExp(decoded.exp || 0);
    setActualRole(decoded.role || "");
    setToken(newToken);
    setIsAuthenticated(true);
    setAuthReady(true);
    return true;
  };

  const logout = (): void => {
    clearPersistedAuthSession();
    resetAuthState();
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
