import React from "react";
import { JarvisMessageCard, JarvisMessageSequence } from "../../../agent-mfe";
import JourneyFlowCard from "../components/JourneyFlowCard";
import JourneyPageHeader from "../components/JourneyPageHeader";

interface LibraryIntroPageProps {
  active: boolean;
}

const LibraryIntroPage: React.FC<LibraryIntroPageProps> = ({ active }) => (
  <div className="recruiters-onboarding__journey">
    <JourneyPageHeader title="Library" />
    <JarvisMessageSequence
      active={active}
      items={[
        {
          id: "journey-step-library",
          render: () => (
            <JarvisMessageCard
              body={
                <p>
                  Cuando tu perfil este listo, aqui te ayudare a ordenar el siguiente paso: subir
                  videos, organizarlos y preparar el material que despues vas a competir o
                  compartir.
                </p>
              }
            />
          ),
        },
        {
          id: "journey-flow-library",
          render: () => <JourneyFlowCard />,
        },
      ]}
    />
  </div>
);

export default LibraryIntroPage;
