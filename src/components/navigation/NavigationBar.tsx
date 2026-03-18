import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/VICTORY CRAFT.png"; // ✅ Asegura que el logo se importa correctamente
import "./styles.css";

const ViewModeSwitcher: React.FC<{
  viewRole: string | null;
  setViewRole: (role: "user" | "admin" | null) => void;
  className?: string;
}> = ({ viewRole, setViewRole, className = "" }) => (
  <div className={`view-mode-switcher ${className}`.trim()}>
    <div className="view-mode-switcher__controls">
      <button
        type="button"
        className={`view-mode-switcher__button ${
          (viewRole ?? "user") === "user"
            ? "view-mode-switcher__button--active"
            : ""
        }`}
        onClick={() => setViewRole("user")}
      >
        Usuario
      </button>
      <button
        type="button"
        className={`view-mode-switcher__button ${
          viewRole === "admin" ? "view-mode-switcher__button--active" : ""
        }`}
        onClick={() => setViewRole("admin")}
      >
        Admin
      </button>
    </div>
  </div>
);

const NavigationBar: React.FC = () => {
  const { isAuthenticated, logout, setViewRole, viewRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand-group">
        <img
          src={Logo}
          alt="Victory Craft Logo"
          className="logo cursor-pointer"
          onClick={() => navigate("/")}
        />
        {isAuthenticated && (
          <ViewModeSwitcher
            viewRole={viewRole}
            setViewRole={setViewRole}
            className="view-mode-switcher--desktop"
          />
        )}
      </div>
      <div className="navbar-items">
        {/* ✅ LOGO CON PUNTERO */}

        {/* 🔹 Botón de menú en móviles */}
        <button
          className="navbar-toggler md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? "×" : "☰"}
        </button>

        {/* 🔹 Menú de navegación */}
        <div
          className={`navbar-menu ${
            isOpen ? "navbar-menu--open" : "navbar-menu--closed"
          } md:flex md:space-x-6 w-full md:w-auto md:items-center text-center md:text-left`}
        >
          {/* 🔹 Pestañas accesibles para todos */}
          <button
            type="button"
            className={getNavLinkClassName("/fields")}
            onClick={() => handleNavigate("/fields")}
          >
            Campos
          </button>

          {/* 🔹 Pestañas solo para usuarios autenticados */}
          {isAuthenticated && (
            <>
              <button
                type="button"
                className={getNavLinkClassName("/reservations")}
                onClick={() => handleNavigate("/reservations")}
              >
                Reservas
              </button>
              <button
                type="button"
                className={getNavLinkClassName("/slots")}
                onClick={() => handleNavigate("/slots")}
              >
                Partidos
              </button>
              <button
                type="button"
                className={getNavLinkClassName("/tournaments")}
                onClick={() => handleNavigate("/tournaments")}
              >
                Torneos
              </button>

              <button
                type="button"
                className={getNavLinkClassName("/videos")}
                onClick={() => handleNavigate("/videos")}
              >
                Vídeos
              </button>
              <button
                type="button"
                className={getNavLinkClassName("/scouting")}
                onClick={() => handleNavigate("/scouting/subpages/dashboard")}
              >
                Scouting
              </button>

              {/* 🔥 BOTÓN LOGOUT - AHORA ES NEGRO CON TEXTO BLANCO */}
              <button
                className="px-4 py-2 text-white bg-black rounded-md hover:bg-gray-900 transition md:pr-4"
                onClick={() => {
                  logout();
                  handleNavigate("/");
                }}
              >
                Logout
              </button>

              <ViewModeSwitcher
                viewRole={viewRole}
                setViewRole={setViewRole}
                className="view-mode-switcher--mobile"
              />
            </>
          )}
          {!isAuthenticated && (
            <button
              type="button"
              className={getNavLinkClassName("/users")}
              onClick={() => handleNavigate("/users")}
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
