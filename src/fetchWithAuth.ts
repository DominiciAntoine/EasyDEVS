import { useAuth } from "./auth-provider";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const { token, logout } = useAuth();

  // Ajoute l'en-tête Authorization si un token est disponible
  const addAuthHeader = (headers: HeadersInit) => {
    if (token) {
      return {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return headers;
  };

  const makeRequest = async () => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: addAuthHeader(options.headers || {}),
      });

      if (response.status === 401) {
        // Rafraîchit le token si nécessaire
        const refreshedToken = await refreshAccessToken(); // Utilise la fonction centralisée
        if (refreshedToken) {
          // Refaire la requête avec le token rafraîchi
          return fetch(url, {
            ...options,
            headers: {
              ...addAuthHeader(options.headers || {}),
              Authorization: `Bearer ${refreshedToken}`,
            },
          });
        } else {
          logout(); // Déconnecte l'utilisateur si le refresh échoue
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
      }

      return response;
    } catch (error) {
      console.error("Erreur dans fetchWithAuth :", error);
      throw error;
    }
  };

  if (!token) {
    console.warn("Aucun token disponible. Redirection possible.");
    throw new Error("Token manquant.");
  }

  return makeRequest();
};

// Rafraîchit le token en appelant le AuthProvider
const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshAccessToken } = useAuth();
  return refreshAccessToken();
};