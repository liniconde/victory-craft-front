import React from "react";
import ReservationList from "./ReservationList";

const ReservationsPage: React.FC = () => {
  return (
    <>
      <div className="relative z-50 min-h-screen px-4 py-8 flex flex-col items-center">
        <ReservationList />
      </div>
    </>
  );
};

export default ReservationsPage;
