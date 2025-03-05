import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Image } from "react-bootstrap";
import "./styles.css";
import { api } from "../../../utils/api";

interface Field {
  _id: string;
  name: string;
  type: string;
  location: string;
  pricePerHour: number;
  imageUrl: string;
}

const FieldList: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch fields from the API
    api
      .get("/fields")
      .then((response) => setFields(response.data))
      .catch((error) => console.error("Error fetching fields:", error));
  }, []);

  const handleDelete = (id: string) => {
    // Delete the field by ID
    api
      .delete(`/fields/${id}`)
      .then(() => setFields(fields.filter((field) => field._id !== id)))
      .catch((error) => console.error("Error deleting field:", error));
  };

  return (
    <div className="fields-container">
      <h1>Fields</h1>
      <Button variant="primary" onClick={() => navigate("/fields/new")}>
        Add New Field
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Price Per Hour</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field._id}>
              <td>
                {field.imageUrl ? (
                  <Image src={field.imageUrl} rounded width={100} height={75} />
                ) : (
                  <div>No Image</div>
                )}
              </td>
              <td>{field.name}</td>
              <td>{field.type}</td>
              <td>{field.location}</td>
              <td>${field.pricePerHour.toFixed(2)}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2"
                  onClick={() => navigate(`/fields/edit/${field._id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(field._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default FieldList;
