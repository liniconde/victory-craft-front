import { createRoot, Root } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import TournamentsModule from "./TournamentsModule";

interface RemoteTournamentsMountProps {}

interface RemoteTournamentsGlobal {
  mount: (
    container: HTMLElement,
    props?: RemoteTournamentsMountProps
  ) => void | (() => void) | { unmount: () => void };
}

declare global {
  interface Window {
    VictoryTournamentsMfe?: RemoteTournamentsGlobal;
  }
}

const roots = new WeakMap<HTMLElement, Root>();

const mount: RemoteTournamentsGlobal["mount"] = (container) => {
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }

  root.render(
    <BrowserRouter>
      <TournamentsModule />
    </BrowserRouter>
  );

  return () => {
    const mountedRoot = roots.get(container);
    if (mountedRoot) {
      mountedRoot.unmount();
      roots.delete(container);
    }
  };
};

window.VictoryTournamentsMfe = { mount };
