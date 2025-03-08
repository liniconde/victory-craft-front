import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FieldForm.css"; // Se mantiene el archivo CSS
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { getS3UploadImageUrl } from "../../../services/field/fieldService";

const BUCKET_NAME = `victory-craft`;

// 📌 Tipado de las props del componente
interface FieldFormProps {
  mode: "create" | "edit";
}

// 📌 Tipado del objeto Field
interface Field {
  id?: string;
  name: string;
  type: "football" | "padel" | "tennis";
  location: string;
  pricePerHour: number;
  imageUrl: string;
  imageS3Key: string;
  owner: string;
}

const FieldForm: React.FC<FieldFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { id } = useParams<{ id: string }>();
  const BUCKET_URL = `https://${BUCKET_NAME}.s3.amazonaws.com/`;

  const [fieldData, setFieldData] = useState<Field>({
    name: "",
    type: "football",
    location: "",
    pricePerHour: 0,
    imageUrl: "",
    imageS3Key: "",
    owner: userId || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && id) {
      api
        .get<Field>(`/fields/${id}`)
        .then((response) => setFieldData(response.data))
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
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  // 📤 Subir la imagen al backend y a S3
  const uploadImageToS3 = async (): Promise<{
    imageUrl: string;
    imageS3Key: string;
  } | null> => {
    if (!imageFile) return null;
    try {
      setIsUploading(true);
      const data = await getS3UploadImageUrl(imageFile, userId!);
      setIsUploading(false);
      return { imageUrl: data.s3Url, imageS3Key: data.objectKey };
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      setIsUploading(false);
      return null;
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

    const fieldPayload = { ...fieldData };

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
    <div className="field-form-container bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
        {mode === "create" ? "Create a New Field" : "Edit Field"}
      </h2>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="field-form-label">
            Name
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
            Type
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
            Location
          </label>
          <input
            id="location"
            name="location"
            value={fieldData.location}
            onChange={handleChange}
            className="field-form-input"
          />
        </div>

        {/* Price Per Hour Field */}
        <div>
          <label htmlFor="pricePerHour" className="field-form-label">
            Price Per Hour ($)
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
            Upload Image
          </label>
          <input
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="field-form-input"
          />
        </div>

        {isUploading && <p className="text-blue-500">Uploading image...</p>}

        {/* Submit Button */}
        <button type="submit" className="field-form-button">
          {mode === "create" ? "Create Field" : "Update Field"}
        </button>
      </form>
    </div>
  );
};

export default FieldForm;
