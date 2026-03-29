import {
  BrowserRouter,
  Navigate,
  useLocation,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { PrivateRoute } from "../components/privateRoute/PrivateRoute";
import { AuthProvider, useAuth } from "../context/AuthContext";
import NavigationBar from "../components/navigation/NavigationBar";
import "./App.css";
import Footer from "../components/footer/footer";
import AgentModule from "../agent-mfe/AgentModule";
import { createBackendAgentAdapter } from "./agent/adapters/backendAgentAdapter";
import { TournamentsAgentActions } from "../tournaments-mfe/agent/TournamentsAgentActions";

// 📌 Rutas con Lazy Loading
const Users = lazy(() => import("../pages/Users"));
const FieldsList = lazy(() => import("../pages/fields/list/FieldsList"));
const Reservations = lazy(() => import("../pages/reservations/Reservations"));
const FieldForm = lazy(() => import("../pages/fields/form/FieldForm"));
const SlotForm = lazy(() => import("../pages/slots/components/form/SlotForm"));
const ReservationForm = lazy(
  () => import("../pages/reservations/form/ReservationForm")
);
import { ReservationFormEnum } from "../pages/reservations/form/ReservationForm";
import { AppFeedbackProvider } from "../context/AppFeedbackProvider";
import ReservationsPage from "../pages/reservations/ReservationsPage";
import { RemoteVideosModule } from "../microfrontends/videos/RemoteVideosModule";
import { RecruitersModuleProvider } from "../recruiters-mfe/features/recruiters/RecruitersModuleContext";
const SlotList = lazy(() => import("../pages/slots/components/list/SlotList"));
const Login = lazy(() => import("../components/login/Login"));
const Register = lazy(() => import("../components/register/Register"));
const OAuthCallback = lazy(() => import("../components/auth/OAuthCallback"));
const Home = lazy(() => import("../pages/home/Home"));
const TournamentsModule = lazy(
  () => import("../tournaments-mfe/TournamentsModule")
);
const RecruitersModule = lazy(
  () => import("../recruiters-mfe/RecruitersModule")
);
const SharedPlayerProfilePage = lazy(
  () => import("../recruiters-mfe/subpages/player-profiles/pages/SharedPlayerProfilePage")
);
const ReservationsList = lazy(
  () => import("../pages/fields/reservationsList/ReservationsList")
);
const agentPlannerAdapter = createBackendAgentAdapter();

type VideosMode = "list" | "create" | "edit";
const VIDEO_MFE_PREFIXES = ["/videos", "/fields/videos", "/subpages"];

const isVideosMfePath = (pathname: string) =>
  VIDEO_MFE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

const inferVideosModeFromPath = (pathname: string): VideosMode => {
  if (/^\/videos\/[^/]+\/update\/?$/.test(pathname)) return "edit";
  if (/^\/videos\/fields\/[^/]+\/videos\/create\/?$/.test(pathname)) return "create";
  if (/^\/videos\/fields\/[^/]+\/videos\/[^/]+\/edit\/?$/.test(pathname)) return "create";
  if (/^\/fields\/[^/]+\/videos\/create\/?$/.test(pathname)) return "create";
  if (/^\/fields\/[^/]+\/videos\/[^/]+\/edit\/?$/.test(pathname)) return "create";
  return "list";
};

const VideosRouteHandler = () => {
  const location = useLocation();
  return <RemoteVideosModule mode={inferVideosModeFromPath(location.pathname)} />;
};

const UnknownPrivateRoute = () => {
  const location = useLocation();
  if (isVideosMfePath(location.pathname)) {
    return <VideosRouteHandler />;
  }
  return <Navigate to="/" replace />;
};

// 📌 Componente para mostrar la pantalla de carga mientras se cargan los componentes
const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-12 h-12 border-4 border-[#50BB73] border-t-transparent rounded-full animate-spin"></div>
  </div>
);
function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authReady, isAuthenticated } = useAuth();
  const hideNavbarPaths = ["/login", "/register", "/auth/callback"];
  const shouldHideNavbarBase =
    hideNavbarPaths.includes(location.pathname) ||
    location.pathname.startsWith("/public/player-profiles/");

  // 📌 Componente para manejar las rutas
  return (
    <AgentModule
      currentPath={location.pathname}
      navigate={navigate}
      llmAdapter={agentPlannerAdapter}
      showWidget={authReady && isAuthenticated}
    >
      <div className="app-shell">
        <TournamentsAgentActions />
        <div
          className={`app-shell__navbar ${shouldHideNavbarBase ? "app-shell__navbar--hidden" : ""}`}
        >
          <NavigationBar />
        </div>
        <div className="page-container">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
            {/* ✅ Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/" element={<Home />} />
            <Route path="/fields" element={<FieldsList />} />
            <Route
              path="/public/player-profiles/:publicSlug"
              element={
                <RecruitersModuleProvider>
                  <SharedPlayerProfilePage />
                </RecruitersModuleProvider>
              }
            />
            <Route
              path="/public/player-profiles/share/:publicShareId"
              element={
                <RecruitersModuleProvider>
                  <SharedPlayerProfilePage />
                </RecruitersModuleProvider>
              }
            />

            {/* ✅ Rutas Privadas (Requieren autenticación) */}
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields"
              element={
                <PrivateRoute>
                  <FieldsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/reservations"
              element={
                <PrivateRoute>
                  <ReservationsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/reservations/:fieldId"
              element={
                <PrivateRoute>
                  <Reservations />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields/new"
              element={
                <PrivateRoute>
                  <FieldForm mode="create" />
                </PrivateRoute>
              }
            />
            <Route
              path="/reservations/new/:fieldId"
              element={
                <PrivateRoute>
                  <ReservationForm mode={ReservationFormEnum.CREATE} />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields/edit/:id"
              element={
                <PrivateRoute>
                  <FieldForm mode="edit" />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields/:id/reservations/"
              element={
                <PrivateRoute>
                  <ReservationsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/videos"
              element={
                <PrivateRoute>
                  <VideosRouteHandler />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields/videos/"
              element={
                <PrivateRoute>
                  <Navigate to="/videos/subpages/dashboard" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields/videos/*"
              element={
                <PrivateRoute>
                  <Navigate to="/videos/subpages/dashboard" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields/:fieldId/videos/create"
              element={
                <PrivateRoute>
                  <Navigate to={`/videos${location.pathname}`} replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields/:fieldId/videos/*"
              element={
                <PrivateRoute>
                  <Navigate to={`/videos${location.pathname}`} replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/videos/:videoId/update"
              element={
                <PrivateRoute>
                  <VideosRouteHandler />
                </PrivateRoute>
              }
            />
            <Route
              path="/videos/*"
              element={
                <PrivateRoute>
                  <VideosRouteHandler />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields/:fieldId/videos/:videoId/edit"
              element={
                <PrivateRoute>
                  <Navigate to={`/videos${location.pathname}`} replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/subpages/*"
              element={
                <PrivateRoute>
                  <Navigate to={`/videos${location.pathname}`} replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/reservations/new"
              element={
                <PrivateRoute>
                  <ReservationForm mode={ReservationFormEnum.CREATE} />
                </PrivateRoute>
              }
            />
            <Route
              path="/reservations/edit/:id"
              element={
                <PrivateRoute>
                  <ReservationForm mode={ReservationFormEnum.EDIT} />
                </PrivateRoute>
              }
            />
            <Route
              path="/slots"
              element={
                <PrivateRoute>
                  <SlotList />
                </PrivateRoute>
              }
            />
            <Route
              path="/slots/new/:fieldId"
              element={
                <PrivateRoute>
                  <SlotForm mode="create" />
                </PrivateRoute>
              }
            />
            <Route
              path="/slots/edit/:id"
              element={
                <PrivateRoute>
                  <SlotForm mode="edit" />
                </PrivateRoute>
              }
            />
            <Route
              path="/tournaments/*"
              element={
                <PrivateRoute>
                  <TournamentsModule />
                </PrivateRoute>
              }
            />
            <Route
              path="/scouting/*"
              element={
                <PrivateRoute>
                  <RecruitersModule />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiters/*"
              element={
                <PrivateRoute>
                  <Navigate to="/scouting/subpages/dashboard" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <UnknownPrivateRoute />
                </PrivateRoute>
              }
            />
            </Routes>
          </Suspense>
        </div>
        <div className="app-shell__footer">
          <Footer />
        </div>
      </div>
    </AgentModule>
  );
}

// 📌 Componente Principal
const App = () => {
  return (
    <AuthProvider>
      <AppFeedbackProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppFeedbackProvider>
    </AuthProvider>
  );
};

export default App;
