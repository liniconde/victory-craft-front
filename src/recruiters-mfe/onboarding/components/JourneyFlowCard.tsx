import React from "react";
import { JarvisMessageCard } from "../../../agent-mfe";

const JourneyFlowCard: React.FC = () => (
  <div className="recruiters-onboarding__journey-card">
    <JarvisMessageCard
      body={
        <>
          <strong>Este es el flujo que te recomiendo</strong>
          <p>
            1. Primero, crea tu perfil.
            <br />
            2. Despues, sube tus videos.
            <br />
            3. Luego revisa tu material en library.
            <br />
            4. Finalmente, compite y descubre los mejores videos en el ranking mundial.
          </p>
        </>
      }
    />
  </div>
);

export default JourneyFlowCard;
