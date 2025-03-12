import ReservationForm, { ReservationFormEnum } from "./form/ReservationForm";

const Reservations = () => {
  return (
    <div>
      <ReservationForm mode={ReservationFormEnum.CREATE} />
    </div>
  );
};

export default Reservations;
