import React, { useRef } from "react";
import { useJarvisArrival } from "../hooks/useJarvisArrival";
import type { JarvisSceneDefinition } from "../scenes/jarvisSceneRegistry";
import {
  JarvisCapabilityReminder,
  JarvisFlightOverlay,
  JarvisGreetingCallout,
} from "./JarvisActionScenes";

interface JarvisSceneHostProps {
  scene: JarvisSceneDefinition;
  active?: boolean;
}

export const JarvisSceneHost: React.FC<JarvisSceneHostProps> = ({ active = true, scene }) => {
  const dockRef = useRef<HTMLDivElement | null>(null);
  const shouldAnimateArrival =
    active && scene.type === "greeting" && scene.enableArrival !== false;
  const { durationMs, flightState, hasArrived } = useJarvisArrival({
    enabled: shouldAnimateArrival,
    targetElement: dockRef.current,
  });

  if (scene.type === "reminder") {
    return <JarvisCapabilityReminder title={scene.title} body={scene.body} />;
  }

  const isVisible = active && (scene.enableArrival === false || hasArrived);

  return (
    <>
      <JarvisGreetingCallout
        body={scene.body}
        dockRef={dockRef}
        isVisible={isVisible}
        note={scene.note}
        title={scene.title}
      />
      {scene.enableArrival !== false ? (
        <JarvisFlightOverlay
          bubbleText={scene.bubbleText}
          durationMs={durationMs}
          flightState={flightState}
        />
      ) : null}
    </>
  );
};
