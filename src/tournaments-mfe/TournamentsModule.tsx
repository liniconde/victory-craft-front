import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TournamentsModuleProvider } from "./features/tournaments/TournamentsModuleContext";
import TournamentsLayout from "./subpages/layout/TournamentsLayout";
import TournamentsDashboardPage from "./subpages/dashboard/pages/TournamentsDashboardPage";
import "./index.css";

const TournamentsModule: React.FC = () => {
  return (
    <TournamentsModuleProvider>
      <Routes>
        <Route element={<TournamentsLayout />}>
          <Route path="subpages/dashboard" element={<TournamentsDashboardPage />} />
          <Route index element={<Navigate to="subpages/dashboard" replace />} />
          <Route path="*" element={<Navigate to="subpages/dashboard" replace />} />
        </Route>
      </Routes>
    </TournamentsModuleProvider>
  );
};

export default TournamentsModule;
