import React from "react";
import { JarvisMessageCard, JarvisMessageSequence } from "../../../agent-mfe";
import JourneyFlowCard from "../components/JourneyFlowCard";
import JourneyPageHeader from "../components/JourneyPageHeader";

interface ScoutingMenuIntroPageProps {
  active: boolean;
}

const ScoutingMenuIntroPage: React.FC<ScoutingMenuIntroPageProps> = ({ active }) => (
  <div className="recruiters-onboarding__journey">
    <JourneyPageHeader title="Este es tu menu de scouting" />
    <JarvisMessageSequence
      active={active}
      items={[
        {
          id: "journey-step-scouting-menu",
          render: () => (
            <JarvisMessageCard
              body={
                <p>
                  Yo te recomiendo tomar este menu como tu base. Desde aqui entras al dashboard y
                  te mueves por todo el flujo sin perderte.
                </p>
              }
            />
          ),
        },
        {
          id: "journey-flow-scouting-menu",
          render: () => <JourneyFlowCard />,
        },
      ]}
    />
  </div>
);

export default ScoutingMenuIntroPage;
