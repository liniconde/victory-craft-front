import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import MapComponent from "../map/MapComponent";
import { Field } from "../../../interfaces/FieldInterfaces";

const FieldList: React.FC = () => {
  // ✅ Ahora acepta la prop
  const [fields, setFields] = useState<Field[]>([]);
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  useEffect(() => {
    api
      .get("/fields")
      .then((response) => setFields(response.data))
      .catch((error) => console.error("Error fetching fields:", error));
  }, []);

  const handleDelete = (id: string) => {
    api
      .delete(`/fields/${id}`)
      .then(() => setFields(fields.filter((field) => field._id !== id)))
      .catch((error) => console.error("Error deleting field:", error));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Available Fields
      </h1>

      <button
        className="mb-6 px-5 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
        onClick={() => navigate("/fields/new")}
      >
        Add New Field
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {fields.map((field) => (
          <div
            key={field._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => setSelectedField(field)}
          >
            <img
              src={field.imageUrl || "https://via.placeholder.com/300"}
              alt={field.name}
              className="w-full h-56 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {field.name}
              </h2>
              <p className="text-gray-600 text-sm">
                {field.type.toUpperCase()}
              </p>
              <p className="text-gray-500 text-sm">{field.location?.name}</p>
              <p className="text-green-600 font-bold mt-2">
                ${field.pricePerHour} / hour
              </p>

              {/* 📌 Se ajustaron los botones para mayor armonía visual */}
              <div className="flex justify-between gap-4 mt-4">
                <button
                  className="px-4 py-2  text-sm bg-[#50BB73] text-white rounded-md hover:bg-green-800 transition"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ Evita que el clic en "Edit" seleccione la cancha
                    navigate(`/fields/edit/${field._id}`);
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2  text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ Evita que el clic en "Delete" seleccione la cancha
                    handleDelete(field._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <MapComponent fields={fields} selectedField={selectedField} />
    </div>
  );
};

export default FieldList;
