import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getReservations,
  removeReservation,
  Reservation,
} from "../../services/reservation/reservationService";

const ReservationList: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const reservations = await getReservations();
        setReservations(reservations);
        console.log(reservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    fetchReservations(); // 🔹 Llamar a la función asíncrona
  }, []);

  const handleDelete = async (id: string) => {
    // Delete the reservation by ID
    try {
      await removeReservation(id);
      setReservations(
        reservations.filter((reservation) => reservation._id !== id)
      );
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  return (
    <div className="reservations-container">
      <h1>Reservations</h1>
      <button
        className="actions-button"
        onClick={() => navigate("/reservations/new")}
      >
        Add New Reservation
      </button>
      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Field ID</th>
            <th>Slot ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation._id}>
              <td>{reservation.user._id}</td>
              <td>{reservation.field._id}</td>
              <td>{reservation.slot._id}</td>
              <td>
                <button
                  onClick={() =>
                    navigate(`/reservations/edit/${reservation._id}`)
                  }
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(reservation._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationList;
