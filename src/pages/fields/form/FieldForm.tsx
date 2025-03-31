import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FieldForm.css"; // Se mantiene el archivo CSS
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { getS3UploadImageUrl } from "../../../services/field/fieldService";
import PersonalizedMapComponent from "../../../components/personalizedMap/PersonalizedMapComponent";
import { FieldLocation } from "../../../interfaces/FieldInterfaces";
import { useAppFeedback } from "../../../hooks/useAppFeedback";

// const BUCKET_NAME = import.meta.env.VITE_BUCKET_NAME || `victory-craft`;

// 📌 Tipado de las props del componente
interface FieldFormProps {
  mode: "create" | "edit";
}

// 📌 Tipado del objeto Field
interface Field {
  id?: string;
  name: string;
  type: "football" | "padel" | "tennis";
  location: FieldLocation;
  pricePerHour: number;
  imageUrl: string;
  imageS3Key: string;
  owner: string;
}

const FieldForm: React.FC<FieldFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { id } = useParams<{ id: string }>();
  // const BUCKET_URL = `https://${BUCKET_NAME}.s3.amazonaws.com/`;
  const defaultLocation: FieldLocation = {
    name: "",
    lat: 41.3851,
    long: 2.1734,
  };

  const [fieldData, setFieldData] = useState<Field>({
    name: "",
    type: "football",
    location: defaultLocation,
    pricePerHour: 0,
    imageUrl: "",
    imageS3Key: "",
    owner: userId || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<FieldLocation>(defaultLocation);

  const { hideLoading, showError, showLoading } = useAppFeedback();

  useEffect(() => {
    if (mode === "edit" && id) {
      api
        .get<Field>(`/fields/${id}`)
        .then((response) => {
          setFieldData(response.data);
          setSelectedLocation(response.data.location || defaultLocation);
        })
        .catch((error) => console.error("Error fetching field:", error));
    }
  }, [mode, id]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFieldData((prevState) => ({
      ...prevState,
      [name]: name === "pricePerHour" ? parseFloat(value) || 0 : value,
    }));
  };

  // Manejar la selección del archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        showError("Solo se permiten archivos .jpg o .jpeg");
        return;
      }
      setImageFile(file);
    }
  };

  // 📤 Subir la imagen al backend y a S3
  const uploadImageToS3 = async (): Promise<{
    imageUrl: string;
    imageS3Key: string;
  } | null> => {
    if (!imageFile) return null;
    try {
      showLoading();
      const data = await getS3UploadImageUrl(imageFile, userId!);
      return { imageUrl: data.s3Url, imageS3Key: data.objectKey };
    } catch (error) {
      console.error(" Error uploading image:", error);
      showError(" Error uploading image");
      return null;
    } finally {
      hideLoading();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (imageFile) {
      const imageObject = await uploadImageToS3();
      console.log("image iobjectt", imageObject);
      if (imageObject) {
        fieldData.imageUrl = imageObject.imageUrl;
        fieldData.imageS3Key = imageObject.imageS3Key;
      }
    }

    const fieldPayload = { ...fieldData, location: selectedLocation };

    if (mode === "create") {
      api
        .post("/fields", fieldPayload)
        .then(() => navigate("/fields"))
        .catch((error) => console.error("Error creating field:", error));
    } else if (id) {
      api
        .put(`/fields/${id}`, fieldPayload)
        .then(() => navigate("/fields"))
        .catch((error) => console.error("Error updating field:", error));
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        {mode === "create" ? "Crear un nuevo campo" : "Editar Campo"}
      </h2>

      {/* Contenedor principal en grid */}
      <div className="field-form-container">
        {/* 📝 Sección del formulario */}
        <form onSubmit={handleSubmit} className="field-form">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="field-form-label">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              value={fieldData.name}
              onChange={handleChange}
              className="field-form-input"
            />
          </div>

          {/* Type Select */}
          <div>
            <label htmlFor="type" className="field-form-label">
              Tipo
            </label>
            <select
              id="type"
              name="type"
              value={fieldData.type}
              onChange={handleChange}
              className="field-form-input"
            >
              <option value="football">Football</option>
              <option value="padel">Padel</option>
              <option value="tennis">Tennis</option>
            </select>
          </div>

          {/* Location Field */}
          <div>
            <label htmlFor="location" className="field-form-label">
              Locación
            </label>
            <input
              id="location"
              name="location"
              value={fieldData.location.name}
              onChange={handleChange}
              className="field-form-input"
            />
          </div>

          {/* Price Per Hour Field */}
          <div>
            <label htmlFor="pricePerHour" className="field-form-label">
              Precio por hora ($)
            </label>
            <input
              id="pricePerHour"
              name="pricePerHour"
              type="number"
              value={fieldData.pricePerHour}
              onChange={handleChange}
              className="field-form-input"
            />
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="imageFile" className="field-form-label">
              Cargar Imagen
            </label>
            <input
              id="imageFile"
              type="file"
              accept=".jpg,.jpeg"
              onChange={handleFileChange}
              className="field-form-input"
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="field-form-button">
            {mode === "create" ? "Crear Campo" : "Actualizar Campo"}
          </button>
        </form>

        {/* 🗺 Sección del mapa */}
        <div className="map-container-form">
          <PersonalizedMapComponent
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default FieldForm;
