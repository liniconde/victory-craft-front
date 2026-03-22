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
  setUserProfile: (profile: {
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
  }) => void;
  logout: () => void;
  token: string;
  authReady: boolean;
  userId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
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
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [exp, setExp] = useState<number>(0);
  const [token, setToken] = useState<string>("");
  const [actualRole, setActualRole] = useState<string | null>(null);
  const [viewRole, setViewRoleState] = useState<"user" | "admin" | null>(null);

  const deriveProfileNames = useCallback((profile: {
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
  }): { firstName: string; lastName: string } => {
    const normalizedFirstName = profile.firstName?.trim() || "";
    const normalizedLastName = profile.lastName?.trim() || "";

    if (normalizedFirstName || normalizedLastName) {
      return {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
      };
    }

    const normalizedFullName = profile.fullName?.trim() || "";
    if (!normalizedFullName) {
      return { firstName: "", lastName: "" };
    }

    const [derivedFirstName, ...rest] = normalizedFullName.split(/\s+/);
    return {
      firstName: derivedFirstName || "",
      lastName: rest.join(" "),
    };
  }, []);

  const resetAuthState = useCallback((): void => {
    setIsAuthenticated(false);
    setToken("");
    setUserId(null);
    setEmail(null);
    setFirstName(null);
    setLastName(null);
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
    const { firstName: tokenFirstName, lastName: tokenLastName } =
      deriveProfileNames({
        firstName: decodedToken?.firstName || decodedToken?.given_name || null,
        lastName: decodedToken?.lastName || decodedToken?.family_name || null,
        fullName: decodedToken?.name || null,
      });
    // Verificar si el token ha expirado
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken && decodedToken?.exp > currentTime) {
      setToken(storageToken);
      setIsAuthenticated(true);
      setUserId(localStorage.getItem("userId"));
      setEmail(localStorage.getItem("email"));
      setFirstName(localStorage.getItem("firstName") || tokenFirstName || null);
      setLastName(localStorage.getItem("lastName") || tokenLastName || null);
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
  }, [deriveProfileNames, resetAuthState]);

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

    const { firstName: tokenFirstName, lastName: tokenLastName } =
      deriveProfileNames({
        firstName: decoded.firstName || decoded.given_name || null,
        lastName: decoded.lastName || decoded.family_name || null,
        fullName: decoded.name || null,
      });

    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", decoded.id || "");
    localStorage.setItem("email", decoded.email || "");
    localStorage.setItem("role", decoded.role || "");
    localStorage.setItem("exp", decoded.exp ? `${decoded.exp}` : "0");
    localStorage.setItem("firstName", tokenFirstName);
    localStorage.setItem("lastName", tokenLastName);
    setUserId(decoded.id || "");
    setEmail(decoded.email || "");
    setFirstName(tokenFirstName || null);
    setLastName(tokenLastName || null);
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

  const setUserProfile = ({
    firstName: nextFirstName,
    lastName: nextLastName,
    fullName,
  }: {
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
  }): void => {
    const normalizedProfile = deriveProfileNames({
      firstName: nextFirstName,
      lastName: nextLastName,
      fullName,
    });

    localStorage.setItem("firstName", normalizedProfile.firstName);
    localStorage.setItem("lastName", normalizedProfile.lastName);
    setFirstName(normalizedProfile.firstName || null);
    setLastName(normalizedProfile.lastName || null);
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
    setUserProfile,
    logout,
    token,
    authReady,
    userId,
    email,
    firstName,
    lastName,
    exp,
    role,
    isAdmin,
    actualRole,
    viewRole,
    setViewRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
