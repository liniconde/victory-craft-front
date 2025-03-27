import React, { useState, useEffect } from "react";
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

const FieldList: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  const navigate = useNavigate();
  const { role, isAdmin, userId } = useAuth();

  useEffect(() => {
    const getFieldsAsync = async () => {
      try {
        const fields =
          isAdmin && userId
            ? await getFieldsbyUserId(userId!)
            : await getFields();
        setFields(fields);
        setFilteredFields(fields);
      } catch (error) {
        console.error("Error fetching fields:", error);
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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setVisibleCount((prev) => prev + 6);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDelete = (id: string) => {
    api
      .delete(`/fields/${id}`)
      .then(() => setFields(fields.filter((field) => field._id !== id)))
      .catch((error) => console.error("Error deleting field:", error));
  };

  const getGridColumns = () => {
    if (windowWidth < 640) return "grid-cols-1";
    return filteredFields.length % 2 === 0 ? "grid-cols-4" : "grid-cols-3";
  };

  const visibleFields = filteredFields.slice(0, visibleCount);

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-8">
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

      <div className={`grid gap-6 ${getGridColumns()}`}>
        {visibleFields.map((field) => (
          <div
            key={field._id}
            className="bg-white rounded-lg shadow-lg h-full flex flex-col justify-between transform transition-transform hover:scale-105 hover:shadow-xl cursor-pointer"
            onClick={() => setSelectedField(field)}
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
                        navigate(`/reservations/${field._id}`);
                      }}
                    >
                      Reservar cancha
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="px-0 py-2 text-sm bg-[#50BB73] text-white rounded-md hover:bg-green-800 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/fields/edit/${field._id}`);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      className="px-0 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition"
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

      <div className="mt-12">
        <MapComponent fields={filteredFields} selectedField={selectedField} />
      </div>
    </div>
  );
};

export default FieldList;
