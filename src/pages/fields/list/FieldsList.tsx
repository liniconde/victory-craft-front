import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import MapComponent from "../map/MapComponent";
import { Field } from "../../../interfaces/FieldInterfaces";
import { useAuth } from "../../../context/AuthContext";
import "./FieldList.css";
import {
  getFields,
  getFieldsbyUserId,
} from "../../../services/field/fieldService";
import { useAppFeedback } from "../../../hooks/useAppFeedback";

const FieldList: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const navigate = useNavigate();
  const { hideLoading, showError, showLoading } = useAppFeedback();
  const { role, isAdmin, userId } = useAuth();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const getFieldsAsync = async () => {
      try {
        showLoading();
        const fields =
          isAdmin && userId
            ? await getFieldsbyUserId(userId!)
            : await getFields();
        setFields(fields);
        setFilteredFields(fields);
      } catch (error) {
        console.error("Error fetching fields:", error);
        showError("Error fetching fields:");
      } finally {
        hideLoading();
      }
    };
    getFieldsAsync();
  }, []);

  useEffect(() => {
    if (filterType === "all") {
      setFilteredFields(fields);
    } else {
      setFilteredFields(fields.filter((field) => field.type === filterType));
    }
  }, [filterType, fields]);

  const handleDelete = (id: string) => {
    api
      .delete(`/fields/${id}`)
      .then(() => setFields(fields.filter((field) => field._id !== id)))
      .catch((error) => console.error("Error deleting field:", error));
  };

  const updateScrollState = () => {
    const container = carouselRef.current;
    if (!container) return;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    setCanScrollLeft(container.scrollLeft > 8);
    setCanScrollRight(container.scrollLeft < maxScrollLeft - 8);
  };

  useEffect(() => {
    updateScrollState();
  }, [filteredFields]);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    container.scrollLeft = 0;
    updateScrollState();
  }, [filterType]);

  const scrollCarousel = (direction: "left" | "right") => {
    const container = carouselRef.current;
    if (!container) return;

    const distance = Math.max(container.clientWidth * 0.75, 280);
    container.scrollBy({
      left: direction === "right" ? distance : -distance,
      behavior: "smooth",
    });
  };

  return (
    <div className="fields-page-shell mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Campos Disponibles
      </h1>

      {role === "admin" && (
        <button
          className="mb-6 px-5 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
          onClick={() => navigate("/fields/new")}
        >
          Agregar nueva campo
        </button>
      )}

      <div className="mb-6 flex justify-center">
        <select
          className="px-4 py-2 border rounded-lg shadow-sm text-gray-700"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Todas las campos</option>
          <option value="football">Futbol</option>
          <option value="padel">Padel</option>
          <option value="tennis">Tennis</option>
        </select>
      </div>

      <div className="fields-carousel-shell">
        <button
          type="button"
          className="fields-carousel-arrow fields-carousel-arrow--left"
          onClick={() => scrollCarousel("left")}
          disabled={!canScrollLeft}
          aria-label="Ver campos anteriores"
        >
          ←
        </button>

        <div
          ref={carouselRef}
          className="fields-carousel"
          onScroll={updateScrollState}
        >
          <div className="fields-carousel-track">
            {filteredFields.map((field) => (
              <div
                key={field._id}
                className="field-card-item bg-white rounded-lg shadow-lg h-full flex flex-col justify-between transform transition-transform hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                onClick={() => {
                  setSelectedField(field);
                  setTimeout(() => {
                    mapRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                <img
                  src={field.imageUrl || "https://via.placeholder.com/300"}
                  alt={field.name}
                  className="w-full h-56 object-cover"
                />
                <div className="field-card">
                  <h2 className="field-card-title">{field.name}</h2>
                  <p className="text-gray-600 text-sm">
                    {field.type.toUpperCase()}
                  </p>
                  <p className="text-gray-500 text-sm">{field.location?.name}</p>
                  <p className="field-card-price field-card-sub">
                    ${field.pricePerHour} / hora
                  </p>

                  <div className="flex justify-between gap-4 mt-4">
                    {role === "user" ? (
                      <>
                        <button
                          className="px-2 py-2 text-sm bg-[#50BB73] text-white rounded-md hover:bg-green-800 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/fields/${field._id}/reservations/`);
                          }}
                        >
                          Ver mis reservas
                        </button>
                        <button
                          className="px-2 py-2 text-sm bg-[#50BB73] text-white rounded-md hover:bg-green-800 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/reservations/new/${field._id}`);
                          }}
                        >
                          Reservar cancha
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="px-2 py-2 text-sm bg-[#50BB73] text-white rounded-md hover:bg-green-800 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/fields/edit/${field._id}`);
                          }}
                        >
                          Editar
                        </button>

                        <button
                          className="px-2 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(field._id);
                          }}
                        >
                          Borrar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="fields-carousel-arrow fields-carousel-arrow--right"
          onClick={() => scrollCarousel("right")}
          disabled={!canScrollRight}
          aria-label="Ver más campos"
        >
          →
        </button>
      </div>

      <div className="fields-map-shell mt-12" ref={mapRef}>
        <MapComponent fields={filteredFields} selectedField={selectedField} />
      </div>
    </div>
  );
};

export default FieldList;
