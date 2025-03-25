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
  const { userId } = useAuth();

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
        .then(() => navigate("/reservations"))
        .catch((error) => console.error("Error creating reservation:", error));
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

  // ✅ Calcular los días de la semana según el estado actual
  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    currentWeek.clone().add(i, "days")
  );

  return (
    <div>
      <h1>{mode === "create" ? "Crear Reservación" : "Editar Reservación"}</h1>

      <FieldSelector onFieldSelect={handleFieldSelect} />

      {/* ✅ SOLO SE MUESTRAN LOS BOTONES SI UN FIELD ESTÁ SELECCIONADO */}
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
                        variant={slot.isAvailable ? "success" : "secondary"}
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

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Reservacion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Esta seguro que quiere reservar este campo?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmReservation}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReservationForm;
