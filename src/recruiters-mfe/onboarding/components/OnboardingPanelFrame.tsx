import React from "react";

interface OnboardingPanelFrameProps {
  stepNumber: number;
  totalSteps: number;
  onSkip: () => void;
  children: React.ReactNode;
  actions: React.ReactNode;
}

const OnboardingPanelFrame: React.FC<OnboardingPanelFrameProps> = ({
  stepNumber,
  totalSteps,
  onSkip,
  children,
  actions,
}) => (
  <section className="recruiters-onboarding__panel">
    <div className="recruiters-onboarding__panel-topbar">
      <span>
        Intro {stepNumber}/{totalSteps}
      </span>
      <button type="button" onClick={onSkip}>
        Omitir
      </button>
    </div>

    {children}
    {actions}
  </section>
);

export default OnboardingPanelFrame;
