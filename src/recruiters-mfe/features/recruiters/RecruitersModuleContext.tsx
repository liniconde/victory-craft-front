import React, { createContext, useEffect, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAppFeedback } from "../../../hooks/useAppFeedback";
import { api } from "../../../utils/api";
import { recruitersApi } from "./api/client";

export interface RecruitersModuleContextValue {
  api: typeof recruitersApi;
  feedback: ReturnType<typeof useAppFeedback>;
}

export const RecruitersModuleContext = createContext<
  RecruitersModuleContextValue | undefined
>(undefined);

export const RecruitersModuleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const feedback = useAppFeedback();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      return;
    }

    delete api.defaults.headers.common.Authorization;
  }, [token]);

  const value = useMemo(() => ({ api: recruitersApi, feedback }), [feedback]);

  return (
    <RecruitersModuleContext.Provider value={value}>
      {children}
    </RecruitersModuleContext.Provider>
  );
};
