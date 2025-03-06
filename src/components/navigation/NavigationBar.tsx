import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/VICTORY CRAFT.png"; // ✅ Asegura que el logo se importa correctamente
import "./styles.css";
import { Button } from "react-bootstrap";

const NavigationBar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* ✅ LOGO ÚNICO Y CORREGIDO */}
        <img
          src={Logo}
          alt="Victory Craft Logo"
          className="logo"
          onClick={() => navigate("/")}
        />

        {/* Botón de menú en móviles */}
        <button className="navbar-toggler" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        {/* Menú de navegación */}
        <div className={`navbar-menu ${isOpen ? "block" : "hidden"} md:flex`}>
          <span className="nav-link" onClick={() => navigate("/fields")}>
            Fields
          </span>
          <span className="nav-link" onClick={() => navigate("/reservations")}>
            Reservations
          </span>
          <span className="nav-link" onClick={() => navigate("/slots")}>
            Slots
          </span>
          <span className="nav-link" onClick={() => navigate("/map")}>
            Fields Map
          </span>
          {isAuthenticated && (
            <span
              className="nav-link"
              onClick={() => navigate("/my-reservations")}
            >
              My Reservations
            </span>
          )}
          <span className="nav-link" onClick={() => navigate("/users")}>
            Users
          </span>
          {isAuthenticated && (
            <Button
              className="logo"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
