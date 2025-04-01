import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getReservations,
  removeReservation,
  Reservation,
} from "../../services/reservation/reservationService";
import { useAppFeedback } from "../../hooks/useAppFeedback";
import "./ReservationsPage.css";
import { useAuth } from "../../context/AuthContext";

const ReservationList: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const navigate = useNavigate();
  const { showLoading, hideLoading, showError } = useAppFeedback();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        showLoading();
        const reservations = await getReservations();
        setReservations(reservations);
        console.log(reservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        showError("Error fetching reservations");
      } finally {
        hideLoading();
      }
    };

    fetchReservations(); //Llama a la función asíncrona
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
    <>
      <div className="reservations-container mx-auto max-w-7xl px-4">
        <h1 className="text-2l font-semibold mb-4">Reservas</h1>
        {isAdmin && (
          <button
            className="actions-button mb-6"
            onClick={() => navigate("/reservations/new")}
          >
            Crear Nuevo partido
          </button>
        )}
        {reservations.length === 0 && (
          <div className="text-gray-600 text-center mt-6">
            <p>No tienes reservas aún.</p>
            <p>
              Haz clic en <strong>"Añadir Nueva reserva"</strong> para comenzar.
            </p>
          </div>
        )}
        <table className="reservations-table w-full">
          <thead>
            <tr>
              <th>Usuario ID</th>
              <th>Campo ID</th>
              <th>Slot ID</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation._id}>
                <td>{reservation.user._id || "N/A"}</td>
                <td>{reservation.field?._id || "N/A"}</td>
                <td>{reservation.slot?._id || "N/A"}</td>
                <td>
                  <button
                    onClick={() =>
                      navigate(`/reservations/edit/${reservation?._id}`)
                    }
                  >
                    Editar
                  </button>
                  <button onClick={() => handleDelete(reservation?._id)}>
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ReservationList;
