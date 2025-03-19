import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import MapComponent from "../map/MapComponent";
import { Field } from "../../../interfaces/FieldInterfaces";
import ReservationsList from "../reservationsList/ReservationsList"; // Ya tiene sus estilos importados internamente
import CustomModal from "../reservationsList/CustomModal";
import { useAuth } from "../../../context/AuthContext"; // ✅ Importamos el contexto de autenticación

const FieldList: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const { role } = useAuth(); // ✅ Obtenemos el rol del usuario

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {fields.map((field) => (
          <div
            key={field._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => {
              setSelectedField(field);
              setShowModal(true);
            }}
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

              {/* 📌 Sección de botones según el rol */}
              <div className="flex justify-between gap-4 mt-4">
                {role === "user" ? (
                  <button
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedField(field);
                      setShowModal(true); // ✅ Abre el modal para ver las reservas
                    }}
                  >
                    Reserve
                  </button>
                ) : (
                  <>
                    <button
                      className="px-4 py-2 text-sm bg-[#50BB73] text-white rounded-md hover:bg-green-800 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/fields/edit/${field._id}`);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
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
      <MapComponent fields={fields} selectedField={selectedField} />

      {/* ✅ Modal con ReservationsList */}
      <CustomModal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={`Reservations for ${selectedField?.name}`}
      >
        {selectedField && <ReservationsList fieldId={selectedField._id} />}
      </CustomModal>
    </div>
  );
};

export default FieldList;
