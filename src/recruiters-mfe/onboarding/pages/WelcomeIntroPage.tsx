import React from "react";
import type { CSSProperties, RefCallback } from "react";
import {
  JarvisGreetingCallout,
  JarvisMessageCard,
  JarvisTypingIndicator,
} from "../../../agent-mfe";
import type { OnboardingSportId, OnboardingSportOption } from "../scoutingOnboardingContent";

interface WelcomeIntroPageProps {
  displayName: string;
  selectedSport: OnboardingSportId | null;
  selectedSportContent: OnboardingSportOption | null;
  sportOptions: OnboardingSportOption[];
  onSportSelection: (sportId: OnboardingSportId) => void;
  welcomeSceneTitle?: string;
  welcomeSceneBody: string;
  primaryMessageVisible: boolean;
  secondaryMessageVisible: boolean;
  primaryTypingLabel?: string;
  secondaryTypingLabel?: string;
  primaryTypingVisible: boolean;
  secondaryTypingVisible: boolean;
  registerTarget: RefCallback<HTMLElement | null>;
}

const WelcomeIntroPage: React.FC<WelcomeIntroPageProps> = ({
  displayName,
  selectedSport,
  selectedSportContent,
  sportOptions,
  onSportSelection,
  welcomeSceneTitle,
  welcomeSceneBody,
  primaryMessageVisible,
  secondaryMessageVisible,
  primaryTypingLabel,
  secondaryTypingLabel,
  primaryTypingVisible,
  secondaryTypingVisible,
  registerTarget,
}) => (
  <div className="recruiters-onboarding__intro">
    <div className="recruiters-onboarding__hero-shell">
      <div className="recruiters-onboarding__intro-copy">
        <p className="recruiters-onboarding__eyebrow">Scouting onboarding</p>
        <h2>Bienvenido {displayName}</h2>
        <p>
          Tus mejores jugadas pueden ponerte frente a jugadores, fans y oportunidades reales. Hoy
          voy a dejarte listo para moverte por scouting con claridad.
        </p>
        <JarvisGreetingCallout
          title={welcomeSceneTitle}
          body={welcomeSceneBody}
          isVisible={primaryMessageVisible}
          dockRef={registerTarget}
        />
        {primaryTypingVisible ? <JarvisTypingIndicator label={primaryTypingLabel} /> : null}
        {secondaryMessageVisible ? (
          <JarvisMessageCard
            body={
              <p>
                Elige tu deporte y te enseno el mejor punto de partida para que tu perfil, tus
                videos y tu visibilidad empiecen con fuerza.
              </p>
            }
          />
        ) : null}
        {secondaryTypingVisible ? <JarvisTypingIndicator label={secondaryTypingLabel} /> : null}
      </div>

      <div className="recruiters-onboarding__hero-visual">
        {selectedSportContent ? (
          <img
            src={selectedSportContent.imageUrl}
            alt={selectedSportContent.imageAlt}
            className="recruiters-onboarding__hero-image"
          />
        ) : (
          <div className="recruiters-onboarding__hero-empty">
            <strong>Elige tu deporte</strong>
          </div>
        )}
      </div>
    </div>

    <div className="recruiters-onboarding__sport-grid">
      {sportOptions.map((sport) => (
        <button
          key={sport.id}
          type="button"
          className={`recruiters-onboarding__sport-card ${
            selectedSport === sport.id ? "is-selected" : ""
          }`}
          style={{ "--sport-accent": sport.accent } as CSSProperties}
          onClick={() => onSportSelection(sport.id)}
        >
          <span className="recruiters-onboarding__sport-chip">{sport.label}</span>
        </button>
      ))}
    </div>

    {selectedSportContent ? (
      <div
        className="recruiters-onboarding__message"
        style={{ "--sport-accent": selectedSportContent.accent } as CSSProperties}
      >
        <span className="recruiters-onboarding__message-label">{selectedSportContent.label}</span>
        <strong>{selectedSportContent.hero}</strong>
        <p>
          {selectedSportContent.promise} {selectedSportContent.spotlight}
        </p>
      </div>
    ) : (
      <div className="recruiters-onboarding__message recruiters-onboarding__message--placeholder">
        <strong>Selecciona un deporte para personalizar la bienvenida.</strong>
        <p>Veras una imagen, una leyenda y un recorrido pensado para ese contexto.</p>
      </div>
    )}
  </div>
);

export default WelcomeIntroPage;
