import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../../utils/api";
import "./styles.css"; // 📌 Importamos el archivo CSS con Tailwind

interface SlotFormProps {
  mode: "create" | "edit";
}

const SlotForm: React.FC<SlotFormProps> = ({ mode }) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [value, setValue] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const { id, fieldId } = useParams<{ id: string; fieldId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === "edit" && id) {
      api
        .get(`/slots/${id}`)
        .then((response) => {
          const slot = response.data;
          setStartTime(slot.startTime);
          setEndTime(slot.endTime);
          setValue(slot.value);
          setIsAvailable(slot.isAvailable);
        })
        .catch((error) => console.error("Error fetching slot:", error));
    }
  }, [mode, fieldId, id]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const slotData = { field: fieldId, startTime, endTime, value, isAvailable };

    if (mode === "create") {
      api
        .post(`/slots`, slotData)
        .then(() => navigate(`/slots`))
        .catch((error) => console.error("Error creating slot:", error));
    } else {
      api
        .put(`/slots/${id}`, slotData)
        .then(() => navigate(`/slots`))
        .catch((error) => console.error("Error updating slot:", error));
    }
  };

  return (
    <div className="slot-form-container animate-fade-in">
      <h1 className="text-center text-2xl font-bold text-gray-800">
        {mode === "create" ? "Create Slot" : "Edit Slot"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="slot-form-label">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="slot-form-input transition-all duration-200 ease-in-out"
            required
          />
        </div>

        <div>
          <label className="slot-form-label">End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="slot-form-input transition-all duration-200 ease-in-out"
            required
          />
        </div>

        <button
          type="submit"
          className="slot-form-button hover:scale-105 transition-transform duration-300"
        >
          {mode === "create" ? "Create Slot" : "Update Slot"}
        </button>
      </form>
    </div>
  );
};

export default SlotForm;
