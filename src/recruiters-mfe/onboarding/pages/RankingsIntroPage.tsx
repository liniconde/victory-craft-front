import React from "react";
import { JarvisMessageCard, JarvisMessageSequence } from "../../../agent-mfe";
import JourneyFlowCard from "../components/JourneyFlowCard";
import JourneyPageHeader from "../components/JourneyPageHeader";

interface RankingsIntroPageProps {
  active: boolean;
}

const RankingsIntroPage: React.FC<RankingsIntroPageProps> = ({ active }) => (
  <div className="recruiters-onboarding__journey">
    <JourneyPageHeader title="Rankings" />
    <JarvisMessageSequence
      active={active}
      items={[
        {
          id: "journey-step-rankings",
          render: () => (
            <JarvisMessageCard
              body={
                <p>
                  En rankings quiero que midas tu contexto. Aqui ves los mejores videos del mundo,
                  comparas tu nivel, votas y entiendes como se mueve la competencia global.
                </p>
              }
            />
          ),
        },
        {
          id: "journey-flow-rankings",
          render: () => <JourneyFlowCard />,
        },
      ]}
    />
  </div>
);

export default RankingsIntroPage;
