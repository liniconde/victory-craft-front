import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./login.css"; // Asegúrate de que sea el archivo correcto
import Fondo from "../../assets/pexels-todd-trapani-488382-2339377.jpg";
import Fondo1 from "../../assets/pexels-pixabay-274506.jpg";
import { loginUser } from "../../services/user/userService";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useAuth();

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

  useEffect(() => {
   
    document.body.style.overflow = "hidden";

    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await loginUser(username, password);
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
    <>
      {/* Fondo animado que cubre toda la pantalla */}
      <div
        className="background-image"
        style={{
          backgroundImage: `url(${currentBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out",
        }}
      />

      {/* Capa semitransparente para oscurecer fondo */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* Contenedor del login */}
      <div className="login-container">
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
            <span>¿No tienes una cuenta?</span>
            <span
              onClick={() => navigate("/register")}
              className="register-text"
            >
              Regístrate aquí
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
