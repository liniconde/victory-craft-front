import React, { useState } from "react";
import { api } from "../../utils/api";

const SlotForm: React.FC = () => {
  const [fieldId, setFieldId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [value, setValue] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/slots", {
        field: fieldId,
        startTime,
        endTime,
        value,
        isAvailable,
      });
      alert("Slot created!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Field ID"
        value={fieldId}
        onChange={(e) => setFieldId(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        placeholder="Start Time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        placeholder="End Time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />
      <input
        type="checkbox"
        checked={isAvailable}
        onChange={() => setIsAvailable(!isAvailable)}
      />
      <label>Is Available</label>
      <button type="submit">Create Slot</button>
    </form>
  );
};

export default SlotForm;
