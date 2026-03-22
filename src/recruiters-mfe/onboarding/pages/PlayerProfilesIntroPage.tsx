import React from "react";
import { JarvisMessageCard, JarvisMessageSequence } from "../../../agent-mfe";
import JourneyFlowCard from "../components/JourneyFlowCard";
import JourneyPageHeader from "../components/JourneyPageHeader";

interface PlayerProfilesIntroPageProps {
  active: boolean;
}

const PlayerProfilesIntroPage: React.FC<PlayerProfilesIntroPageProps> = ({ active }) => (
  <div className="recruiters-onboarding__journey">
    <JourneyPageHeader title="Player Profiles" />
    <JarvisMessageSequence
      active={active}
      items={[
        {
          id: "journey-step-player-profiles",
          render: () => (
            <JarvisMessageCard
              body={
                <p>
                  Este es el primer paso real que quiero para ti. Crea o completa tu perfil para
                  que cada video tenga contexto de jugador, posicion, categoria y ciudad.
                </p>
              }
            />
          ),
        },
        {
          id: "journey-flow-player-profiles",
          render: () => <JourneyFlowCard />,
        },
      ]}
    />
  </div>
);

export default PlayerProfilesIntroPage;
