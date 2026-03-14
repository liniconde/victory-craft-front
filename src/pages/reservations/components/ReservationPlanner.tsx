import React, { useEffect, useMemo, useState } from "react";
import moment, { Moment } from "moment";
import { Field } from "../../../interfaces/FieldInterfaces";
import { Slot } from "../../../interfaces/SlotInterfaces";
import { getFields, getFieldSlots } from "../../../services/field/fieldService";
import { useAppFeedback } from "../../../hooks/useAppFeedback";
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import "./ReservationPlanner.css";

interface ReservationPlannerProps {
  isOpen: boolean;
  onReservationCreated: () => void;
}

const FIELD_IMAGE_FALLBACK = "https://via.placeholder.com/640x360?text=Cancha";

const ReservationPlanner: React.FC<ReservationPlannerProps> = ({
  isOpen,
  onReservationCreated,
}) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [currentWeek, setCurrentWeek] = useState<Moment>(
    moment().startOf("isoWeek")
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { userId } = useAuth();
  const { hideLoading, showError, showLoading } = useAppFeedback();

  useEffect(() => {
    if (!isOpen) return;

    const fetchFields = async () => {
      try {
        showLoading();
        const data = await getFields();
        setFields(data);
      } catch (error) {
        console.error("Error fetching fields:", error);
        showError("No se pudieron cargar las canchas.");
      } finally {
        hideLoading();
      }
    };

    fetchFields();
  }, [isOpen]);

  const filteredFields = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return fields;

    return fields.filter((field) =>
      [field.name, field.location?.name, field.type]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))
    );
  }, [fields, searchTerm]);

  const daysOfWeek = useMemo(
    () => Array.from({ length: 7 }, (_, i) => currentWeek.clone().add(i, "days")),
    [currentWeek]
  );

  const fetchSlotsForField = async (field: Field) => {
    try {
      showLoading();
      const fieldSlots = await getFieldSlots(field._id);
      setSelectedField(field);
      setSlots(fieldSlots);
      setSelectedSlot(null);
      setCurrentWeek(moment().startOf("isoWeek"));
    } catch (error) {
      console.error("Error fetching slots:", error);
      showError("No se pudo cargar la disponibilidad.");
    } finally {
      hideLoading();
    }
  };

  const handleConfirmReservation = async () => {
    if (!selectedField || !selectedSlot || !userId) {
      showError("Selecciona una cancha y un horario antes de reservar.");
      return;
    }

    try {
      showLoading();
      await api.post("/reservations", {
        user: userId,
        field: selectedField._id,
        slot: selectedSlot._id,
      });

      await api.put(`/slots/${selectedSlot._id}`, {
        ...selectedSlot,
        isAvailable: false,
      });

      const updatedSlots = await getFieldSlots(selectedField._id);
      setSlots(updatedSlots);
      setSelectedSlot(null);
      setShowConfirmModal(false);
      onReservationCreated();
    } catch (error) {
      console.error("Error creating reservation:", error);
      showError("No se pudo completar la reserva.");
    } finally {
      hideLoading();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <section className="reservation-planner">
        <div className="reservation-planner__intro">
          <div>
            <span className="reservation-planner__eyebrow">
              Selecciona tu cancha
            </span>
            <p className="reservation-planner__description">
              Busca por nombre, tipo o ubicacion. Al elegir una cancha veras los
              horarios disponibles de la semana actual y podras moverte entre
              semanas.
            </p>
          </div>

          <label className="reservation-planner__search">
            <span>Buscar cancha</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ej. Central, Futbol, Norte..."
            />
          </label>
        </div>

        <div className="reservation-planner__layout">
          <aside className="reservation-planner__fields">
            <div className="reservation-planner__section-head">
              <h3>Canchas disponibles</h3>
              <span>{filteredFields.length} resultados</span>
            </div>

            <div className="reservation-planner__field-list">
              {filteredFields.map((field) => {
                const isActive = selectedField?._id === field._id;

                return (
                  <button
                    key={field._id}
                    type="button"
                    className={`reservation-field-card ${
                      isActive ? "reservation-field-card--active" : ""
                    }`}
                    onClick={() => fetchSlotsForField(field)}
                  >
                    <img
                      src={field.imageUrl || FIELD_IMAGE_FALLBACK}
                      alt={field.name}
                      className="reservation-field-card__image"
                    />
                    <div className="reservation-field-card__body">
                      <div className="reservation-field-card__top">
                        <h4>{field.name}</h4>
                        <span>{field.type}</span>
                      </div>
                      <p>{field.location?.name || "Ubicacion no disponible"}</p>
                      <strong>${field.pricePerHour} / hora</strong>
                    </div>
                  </button>
                );
              })}

              {filteredFields.length === 0 && (
                <div className="reservation-planner__empty">
                  No encontramos canchas con ese filtro.
                </div>
              )}
            </div>
          </aside>

          <div className="reservation-planner__calendar-panel">
            {selectedField ? (
              <>
                <div className="reservation-calendar__header">
                  <div>
                    <span className="reservation-calendar__tag">
                      Cancha seleccionada
                    </span>
                    <h3>{selectedField.name}</h3>
                    <p>
                      {selectedField.location?.name || "Ubicacion no disponible"} ·{" "}
                      {selectedField.type}
                    </p>
                  </div>

                  <div className="reservation-calendar__week-nav">
                    <button
                      type="button"
                      className="reservation-calendar__week-button"
                      onClick={() =>
                        setCurrentWeek((prevWeek) =>
                          prevWeek.clone().subtract(1, "week")
                        )
                      }
                    >
                      Semana anterior
                    </button>
                    <div className="reservation-calendar__week-range">
                      {currentWeek.format("D MMM")} -{" "}
                      {currentWeek.clone().add(6, "days").format("D MMM YYYY")}
                    </div>
                    <button
                      type="button"
                      className="reservation-calendar__week-button"
                      onClick={() =>
                        setCurrentWeek((prevWeek) =>
                          prevWeek.clone().add(1, "week")
                        )
                      }
                    >
                      Semana siguiente
                    </button>
                  </div>
                </div>

                <div className="reservation-calendar">
                  {daysOfWeek.map((day) => {
                    const daySlots = slots.filter((slot) =>
                      moment(slot.startTime).isSame(day, "day")
                    );

                    return (
                      <div
                        key={day.format("YYYY-MM-DD")}
                        className="reservation-calendar__day"
                      >
                        <div className="reservation-calendar__day-head">
                          <span>{day.format("dddd")}</span>
                          <strong>{day.format("D MMM")}</strong>
                        </div>

                        <div className="reservation-calendar__slots">
                          {daySlots.length > 0 ? (
                            daySlots.map((slot) => {
                              const isSelected = selectedSlot?._id === slot._id;

                              return (
                                <button
                                  key={slot._id}
                                  type="button"
                                  className={`reservation-slot ${
                                    slot.isAvailable
                                      ? "reservation-slot--available"
                                      : "reservation-slot--unavailable"
                                  } ${
                                    isSelected ? "reservation-slot--selected" : ""
                                  }`}
                                  disabled={!slot.isAvailable}
                                  onClick={() => {
                                    setSelectedSlot(slot);
                                    setShowConfirmModal(true);
                                  }}
                                >
                                  <span>
                                    {moment(slot.startTime).format("HH:mm")} -{" "}
                                    {moment(slot.endTime).format("HH:mm")}
                                  </span>
                                  <small>
                                    {slot.isAvailable
                                      ? "Disponible"
                                      : "No disponible"}
                                  </small>
                                </button>
                              );
                            })
                          ) : (
                            <div className="reservation-calendar__empty-day">
                              Sin horarios para este dia
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="reservation-planner__placeholder">
                <h3>Elige una cancha para ver la agenda semanal</h3>
                <p>
                  Cuando selecciones una cancha, aqui apareceran sus horarios de
                  la semana y podras reservar uno disponible.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {showConfirmModal && selectedField && selectedSlot && (
        <div className="reservation-confirm-modal">
          <div className="reservation-confirm-modal__card">
            <div className="reservation-confirm-modal__header">
              <div>
                <span>Confirmacion</span>
                <h3>Confirma tu reserva</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="reservation-confirm-modal__content">
              <p>
                <strong>{selectedField.name}</strong>
              </p>
              <p>{selectedField.location?.name || "Ubicacion no disponible"}</p>
              <p>
                {moment(selectedSlot.startTime).format("dddd, D MMM YYYY")} ·{" "}
                {moment(selectedSlot.startTime).format("HH:mm")} -{" "}
                {moment(selectedSlot.endTime).format("HH:mm")}
              </p>
            </div>

            <div className="reservation-confirm-modal__actions">
              <button
                type="button"
                className="reservation-confirm-modal__secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="reservation-confirm-modal__primary"
                onClick={handleConfirmReservation}
              >
                Confirmar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReservationPlanner;
