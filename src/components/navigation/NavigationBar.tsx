import React, { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/VICTORY CRAFT.png"; // ✅ Asegura que el logo se importa correctamente
import useAppViewport from "../../hooks/useAppViewport";
import { getVisibleNavItems, normalizeNavigationRole } from "./navigationConfig";
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
  const { isAuthenticated, logout, setViewRole, viewRole, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useAppViewport({ mobileBreakpoint: 880 });

  const normalizedRole = normalizeNavigationRole(isAuthenticated, role);

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
    const resolvedPath =
      isMobile && path === "/scouting/subpages/dashboard"
        ? "/scouting/subpages/rankings/interactive"
        : path;

    navigate(resolvedPath);
    setIsOpen(false);
  };

  const visibleNavItems = getVisibleNavItems(normalizedRole);

  const renderMenuContent = (mobile = false) => (
    <>
      {visibleNavItems.map((item) => (
        <button
          key={item.path}
          type="button"
          className={getNavLinkClassName(item.activePath || item.path)}
          onClick={() => handleNavigate(item.path)}
        >
          {item.label}
        </button>
      ))}

      {isAuthenticated ? (
        <>
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
      ) : null}
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-brand-group">
        <img
          src={Logo}
          alt="Victory Craft Logo"
          className="logo cursor-pointer"
          width={260}
          height={56}
          loading="eager"
          fetchPriority="high"
          decoding="async"
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
