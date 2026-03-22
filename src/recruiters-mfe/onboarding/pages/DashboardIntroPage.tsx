import React from "react";
import { JarvisMessageCard, JarvisMessageSequence } from "../../../agent-mfe";
import JourneyFlowCard from "../components/JourneyFlowCard";
import JourneyPageHeader from "../components/JourneyPageHeader";

interface DashboardIntroPageProps {
  active: boolean;
}

const DashboardIntroPage: React.FC<DashboardIntroPageProps> = ({ active }) => (
  <div className="recruiters-onboarding__journey">
    <JourneyPageHeader title="Dashboard" />
    <JarvisMessageSequence
      active={active}
      items={[
        {
          id: "journey-step-dashboard",
          render: () => (
            <JarvisMessageCard
              body={
                <p>
                  Aqui quiero que empieces. En este punto entiendes el ecosistema, ves accesos
                  rapidos y detectas que esta pasando en scouting.
                </p>
              }
            />
          ),
        },
        {
          id: "journey-flow-dashboard",
          render: () => <JourneyFlowCard />,
        },
      ]}
    />
  </div>
);

export default DashboardIntroPage;
