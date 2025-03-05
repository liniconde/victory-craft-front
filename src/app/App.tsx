import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext"; // Asegúrate de importar AuthProvider
import Users from "../pages/Users";
import FieldsList from "../pages/fields/list/FieldsList";
import Reservations from "../pages/reservations/Reservations";
import ReservationsPage from "../pages/reservations/ReservationsPage";
import FieldForm from "../pages/fields/form/FieldForm";
import SlotForm from "../pages/slots/components/form/SlotForm";
import NavigationBar from "../components/navigation/NavigationBar";
import ReservationForm, {
  ReservationFormEnum,
} from "../pages/reservations/form/ReservationForm";
import SlotList from "../pages/slots/components/list/SlotList";
import MyReservations from "../pages/fields/myReservations/MyReservations";
import LoadingIndicator from "../components/loader/LoadingIndicator";
import Login from "../components/login/Login";
import { LoadingProvider } from "../hooks/useLoading";
import { PrivateRoute } from "../components/privateRoute/PrivateRoute";
import Home from "../pages/home/Home";

const App = () => {
  const dtaMock = {
    name: "Jane Cooper",
    title: "Regional Paradigm Technician",
    status: "ACTIVE",
    age: 27,
    role: "Admin",
    imageSrc:
      "https://st2.depositphotos.com/4211709/7708/i/450/depositphotos_77085751-stock-photo-flower.jpg",
  };

  const tableData = [
    dtaMock,
    dtaMock,
    dtaMock,
    dtaMock,
    dtaMock,
    dtaMock,
    dtaMock,
    dtaMock,
    dtaMock,
    dtaMock,
    dtaMock,
    dtaMock,
  ];

  return (
    <AuthProvider>
      <LoadingProvider>
        <LoadingIndicator />
        <Router>
          {window.location.pathname !== "/login" && <NavigationBar />}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
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
            <Route path="/my-reservations" element={<MyReservations />} />
          </Routes>
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
};

export default App;
