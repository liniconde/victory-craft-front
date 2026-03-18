import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./RecruitersLayout.css";

const RecruitersLayout: React.FC = () => {
  return (
    <div className="recruiters-layout">
      <aside className="recruiters-sidebar">
        <div className="recruiters-sidebar__header">
          <h1>Scouting</h1>
          <p>Dominio separado para recruiter view, profiles y rankings.</p>
        </div>

        <nav className="recruiters-sidebar__nav">
          <NavLink
            to="/scouting/subpages/dashboard"
            className={({ isActive }) =>
              `recruiters-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/scouting/subpages/library"
            className={({ isActive }) =>
              `recruiters-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            Library
          </NavLink>
          <NavLink
            to="/scouting/subpages/player-profiles"
            className={({ isActive }) =>
              `recruiters-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            Player Profiles
          </NavLink>
          <NavLink
            to="/scouting/subpages/rankings"
            className={({ isActive }) =>
              `recruiters-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            Rankings
          </NavLink>
        </nav>
      </aside>

      <main className="recruiters-content">
        <Outlet />
      </main>
    </div>
  );
};

export default RecruitersLayout;
