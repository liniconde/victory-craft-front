import React from "react";

interface OnboardingActionBarProps {
  canGoBack: boolean;
  canContinue: boolean;
  continueLabel: string;
  onBack: () => void;
  onContinue: () => void;
}

const OnboardingActionBar: React.FC<OnboardingActionBarProps> = ({
  canGoBack,
  canContinue,
  continueLabel,
  onBack,
  onContinue,
}) => (
  <div className="recruiters-onboarding__actions">
    <button
      type="button"
      className="recruiters-onboarding__button recruiters-onboarding__button--ghost"
      onClick={onBack}
      disabled={!canGoBack}
    >
      Atras
    </button>
    <button
      type="button"
      className="recruiters-onboarding__button recruiters-onboarding__button--primary"
      onClick={onContinue}
      disabled={!canContinue}
    >
      {continueLabel}
    </button>
  </div>
);

export default OnboardingActionBar;
