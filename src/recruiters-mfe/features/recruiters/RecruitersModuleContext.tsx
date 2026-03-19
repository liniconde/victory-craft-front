import React, { createContext, useEffect, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAppFeedback } from "../../../hooks/useAppFeedback";
import { api } from "../../../utils/api";
import { recruitersApi } from "./api/client";
import {
  RecruitersLoadingProvider,
  useRecruitersLoading,
} from "./RecruitersLoadingContext";

export interface RecruitersModuleContextValue {
  api: typeof recruitersApi;
  feedback: ReturnType<typeof useAppFeedback>;
  loading: ReturnType<typeof useRecruitersLoading>;
}

export const RecruitersModuleContext = createContext<
  RecruitersModuleContextValue | undefined
>(undefined);

export const RecruitersModuleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <RecruitersLoadingProvider>
      <RecruitersModuleProviderContent>{children}</RecruitersModuleProviderContent>
    </RecruitersLoadingProvider>
  );
};

const RecruitersModuleProviderContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const feedback = useAppFeedback();
  const { token } = useAuth();
  const loading = useRecruitersLoading();

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      return;
    }

    delete api.defaults.headers.common.Authorization;
  }, [token]);

  const value = useMemo(() => ({ api: recruitersApi, feedback, loading }), [feedback, loading]);

  return (
    <RecruitersModuleContext.Provider value={value}>
      {children}
    </RecruitersModuleContext.Provider>
  );
};
