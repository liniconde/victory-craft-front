import { useContext } from "react";
import { TournamentsModuleContext } from "../features/tournaments/TournamentsModuleContext";

export const useTournamentsModule = () => {
  const context = useContext(TournamentsModuleContext);
  if (!context) {
    throw new Error(
      "useTournamentsModule must be used within a TournamentsModuleProvider"
    );
  }
  return context;
};
