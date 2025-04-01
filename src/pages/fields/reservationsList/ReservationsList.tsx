import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  Reservation,
  getReservations,
} from "../../../services/reservation/reservationService";
import "./reservationsList.css"; // Importamos los estilos
import { useAppFeedback } from "../../../hooks/useAppFeedback";

const ReservationsList: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { showLoading, hideLoading } = useAppFeedback();

  useEffect(() => {
    const fetchReservations = async () => {
      if (userId) {
        showLoading();
        const allReservations = await getReservations();
        const userReservations = allReservations.filter(
          (res) => res.user._id === userId
        );
        setReservations(userReservations);
        hideLoading();
      }
    };
    fetchReservations();
  }, [userId]);

  return (
    <div className="reservations-page-container">
      <h1 className="reservations-title">Mis reservas</h1>

      {reservations.length === 0 ? (
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
        <p className="no-reservations">
          No tienes reservaciones todavía. ¡Vuelve a la seccíon de campos y
          animate a reservar una!
        </p>
      )}

      <button className="back-btn" onClick={() => navigate("/fields")}>
        Volver a los campos
      </button>
    </div>
  );
};

export default ReservationsList;
