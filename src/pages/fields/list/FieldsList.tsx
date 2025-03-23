import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import MapComponent from "../map/MapComponent";
import { Field } from "../../../interfaces/FieldInterfaces";
import { useAuth } from "../../../context/AuthContext";
import "./FieldList.css";

const FieldList: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [filterType, setFilterType] = useState<string>("all"); // Estado para filtrar por tipo

  const navigate = useNavigate();
  const { role } = useAuth(); // ✅ Obtenemos el rol del usuario

  useEffect(() => {
    api
      .get("/fields")
      .then((response) => {
        setFields(response.data);
        setFilteredFields(response.data); // Inicialmente mostramos todas las canchas
      })
      .catch((error) => console.error("Error fetching fields:", error));
  }, []);

  useEffect(() => {
    if (filterType === "all") {
      setFilteredFields(fields);
    } else {
      setFilteredFields(fields.filter((field) => field.type === filterType));
    }
  }, [filterType, fields]);

  const handleDelete = (id: string) => {
    api
      .delete(`/fields/${id}`)
      .then(() => setFields(fields.filter((field) => field._id !== id)))
      .catch((error) => console.error("Error deleting field:", error));
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Available Fields
      </h1>

      {/* ✅ Solo los administradores pueden ver este botón */}
      {role === "admin" && (
        <button
          className="mb-6 px-5 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
          onClick={() => navigate("/fields/new")}
        >
          Add New Field
        </button>
      )}

      {/* 🔍 Filtro por tipo de cancha */}
      <div className="mb-6 flex justify-center">
        <select
          className="px-4 py-2 border rounded-lg shadow-sm text-gray-700"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Fields</option>
          <option value="football">Football</option>
          <option value="padel">Padel</option>
          <option value="tennis">Tennis</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredFields.map((field) => (
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
            <div className="field-card">
              <h2 className="field-card-title text-xl font-semibold text-gray-800">
                {field.name}
              </h2>
              <p className="text-gray-600 text-sm">
                {field.type.toUpperCase()}
              </p>
              <p className="text-gray-500 text-sm">{field.location?.name}</p>
              <p className="field-card-price field-card-sub">
                ${field.pricePerHour} / hour
              </p>

              {/* 📌 Sección de botones según el rol */}
              <div className="flex justify-between gap-4 mt-4">
                {role === "user" ? (
                  <button
                    className="px-2 py-2 text-sm bg-[#50BB73] text-white rounded-md hover:bg-green-800 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/fields/${field._id}/reservations/`);
                    }}
                  >
                    Reserve
                  </button>
                ) : (
                  <>
                    <button
                      className="px-2 py-2 text-sm bg-[#50BB73] text-white rounded-md hover:bg-green-800 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/fields/edit/${field._id}`);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="px-2 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(field._id);
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Mueve el MapComponent fuera del bucle */}
      <div className="mt-12">
        <MapComponent fields={filteredFields} selectedField={selectedField} />
      </div>
    </div>
  );
};

export default FieldList;
