import React, { useEffect, useMemo, useState } from "react";
import { ASSISTANT_NAME } from "../constants/assistantBrand";
import { JarvisAvatar } from "./JarvisAvatar";
import "./JarvisActionScenes.css";

export interface JarvisMessageSequenceItem {
  id: string;
  render: (active: boolean) => React.ReactNode;
}

interface JarvisMessageSequenceProps {
  active?: boolean;
  items: JarvisMessageSequenceItem[];
  initialDelayMs?: number;
  typingDurationMs?: number;
  typingLabel?: string;
}

const DEFAULT_INITIAL_DELAY_MS = 350;
const DEFAULT_TYPING_DURATION_MS = 1200;

export const JarvisMessageSequence: React.FC<JarvisMessageSequenceProps> = ({
  active = true,
  items,
  initialDelayMs = DEFAULT_INITIAL_DELAY_MS,
  typingDurationMs = DEFAULT_TYPING_DURATION_MS,
  typingLabel = `${ASSISTANT_NAME} esta escribiendo...`,
}) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingIndex, setTypingIndex] = useState<number | null>(null);

  const sequenceIds = useMemo(() => items.map((item) => item.id).join("|"), [items]);

  useEffect(() => {
    if (!active || items.length === 0) {
      setVisibleCount(0);
      setTypingIndex(null);
      return;
    }

    let cancelled = false;
    const timeoutIds: number[] = [];

    const scheduleMessage = (index: number, delayMs: number) => {
      const timeoutId = window.setTimeout(() => {
        if (cancelled) return;

        setTypingIndex(index);

        const revealTimeoutId = window.setTimeout(() => {
          if (cancelled) return;

          setVisibleCount(index + 1);
          setTypingIndex(index + 1 < items.length ? index + 1 : null);

          if (index + 1 < items.length) {
            scheduleMessage(index + 1, typingDurationMs + 240);
          }
        }, typingDurationMs);

        timeoutIds.push(revealTimeoutId);
      }, delayMs);

      timeoutIds.push(timeoutId);
    };

    setVisibleCount(0);
    setTypingIndex(null);
    scheduleMessage(0, initialDelayMs);

    return () => {
      cancelled = true;
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [active, initialDelayMs, items.length, sequenceIds, typingDurationMs]);

  if (!active) return null;

  return (
    <div className="jarvis-message-sequence">
      {items.map((item, index) =>
        index < visibleCount ? (
          <React.Fragment key={item.id}>{item.render(true)}</React.Fragment>
        ) : null
      )}

      {typingIndex !== null && typingIndex < items.length ? (
        <div className="jarvis-typing-indicator" aria-live="polite">
          <JarvisAvatar className="jarvis-typing-indicator__avatar" />
          <div className="jarvis-typing-indicator__bubble">
            <span>{typingLabel}</span>
            <div className="jarvis-typing-indicator__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
