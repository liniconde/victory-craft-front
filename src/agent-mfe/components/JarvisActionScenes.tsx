import React from "react";
import { ASSISTANT_NAME } from "../constants/assistantBrand";
import { JarvisAvatar } from "./JarvisAvatar";
import type { JarvisFlightState } from "../hooks/useJarvisArrival";
import "./JarvisActionScenes.css";

interface JarvisGreetingCalloutProps {
  body: string;
  dockRef?: React.RefObject<HTMLDivElement | null>;
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
