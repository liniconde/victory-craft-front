import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../../utils/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles.css"; // 📌 Importamos el archivo CSS con Tailwind

interface SlotFormProps {
  mode: "create" | "edit";
}

const SlotForm: React.FC<SlotFormProps> = ({ mode }) => {
  const [value, setValue] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const { id, fieldId } = useParams<{ id: string; fieldId: string }>();
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());
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

  return (
    <div className="slot-form-container animate-fade-in">
      <h1 className="text-center text-2xl font-bold text-gray-800">
        {mode === "create" ? "Agregar Partido" : "Editar Partido"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="slot-form-label">Fecha de inicio</label>
          <DatePicker
            selected={startTime}
            onChange={(date: Date | null) => setStartTime(date)}
            showTimeSelect
            timeIntervals={30}
            dateFormat="Pp"
            className="slot-form-input"
          />
        </div>
        <div>
          <label className="slot-form-label">Fecha de Fin</label>
          <DatePicker
            selected={endTime}
            onChange={(date: Date | null) => setEndTime(date)}
            showTimeSelect
            timeIntervals={30}
            dateFormat="Pp"
            className="slot-form-input"
          />
        </div>
        <div>
          <label className="slot-form-label">
            ¿Quieres personalizar el precio de este horario?
          </label>
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center gap-2">
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
              Usar valor del campo (€{fieldDefaultValue || ""})
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="valueOption"
                value="custom"
                checked={useCustomValue}
                onChange={() => {
                  setUseCustomValue(true);
                  setValue(0); // o mantener valor actual
                }}
              />
              Personalizar
            </label>
          </div>
        </div>

        {useCustomValue && (
          <div>
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
              <p className="text-red-600 text-sm mt-1">
                El valor debe ser mayor a 0.
              </p>
            )}
          </div>
        )}
        <button type="submit" className="submit-button">
          {mode === "create" ? "Agregar nuevo partido" : "Actualizar Partido"}
        </button>
        <button
          className="cancel-button"
          onClick={(e) => {
            e.preventDefault();
            navigate("/slots");
          }}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default SlotForm;
