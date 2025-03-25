import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./index.css"; // 📌 Importamos los estilos desde un archivo CSS externo
import Video from "../../assets/Animación VictoryC.mp4"; // 📌 Importamos la imagen de fondo
import { loginUser } from "../../services/user/userService";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await loginUser(username, password); // 📌 Cambiamos la función loginUser por la importada
      console.log("Login Response:", data);
      if (data) {
        login(data.token);
        navigate("/");
      } else {
        setError("Login fallido. Por favor, intente de nuevo.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Error en el servidor. Por favor, intente más tarde.");
    }
  };

  return (
    <div className="login-container">
      {/* 📌 Video de fondo */}
      <video autoPlay loop muted className="background-video">
        <source src={Video} type="video/mp4" />
        Tu navegador no soporta el video.
      </video>

      <div className="login-box">
        <h2 className="login-title">Iniciar Sesión</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div>
            <label htmlFor="username" className="login-label">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              placeholder="Ingresa tu usuario"
            />
          </div>
          <div>
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <p className="register-link text-white">
          ¿No tienes una cuenta?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-[#82C451] cursor-pointer hover:underline"
          >
            Regístrate aquí
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
