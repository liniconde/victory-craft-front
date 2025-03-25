import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/VICTORY CRAFT.png"; // ✅ Asegura que el logo se importa correctamente
import "./styles.css";

const NavigationBar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <img
        src={Logo}
        alt="Victory Craft Logo"
        className="logo cursor-pointer"
        onClick={() => navigate("/")}
      />
      <div className="navbar-items">
        {/* ✅ LOGO CON PUNTERO */}

        {/* 🔹 Botón de menú en móviles */}
        <button
          className="navbar-toggler md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>

        {/* 🔹 Menú de navegación */}
        <div
          className={`navbar-menu ${
            isOpen ? "block" : "hidden"
          } md:flex md:space-x-6 w-full md:w-auto md:items-center text-center md:text-left`}
        >
          {/* 🔹 Pestañas accesibles para todos */}
          <span
            className="nav-link block md:inline-block"
            onClick={() => navigate("/fields")}
          >
            Campos
          </span>

          {/* 🔹 Pestañas solo para usuarios autenticados */}
          {isAuthenticated && (
            <>
              <span
                className="nav-link block md:inline-block"
                onClick={() => navigate("/reservations")}
              >
                Reservas
              </span>
              <span
                className="nav-link block md:inline-block"
                onClick={() => navigate("/slots")}
              >
                Disponibilidad
              </span>

              <span
                className="nav-link block md:inline-block"
                onClick={() => navigate("/fields/videos")}
              >
                Vídeos
              </span>

              {/* 🔥 BOTÓN LOGOUT - AHORA ES NEGRO CON TEXTO BLANCO */}
              <button
                className="px-4 py-2 text-white bg-black rounded-md hover:bg-gray-900 transition md:pr-4"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <span
              className="nav-link block md:inline-block"
              onClick={() => navigate("/users")}
            >
              Usuarios
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
