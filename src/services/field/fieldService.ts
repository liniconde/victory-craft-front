import { api } from "../../utils/api";
import { Slot } from "../slot/slotService";

const API_FIELDS_URL = "/fields";

export interface Field {
  _id: string;
  name: string;
}

// 📌 Función para hacer login y almacenar el token
export const getFields = async (): Promise<Field[]> => {
  try {
    const response = await api.get<Field[]>(`${API_FIELDS_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo Fields:", error);
    throw error;
  }
};


export const getFieldSlots = async (id: string): Promise<Slot[]> => {
    try {
      const response = await api.get<Slot[]>
      (`${API_FIELDS_URL}/${id}/slots`);
      return response.data;
    } catch (error) {
      console.error("Error getting slots", error);
      throw error;
    }
  };
  
