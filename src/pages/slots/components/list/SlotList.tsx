import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Modal, Form } from "react-bootstrap";
import "./styles.css";
import { api } from "../../../../utils/api";
import { Slot } from "../../../../interfaces/SlotInterfaces";
import { Field } from "../../../../interfaces/FieldInterfaces";

const SlotList: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFields, setFilteredFields] = useState<Field[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch fields from the API
    api
      .get("/fields")
      .then((response) => {
        setFields(response.data);
        setFilteredFields(response.data);
      })
      .catch((error) => console.error("Error fetching fields:", error));
  }, []);

  const handleDelete = (id: string) => {
    // Delete the slot by ID
    api
      .delete(`/slots/${id}`)
      .then(() => setSlots(slots.filter((slot) => slot._id !== id)))
      .catch((error) => console.error("Error deleting slot:", error));
  };

  const handleSelectField = (field: Field) => {
    setSelectedField(field);
    setShowModal(false);
    // Fetch slots for the selected field
    api
      .get(`/fields/${field._id}/slots`)
      .then((response) => setSlots(response.data))
      .catch((error) => console.error("Error fetching slots:", error));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredFields(
      fields.filter((field) => field.name.toLowerCase().includes(term))
    );
  };

  return (
    <div>
      <h1>Slots</h1>
      <Button
        variant="primary"
        onClick={() => setShowModal(true)}
        className="mb-3"
      >
        Select Field
      </Button>
      {selectedField && (
        <Button
          variant="success"
          onClick={() => navigate(`/slots/new/${selectedField._id}`)} // Pass fieldId as a URL parameter
          className="mb-3"
        >
          Create New Slot
        </Button>
      )}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Field ID</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Value</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot._id}>
              <td>{slot.field?._id}</td>
              <td>{new Date(slot.startTime).toLocaleString()}</td>
              <td>{new Date(slot.endTime).toLocaleString()}</td>
              <td>${slot.value.toFixed(2)}</td>
              <td>{slot.isAvailable ? "Yes" : "No"}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => navigate(`/slots/edit/${slot._id}`)}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(slot._id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Search fields..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="mb-3"
          />
          <ul className="list-group">
            {filteredFields.map((field) => (
              <li
                key={field._id}
                className="list-group-item d-flex justify-content-between align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => handleSelectField(field)}
              >
                {field.name}
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SlotList;
