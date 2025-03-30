import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { Slot } from "../../interfaces/SlotInterfaces";
import { Button, Table } from "react-bootstrap";
import { getFieldSlots } from "../../services/field/fieldService";

interface SlotSelectorProps {
  fieldId: string;
  setSelectedSlot: React.Dispatch<React.SetStateAction<Slot | null>>;
  selectedSlot: Slot | null;
}
const SlotSelector: React.FC<SlotSelectorProps> = ({
  fieldId,
  setSelectedSlot,
  selectedSlot,
}) => {
  const [slots, setSlots] = useState<Slot[]>([]);

  const [currentWeek, setCurrentWeek] = useState<Moment>(
    moment().startOf("week")
  );

  useEffect(() => {
    handleFieldSelect(fieldId);
  }, []);

  const handleFieldSelect = async (fieldId: string) => {
    // setFieldId(fieldId);

    try {
      const slots = await getFieldSlots(fieldId);
      setSlots(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  // ✅ Funciones para cambiar de semana
  const handlePreviousWeek = () => {
    setCurrentWeek((prevWeek) => prevWeek.clone().subtract(1, "week"));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prevWeek) => prevWeek.clone().add(1, "week"));
  };

  const daysOfWeek = Array.from({ length: 7 }, (_, i) =>
    currentWeek.clone().add(i, "days")
  );

  const handleSlotSelect = (slot: Slot) => {
    console.log("slort", slot, selectedSlot);
    setSelectedSlot(slot);
  };

  return (
    fieldId && (
      <>
        <div className="flex justify-between my-4 items-center">
          <Button
            variant="secondary"
            onClick={handlePreviousWeek}
            className="text-sm px-3 py-2"
          >
            ← Semana Anterior
          </Button>
          <h2 className="text-lg font-semibold my-4">
            Semana del {currentWeek.format("MMM D")} al{" "}
            {currentWeek.clone().add(6, "days").format("MMM D")}
          </h2>
          <Button
            variant="secondary"
            onClick={handleNextWeek}
            className="text-sm px-3 py-2"
          >
            Semana Siguiente →
          </Button>
        </div>
        <Table bordered hover>
          <thead>
            <tr>
              {daysOfWeek.map((day) => (
                <th key={day.format("YYYY-MM-DD")}>
                  {day.format("dddd, MMM D")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {daysOfWeek.map((day) => (
                <td key={day.format("YYYY-MM-DD")}>
                  {slots
                    .filter((slot) => moment(slot.startTime).isSame(day, "day"))
                    .map((slot) => (
                      <Button
                        key={slot._id}
                        className={`w-full mb-2 py-2 text-sm font-medium rounded-lg transition ${
                          slot._id === selectedSlot?._id
                            ? "bg-green-800"
                            : "bg-[#50BB73]"
                        } hover:bg-green-800 text-white`}
                        disabled={slot._id === selectedSlot?._id}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {moment(slot.startTime).format("HH:mm")} -{" "}
                        {moment(slot.endTime).format("HH:mm")}
                      </Button>
                    ))}
                </td>
              ))}
            </tr>
          </tbody>
        </Table>
      </>
    )
  );
};

export default SlotSelector;
