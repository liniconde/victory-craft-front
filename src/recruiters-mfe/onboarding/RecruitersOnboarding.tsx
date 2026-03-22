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
import { ASSISTANT_NAME, ASSISTANT_WELCOME_COPY } from "../../agent-mfe/constants/assistantBrand";
import { JarvisAvatar } from "../../agent-mfe/components/JarvisAvatar";
import "./RecruitersOnboarding.css";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const DEFAULT_SPORT: OnboardingSportId = "football";

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
                      Tus mejores jugadas pueden poner tu nombre frente a jugadores, fans y
                      oportunidades reales. Elige tu deporte y empieza a mostrar lo que te hace
                      diferente.
                    </p>
                    <div className="recruiters-onboarding__assistant-callout">
                      <JarvisAvatar className="recruiters-onboarding__assistant-avatar" />
                      <div>
                        <span>{ASSISTANT_NAME}</span>
                        <p>
                          Soy {ASSISTANT_NAME}. {ASSISTANT_WELCOME_COPY}
                        </p>
                      </div>
                    </div>
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
                <p className="recruiters-onboarding__eyebrow">Recorrido guiado</p>
                <h2>{activeSpotlightStep.title}</h2>
                <p>{activeSpotlightStep.description}</p>

                <div className="recruiters-onboarding__journey-card">
                  <strong>Tu flujo recomendado</strong>
                  <p>
                    1. Crea tu perfil.
                    <br />
                    2. Sube tus videos.
                    <br />
                    3. Revisa tu material en library.
                    <br />
                    4. Compite y descubre los mejores videos en el ranking mundial.
                  </p>
                </div>
              </div>
            ) : null}

            {introStep === "finale" ? (
              <div className="recruiters-onboarding__finale">
                <p className="recruiters-onboarding__eyebrow">Listo para empezar</p>
                <h2>{displayName}, este es tu momento</h2>
                <p>
                  En {resolvedSportContent.label.toLowerCase()} puedes subir tus mejores jugadas,
                  compartirlas con tus amigos, competir, votar y construir una presencia real en
                  scouting.
                </p>
                <div className="recruiters-onboarding__finale-grid">
                  <article>
                    <strong>Crea tu perfil primero</strong>
                    <span>Tu historia deportiva debe estar completa antes de competir.</span>
                  </article>
                  <article>
                    <strong>Sube videos con intencion</strong>
                    <span>Goles, atajadas, puntos y jugadas que te definan.</span>
                  </article>
                  <article>
                    <strong>Haz crecer tu visibilidad</strong>
                    <span>Consulta tu library y mira el ranking mundial para compararte.</span>
                  </article>
                </div>
                <blockquote>
                  No sabes quien puede estar viendo tu siguiente video... algun reclutador del
                  mundo?
                </blockquote>
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
    </>
  );
};

export default RecruitersOnboarding;
