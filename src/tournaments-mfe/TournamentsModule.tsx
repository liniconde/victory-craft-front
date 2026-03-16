import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TournamentsModuleProvider } from "./features/tournaments/TournamentsModuleContext";
import { TournamentsDashboardDataProvider } from "./subpages/dashboard/context/TournamentsDashboardDataContext";
import TournamentsDashboardPage from "./subpages/dashboard/pages/TournamentsDashboardPage";
import TournamentsLayout from "./subpages/layout/TournamentsLayout";
import MatchStatsPage from "./subpages/match-stats/pages/MatchStatsPage";
import MatchesPage from "./subpages/matches/pages/MatchesPage";
import PlayersPage from "./subpages/players/pages/PlayersPage";
import TeamsPage from "./subpages/teams/pages/TeamsPage";
import TournamentsPage from "./subpages/tournaments/pages/TournamentsPage";
import "./index.css";

const TournamentsModule: React.FC = () => {
  return (
    <TournamentsModuleProvider>
      <TournamentsDashboardDataProvider>
        <Routes>
          <Route element={<TournamentsLayout />}>
            <Route path="subpages/dashboard" element={<TournamentsDashboardPage />} />
            <Route path="subpages/tournaments" element={<TournamentsPage />} />
            <Route path="subpages/teams" element={<TeamsPage />} />
            <Route path="subpages/players" element={<PlayersPage />} />
            <Route path="subpages/matches" element={<MatchesPage />} />
            <Route path="subpages/match-stats" element={<MatchStatsPage />} />
            <Route index element={<Navigate to="subpages/dashboard" replace />} />
            <Route path="*" element={<Navigate to="subpages/dashboard" replace />} />
          </Route>
        </Routes>
      </TournamentsDashboardDataProvider>
    </TournamentsModuleProvider>
  );
};

export default TournamentsModule;
