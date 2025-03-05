import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Table, Button, Modal } from "react-bootstrap";
import moment from "moment";
import FieldSelector from "../../fields/components/FieldSelector";
import "./index.css";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../utils/api";

export enum ReservationFormEnum {
  CREATE = "create",
  EDIT = "edit",
}

interface ReservationFormProps {
  mode: ReservationFormEnum.CREATE | ReservationFormEnum.EDIT;
}

interface Slot {
  _id: string;
  fieldId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ mode }) => {
  const [fieldId, setFieldId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();

  useEffect(() => {
    if (mode === "edit" && id) {
      api
        .get(`/reservations/${id}`)
        .then((response) => {
          const reservation = response.data;
          setFieldId(reservation.fieldId);
          setSelectedSlot(reservation.slotId);
        })
        .catch((error) => console.error("Error fetching reservation:", error));
    }
  }, [mode, id]);

  const handleFieldSelect = (fieldId: string) => {
    setFieldId(fieldId);
    // Fetch slots for the selected field
    api
      .get(`/fields/${fieldId}/slots`)
      .then((response) => setSlots(response.data))
      .catch((error) => console.error("Error fetching slots:", error));
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setShowConfirmModal(true);
  };

  const handleConfirmReservation = () => {
    const reservationData = { userId, fieldId, slotId: selectedSlot?._id };

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

  const startOfWeek = moment().startOf("week");
  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.clone().add(i, "days")
  );

  return (
    <div>
      <h1>{mode === "create" ? "Create Reservation" : "Edit Reservation"}</h1>

      <FieldSelector onFieldSelect={handleFieldSelect} />

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
          <Modal.Title>Confirm Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to reserve this slot?</Modal.Body>
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
