import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAppFeedback } from "../../hooks/useAppFeedback";
import { getScoutingOnboardingPostLoginPath } from "../../recruiters-mfe/onboarding/onboardingStorage";

const OAuthCallback: React.FC = () => {
  const { login, setUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useAppFeedback();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));

    const token = query.get("token") || hash.get("token");
    const oauthError = query.get("error") || hash.get("error");
    const returnTo = query.get("return_to") || "/";
    const firstName =
      query.get("firstName") ||
      query.get("given_name") ||
      hash.get("firstName") ||
      hash.get("given_name");
    const lastName =
      query.get("lastName") ||
      query.get("family_name") ||
      hash.get("lastName") ||
      hash.get("family_name");
    const fullName =
      query.get("name") ||
      hash.get("name");

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

    const authenticated = login(token);
    if (!authenticated) {
      showError("Se recibió un token OAuth inválido.");
      navigate("/login", { replace: true });
      return;
    }

    if (firstName || lastName || fullName) {
      setUserProfile({ firstName, lastName, fullName });
    }

    navigate(getScoutingOnboardingPostLoginPath(returnTo), { replace: true });
  }, [location.hash, location.search, login, navigate, setUserProfile, showError]);

  return <p className="text-center py-6">Procesando autenticación OAuth...</p>;
};

export default OAuthCallback;
