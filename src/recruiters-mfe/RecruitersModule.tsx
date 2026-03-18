import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RecruitersModuleProvider } from "./features/recruiters/RecruitersModuleContext";
import RecruitersLayout from "./subpages/layout/RecruitersLayout";
import RecruitersDashboardPage from "./subpages/dashboard/pages/RecruitersDashboardPage";
import RecruiterRankingsPage from "./subpages/rankings/pages/RecruiterRankingsPage";
import RecruitersLibraryPage from "./subpages/library/pages/RecruitersLibraryPage";
import RecruiterProfilePage from "./subpages/profile/pages/RecruiterProfilePage";
import RecruiterVideoPage from "./subpages/video/pages/RecruiterVideoPage";
import "./index.css";
import "./subpages/dashboard/pages/RecruitersDashboardPage.css";

const RecruitersModule: React.FC = () => {
  return (
    <RecruitersModuleProvider>
      <Routes>
        <Route element={<RecruitersLayout />}>
          <Route path="subpages/dashboard" element={<RecruitersDashboardPage />} />
          <Route path="subpages/library" element={<RecruitersLibraryPage />} />
          <Route path="subpages/rankings" element={<RecruiterRankingsPage />} />
          <Route path="subpages/profile/:videoId" element={<RecruiterProfilePage />} />
          <Route path="subpages/video/:videoId" element={<RecruiterVideoPage />} />
          <Route index element={<Navigate to="subpages/dashboard" replace />} />
          <Route path="*" element={<Navigate to="subpages/dashboard" replace />} />
        </Route>
      </Routes>
    </RecruitersModuleProvider>
  );
};

export default RecruitersModule;
