import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./login.css"; // Asegúrate de que sea el archivo correcto
import Fondo from "../../assets/pexels-todd-trapani-488382-2339377.jpg";
import Fondo1 from "../../assets/pexels-pixabay-274506.jpg";
import { getGoogleOAuthLoginUrl, loginUser } from "../../services/user/userService";
import { useAppFeedback } from "../../hooks/useAppFeedback";
import { getScoutingOnboardingPostLoginPath } from "../../recruiters-mfe/onboarding/onboardingStorage";

const GoogleIcon = (): React.ReactElement => (
  <svg aria-hidden="true" className="google-icon" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.97-4.32 2.97-7.29Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.96-.9 6.61-2.48l-3.24-2.52c-.9.6-2.05.96-3.37.96-2.59 0-4.78-1.75-5.56-4.1H3.09v2.6A9.99 9.99 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.44 13.86A5.99 5.99 0 0 1 6.13 12c0-.65.11-1.28.31-1.86v-2.6H3.09A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.09 4.46l3.35-2.6Z"
    />
    <path
      fill="#EA4335"
      d="M12 6.04c1.47 0 2.78.5 3.82 1.5l2.87-2.87C16.95 3.05 14.69 2 12 2a9.99 9.99 0 0 0-8.91 5.54l3.35 2.6c.78-2.35 2.97-4.1 5.56-4.1Z"
    />
  </svg>
);

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { hideLoading, showError, showLoading } = useAppFeedback();

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
      showLoading();
      const data = await loginUser(username, password);
      if (data) {
        const authenticated = login(data.token);
        if (!authenticated) {
          setError("El backend no devolvió un JWT válido.");
          showError("No se pudo iniciar sesión porque el token recibido es inválido.");
          return;
        }
        navigate(getScoutingOnboardingPostLoginPath("/"), { replace: true });
      } else {
        setError("Login fallido. Por favor, intente de nuevo.");
        showError("Login fallido. Por favor, intente de nuevo.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      showError("Error al hacer login. Usuario o contraseña incorrecto.");
    } finally {
      hideLoading();
    }
  };

  const handleGoogleLogin = () => {
    const oauthUrl = getGoogleOAuthLoginUrl("/");
    window.location.assign(oauthUrl);
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
            <button
              type="button"
              className="oauth-button"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon />
              <span>Continuar con Google</span>
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
