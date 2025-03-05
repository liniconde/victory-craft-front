import React from "react";

// 📌 Definimos la interfaz para las props del componente
interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  onPageChange,
  totalPages,
}) => {
  return (
    <div className="container mx-auto mt-6">
      <nav aria-label="Pagination Navigation">
        <ul className="flex justify-center space-x-2">
          {/* 📌 Botón "Previous" */}
          <li>
            <button
              className={`px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-700 transition ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {/* 📌 Renderizar números de página */}
          {[...Array(totalPages)].map((_, index) => (
            <li key={index}>
              <button
                className={`px-4 py-2 rounded-md transition ${
                  currentPage === index + 1
                    ? "bg-green-500 text-white font-bold"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => onPageChange(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}

          {/* 📌 Botón "Next" */}
          <li>
            <button
              className={`px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-700 transition ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>

      {/* 📌 Información de la página actual */}
      <div className="text-center mt-4 text-gray-700 font-semibold">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
