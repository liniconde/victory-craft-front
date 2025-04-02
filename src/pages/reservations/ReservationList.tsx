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
        <h1 className="text-2xl font-semibold mb-4">Reservas</h1>

        {isAdmin && (
          <button
            className="actions-button mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => navigate("/reservations/new")}
          >
            Crear Nuevo Partido
          </button>
        )}

        {reservations.length === 0 && (
          <div className="text-gray-600 text-center mt-6">
            <p>No tienes reservas aún.</p>
            <p>
              Haz clic en <strong>"Crear Nuevo Partido"</strong> para comenzar.
            </p>
          </div>
        )}

        <table className="reservations-table w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Imagen</th>
              <th className="p-2">Nombre de la Cancha</th>
              <th className="p-2">Horario</th>
              <th className="p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => {
              const field = reservation.slot?.field;
              const start = new Date(
                reservation.slot?.startTime
              ).toLocaleString();
              const end = new Date(reservation.slot?.endTime).toLocaleString();

              return (
                <tr key={reservation._id} className="border-b">
                  <td className="p-2">
                    <div className="flex justify-center items-center">
                      <img
                        src={field?.imageUrl}
                        alt="Imagen de cancha"
                        className="w-24 h-16 object-cover rounded shadow"
                      />
                    </div>
                  </td>
                  <td className="p-2 font-medium">{field?.name || "N/A"}</td>
                  <td className="p-2 text-sm text-gray-600">
                    {start} - {end}
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center items-center gap-[25px]">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        onClick={() =>
                          navigate(`/reservations/edit/${reservation._id}`)
                        }
                      >
                        Editar
                      </button>
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
    </>
  );
};

export default ReservationList;
