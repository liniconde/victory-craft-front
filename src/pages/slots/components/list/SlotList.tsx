import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../utils/api";
import { Slot } from "../../../../interfaces/SlotInterfaces";
import { Field } from "../../../../interfaces/FieldInterfaces";
import { useAuth } from "../../../../context/AuthContext";
import {
  getFields,
  getFieldsbyUserId,
} from "../../../../services/field/fieldService";
import { useAppFeedback } from "../../../../hooks/useAppFeedback";
import "./slotList.css";

const SlotList: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [showFieldPicker, setShowFieldPicker] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);

  const navigate = useNavigate();
  const { isAdmin, userId } = useAuth();
  const { showLoading, hideLoading, showError } = useAppFeedback();

  const getFieldsSlots = async (fieldId: string) => {
    const slots = await api.get(`/fields/${fieldId}/slots`);
    console.log("dataa", slots.data);
    return slots.data || [];
  };

  const fetchFields = async () => {
    if (userId) {
      showLoading();
      const fieldsData = isAdmin
        ? await getFieldsbyUserId(userId)
        : await getFields();
      hideLoading();
      return fieldsData || [];
    }
  };

  useEffect(() => {
    const populateFieldsAndSlots = async () => {
      const fieldsData = await fetchFields();
      if (fieldsData) {
        setFields(fieldsData);
        setFilteredFields(fieldsData);

        const allSlots = await Promise.all(
          fieldsData.map((field) => {
            console.log("field", field);
            return getFieldsSlots(field._id);
          })
        );
        if (allSlots?.length) {
          setSlots(allSlots.flat());
        }
      }
    };

    populateFieldsAndSlots();
  }, []);

  const handleDelete = (id: string) => {
    showLoading();
    api
      .delete(`/slots/${id}`)
      .then(() => {
        setSlots(slots.filter((slot) => slot._id !== id));
      })
      .catch((error) => {
        console.error("Error deleting slot:", error);
        showError("Error deleting slot");
      })
      .finally(() => hideLoading());
  };

  const handleSelectField = (field: Field) => {
    setSelectedField(field);
    setShowFieldPicker(false);
    showLoading();
    api
      .get(`/fields/${field._id}/slots`)
      .then((response) => {
        setSlots(response.data);
        console.log("response dataa", response.data);
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
        showError("Error fetching slots");
      })
      .finally(() => hideLoading());
  };

  const handleShowAllFields = async () => {
    setSelectedField(null);
    setShowFieldPicker(true);
    try {
      showLoading();
      const allSlots = await Promise.all(fields.map((field) => getFieldsSlots(field._id)));
      setSlots(allSlots.flat());
    } catch (error) {
      console.error("Error fetching all slots:", error);
      showError("Error fetching slots");
    } finally {
      hideLoading();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredFields(
      fields.filter((field) => field.name.toLowerCase().includes(term))
    );
  };

  return (
    <div className="slots-page max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-3 text-center">
        Disponibilidad por Campo
      </h1>
      <p className="slots-page__subtitle">
        Filtra por nombre y selecciona una cancha para ver y gestionar sus
        partidos disponibles.
      </p>

      {!showFieldPicker && (
        <div className="slot-topbar">
          <button
            type="button"
            className="slot-field-reset slot-field-reset--active"
            onClick={handleShowAllFields}
          >
            Ver todas las canchas
          </button>

          {selectedField && (
            <button
              onClick={() => navigate(`/slots/new/${selectedField._id}`)}
              className="slot-actions__button"
            >
              Crear nuevo partido
            </button>
          )}
        </div>
      )}

      {/* 🔍 Buscar y seleccionar campo */}
      {showFieldPicker && (
        <section className="slot-field-picker">
          <div className="slot-field-picker__header">
            <h2 className="slot-field-picker__title">Elige una cancha</h2>

            <div className="slot-field-picker__controls">
              <label className="slot-field-picker__search">
                <span>Buscar por nombre</span>
                <input
                  type="text"
                  placeholder="Buscar campo..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </label>

              <div className="slot-field-picker__toolbar">
                <button
                  type="button"
                  className={`slot-field-reset ${selectedField ? "" : "slot-field-reset--active"}`}
                  onClick={handleShowAllFields}
                >
                  Ver todas las canchas
                </button>
              </div>
            </div>
          </div>

          <div className="slot-field-picker__grid">
            {filteredFields.map((field) => {
              const isActive = selectedField?._id === field._id;

              return (
                <button
                  key={field._id}
                  type="button"
                  onClick={() => handleSelectField(field)}
                  className={`slot-field-row ${isActive ? "slot-field-row--active" : ""}`}
                >
                  <div className="slot-field-row__main">
                    <h3>{field.name}</h3>
                    <p>{field.location?.name || "Ubicacion no disponible"}</p>
                  </div>
                  <div className="slot-field-row__meta">
                    <span>{field.type}</span>
                    <strong>${field.pricePerHour} / hora</strong>
                  </div>
                </button>
              );
            })}

            {filteredFields.length === 0 && (
              <div className="slot-field-picker__empty">
                No hay canchas que coincidan con ese nombre.
              </div>
            )}
          </div>
        </section>
      )}

      {/* 🎯 Mostrar slots como tarjetas */}
      <div className="slots-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {slots.map((slot) => (
          <div
            key={slot._id}
            className="slot-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-transform hover:scale-105"
          >
            <img
              src={slot.field?.imageUrl || "https://via.placeholder.com/640x360?text=Cancha"}
              alt={slot.field?.name}
              className="slot-card__image w-full h-48 object-cover"
            />
            <div className="slot-card__body p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {slot.field?.name || "Campo"}
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Inicio:</strong>{" "}
                {new Date(slot.startTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Fin:</strong> {new Date(slot.endTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Precio:</strong> $
                {slot.value || slot.field?.pricePerHour.toFixed(2)}
              </p>
              <p
                className={`text-sm font-semibold mt-1 ${
                  slot.isAvailable ? "text-green-600" : "text-red-600"
                }`}
              >
                {slot.isAvailable ? "Disponible" : "No disponible"}
              </p>

              <div className="slot-card__actions flex justify-between mt-4">
                <button
                  className="slot-card__button slot-card__button--edit"
                  onClick={() => navigate(`/slots/edit/${slot._id}`)}
                >
                  Editar
                </button>
                <button
                  className="slot-card__button slot-card__button--delete"
                  onClick={() => handleDelete(slot._id)}
                >
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slots.length === 0 && selectedField && (
        <div className="slot-field-picker__empty mt-6">
          Esta cancha no tiene partidos configurados todavia.
        </div>
      )}
    </div>
  );
};

export default SlotList;
