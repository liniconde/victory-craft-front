import React, { useState, useEffect } from "react";
import { Table, Button, Container } from "react-bootstrap";
import { api } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import {
  getReservations,
  Reservation,
} from "../../../services/reservation/reservationService";

const MyReservations: React.FC = () => {
  const { userId } = useAuth(); // Obtener el userId del AuthContext
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const fetchReservations = async () => {
    if (userId) {
      // Fetch reservations for the logged-in user
      const reservations = await getReservations();
      setReservations(reservations);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [userId]);

  const handleCancelReservation = (reservationId: string) => {
    api
      .delete(`/reservations/${reservationId}`)
      .then(() => {
        // Filter out the canceled reservation from the state
        setReservations(
          reservations.filter(
            (reservation) => reservation._id !== reservationId
          )
        );
      })
      .catch((error) => console.error("Error canceling reservation:", error));
  };

  return (
    <Container>
      <h1>My Reservations</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Field</th>
            <th>Slot</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation._id}>
              <td>{reservation.slot.field?.name}</td>
              <td>
                {reservation.slot?.startTime} - {reservation.slot?.endTime}
              </td>
              <td>
                {new Date(reservation.slot?.startTime).toLocaleDateString()}
              </td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => handleCancelReservation(reservation._id)}
                >
                  Cancel
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default MyReservations;
