import { api } from "../../utils/api";

const API_RESERVATIONS_URL = "/reservations";

export interface Reservation {
  _id: string;
  userId: string;
  fieldId: string;
  slotId: string;
}

// 📌 Función para hacer login y almacenar el token
export const getReservations = async (): Promise<Reservation[]> => {
  try {
    const response = await api.get<Reservation[]>(`${API_RESERVATIONS_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo reservations:", error);
    throw error;
  }
};
