import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { PrivateRoute } from "../components/privateRoute/PrivateRoute";
import { LoadingProvider } from "../hooks/useLoading";
import { AuthProvider } from "../context/AuthContext";
import NavigationBar from "../components/navigation/NavigationBar"; // Asegúrate de importar AuthProvider
import LoadingIndicator from "../components/loader/LoadingIndicator";
import "./App.css";

// todas las rutas estan siendo tratadas con Lazy//
const Users = lazy(() => import("../pages/Users"));
const FieldsList = lazy(() => import("../pages/fields/list/FieldsList"));
const Reservations = lazy(() => import("../pages/reservations/Reservations"));
const ReservationsPage = lazy(
  () => import("../pages/reservations/ReservationsPage")
);
const FieldForm = lazy(() => import("../pages/fields/form/FieldForm"));
const SlotForm = lazy(() => import("../pages/slots/components/form/SlotForm"));
const ReservationForm = lazy(
  () => import("../pages/reservations/form/ReservationForm")
);
import { ReservationFormEnum } from "../pages/reservations/form/ReservationForm"; //ojo este se maneja de manera estatica//
const SlotList = lazy(() => import("../pages/slots/components/list/SlotList"));
const MyReservations = lazy(
  () => import("../pages/fields/myReservations/MyReservations")
);
const Login = lazy(() => import("../components/login/Login"));
const Home = lazy(() => import("../pages/home/Home"));
const MapComponent = lazy(() => import("../pages/map/MapComponent"));
const Register = lazy(() => import("../components/register/Register"));

const App = () => {
  const LoadingScreen = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="w-12 h-12 border-4 border-[#50BB73] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <AuthProvider>
      <LoadingProvider>
        <LoadingIndicator />
        <Router>
          {window.location.pathname !== "/login" && <NavigationBar />}

          <div className="page-container">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route
                  path="/map"
                  element={<MapComponent fields={[]} selectedField={null} />} // AQUÍ PUEDE HABER UN POSIBLE ERROR REVISAR SI SE DEBE HACER CON EL USELOCATION Y COMO//
                />

                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <FieldsList />
                    </PrivateRoute>
                  }
                />
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
                  path="/slots"
                  element={
                    <PrivateRoute>
                      <SlotList />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reservations"
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
                  path="/fields/edit/:id"
                  element={
                    <PrivateRoute>
                      <FieldForm mode="edit" />
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
                  path="/slots" // OJO AQUÍ ESTA DUPLICADA REVISAR BIEN SI HACE ALGO O ES UN ERROR //
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
                <Route path="/my-reservations" element={<MyReservations />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
};

export default App;

// Aquú a nivel de routes, puedo hacer un suspence para cargar la pagina o spenner //

// skeleto a la tabla para que cuando renderice no de la sensación de vacio, mientras carga la información//
//revisar los custm hooks//
// Para los contextos los get y demás puedo tener una carpeta Api

//Añadir suspense y lazy //
