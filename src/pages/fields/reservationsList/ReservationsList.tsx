import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  Reservation,
  getReservations,
} from "../../../services/reservation/reservationService";
import "./reservationsList.css"; // Importamos los estilos

const ReservationsList: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (userId) {
        const allReservations = await getReservations();
        setReservations(
          allReservations.filter((res) => res.user._id === userId)
        );
      }
    };
    fetchReservations();
  }, [userId]);

  return (
    <div className="reservations-page-container">
      <h1 className="reservations-title">My Reservations</h1>

      {reservations.length > 0 ? (
        <div className="reservations-list">
          {reservations.map((reservation) => (
            <div key={reservation._id} className="reservation-card">
              <img
                src={
                  reservation.slot.field?.imageUrl ||
                  "https://via.placeholder.com/300"
                }
                alt="Field"
                className="field-image"
              />
              <div className="reservation-details">
                <h2>{reservation.slot.field?.name}</h2>
                <p>
                  Fecha:{" "}
                  {new Date(reservation.slot.startTime).toLocaleDateString()}
                </p>
                <p>
                  Tiempo: {reservation.slot.startTime} -{" "}
                  {reservation.slot.endTime}
                </p>
                <p>Locación: {reservation.slot.field?.location?.name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-reservations">No hay reservaciones ahora.</p>
      )}

      <button className="back-btn" onClick={() => navigate("/")}>
        Back to Fields
      </button>
    </div>
  );
};

export default ReservationsList;
