import React, { useState, useEffect } from "react";
import { ListGroup, Button, Modal } from "react-bootstrap";
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import {
  getReservations,
  Reservation,
} from "../../../services/reservation/reservationService";
import "../reservationsList/reservationsList.css"; // Importamos los estilos

interface Props {
  fieldId: string; // ID de la cancha seleccionada
}

const ReservationsList: React.FC<Props> = ({ fieldId }) => {
  const { userId } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<string | null>(
    null
  );

  // Obtener las reservas del usuario filtradas por cancha
  const fetchReservations = async () => {
    if (userId) {
      const allReservations = await getReservations();
      setReservations(
        allReservations
          .filter((res) => res.slot?.field?._id) // Asegurar que slot y field existen
          .filter((res) => res.slot!.field!._id === fieldId) // Ahora TypeScript sabe que existen
      );
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [userId, fieldId]);

  // Cancelar reserva con confirmación
  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    try {
      await api.delete(`/reservations/${selectedReservation}`);
      setReservations(
        reservations.filter((res) => res._id !== selectedReservation)
      );
      setShowConfirm(false);
    } catch (error) {
      console.error("Error canceling reservation:", error);
    }
  };

  return (
    <div className="reservations-container">
      <h2 className="reservations-title">My Reservations</h2>
      <ListGroup variant="flush">
        {reservations.length > 0 ? (
          reservations.map((reservation) => (
            <ListGroup.Item key={reservation._id} className="reservation-item">
              <div className="reservation-details">
                <strong>{reservation.slot.field?.name}</strong>
                <p className="reservation-time">
                  {reservation.slot?.startTime} - {reservation.slot?.endTime} |{" "}
                  {new Date(reservation.slot?.startTime).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                className="cancel-btn"
                onClick={() => {
                  setSelectedReservation(reservation._id);
                  setShowConfirm(true);
                }}
              >
                Cancel
              </Button>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item className="no-reservations">
            No reservations yet.
          </ListGroup.Item>
        )}
      </ListGroup>
      <div className="reservations-footer">
        <Button variant="primary" size="sm" className="book-more-btn">
          Book More
        </Button>
      </div>

      {/* Modal de confirmación */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel this reservation?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleCancelReservation}>
            Cancel Reservation
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReservationsList;
