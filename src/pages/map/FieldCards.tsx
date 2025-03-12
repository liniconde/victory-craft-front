import React from "react";
import "./FieldCards.css";

interface Field {
  _id: string;
  name: string;
  pricePerHour: number;
  imageUrl: string;
  location: { latitude: number; longitude: number; venue: string };
}

interface FieldCardsProps {
  fields: Field[];
  onSelectField: (field: Field) => void;
}

const FieldCards: React.FC<FieldCardsProps> = ({ fields, onSelectField }) => {
  return (
    <div className="field-cards-container">
      {fields.map((field) => (
        <div
          key={field._id}
          className="field-card"
          onClick={() => onSelectField(field)}
        >
          <img src={field.imageUrl} alt={field.name} className="field-image" />
          <div className="field-info">
            <h3>{field.name}</h3>
            <p>${field.pricePerHour} / hour</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FieldCards;
