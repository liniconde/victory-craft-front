import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FieldForm.css"; // Se mantiene el archivo CSS
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

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
  owner: string;
}

const FieldForm: React.FC<FieldFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { id } = useParams<{ id: string }>();

  const [fieldData, setFieldData] = useState<Field>({
    name: "",
    type: "football",
    location: "",
    pricePerHour: 0,
    imageUrl: "",
    owner: userId || "",
  });

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "create") {
      api
        .post("/fields", fieldData)
        .then(() => navigate("/fields"))
        .catch((error) => console.error("Error creating field:", error));
    } else if (id) {
      api
        .put(`/fields/${id}`, fieldData)
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

        {/* Image URL Field */}
        <div>
          <label htmlFor="imageUrl" className="field-form-label">
            Image URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            value={fieldData.imageUrl}
            onChange={handleChange}
            className="field-form-input"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="field-form-button">
          {mode === "create" ? "Create Field" : "Update Field"}
        </button>
      </form>
    </div>
  );
};

export default FieldForm;
