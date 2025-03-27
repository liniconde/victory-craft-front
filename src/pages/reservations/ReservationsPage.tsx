import React from "react";
import ReservationList from "./ReservationList";
import BackgroundComponent from "../../components/Background/Background"; // ✅ Ajusta la ruta

const ReservationsPage: React.FC = () => {
  return (
    <>
      <BackgroundComponent />

      <div className="relative z-50 min-h-screen px-4 py-8 flex flex-col items-center">
        <ReservationList />
      </div>
    </>
  );
};

export default ReservationsPage;
