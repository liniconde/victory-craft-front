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
  JarvisRevealMessageAction,
  JarvisTypingAction,
  useJarvisActionRunner,
} from "../../agent-mfe";
import OnboardingActionBar from "./components/OnboardingActionBar";
import OnboardingPanelFrame from "./components/OnboardingPanelFrame";
import WelcomeIntroPage from "./pages/WelcomeIntroPage";
import ScoutingMenuIntroPage from "./pages/ScoutingMenuIntroPage";
import DashboardIntroPage from "./pages/DashboardIntroPage";
import PlayerProfilesIntroPage from "./pages/PlayerProfilesIntroPage";
import LibraryIntroPage from "./pages/LibraryIntroPage";
import RankingsIntroPage from "./pages/RankingsIntroPage";
import FinaleIntroPage from "./pages/FinaleIntroPage";
import "./styles/RecruitersOnboarding.base.css";
import "./styles/RecruitersOnboarding.welcome.css";
import "./styles/RecruitersOnboarding.journey.css";
import "./styles/RecruitersOnboarding.finale.css";

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
const TOTAL_ONBOARDING_STEPS = 7;

const toDisplayName = (
  firstName: string | null,
  lastName: string | null,
  email: string | null,
  userId: string | null
) => {
  const profileName = [firstName, lastName]
    .map((value) => value?.trim() || "")
    .filter(Boolean)
    .join(" ")
    .trim();
  const rawName = (profileName || email?.split("@")[0] || userId || "jugador").trim();
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
  const { authReady, email, userId, firstName, lastName } = useAuth();
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

  const displayName = useMemo(
    () => toDisplayName(firstName, lastName, email, userId),
    [email, firstName, lastName, userId]
  );
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
  const isJourneyActive = isOpen && introStep === "journey";
  const journeyPages: Record<string, React.ReactNode> = {
    "scouting-menu": <ScoutingMenuIntroPage active={isJourneyActive} />,
    dashboard: <DashboardIntroPage active={isJourneyActive} />,
    "player-profiles": <PlayerProfilesIntroPage active={isJourneyActive} />,
    library: <LibraryIntroPage active={isJourneyActive} />,
    rankings: <RankingsIntroPage active={isJourneyActive} />,
  };
  const currentStepNumber =
    introStep === "welcome" ? 1 : introStep === "finale" ? TOTAL_ONBOARDING_STEPS : spotlightIndex + 2;
  const continueLabel =
    introStep === "finale"
      ? "Entrar a scouting"
      : introStep === "journey" && spotlightIndex === SCOUTING_SPOTLIGHT_STEPS.length - 1
        ? "Ver cierre"
        : "Continuar";

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

          <OnboardingPanelFrame
            stepNumber={currentStepNumber}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            onSkip={skipOnboarding}
            actions={
              <OnboardingActionBar
                canGoBack={introStep !== "welcome"}
                canContinue={introStep !== "welcome" || Boolean(selectedSport)}
                continueLabel={continueLabel}
                onBack={goBack}
                onContinue={advanceIntro}
              />
            }
          >
            {introStep === "welcome" ? (
              <WelcomeIntroPage
                displayName={displayName}
                selectedSport={selectedSport}
                selectedSportContent={selectedSportContent}
                sportOptions={SPORT_OPTIONS}
                onSportSelection={handleSportSelection}
                welcomeSceneTitle={welcomeJarvisScene.title}
                welcomeSceneBody={welcomeJarvisScene.body}
                primaryMessageVisible={welcomeJarvisRuntime.visibleMessageIds.includes(
                  WELCOME_PRIMARY_MESSAGE_ID
                )}
                secondaryMessageVisible={welcomeJarvisRuntime.visibleMessageIds.includes(
                  WELCOME_SECONDARY_MESSAGE_ID
                )}
                primaryTypingLabel={welcomeJarvisRuntime.typing?.label}
                secondaryTypingLabel={welcomeJarvisRuntime.typing?.label}
                primaryTypingVisible={
                  Boolean(welcomeJarvisRuntime.typing) &&
                  welcomeJarvisRuntime.currentActionId === "jarvis.type.welcome-primary"
                }
                secondaryTypingVisible={
                  Boolean(welcomeJarvisRuntime.typing) &&
                  welcomeJarvisRuntime.currentActionId === "jarvis.type.welcome-secondary"
                }
                registerTarget={registerTarget(WELCOME_PRIMARY_TARGET_ID)}
              />
            ) : null}

            {introStep === "journey" && activeSpotlightStep
              ? journeyPages[activeSpotlightStep.id] ?? null
              : null}

            {introStep === "finale" ? (
              <FinaleIntroPage
                active={isOpen && introStep === "finale"}
                displayName={displayName}
                sportLabel={resolvedSportContent.label}
                capabilityReminderScene={capabilityReminderScene}
              />
            ) : null}
          </OnboardingPanelFrame>
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
