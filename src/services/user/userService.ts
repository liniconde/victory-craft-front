import { api } from "../../utils/api";

const API_USERS_URL = "/users";

// 📌 Interfaz de la respuesta del backend en el login
interface AuthResponse {
  user: {
    _id: string;
    username: string;
    email: string;
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
