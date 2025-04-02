import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Table, Button } from "react-bootstrap";
import moment, { Moment } from "moment";
import FieldSelector from "../../fields/components/FieldSelector";
import "./ReservationForm.css";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../utils/api";
import { getReservation } from "../../../services/reservation/reservationService";
import { Slot } from "../../../interfaces/SlotInterfaces";
import { getFieldSlots } from "../../../services/field/fieldService";
import { useAppFeedback } from "../../../hooks/useAppFeedback";

export enum ReservationFormEnum {
  CREATE = "create",
  EDIT = "edit",
}

interface ReservationFormProps {
  mode: ReservationFormEnum.CREATE | ReservationFormEnum.EDIT;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ mode }) => {
  const [fieldId, setFieldId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<Moment>(
    moment().startOf("week")
  );

  const { id, fieldId: fieldIdParam } = useParams<{
    id: string;
    fieldId: string;
  }>();
  const navigate = useNavigate();
  const { userId, isAdmin } = useAuth();
  const { showLoading, hideLoading, showError } = useAppFeedback();

  const fetchReservation = async (reservationId: string | undefined) => {
    if (mode === "edit" && reservationId) {
      try {
        showLoading();
        const reservation = await getReservation(reservationId);
        setFieldId(reservation.field!._id);
        setSelectedSlot(reservation.slot);
      } catch (error) {
        console.error("Error fetching reservation:", error);
        showError("Error fetching reservation");
      } finally {
        hideLoading();
      }
    }
  };

  useEffect(() => {
    fetchReservation(id);
  }, [mode, id, fieldIdParam]);

  useEffect(() => {
    if (fieldIdParam) handleFieldSelect(fieldIdParam);
  }, [fieldIdParam]);

  const handleFieldSelect = async (fieldId: string) => {
    setFieldId(fieldId);
    try {
      showLoading();
      const slots = await getFieldSlots(fieldId);
      setSlots(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      showError("Error fetching slots");
    } finally {
      hideLoading();
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setShowConfirmModal(true);
  };

  const handleConfirmReservation = () => {
    const reservationData = {
      user: userId,
      field: fieldId,
      slot: selectedSlot?._id,
    };

    if (mode === "create") {
      api
        .post("/reservations", reservationData)
        .then(() => console.log("reserva creada correctamente"))
        .catch((error) => {
          console.error("Error creating reservation:", error);
          alert("Error: " + error);
        });

      api
        .put(`/slots/${selectedSlot?._id}`, {
          ...selectedSlot,
          isAvailable: false,
        })
        .then(() => {
          setShowConfirmModal(false);
          handleFieldSelect(fieldId);
        })
        .catch((error) => {
          console.error("Error updating slot:", error);
          alert("Error: " + error);
        });
    } else {
      api
        .put(`/reservations/${id}`, reservationData)
        .then(() => navigate("/reservations"))
        .catch((error) => console.error("Error updating reservation:", error));
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeek((prevWeek) => prevWeek.clone().subtract(1, "week"));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prevWeek) => prevWeek.clone().add(1, "week"));
  };

  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    currentWeek.clone().add(i, "days")
  );

  return (
    <div className="reservation-container">
      {isAdmin && (
        <h1 className="reservation-title">
          {mode === "create" ? "Nueva Reserva" : "Editar Reserva"}
        </h1>
      )}

      {!fieldIdParam && <FieldSelector onFieldSelect={handleFieldSelect} />}

      {fieldId && (
        <div className="reservation-week-nav">
          <Button
            variant="secondary"
            onClick={handlePreviousWeek}
            className="reservation-button"
          >
            ← Semana Anterior
          </Button>
          <h2 className="reservation-week-title">
            Semana del {currentWeek.format("MMM D")} al{" "}
            {currentWeek.clone().add(6, "days").format("MMM D")}
          </h2>
          <Button
            variant="secondary"
            onClick={handleNextWeek}
            className="reservation-button"
          >
            Semana Siguiente →
          </Button>
        </div>
      )}

      {fieldId && (
        <div className="overflow-x-auto px-2">
          <Table bordered hover className="reservation-table">
            <thead>
              <tr>
                {daysOfWeek.map((day) => (
                  <th key={day.format("YYYY-MM-DD")}>
                    {day.format("dddd, MMM D")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {daysOfWeek.map((day) => (
                  <td key={day.format("YYYY-MM-DD")}>
                    {slots
                      .filter((slot) =>
                        moment(slot.startTime).isSame(day, "day")
                      )
                      .map((slot) => (
                        <Button
                          key={slot._id}
                          className={`reservation-slot-button ${
                            slot.isAvailable ? "available" : "unavailable"
                          }`}
                          disabled={!slot.isAvailable}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {moment(slot.startTime).format("HH:mm")} -{" "}
                          {moment(slot.endTime).format("HH:mm")}
                        </Button>
                      ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>
        </div>
      )}

      {showConfirmModal && (
        <div className="reservation-modal-overlay">
          <div className="reservation-modal">
            <div className="reservation-modal-header">
              <h2 className="reservation-modal-title">Confirmar Reservación</h2>
              <button
                className="reservation-modal-close"
                onClick={() => setShowConfirmModal(false)}
              >
                ✕
              </button>
            </div>

            <p className="reservation-modal-message">
              ¿Estás segura/o que deseas reservar este campo?
            </p>

            <div className="reservation-modal-actions">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="reservation-modal-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReservation}
                className="reservation-modal-confirm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationForm;
