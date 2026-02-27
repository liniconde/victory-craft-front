import { api } from "../../utils/api";

const API_USERS_URL = "/users";

// 📌 Interfaz de la respuesta del backend en el login
interface AuthResponse {
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
}

// 📌 Función para hacer login y almacenar el token
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(`${API_USERS_URL}/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};

// 📌 Interfaz para los datos de registro
interface RegisterData {
  email: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  username: string;
  // Puede ser "player" o "admin"
}

export const registerUser = async (
  userData: RegisterData
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(
      `${API_USERS_URL}/register`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error en el registro:", error);
    throw error;
  }
};

export const getGoogleOAuthLoginUrl = (returnTo: string = "/"): string => {
  const configuredUrl = (import.meta.env.VITE_OAUTH2_GOOGLE_URL as string | undefined)?.trim();
  const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
  const callbackPath = (import.meta.env.VITE_OAUTH2_CALLBACK_PATH as string | undefined) || "/auth/callback";
  const redirectUri = `${window.location.origin}${callbackPath}`;

  const baseUrl = configuredUrl || (apiBaseUrl ? `${apiBaseUrl}/users/oauth2/google` : "/users/oauth2/google");
  const url = new URL(baseUrl, window.location.origin);

  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("return_to", returnTo);

  return url.toString();
};
