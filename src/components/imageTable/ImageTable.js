import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import Pagination from "../pagination/Pagination";
import { useNavigate } from "react-router-dom";
import { getImages, getImageUrl } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../hooks/useLoading";

const ImageTable = ({ data }) => {
  const navigate = useNavigate();
  const { isAuthenticated, token, userId } = useAuth();
  const { startLoading, stopLoading } = useLoading(); // Usar el hook useLoading

  const itemsPerPage = 8; // O cualquier otro número que represente cuántos ítems quieres por página
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    Math.ceil(data.length / itemsPerPage)
  );
  const [tableData, setTableData] = useState([]); // Estado inicial vacío para los datos de la tabla

  const navigateToAddImage = () => {
    navigate("/add-image");
  };

  useEffect(() => {
    const fetchImages = async () => {
      startLoading();
      try {
        //const userId = userId; // Supongamos que deseas cargar imágenes para el userId 1, ajusta según sea necesario
        const imagesData = await getImages(userId);
        // Para cada imagen, obtener la URL firmada
        const imagesWithSignedUrls = await Promise.all(
          imagesData?.result.map(async (item) => {
            const downloadUrl = await getImageUrl(
              item.image_name,
              tokens?.IdToken
            );
            console.log("resultt", downloadUrl);
            return { ...item, s3_url: downloadUrl };
          })
        );
        console.log("imagees", imagesWithSignedUrls);
        setTableData(imagesWithSignedUrls);
        setTotalPages(Math.ceil(imagesWithSignedUrls.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        stopLoading(); // Detener el indicador de carga
      }
    };

    fetchImages();
  }, []);

  // Determina el rango de datos para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

  // Función para cambiar la página
  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">Image Gallery</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/add-image")}
          >
            Add New Image
          </button>
          <table className="table">
            <thead className="thead-dark">
              <tr>
                <th scope="col">Image</th>
                <th scope="col">Image Name</th>
                <th scope="col">User ID</th>
                <th scope="col">S3 URL</th>
                <th scope="col">Metadata Processed</th>
                <th scope="col">Encrypted Metadata Processed</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <img
                      src={item.s3_url}
                      alt={"Image_s3_url"}
                      className="img-thumbnail"
                      style={{ width: "50px", height: "50px" }}
                    />
                  </td>
                  <td>{item.image_name}</td>
                  <td>{item.user_id}</td>
                  <td>
                    <a
                      href={item.s3_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Image
                    </a>
                  </td>
                  <td>{item.user_metadata ? "Processed" : "Not Processed"}</td>
                  <td>
                    {item.encrypted_metadata ? "Processed" : "Not Processed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            onPageChange={onPageChange}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageTable;
