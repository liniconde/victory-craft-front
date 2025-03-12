import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/user/userService"; // 📌 Importamos el servicio para registrar usuarios
import "./register.css"; // 📌 Estilos separados en CSS

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("player"); // 📌 Por defecto es un jugador
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación simple antes de enviar la solicitud
    if (!username || !email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await registerUser({ username, email, password, role });
      console.log("Registro exitoso:", response);
      navigate("/login"); // 📌 Redirigir al login después del registro exitoso
    } catch (error) {
      console.error("Error al registrar:", error);
      setError("Error en el registro. Intenta nuevamente.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Crear Cuenta</h2>
        <form onSubmit={handleRegister} className="register-form">
          {/* Usuario */}
          <div>
            <label htmlFor="username" className="register-label">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="register-input"
              placeholder="Ingresa tu usuario"
            />
          </div>

          {/* Email */}
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

          {/* Contraseña */}
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

          {/* Selección de rol */}
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
              <option value="player">Jugador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Botón de Registro */}
          <button type="submit" className="register-button">
            Registrarse
          </button>

          {/* Mensaje de error */}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;
