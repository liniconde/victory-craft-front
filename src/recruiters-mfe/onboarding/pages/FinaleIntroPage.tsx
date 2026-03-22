import React from "react";
import { JarvisMessageCard, JarvisMessageSequence, JarvisSceneHost } from "../../../agent-mfe";
import type { JarvisReminderSceneDefinition } from "../../../agent-mfe";

interface FinaleIntroPageProps {
  displayName: string;
  sportLabel: string;
  capabilityReminderScene: JarvisReminderSceneDefinition;
  active: boolean;
}

const FinaleIntroPage: React.FC<FinaleIntroPageProps> = ({
  displayName,
  sportLabel,
  capabilityReminderScene,
  active,
}) => (
  <div className="recruiters-onboarding__finale">
    <p className="recruiters-onboarding__eyebrow">Jarvis te deja listo</p>
    <h2>{displayName}, este es tu momento</h2>
    <p>
      En {sportLabel.toLowerCase()} ya tienes un camino claro. Yo te recomiendo subir tus mejores
      jugadas, compartirlas con tus amigos, competir, votar y construir una presencia real en
      scouting.
    </p>
    <blockquote>
      Yo te lo voy a recordar siempre: nunca sabes quien puede estar viendo tu siguiente video...
      algun reclutador del mundo.
    </blockquote>
    <div className="recruiters-onboarding__finale-grid">
      <JarvisMessageSequence
        active={active}
        items={[
          {
            id: "finale-profile",
            render: () => (
              <JarvisMessageCard
                body={
                  <>
                    <strong>Quiero que empieces por tu perfil</strong>
                    <p>Tu historia deportiva debe estar completa antes de competir.</p>
                  </>
                }
              />
            ),
          },
          {
            id: "finale-videos",
            render: () => (
              <JarvisMessageCard
                body={
                  <>
                    <strong>Sube videos con intencion</strong>
                    <p>Elige goles, atajadas, puntos y jugadas que de verdad te definan.</p>
                  </>
                }
              />
            ),
          },
          {
            id: "finale-visibility",
            render: () => (
              <JarvisMessageCard
                body={
                  <>
                    <strong>Haz crecer tu visibilidad</strong>
                    <p>
                      Consulta tu library y mira el ranking mundial para compararte con contexto.
                    </p>
                  </>
                }
              />
            ),
          },
          {
            id: "finale-capability-reminder",
            render: (active) => <JarvisSceneHost scene={capabilityReminderScene} active={active} />,
          },
        ]}
      />
    </div>
  </div>
);

export default FinaleIntroPage;
