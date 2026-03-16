import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./TournamentsLayout.css";

const TournamentsLayout: React.FC = () => {
  return (
    <div className="tournaments-layout">
      <aside className="tournaments-sidebar">
        <div className="tournaments-sidebar__header">
          <h1>Torneos</h1>
          <p>Modulo preparado para futura extraccion como MFE.</p>
        </div>

        <nav className="tournaments-sidebar__nav">
          <NavLink
            to="/tournaments/subpages/dashboard"
            className={({ isActive }) =>
              `tournaments-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/tournaments/subpages/tournaments"
            className={({ isActive }) =>
              `tournaments-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            Torneos
          </NavLink>
          <NavLink
            to="/tournaments/subpages/teams"
            className={({ isActive }) =>
              `tournaments-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            Equipos
          </NavLink>
          <NavLink
            to="/tournaments/subpages/players"
            className={({ isActive }) =>
              `tournaments-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            Jugadores
          </NavLink>
          <NavLink
            to="/tournaments/subpages/matches"
            className={({ isActive }) =>
              `tournaments-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            Partidos
          </NavLink>
          <NavLink
            to="/tournaments/subpages/match-stats"
            className={({ isActive }) =>
              `tournaments-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            Estadísticas
          </NavLink>
        </nav>
      </aside>

      <main className="tournaments-content">
        <div className="tournaments-content__body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TournamentsLayout;
