import axios from "axios";

// 📌 Definir constantes globales
const IMAGES_BUCKET = "images-tfm2";

// 📌 Tipado para la API principal
export const api = axios.create({
  baseURL: "http://localhost:5001", // Cambia esto a la URL de tu API
});

// 📌 Funciones para obtener URLs base
export function getBaseURL(path: string = ""): string {
  return `https://dmag5.pc.ac.upc.edu/api/${path}`;
}

export function getBaseURLMetadata(path: string = ""): string {
  return `https://q8onxhk818.execute-api.us-east-1.amazonaws.com/Prod/${path}`;
}

export function getBaseUrlJumbf(path: string = ""): string {
  return `http://ec2-3-80-81-251.compute-1.amazonaws.com:8080/${path}`;
}

// 📌 Crear instancias de API con baseURL personalizada
export const apiMetadata = axios.create({
  baseURL: getBaseURLMetadata(),
});

export const apiJumbf = axios.create({
  baseURL: getBaseUrlJumbf(),
});

// 📌 Tipado de estructura para respuestas API
interface ApiResponse<T> {
  data: T;
}

// 📌 Función para obtener imagen
export const getImage = async (objectKey: string): Promise<string> => {
  try {
    const response = await apiMetadata.post<
      ApiResponse<{ downloadUrl: string }>
    >(
      "getImage",
      {
        bucketName: IMAGES_BUCKET,
        objectKey: objectKey,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const imageUrl = response.data.data.downloadUrl;
    const response2 = await axios.get(imageUrl);
    return response2.data;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
};

// 📌 Función para obtener la URL de la imagen
export const getImageUrl = async (
  objectKey: string,
  token: string
): Promise<string | undefined> => {
  try {
    const response = await axios.post<ApiResponse<{ downloadUrl: string }>>(
      "https://31ho56yrgi.execute-api.us-east-1.amazonaws.com/prod/getImage",
      {
        bucketName: IMAGES_BUCKET,
        objectKey: objectKey,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data.downloadUrl;
  } catch (error) {
    console.error("Error fetching image:", error);
  }
};

// 📌 Tipado para subida de archivos
export const uploadJumbfServerFile = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      "http://ec2-3-80-81-251.compute-1.amazonaws.com:8080/api/demo/uploadMetadataFile",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("Respuesta del servidor:", response.data);
  } catch (error) {
    console.error("Error al subir el archivo:", error);
  }
};

// 📌 Función para crear un registro de imagen en la API
export const createImageRecord = async (
  objectKey: string,
  userId: string
): Promise<ApiResponse<any>> => {
  try {
    const apiUrl =
      "https://q8onxhk818.execute-api.us-east-1.amazonaws.com/Prod/images/create";
    const params = new URLSearchParams({ key: objectKey, userId });

    const data = { bucketName: IMAGES_BUCKET, objectKey, userId };

    const response = await axios.post<ApiResponse<any>>(
      `${apiUrl}?${params.toString()}`,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Image record created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating image record:", error);
    throw error;
  }
};

// 📌 Función para procesar metadatos EXIF
export const processExifMetadata = async (
  objectKey: string,
  userId: string
): Promise<ApiResponse<any>> => {
  try {
    const apiUrl =
      "https://q8onxhk818.execute-api.us-east-1.amazonaws.com/Prod/processExif";
    const data = { bucketName: IMAGES_BUCKET, objectKey, userId };

    const response = await axios.post<ApiResponse<any>>(apiUrl, data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("EXIF data processed successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error processing EXIF data:", error);
    throw error;
  }
};

// 📌 Función para subir archivos JSON de metadatos
export const uploadMetadataFile = async (
  objectKey: string,
  jsonObject: object
): Promise<void> => {
  try {
    const jsonFileName = objectKey.split(".")[0] + ".json";
    console.log("json file name", jsonFileName);

    const archivoJSON = new Blob([JSON.stringify(jsonObject)], {
      type: "application/json",
    });
    const formData = new FormData();
    formData.append("file", archivoJSON, jsonFileName);

    const response = await axios.post(
      "http://ec2-3-80-81-251.compute-1.amazonaws.com:8080/api/demo/uploadMetadataFile",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("Respuesta del servidor:", response.data);
  } catch (error) {
    console.error(error);
  }
};

// 📌 Función para descargar un archivo
export const downloadFile = async (objectKey: string): Promise<Blob> => {
  try {
    const targetFile = "target_" + objectKey;
    const apiUrl =
      "http://ec2-3-80-81-251.compute-1.amazonaws.com:8080/api/demo/download";
    const params = new URLSearchParams({ targetFile }).toString();

    const response = await axios.get(`${apiUrl}?${params}`, {
      responseType: "blob",
    });

    return new Blob([response.data]);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

// 📌 Función para obtener imágenes de un usuario
export const getImages = async (userId: string): Promise<ApiResponse<any>> => {
  try {
    const apiUrl =
      "https://q8onxhk818.execute-api.us-east-1.amazonaws.com/Prod/getImages";
    const params = new URLSearchParams({ userId }).toString();

    const response = await axios.get<ApiResponse<any>>(`${apiUrl}?${params}`, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};
