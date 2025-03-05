import React, { useState, useEffect } from "react";
import { Field, getFields } from "../../../services/field/fieldService";

interface FieldSelectorProps {
  onFieldSelect: (fieldId: string) => void;
}

const FieldSelector: React.FC<FieldSelectorProps> = ({ onFieldSelect }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await getFields();
        setFields(data);
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
    };

    fetchFields();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFieldSelect = (field: Field) => {
    onFieldSelect(field._id);
    setShowModal(false);
  };

  return (
    <>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
        onClick={() => setShowModal(true)}
      >
        Select Field
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-semibold">Select Field</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                &times;
              </button>
            </div>

            <input
              type="text"
              placeholder="Search field..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-2 border rounded mt-3"
            />

            <ul className="mt-3 max-h-60 overflow-y-auto border rounded">
              {fields
                .filter((field) =>
                  field.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((field) => (
                  <li
                    key={field._id}
                    className="p-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleFieldSelect(field)}
                  >
                    {field.name}
                  </li>
                ))}
            </ul>

            <button
              className="mt-4 w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FieldSelector;
