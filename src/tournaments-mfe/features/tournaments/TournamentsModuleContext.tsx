import React, { createContext, useMemo } from "react";
import { useAppFeedback } from "../../../hooks/useAppFeedback";
import { tournamentsApi } from "./api/client";

export interface TournamentsModuleContextValue {
  api: typeof tournamentsApi;
  feedback: ReturnType<typeof useAppFeedback>;
}

export const TournamentsModuleContext = createContext<
  TournamentsModuleContextValue | undefined
>(undefined);

export const TournamentsModuleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const feedback = useAppFeedback();

  const value = useMemo(
    () => ({ api: tournamentsApi, feedback }),
    [feedback]
  );

  return (
    <TournamentsModuleContext.Provider value={value}>
      {children}
    </TournamentsModuleContext.Provider>
  );
};
