import { api } from "../../utils/api";
import { Slot } from "../../interfaces/SlotInterfaces";
import { User } from "../user/userService";
import { Field } from "../../interfaces/FieldInterfaces";

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
