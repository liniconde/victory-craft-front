import React from "react";

interface JourneyPageHeaderProps {
  title: string;
}

const JourneyPageHeader: React.FC<JourneyPageHeaderProps> = ({ title }) => (
  <header className="recruiters-onboarding__journey-header">
    <div className="recruiters-onboarding__journey-kicker">
      <span className="recruiters-onboarding__journey-kicker-dot" aria-hidden="true" />
      <span>Jarvis te guia</span>
    </div>
    <h2>{title}</h2>
  </header>
);

export default JourneyPageHeader;
