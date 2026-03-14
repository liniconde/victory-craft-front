import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../../utils/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles.css";

interface SlotFormProps {
  mode: "create" | "edit";
}

const SlotForm: React.FC<SlotFormProps> = ({ mode }) => {
  const initialStartDate = new Date();
  const initialEndDate = new Date(initialStartDate.getTime() + 60 * 60 * 1000);
  const [value, setValue] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const { id, fieldId } = useParams<{ id: string; fieldId: string }>();
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState<Date | null>(initialStartDate);
  const [endTime, setEndTime] = useState<Date | null>(initialEndDate);
  const [useCustomValue, setUseCustomValue] = useState(false);
  const [fieldDefaultValue, setFieldDefaultValue] = useState<number>(0);

  useEffect(() => {
    if (mode === "edit" && id) {
      api
        .get(`/slots/${id}`)
        .then((response) => {
          const slot = response.data;
          setStartTime(new Date(slot.startTime));
          setEndTime(new Date(slot.endTime));
          setValue(slot.value || slot.field?.pricePerHour);
          setFieldDefaultValue(slot.field?.pricePerHour);
          setIsAvailable(slot.isAvailable);
          if (slot.value) {
            setUseCustomValue(true);
          }
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
        .catch((error) => {
          console.error("Error creating slot:", error);
          alert("Error: " + error);
        });
    } else {
      api
        .put(`/slots/${id}`, slotData)
        .then(() => navigate(`/slots`))
        .catch((error) => {
          console.error("Error updating slot:", error);
          alert("Error: " + error);
        });
    }
  };

  const handleStartTimeChange = (date: Date | null) => {
    setStartTime(date);

    if (!date) return;

    setEndTime(new Date(date.getTime() + 60 * 60 * 1000));
  };

  return (
    <div className="slot-form-shell animate-fade-in">
      <div className="slot-form-container">
        <div className="slot-form-header">
          <h1 className="slot-form-title">
            {mode === "create" ? "Crear Partido" : "Editar Partido"}
          </h1>
          <p className="slot-form-subtitle">
            Define el horario del partido y personaliza el precio si quieres un
            valor distinto al de la cancha.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="slot-form">
          <div className="slot-form-grid">
            <div className="slot-form-field">
              <label className="slot-form-label">Fecha de inicio</label>
              <DatePicker
                selected={startTime}
                onChange={handleStartTimeChange}
                showTimeSelect
                timeIntervals={30}
                dateFormat="Pp"
                className="slot-form-input"
              />
            </div>
            <div className="slot-form-field">
              <label className="slot-form-label">Fecha de fin</label>
              <DatePicker
                selected={endTime}
                onChange={(date: Date | null) => setEndTime(date)}
                showTimeSelect
                timeIntervals={30}
                dateFormat="Pp"
                className="slot-form-input"
              />
            </div>
          </div>

          <div className="slot-form-pricing">
            <label className="slot-form-label">
              ¿Quieres personalizar el precio de este horario?
            </label>
            <div className="slot-form-options">
              <label className="slot-form-option">
                <input
                  type="radio"
                  name="valueOption"
                  value="default"
                  checked={!useCustomValue}
                  onChange={() => {
                    setUseCustomValue(false);
                    setValue(fieldDefaultValue);
                  }}
                />
                <span>Usar valor del campo (€{fieldDefaultValue || ""})</span>
              </label>
              <label className="slot-form-option">
                <input
                  type="radio"
                  name="valueOption"
                  value="custom"
                  checked={useCustomValue}
                  onChange={() => {
                    setUseCustomValue(true);
                    setValue(0);
                  }}
                />
                <span>Personalizar precio</span>
              </label>
            </div>
          </div>

          {useCustomValue && (
            <div className="slot-form-field">
              <label className="slot-form-label">Valor personalizado (€)</label>
              <input
                type="number"
                min={1}
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value))}
                className="slot-form-input"
                required
              />
              {value <= 0 && (
                <p className="slot-form-error">El valor debe ser mayor a 0.</p>
              )}
            </div>
          )}

          <div className="slot-form-actions">
            <button
              className="slot-form-button slot-form-button--secondary"
              onClick={(e) => {
                e.preventDefault();
                navigate("/slots");
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="slot-form-button slot-form-button--primary"
            >
              {mode === "create" ? "Crear nuevo partido" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SlotForm;
