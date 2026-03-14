import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/VICTORY CRAFT.png"; // ✅ Asegura que el logo se importa correctamente
import "./styles.css";

const NavigationBar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    if (path === "/fields") {
      return location.pathname === "/fields";
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const getNavLinkClassName = (path: string) =>
    `nav-link block md:inline-flex ${isActiveRoute(path) ? "nav-link-active" : ""}`;

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
          <button
            type="button"
            className={getNavLinkClassName("/fields")}
            onClick={() => navigate("/fields")}
          >
            Campos
          </button>

          {/* 🔹 Pestañas solo para usuarios autenticados */}
          {isAuthenticated && (
            <>
              <button
                type="button"
                className={getNavLinkClassName("/reservations")}
                onClick={() => navigate("/reservations")}
              >
                Reservas
              </button>
              <button
                type="button"
                className={getNavLinkClassName("/slots")}
                onClick={() => navigate("/slots")}
              >
                Partidos
              </button>

              <button
                type="button"
                className={getNavLinkClassName("/fields/videos")}
                onClick={() => navigate("/fields/videos")}
              >
                Vídeos
              </button>

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
            <button
              type="button"
              className={getNavLinkClassName("/users")}
              onClick={() => navigate("/users")}
            >
              Usuarios
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
