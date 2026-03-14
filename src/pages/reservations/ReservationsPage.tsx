import React, { useState } from "react";
import ReservationList from "./ReservationList";
import ReservationPlanner from "./components/ReservationPlanner";
import "./ReservationsPage.css";

const ReservationsPage: React.FC = () => {
  const [showPlanner, setShowPlanner] = useState(false);
  const [refreshReservationsKey, setRefreshReservationsKey] = useState(0);

  return (
    <div className="relative z-10 min-h-screen pt-[5rem] px-4 py-8 flex flex-col items-center text-center bg-white">
      <h1 className="text-3xl font-bold text-[#50BB73] mb-4">
        Reserva tu cancha
      </h1>
      <p className="text-gray-600 mb-6 max-w-xl">
        Elige entre nuestras canchas de fútbol, pádel o tenis. Revisa la
        disponibilidad semanal, selecciona el horario ideal y ¡reserva en
        segundos!
      </p>

      <button
        className="bg-[#50BB73] text-white px-6 py-3 rounded-lg hover:bg-green-800 transition font-semibold"
        onClick={() => setShowPlanner((currentValue) => !currentValue)}
      >
        {showPlanner ? "Ocultar selector" : "Seleccionar cancha"}
      </button>

      <ReservationPlanner
        isOpen={showPlanner}
        onReservationCreated={() =>
          setRefreshReservationsKey((currentValue) => currentValue + 1)
        }
      />

      {!showPlanner && (
        <div className="w-full">
          {/* Guía de pasos */}
          <section className="bg-gray-100 w-full mt-12 py-8">
            <h2 className="text-xl md:text-2xl font-bold text-center text-[#50BB73] mb-6">
              ¿Cómo reservar?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
              <div className="bg-white p-4 shadow rounded-lg">
                <h3 className="text-lg font-semibold">1. Selecciona tu cancha</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Elige el campo que más te guste.
                </p>
              </div>
              <div className="bg-white p-4 shadow rounded-lg">
                <h3 className="text-lg font-semibold">2. Elige el horario</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Consulta la disponibilidad semanal.
                </p>
              </div>
              <div className="bg-white p-4 shadow rounded-lg">
                <h3 className="text-lg font-semibold">3. Confirma y juega</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Confirma tu reserva y disfruta.
                </p>
              </div>
            </div>
          </section>

          {/* Componente lista de reservas */}
          <div className="w-full max-w-7xl mt-12 px-4 mx-auto">
            <ReservationList refreshKey={refreshReservationsKey} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
