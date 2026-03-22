import React from "react";
import { ASSISTANT_NAME } from "../constants/assistantBrand";
import { JarvisAvatar } from "./JarvisAvatar";
import type { JarvisFlightState } from "../hooks/useJarvisArrival";
import "./JarvisActionScenes.css";

interface JarvisGreetingCalloutProps {
  body: string;
  dockRef?: React.Ref<HTMLDivElement>;
  isVisible: boolean;
  note?: string;
  title?: string;
}

export const JarvisGreetingCallout: React.FC<JarvisGreetingCalloutProps> = ({
  body,
  dockRef,
  isVisible,
  note,
  title = ASSISTANT_NAME,
}) => (
  <>
    <div className={`jarvis-greeting-callout ${isVisible ? "is-visible" : ""}`.trim()}>
      <div ref={dockRef} className="jarvis-greeting-callout__dock" aria-hidden="true">
        {isVisible ? <JarvisAvatar className="jarvis-greeting-callout__avatar" /> : null}
      </div>
      <div>
        <span>{title}</span>
        <p>{body}</p>
      </div>
    </div>
    {note ? <p className="jarvis-greeting-callout__note">{note}</p> : null}
  </>
);

interface JarvisFlightOverlayProps {
  bubbleText?: string;
  durationMs: number;
  flightState: JarvisFlightState;
}

export const JarvisFlightOverlay: React.FC<JarvisFlightOverlayProps> = ({
  bubbleText = "Hola, voy para alla",
  durationMs,
  flightState,
}) => {
  if (flightState.phase === "idle" || flightState.phase === "arrived") return null;

  return (
    <div
      className={`jarvis-flight-overlay jarvis-flight-overlay--${flightState.phase}`}
      style={
        {
          "--jarvis-start-x": `${flightState.startX}px`,
          "--jarvis-start-y": `${flightState.startY}px`,
          "--jarvis-delta-x": `${flightState.deltaX}px`,
          "--jarvis-delta-y": `${flightState.deltaY}px`,
          "--jarvis-flight-duration": `${durationMs}ms`,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <div className="jarvis-flight-overlay__bubble">{bubbleText}</div>
      <JarvisAvatar className="jarvis-flight-overlay__avatar" />
    </div>
  );
};

interface JarvisTypingIndicatorProps {
  label?: string;
}

export const JarvisTypingIndicator: React.FC<JarvisTypingIndicatorProps> = ({
  label = `${ASSISTANT_NAME} esta escribiendo...`,
}) => (
  <div className="jarvis-typing-indicator" aria-live="polite">
    <JarvisAvatar className="jarvis-typing-indicator__avatar" />
    <div className="jarvis-typing-indicator__bubble">
      <span>{label}</span>
      <div className="jarvis-typing-indicator__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </div>
  </div>
);

interface JarvisCapabilityReminderProps {
  body: string;
  title?: string;
}

export const JarvisCapabilityReminder: React.FC<JarvisCapabilityReminderProps> = ({
  body,
  title = `${ASSISTANT_NAME} sigue contigo`,
}) => (
  <div className="jarvis-capability-reminder">
    <JarvisAvatar className="jarvis-capability-reminder__avatar" />
    <div>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  </div>
);

interface JarvisMessageCardProps {
  body: React.ReactNode;
  title?: string;
}

export const JarvisMessageCard: React.FC<JarvisMessageCardProps> = ({
  body,
  title = ASSISTANT_NAME,
}) => (
  <div className="jarvis-message-card">
    <JarvisAvatar className="jarvis-message-card__avatar" />
    <div>
      <span>{title}</span>
      <div className="jarvis-message-card__body">{body}</div>
    </div>
  </div>
);
