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
import "./ReservationList.css";

interface ReservationListProps {
  refreshKey?: number;
}

const ReservationList: React.FC<ReservationListProps> = ({ refreshKey = 0 }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const navigate = useNavigate();
  const { showLoading, hideLoading, showError } = useAppFeedback();
  const { isAdmin } = useAuth();
  const emptyActionLabel = isAdmin ? "Crear Nuevo Partido" : "Seleccionar cancha";

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
  }, [refreshKey]);

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
    <section className="reservations-module">
      <div className="reservations-container">
        <div className="reservations-header">
          <div>
            <h1 className="reservations-title">Reservas</h1>
            <p className="reservations-subtitle">
              Consulta tus horarios reservados y gestiona cada partido desde un
              solo lugar.
            </p>
          </div>

          {isAdmin && (
            <button
              className="actions-button"
              onClick={() => navigate("/reservations/new")}
            >
              Crear Nuevo Partido
            </button>
          )}
        </div>

        {reservations.length === 0 && (
          <div className="reservations-empty">
            <h2>No tienes reservas aún.</h2>
            <p>
              {isAdmin
                ? 'Haz clic en "Crear Nuevo Partido" para comenzar.'
                : 'Cuando reserves una cancha, la verás listada aquí.'}
            </p>
            {!isAdmin && (
              <button
                className="actions-button"
                onClick={() => navigate("/reservations")}
              >
                {emptyActionLabel}
              </button>
            )}
          </div>
        )}

        {reservations.length > 0 && (
          <div className="reservations-table-shell hidden md:block">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>Cancha</th>
                  <th>Nombre</th>
                  <th>Horario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => {
                  const field = reservation.slot?.field;
                  const start = new Date(
                    reservation.slot?.startTime
                  ).toLocaleString();
                  const end = new Date(
                    reservation.slot?.endTime
                  ).toLocaleString();

                  return (
                    <tr key={reservation._id}>
                      <td>
                        <div className="reservations-image-wrap">
                          <img
                            src={
                              field?.imageUrl ||
                              "https://via.placeholder.com/240x160?text=Cancha"
                            }
                            alt="Imagen de cancha"
                            className="reservations-image"
                          />
                        </div>
                      </td>
                      <td>
                        <div className="reservations-field-meta">
                          <strong>{field?.name || "N/A"}</strong>
                          <span>{field?.location?.name || "Ubicacion no disponible"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="reservations-schedule">
                          <strong>{start}</strong>
                          <span>{end}</span>
                        </div>
                      </td>
                      <td>
                        <div className="reservations-actions">
                          <button
                            className="reservations-action reservations-action--edit"
                            onClick={() =>
                              navigate(`/reservations/edit/${reservation._id}`)
                            }
                          >
                            Editar
                          </button>
                          <button
                            className="reservations-action reservations-action--delete"
                            onClick={() => handleDelete(reservation._id)}
                          >
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="reservations-mobile-grid md:hidden">
          {reservations.map((reservation) => {
            const field = reservation.slot?.field;
            const start = new Date(
              reservation.slot?.startTime
            ).toLocaleString();
            const end = new Date(reservation.slot?.endTime).toLocaleString();

            return (
              <article key={reservation._id} className="reservations-mobile-card">
                <div className="reservations-mobile-card__top">
                  <img
                    src={
                      field?.imageUrl ||
                      "https://via.placeholder.com/240x160?text=Cancha"
                    }
                    alt="Imagen de cancha"
                    className="reservations-mobile-card__image"
                  />
                  <div className="reservations-mobile-card__info">
                    <h2>{field?.name || "N/A"}</h2>
                    <p>{field?.location?.name || "Ubicacion no disponible"}</p>
                  </div>
                </div>

                <div className="reservations-mobile-card__schedule">
                  <strong>{start}</strong>
                  <span>{end}</span>
                </div>

                <div className="reservations-mobile-card__actions">
                  <button
                    className="reservations-action reservations-action--edit"
                    onClick={() =>
                      navigate(`/reservations/edit/${reservation._id}`)
                    }
                  >
                    Editar
                  </button>
                  <button
                    className="reservations-action reservations-action--delete"
                    onClick={() => handleDelete(reservation._id)}
                  >
                    Borrar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ReservationList;
