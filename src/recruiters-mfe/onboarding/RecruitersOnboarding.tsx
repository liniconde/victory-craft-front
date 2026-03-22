import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  SCOUTING_SPOTLIGHT_STEPS,
  SPORT_OPTIONS,
  type OnboardingSportId,
  type OnboardingSpotlightStep,
} from "./scoutingOnboardingContent";
import {
  getScoutingOnboardingIdentity,
  isScoutingOnboardingDesktopEnabled,
  getScoutingOnboardingProgress,
  persistScoutingOnboardingProgress,
} from "./onboardingStorage";
import {
  buildJarvisCapabilityReminderScene,
  buildScoutingWelcomeScene,
  JarvisFlyToTargetAction,
  JarvisFlightOverlay,
  JarvisGreetingCallout,
  JarvisMessageCard,
  JarvisRevealMessageAction,
  JarvisSceneHost,
  JarvisTypingIndicator,
  JarvisTypingAction,
  useJarvisActionRunner,
} from "../../agent-mfe";
import { JarvisMessageSequence } from "../../agent-mfe/components/JarvisMessageSequence";
import "./RecruitersOnboarding.css";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const DEFAULT_SPORT: OnboardingSportId = "football";
const WELCOME_PRIMARY_MESSAGE_ID = "welcome-primary-message";
const WELCOME_SECONDARY_MESSAGE_ID = "welcome-secondary-message";
const WELCOME_PRIMARY_TARGET_ID = "welcome-primary-dock";

const toDisplayName = (email: string | null, userId: string | null) => {
  const rawName = (email?.split("@")[0] || userId || "jugador").trim();
  return rawName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const isElementVisible = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    rect.width > 0 &&
    rect.height > 0
  );
};

const resolveTarget = (step: OnboardingSpotlightStep): HTMLElement | null => {
  for (const selector of step.selectors) {
    const candidate = document.querySelector<HTMLElement>(selector);
    if (candidate && isElementVisible(candidate)) {
      return candidate;
    }
  }

  return null;
};

type IntroStepId = "welcome" | "journey" | "finale";

const RecruitersOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authReady, email, userId } = useAuth();
  const identity = getScoutingOnboardingIdentity(userId, email);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<OnboardingSportId | null>(null);
  const [introStep, setIntroStep] = useState<IntroStepId>("welcome");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [isDesktopOnboardingEnabled, setIsDesktopOnboardingEnabled] = useState(
    isScoutingOnboardingDesktopEnabled
  );
  const isIntroEntryRoute = location.pathname === "/scouting/intro";

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(min-width: 881px)");
    const syncDesktopMode = (event?: MediaQueryListEvent) => {
      setIsDesktopOnboardingEnabled(event ? event.matches : mediaQuery.matches);
    };

    syncDesktopMode();
    mediaQuery.addEventListener("change", syncDesktopMode);

    return () => {
      mediaQuery.removeEventListener("change", syncDesktopMode);
    };
  }, []);

  useEffect(() => {
    if (!authReady || !isIntroEntryRoute || isDesktopOnboardingEnabled) return;

    setIsOpen(false);
    navigate("/scouting/subpages/dashboard", { replace: true });
  }, [authReady, isDesktopOnboardingEnabled, isIntroEntryRoute, navigate]);

  useEffect(() => {
    if (!isDesktopOnboardingEnabled) return;
    if (!authReady || !isIntroEntryRoute) return;

    const progress = getScoutingOnboardingProgress(identity);
    if (progress?.selectedSport) {
      setSelectedSport(progress.selectedSport);
    } else {
      setSelectedSport(null);
    }

    setIntroStep("welcome");
    setSpotlightIndex(0);
    setSpotlightRect(null);
    setIsOpen(true);
  }, [authReady, identity, isDesktopOnboardingEnabled, isIntroEntryRoute]);

  useEffect(() => {
    if (!isOpen) return;

    persistScoutingOnboardingProgress(identity, {
      completed: false,
      selectedSport: selectedSport ?? DEFAULT_SPORT,
    });
  }, [identity, isOpen, selectedSport]);

  const selectedSportContent = useMemo(
    () => SPORT_OPTIONS.find((sport) => sport.id === selectedSport) ?? null,
    [selectedSport]
  );

  const displayName = useMemo(() => toDisplayName(email, userId), [email, userId]);
  const activeSpotlightStep = SCOUTING_SPOTLIGHT_STEPS[spotlightIndex] ?? null;
  const resolvedSportContent = selectedSportContent ?? SPORT_OPTIONS[0];
  const welcomeJarvisScene = useMemo(
    () => buildScoutingWelcomeScene({ displayName }),
    [displayName]
  );
  const capabilityReminderScene = useMemo(() => buildJarvisCapabilityReminderScene(), []);
  const welcomeJarvisActions = useMemo(
    () => [
      new JarvisFlyToTargetAction("jarvis.fly.welcome-primary", {
        bubbleText: "Hola, voy para alla",
        targetId: WELCOME_PRIMARY_TARGET_ID,
      }),
      new JarvisTypingAction("jarvis.type.welcome-primary", 1100),
      new JarvisRevealMessageAction("jarvis.reveal.welcome-primary", WELCOME_PRIMARY_MESSAGE_ID),
      new JarvisTypingAction("jarvis.type.welcome-secondary", 950),
      new JarvisRevealMessageAction(
        "jarvis.reveal.welcome-secondary",
        WELCOME_SECONDARY_MESSAGE_ID
      ),
    ],
    []
  );
  const { registerTarget, runtimeState: welcomeJarvisRuntime } = useJarvisActionRunner({
    actions: welcomeJarvisActions,
    active: isOpen && introStep === "welcome",
  });

  useEffect(() => {
    if (!isOpen || introStep !== "journey" || !activeSpotlightStep) return;

    if (location.pathname !== activeSpotlightStep.route) {
      navigate(activeSpotlightStep.route, { replace: true });
      return;
    }

    let frameId = 0;
    let attempts = 0;

    const updateRect = () => {
      const target = resolveTarget(activeSpotlightStep);
      if (!target) {
        attempts += 1;
        if (attempts < 20) {
          frameId = window.requestAnimationFrame(updateRect);
        }
        return;
      }

      const rect = target.getBoundingClientRect();
      setSpotlightRect({
        top: rect.top - 12,
        left: rect.left - 12,
        width: rect.width + 24,
        height: rect.height + 24,
      });
    };

    updateRect();
    const handleResize = () => updateRect();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [activeSpotlightStep, introStep, isOpen, location.pathname, navigate]);

  const completeOnboarding = (destination?: string) => {
    persistScoutingOnboardingProgress(identity, {
      completed: true,
      selectedSport: selectedSport ?? DEFAULT_SPORT,
    });
    setIsOpen(false);
    setIntroStep("welcome");
    setSpotlightIndex(0);
    setSpotlightRect(null);

    if (destination) {
      navigate(destination, { replace: true });
    }
  };

  const skipOnboarding = () => {
    completeOnboarding("/scouting/subpages/dashboard");
  };

  const advanceIntro = () => {
    if (introStep === "welcome") {
      setIntroStep("journey");
      setSpotlightIndex(0);
      navigate(SCOUTING_SPOTLIGHT_STEPS[0].route, { replace: true });
      return;
    }

    if (introStep === "journey") {
      if (spotlightIndex < SCOUTING_SPOTLIGHT_STEPS.length - 1) {
        setSpotlightIndex((current) => current + 1);
        return;
      }

      setIntroStep("finale");
      setSpotlightRect(null);
      return;
    }

    completeOnboarding("/scouting/subpages/player-profiles");
  };

  const handleSportSelection = (sportId: OnboardingSportId) => {
    setSelectedSport(sportId);
  };

  const goBack = () => {
    if (introStep === "finale") {
      setIntroStep("journey");
      setSpotlightIndex(SCOUTING_SPOTLIGHT_STEPS.length - 1);
      return;
    }

    if (introStep === "journey" && spotlightIndex > 0) {
      setSpotlightIndex((current) => current - 1);
      return;
    }

    if (introStep === "journey") {
      setIntroStep("welcome");
      setSpotlightRect(null);
    }
  };

  if (!authReady || !isDesktopOnboardingEnabled) return null;

  return (
    <>
      <button
        type="button"
        className="recruiters-onboarding-replay"
        onClick={() => navigate("/scouting/intro")}
      >
        Ver intro
      </button>

      {isOpen ? (
        <div className="recruiters-onboarding" role="dialog" aria-modal="true">
          <div
            className={`recruiters-onboarding__veil ${
              introStep === "journey" ? "recruiters-onboarding__veil--guided" : ""
            }`.trim()}
          />

          {introStep === "journey" && spotlightRect ? (
            <div
              className="recruiters-onboarding__spotlight recruiters-onboarding__spotlight--guided"
              style={{
                top: `${spotlightRect.top}px`,
                left: `${spotlightRect.left}px`,
                width: `${spotlightRect.width}px`,
                height: `${spotlightRect.height}px`,
              }}
            />
          ) : null}

          <section className="recruiters-onboarding__panel">
            <div className="recruiters-onboarding__panel-topbar">
              <span>
                Intro {introStep === "journey" ? spotlightIndex + 2 : introStep === "finale" ? 7 : 1}/7
              </span>
              <button type="button" onClick={skipOnboarding}>
                Omitir
              </button>
            </div>

            {introStep === "welcome" ? (
              <div className="recruiters-onboarding__intro">
                <div className="recruiters-onboarding__hero-shell">
                  <div className="recruiters-onboarding__intro-copy">
                    <p className="recruiters-onboarding__eyebrow">Scouting onboarding</p>
                    <h2>Bienvenido {displayName}</h2>
                    <p>
                      Tus mejores jugadas pueden ponerte frente a jugadores, fans y oportunidades
                      reales. Hoy voy a dejarte listo para moverte por scouting con claridad.
                    </p>
                    <JarvisGreetingCallout
                      title={welcomeJarvisScene.title}
                      body={welcomeJarvisScene.body}
                      isVisible={welcomeJarvisRuntime.visibleMessageIds.includes(
                        WELCOME_PRIMARY_MESSAGE_ID
                      )}
                      dockRef={registerTarget(WELCOME_PRIMARY_TARGET_ID)}
                    />
                    {welcomeJarvisRuntime.typing &&
                    welcomeJarvisRuntime.currentActionId === "jarvis.type.welcome-primary" ? (
                      <JarvisTypingIndicator label={welcomeJarvisRuntime.typing.label} />
                    ) : null}
                    {welcomeJarvisRuntime.visibleMessageIds.includes(WELCOME_SECONDARY_MESSAGE_ID) ? (
                      <JarvisMessageCard
                        body={
                          <p>
                            Elige tu deporte y te enseno el mejor punto de partida para que tu
                            perfil, tus videos y tu visibilidad empiecen con fuerza.
                          </p>
                        }
                      />
                    ) : null}
                    {welcomeJarvisRuntime.typing &&
                    welcomeJarvisRuntime.currentActionId === "jarvis.type.welcome-secondary" ? (
                      <JarvisTypingIndicator label={welcomeJarvisRuntime.typing.label} />
                    ) : null}
                  </div>

                  <div className="recruiters-onboarding__hero-visual">
                    {selectedSportContent ? (
                      <>
                        <img
                          src={selectedSportContent.imageUrl}
                          alt={selectedSportContent.imageAlt}
                          className="recruiters-onboarding__hero-image"
                        />
                      </>
                    ) : (
                      <div className="recruiters-onboarding__hero-empty">
                        <strong>Elige tu deporte</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="recruiters-onboarding__sport-grid">
                  {SPORT_OPTIONS.map((sport) => (
                    <button
                      key={sport.id}
                      type="button"
                      className={`recruiters-onboarding__sport-card ${
                        selectedSport === sport.id ? "is-selected" : ""
                      }`}
                      style={{ "--sport-accent": sport.accent } as React.CSSProperties}
                      onClick={() => handleSportSelection(sport.id)}
                    >
                      <span className="recruiters-onboarding__sport-chip">{sport.label}</span>
                    </button>
                  ))}
                </div>

                {selectedSportContent ? (
                  <div
                    className="recruiters-onboarding__message"
                    style={{ "--sport-accent": selectedSportContent.accent } as React.CSSProperties}
                  >
                    <span className="recruiters-onboarding__message-label">
                      {selectedSportContent.label}
                    </span>
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
            ) : null}

            {introStep === "journey" && activeSpotlightStep ? (
              <div className="recruiters-onboarding__journey">
                <p className="recruiters-onboarding__eyebrow">Jarvis te guia</p>
                <h2>{activeSpotlightStep.title}</h2>
                <JarvisMessageSequence
                  active={isOpen && introStep === "journey"}
                  items={[
                    {
                      id: `journey-step-${activeSpotlightStep.id}`,
                      render: () => <JarvisMessageCard body={<p>{activeSpotlightStep.description}</p>} />,
                    },
                    {
                      id: `journey-flow-${activeSpotlightStep.id}`,
                      render: () => (
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
                      ),
                    },
                  ]}
                />
              </div>
            ) : null}

            {introStep === "finale" ? (
              <div className="recruiters-onboarding__finale">
                <p className="recruiters-onboarding__eyebrow">Jarvis te deja listo</p>
                <h2>{displayName}, este es tu momento</h2>
                <p>
                  En {resolvedSportContent.label.toLowerCase()} ya tienes un camino claro. Yo te
                  recomiendo subir tus mejores jugadas, compartirlas con tus amigos, competir,
                  votar y construir una presencia real en scouting.
                </p>
                <blockquote>
                  Yo te lo voy a recordar siempre: nunca sabes quien puede estar viendo tu siguiente
                  video... algun reclutador del mundo.
                </blockquote>
                <div className="recruiters-onboarding__finale-grid">
                  <JarvisMessageSequence
                    active={isOpen && introStep === "finale"}
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
                                <p>
                                  Elige goles, atajadas, puntos y jugadas que de verdad te definan.
                                </p>
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
                                  Consulta tu library y mira el ranking mundial para compararte con
                                  contexto.
                                </p>
                              </>
                            }
                          />
                        ),
                      },
                      {
                        id: "finale-capability-reminder",
                        render: (active) => (
                          <JarvisSceneHost scene={capabilityReminderScene} active={active} />
                        ),
                      },
                    ]}
                  />
                </div>
              </div>
            ) : null}

            <div className="recruiters-onboarding__actions">
              <button
                type="button"
                className="recruiters-onboarding__button recruiters-onboarding__button--ghost"
                onClick={goBack}
                disabled={introStep === "welcome"}
              >
                Atras
              </button>
              <button
                type="button"
                className="recruiters-onboarding__button recruiters-onboarding__button--primary"
                onClick={advanceIntro}
                disabled={introStep === "welcome" && !selectedSport}
              >
                {introStep === "finale"
                  ? "Entrar a scouting"
                  : introStep === "journey" && spotlightIndex === SCOUTING_SPOTLIGHT_STEPS.length - 1
                    ? "Ver cierre"
                    : introStep === "welcome"
                      ? "Continuar"
                      : "Continuar"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isOpen && introStep === "welcome" ? (
        <JarvisFlightOverlay
          bubbleText={welcomeJarvisScene.bubbleText}
          durationMs={1450}
          flightState={welcomeJarvisRuntime.flightState}
        />
      ) : null}
    </>
  );
};

export default RecruitersOnboarding;
