import React, { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
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

  useEffect(() => {
    const body = document.body;

    if (!isOpen) {
      body.classList.remove("navbar-menu-open");
      return;
    }

    const previousOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;

    body.classList.add("navbar-menu-open");
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    return () => {
      body.classList.remove("navbar-menu-open");
      body.style.overflow = previousOverflow;
      body.style.touchAction = previousTouchAction;
    };
  }, [isOpen]);

  const isActiveRoute = (path: string) => {
    if (path === "/fields") {
      return location.pathname === "/fields";
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const getNavLinkClassName = (path: string) =>
    `nav-link ${isActiveRoute(path) ? "nav-link-active" : ""}`;

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const renderMenuContent = (mobile = false) => (
    <>
      <button
        type="button"
        className={getNavLinkClassName("/fields")}
        onClick={() => handleNavigate("/fields")}
      >
        Campos
      </button>

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
            Videos
          </button>
          <button
            type="button"
            className={getNavLinkClassName("/scouting")}
            onClick={() => handleNavigate("/scouting/subpages/dashboard")}
          >
            Scouting
          </button>

          <button
            className="nav-link navbar-logout-button"
            onClick={() => {
              logout();
              handleNavigate("/");
            }}
          >
            Logout
          </button>

          {mobile ? (
            <ViewModeSwitcher
              viewRole={viewRole}
              setViewRole={setViewRole}
              className="view-mode-switcher--mobile"
            />
          ) : null}
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
    </>
  );

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
          className="navbar-toggler"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isOpen}
        >
          <FaBars aria-hidden="true" />
        </button>

        <div className="navbar-menu navbar-menu--desktop">{renderMenuContent()}</div>
      </div>

      {isOpen ? (
        <div className="navbar-mobile-menu" aria-hidden={!isOpen}>
          <button
            type="button"
            className="navbar-mobile-menu__backdrop"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
          />
          <aside className="navbar-mobile-panel">
            <div className="navbar-mobile-panel__header">
              <div>
                <h2>Victory Craft</h2>
                <p>Muévete rápido entre campos, reservas, partidos y modulos.</p>
              </div>
              <button
                type="button"
                className="navbar-mobile-menu__close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú de navegación"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>
            <nav className="navbar-mobile-panel__nav">{renderMenuContent(true)}</nav>
          </aside>
        </div>
      ) : null}
    </nav>
  );
};

export default NavigationBar;
