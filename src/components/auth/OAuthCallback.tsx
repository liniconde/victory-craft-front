import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAppFeedback } from "../../hooks/useAppFeedback";

const OAuthCallback: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useAppFeedback();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));

    const token = query.get("token") || hash.get("token");
    const oauthError = query.get("error") || hash.get("error");
    const returnTo = query.get("return_to") || "/";

    if (oauthError) {
      showError(`Error OAuth: ${oauthError}`);
      navigate("/login", { replace: true });
      return;
    }

    if (!token) {
      showError("No se recibió token OAuth.");
      navigate("/login", { replace: true });
      return;
    }

    login(token);
    navigate(returnTo, { replace: true });
  }, [location.hash, location.search, login, navigate, showError]);

  return <p className="text-center py-6">Procesando autenticación OAuth...</p>;
};

export default OAuthCallback;
