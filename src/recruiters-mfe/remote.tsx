import { createRoot, Root } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RecruitersModule from "./RecruitersModule";

interface RemoteRecruitersMountProps {}

interface RemoteRecruitersGlobal {
  mount: (
    container: HTMLElement,
    props?: RemoteRecruitersMountProps
  ) => void | (() => void) | { unmount: () => void };
}

declare global {
  interface Window {
    VictoryRecruitersMfe?: RemoteRecruitersGlobal;
  }
}

const roots = new WeakMap<HTMLElement, Root>();

const mount: RemoteRecruitersGlobal["mount"] = (container) => {
  container.classList.add("recruiters-mfe-scope");

  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }

  root.render(
    <BrowserRouter>
      <RecruitersModule />
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

window.VictoryRecruitersMfe = { mount };
