import { useContext } from "react";
import { RecruitersModuleContext } from "../features/recruiters/RecruitersModuleContext";

export const useRecruitersModule = () => {
  const context = useContext(RecruitersModuleContext);
  if (!context) {
    throw new Error("useRecruitersModule must be used within a RecruitersModuleProvider");
  }
  return context;
};
