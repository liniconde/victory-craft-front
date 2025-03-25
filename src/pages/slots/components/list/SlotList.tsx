import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../utils/api";
import { Slot } from "../../../../interfaces/SlotInterfaces";
import { Field } from "../../../../interfaces/FieldInterfaces";

const SlotList: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/fields")
      .then((response) => {
        setFields(response.data);
        setFilteredFields(response.data);
      })
      .catch((error) => console.error("Error fetching fields:", error));
  }, []);

  const handleDelete = (id: string) => {
    api
      .delete(`/slots/${id}`)
      .then(() => setSlots(slots.filter((slot) => slot._id !== id)))
      .catch((error) => console.error("Error deleting slot:", error));
  };

  const handleSelectField = (field: Field) => {
    setSelectedField(field);
    api
      .get(`/fields/${field._id}/slots`)
      .then((response) => setSlots(response.data))
      .catch((error) => console.error("Error fetching slots:", error));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredFields(
      fields.filter((field) => field.name.toLowerCase().includes(term))
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Disponibilidad por Cancha
      </h1>

      {/* 🔍 Buscar y seleccionar cancha */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Buscar cancha..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:w-1/2 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#50BB73]"
        />
        <div className="flex gap-2">
          {filteredFields.map((field) => (
            <button
              key={field._id}
              onClick={() => handleSelectField(field)}
              className="bg-[#50BB73] text-white px-4 py-2 rounded-md hover:bg-green-800 transition text-sm"
            >
              {field.name}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Botón para crear nuevo slot */}
      {selectedField && (
        <div className="text-right mb-6">
          <button
            onClick={() => navigate(`/slots/new/${selectedField._id}`)}
            className="bg-[#50BB73] text-white px-5 py-2 rounded-lg shadow-md hover:bg-green-800 transition"
          >
            Crear nuevo turno
          </button>
        </div>
      )}

      {/* 🎯 Mostrar slots como tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {slots.map((slot) => (
          <div
            key={slot._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-transform hover:scale-105"
          >
            <img
              src={slot.field?.imageUrl || "https://via.placeholder.com/300"}
              alt={slot.field?.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {slot.field?.name || "Cancha"}
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Inicio:</strong>{" "}
                {new Date(slot.startTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Fin:</strong> {new Date(slot.endTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Precio:</strong> ${slot.value.toFixed(2)}
              </p>
              <p
                className={`text-sm font-semibold mt-1 ${
                  slot.isAvailable ? "text-green-600" : "text-red-600"
                }`}
              >
                {slot.isAvailable ? "Disponible" : "No disponible"}
              </p>

              <div className="flex justify-between mt-4">
                <button
                  className="px-3 py-1 text-sm bg-[#50BB73] text-white rounded-md hover:bg-[#235A2C] transition"
                  onClick={() => navigate(`/slots/edit/${slot._id}`)}
                >
                  Editar
                </button>
                <button
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  onClick={() => handleDelete(slot._id)}
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlotList;
