import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/user/userService";
import "./register.css";
import Fondo from "../../assets/pexels-todd-trapani-488382-2339377.jpg";
import Fondo1 from "../../assets/pexels-pixabay-274506.jpg";

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<string>("user");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  // Slideshow de imágenes
  const backgrounds = [Fondo, Fondo1];
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBackground = backgrounds[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000); // Cambia cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await registerUser({
        firstName,
        lastName,
        email,
        password,
        role,
        username: email,
      });
      console.log("Registro exitoso:", response);
      navigate("/login");
    } catch (error) {
      console.error("Error al registrar:", error);
      setError("Error en el registro. Intenta nuevamente.");
    }
  };

  const passwordNotValidated = password !== confirmPassword;

  return (
    <div className="register-container">
      <div
        className="background-fade absolute"
        style={{
          backgroundImage: `url(${currentBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out",
        }}
      />

      <div className="register-box">
        <h2 className="register-title">Crear Cuenta</h2>
        <form onSubmit={handleRegister} className="register-form">
          <div>
            <label htmlFor="firstName" className="register-label">
              Nombre
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="register-input"
              placeholder="Ingresa tu nombre"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="register-label">
              Apellido
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="register-input"
              placeholder="Ingresa tu apellido"
            />
          </div>

          <div>
            <label htmlFor="email" className="register-label">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="register-input"
              placeholder="Ingresa tu email"
            />
          </div>

          <div>
            <label htmlFor="password" className="register-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-input"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="confirmPassword" className="register-label">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="register-input"
              placeholder="Repite tu contraseña"
            />
          </div>

          <div>
            <label htmlFor="role" className="register-label">
              Tipo de usuario
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="register-input"
            >
              <option value="user">Jugador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {passwordNotValidated && (
            <div>
              <p className="error-message">Los password no coinciden</p>
            </div>
          )}

          <button
            type="submit"
            className={`register-button ${
              passwordNotValidated ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={passwordNotValidated}
          >
            Registrarse
          </button>

          <button className="login-button" onClick={() => navigate("/login")}>
            Volver al login{" "}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;
