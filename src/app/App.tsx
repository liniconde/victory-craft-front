import { BrowserRouter, useLocation, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { PrivateRoute } from "../components/privateRoute/PrivateRoute";
import { AuthProvider } from "../context/AuthContext";
import NavigationBar from "../components/navigation/NavigationBar";
import "./App.css";
import Footer from "../components/footer/footer";

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
const SlotList = lazy(() => import("../pages/slots/components/list/SlotList"));
const Login = lazy(() => import("../components/login/Login"));
const Register = lazy(() => import("../components/register/Register"));
const OAuthCallback = lazy(() => import("../components/auth/OAuthCallback"));
const Home = lazy(() => import("../pages/home/Home"));
const ReservationsList = lazy(
  () => import("../pages/fields/reservationsList/ReservationsList")
);

// 📌 Componente para mostrar la pantalla de carga mientras se cargan los componentes
const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-12 h-12 border-4 border-[#50BB73] border-t-transparent rounded-full animate-spin"></div>
  </div>
);
function AppRoutes() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/auth/callback"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  // 📌 Componente para manejar las rutas
  return (
    <>
      {!shouldHideNavbar && <NavigationBar />}
      <div className="page-container">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* ✅ Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/" element={<Home />} />
            <Route path="/fields" element={<FieldsList />} />

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
              path="/fields/videos/"
              element={
                <PrivateRoute>
                  <RemoteVideosModule mode="list" />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields/:fieldId/videos/create"
              element={
                <PrivateRoute>
                  <RemoteVideosModule mode="create" />
                </PrivateRoute>
              }
            />
            <Route
              path="/videos/:videoId/update"
              element={
                <PrivateRoute>
                  <RemoteVideosModule mode="edit" />
                </PrivateRoute>
              }
            />
            <Route
              path="/fields/:fieldId/videos/:videoId/edit"
              element={
                <PrivateRoute>
                  <RemoteVideosModule mode="create" />
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
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
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
