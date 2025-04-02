import { useContext } from "react";

import { AppFeedbackContext } from "../context/AppFeedbackProvider";

export const useAppFeedback = () => {
  const context = useContext(AppFeedbackContext);
  if (!context) {
    throw new Error(
      "useAppFeedback must be used within an AppFeedbackProvider"
    );
  }
  return context;
};
