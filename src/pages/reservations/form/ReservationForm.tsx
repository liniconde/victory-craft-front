import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Table, Button, Modal } from "react-bootstrap";
import moment, { Moment } from "moment";
import FieldSelector from "../../fields/components/FieldSelector";
import "./index.css";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../utils/api";
import { getReservation } from "../../../services/reservation/reservationService";
import { Slot } from "../../../interfaces/SlotInterfaces";
import { getFieldSlots } from "../../../services/field/fieldService";

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
  ); // ✅ Estado para la semana actual

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId, isAdmin } = useAuth();

  const fetchReservation = async (reservationId: string | undefined) => {
    if (mode === "edit" && reservationId) {
      try {
        const reservation = await getReservation(reservationId);
        setFieldId(reservation.field!._id);
        setSelectedSlot(reservation.slot);
      } catch (error) {
        console.error("Error fetching reservation:", error);
      }
    }
  };

  useEffect(() => {
    fetchReservation(id);
  }, [mode, id]);

  const handleFieldSelect = async (fieldId: string) => {
    setFieldId(fieldId);
    // Fetch slots for the selected field
    try {
      const slots = await getFieldSlots(fieldId);
      setSlots(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
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

  // ✅ Funciones para cambiar de semana
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
    <div>
      {isAdmin && (
        <h1>{mode === "create" ? "Nueva Reserva" : "Editar Reserva"}</h1>
      )}

      <FieldSelector onFieldSelect={handleFieldSelect} />

      {fieldId && (
        <div className="flex justify-between my-4 items-center">
          <Button
            variant="secondary"
            onClick={handlePreviousWeek}
            className="text-sm px-3 py-2"
          >
            ← Semana Anterior
          </Button>
          <h2 className="text-lg font-semibold my-4">
            Semana del {currentWeek.format("MMM D")} al{" "}
            {currentWeek.clone().add(6, "days").format("MMM D")}
          </h2>
          <Button
            variant="secondary"
            onClick={handleNextWeek}
            className="text-sm px-3 py-2"
          >
            Semana Siguiente →
          </Button>
        </div>
      )}

      {fieldId && (
        <Table bordered hover>
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
                    .filter((slot) => moment(slot.startTime).isSame(day, "day"))
                    .map((slot) => (
                      <Button
                        key={slot._id}
                        className={`w-full mb-2 py-2 text-sm font-medium rounded-lg transition 
                        ${
                          slot.isAvailable
                            ? "bg-[#50BB73] hover:bg-green-800 text-white"
                            : "bg-red-500 text-white cursor-not-allowed opacity-70"
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
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Confirmar Reservación
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmModal(false)}
              >
                ✕
              </button>
            </div>

            <p className="text-gray-700 mb-6">
              ¿Estás segura/o que deseas reservar este campo?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReservation}
                className="px-4 py-2 bg-[#50BB73] text-white rounded-lg hover:bg-green-800 transition"
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
