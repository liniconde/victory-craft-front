import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { NavLink, Outlet } from "react-router-dom";
import RecruitersOnboarding from "../../onboarding/RecruitersOnboarding";
import "./RecruitersLayout.css";

const RecruitersLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderLink = (to: string, label: string, onboardingId: string) => (
    <NavLink
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      data-onboarding={onboardingId}
      className={({ isActive }) =>
        `recruiters-sidebar__link ${isActive ? "is-active" : ""}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <div className="recruiters-layout recruiters-mfe-scope">
      <button
        type="button"
        className="recruiters-mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Abrir menú de scouting"
        data-onboarding="scouting-mobile-trigger"
      >
        <FaBars aria-hidden="true" />
        <span>Scouting</span>
      </button>

      {isMobileMenuOpen ? (
        <div className="recruiters-mobile-menu">
          <button
            type="button"
            className="recruiters-mobile-menu__backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          />
          <aside className="recruiters-sidebar recruiters-sidebar--mobile">
            <div
              className="recruiters-sidebar__header recruiters-sidebar__header--mobile"
              data-onboarding="scouting-sidebar-header"
            >
              <div>
                <h1>Scouting</h1>
                <p>Muévete rápido entre dashboard, library, perfiles y rankings.</p>
              </div>
              <button
                type="button"
                className="recruiters-mobile-menu__close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Cerrar menú de scouting"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>

            <nav className="recruiters-sidebar__nav">
              {renderLink("/scouting/subpages/dashboard", "Dashboard", "scouting-menu-dashboard")}
              {renderLink("/scouting/subpages/library", "Library", "scouting-menu-library")}
              {renderLink(
                "/scouting/subpages/player-profiles",
                "Player Profiles",
                "scouting-menu-player-profiles"
              )}
              {renderLink("/scouting/subpages/rankings", "Rankings", "scouting-menu-rankings")}
            </nav>
          </aside>
        </div>
      ) : null}

      <aside className="recruiters-sidebar recruiters-sidebar--desktop">
        <div className="recruiters-sidebar__header" data-onboarding="scouting-sidebar-header">
          <h1>Scouting</h1>
          <p>Dominio separado para recruiter view, profiles y rankings.</p>
        </div>

        <nav className="recruiters-sidebar__nav">
          {renderLink("/scouting/subpages/dashboard", "Dashboard", "scouting-menu-dashboard")}
          {renderLink("/scouting/subpages/library", "Library", "scouting-menu-library")}
          {renderLink(
            "/scouting/subpages/player-profiles",
            "Player Profiles",
            "scouting-menu-player-profiles"
          )}
          {renderLink("/scouting/subpages/rankings", "Rankings", "scouting-menu-rankings")}
        </nav>
      </aside>

      <main className="recruiters-content">
        <Outlet />
      </main>

      <RecruitersOnboarding />
    </div>
  );
};

export default RecruitersLayout;
