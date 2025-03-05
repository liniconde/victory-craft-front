import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { parseJwtAWS } from "../utils/helpers";

// 📌 Interfaz para los tokens de autenticación
interface AuthTokens {
  AccessToken: string | null;
  IdToken: string | null;
  RefreshToken: string | null;
}

// 📌 Interfaz para el contexto de autenticación
interface AuthContextType {
  isAuthenticated: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
  tokens: AuthTokens;
  authReady: boolean;
  userId: string | null;
}

// 📌 Crear contexto con valores iniciales
const AuthContextAWS = createContext<AuthContextType | undefined>(undefined);

// 📌 Hook para usar el contexto
export const useAuthAWS = (): AuthContextType => {
  const context = useContext(AuthContextAWS);
  if (!context) {
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
  const [tokens, setTokens] = useState<AuthTokens>({
    AccessToken: null,
    IdToken: null,
    RefreshToken: null,
  });

  useEffect(() => {
    const storedTokens: AuthTokens = {
      AccessToken: localStorage.getItem("AccessToken"),
      IdToken: localStorage.getItem("IdToken"),
      RefreshToken: localStorage.getItem("RefreshToken"),
    };

    if (
      storedTokens.IdToken &&
      storedTokens.AccessToken &&
      storedTokens.RefreshToken
    ) {
      setTokens(storedTokens);
      setIsAuthenticated(true);
      setUserId(localStorage.getItem("userId"));
      console.log("User ID from storage:", localStorage.getItem("userId"));
    }
    setAuthReady(true);
  }, []);

  const loginAWS = (tokens: AuthTokens): void => {
    localStorage.setItem("AccessToken", tokens.AccessToken || "");
    localStorage.setItem("IdToken", tokens.IdToken || "");
    localStorage.setItem("RefreshToken", tokens.RefreshToken || "");

    if (tokens.IdToken) {
      const decoded = parseJwtAWS(tokens.IdToken);
      console.log("Token decoded:", decoded);
      console.log("User ID decoded:", decoded.sub);
      localStorage.setItem("userId", decoded.sub?.toString() || "");
      setUserId(decoded.sub?.toString() || "");
    }

    setTokens(tokens);
    setIsAuthenticated(true);
    setAuthReady(true);
  };

  const logoutAWS = (): void => {
    localStorage.removeItem("AccessToken");
    localStorage.removeItem("IdToken");
    localStorage.removeItem("RefreshToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setTokens({ AccessToken: null, IdToken: null, RefreshToken: null });
    setUserId(null);
    setAuthReady(true);
  };

  const value: AuthContextType = {
    isAuthenticated,
    login: loginAWS,
    logout: logoutAWS,
    tokens,
    authReady,
    userId,
  };

  return (
    <AuthContextAWS.Provider value={value}>{children}</AuthContextAWS.Provider>
  );
};
