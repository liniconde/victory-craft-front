import axios from "axios";
import { api, s3Api } from "../../utils/api";
import { Slot } from "../../interfaces/SlotInterfaces";
import { Field } from "../../interfaces/FieldInterfaces";

const API_FIELDS_URL = "/fields";

export interface S3UploadObject {
  s3Url: string;
  objectKey: string;
  uploadUrl: string;
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
    const response = await api.get<Slot[]>(`${API_FIELDS_URL}/${id}/slots`);
    return response.data;
  } catch (error) {
    console.error("Error getting slots", error);
    throw error;
  }
};

export const getS3UploadImageUrl = async (
  imageFile: File,
  userId: string
): Promise<S3UploadObject> => {
  try {
    const result = await api.post("/images/upload", {
      objectKey: `fields/${userId}/${imageFile.name}`,
    });

    const imageObject: S3UploadObject = result.data;

    console.log("data obtenida", imageObject);

    await s3Api.put(imageObject.uploadUrl, imageFile);

    return imageObject;
  } catch (error) {
    console.error("Error getting slots", error);
    throw error;
  }
};

export const uploadImageS3 = async (
  imageFile: File
): Promise<S3UploadObject> => {
  try {
    const data: S3UploadObject = await api.post("/images/upload", {
      objectKey: imageFile.name,
    });

    await axios.put(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": imageFile.type },
      body: {
        imageFile,
      },
    });

    return data;
  } catch (error) {
    console.error("Error getting slots", error);
    throw error;
  }
};
