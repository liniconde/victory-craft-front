import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SportsLoader from "../components/loader/SportsLoader";
import { RecruitersModuleProvider } from "./features/recruiters/RecruitersModuleContext";
import RecruitersLayout from "./subpages/layout/RecruitersLayout";
import "./index.css";
import "./subpages/dashboard/pages/RecruitersDashboardPage.css";

const RecruitersDashboardPage = lazy(
  () => import("./subpages/dashboard/pages/RecruitersDashboardPage")
);
const RecruiterRankingsPage = lazy(
  () => import("./subpages/rankings/pages/RecruiterRankingsPage")
);
const RecruitersLibraryPage = lazy(() => import("./subpages/library/pages/RecruitersLibraryPage"));
const PlayerProfilesPage = lazy(
  () => import("./subpages/player-profiles/pages/PlayerProfilesPage")
);
const RecruiterProfilePage = lazy(() => import("./subpages/profile/pages/RecruiterProfilePage"));
const RecruiterVideoPage = lazy(() => import("./subpages/video/pages/RecruiterVideoPage"));

const RecruitersModule: React.FC = () => {
  return (
    <RecruitersModuleProvider>
      <Suspense
        fallback={
          <SportsLoader
            message="Los sticks están entrenando mientras armamos la siguiente pantalla."
          />
        }
      >
        <Routes>
          <Route element={<RecruitersLayout />}>
            <Route path="subpages/dashboard" element={<RecruitersDashboardPage />} />
            <Route path="subpages/library" element={<RecruitersLibraryPage />} />
            <Route path="subpages/player-profiles" element={<PlayerProfilesPage />} />
            <Route path="subpages/rankings" element={<RecruiterRankingsPage />} />
            <Route path="subpages/profile/:videoId" element={<RecruiterProfilePage />} />
            <Route path="subpages/video/:videoId" element={<RecruiterVideoPage />} />
            <Route index element={<Navigate to="subpages/dashboard" replace />} />
            <Route path="*" element={<Navigate to="subpages/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </RecruitersModuleProvider>
  );
};

export default RecruitersModule;
