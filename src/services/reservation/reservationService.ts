import { api } from "../../utils/api";
import { Field } from "../field/fieldService";
import { Slot } from "../slot/slotService";
import { User } from "../user/userService";

const API_RESERVATIONS_URL = "/reservations";

export interface Reservation {
  _id: string;
  user: User;
  slot: Slot;
  field?: Field;
}

// 📌 Función para hacer login y almacenar el token
export const getReservations = async (): Promise<Reservation[]> => {
  try {
    const response = await api.get<Reservation[]>(`${API_RESERVATIONS_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error getting reservations:", error);
    throw error;
  }
};

export const getReservation = async (id: string): Promise<Reservation> => {
  try {
    const response = await api.get<Reservation>(
      `${API_RESERVATIONS_URL}/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting reservation:", error);
    throw error;
  }
};

// 📌 Función para hacer login y almacenar el token
export const removeReservation = async (id: string): Promise<void> => {
  try {
    await api.delete<void>(`${API_RESERVATIONS_URL}/${id}`);
    return;
  } catch (error) {
    console.error(` Error removing reservation: ${id} `, error);
    throw error;
  }
};
