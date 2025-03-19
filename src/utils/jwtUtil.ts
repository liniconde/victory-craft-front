import { jwtDecode } from "jwt-decode";

// 📌 Interfaz del usuario después de desencriptar el token
interface DecodedToken {
  id: string;
  email: string;
  exp: number; // Tiempo de expiración del token
  role: string;
}

// 📌 Función para obtener y decodificar el token JWT
export const getDecodedToken = (token: string): DecodedToken | null => {
  try {
    // Desencriptar token con `jsonwebtoken` (Misma librería del backend)
    const decoded = jwtDecode(token) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
};
