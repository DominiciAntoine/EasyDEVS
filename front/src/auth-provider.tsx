import { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextProps {
  user: any | null;
  token: string | null | undefined;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null | undefined>(undefined); // Stocké en mémoire
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Rafraîchir le token via l'API
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include", // Inclut les cookies dans la requête
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        throw new Error("Impossible de rafraîchir le token.");
      }

      const { accessToken } = await response.json();
      setToken(accessToken); // Stocke le token en mémoire
      return accessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Erreur lors de la récupération des informations utilisateur.");
          }

          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Erreur d'initialisation de l'authentification :", error);
      } finally {
        setIsLoading(false); // Une fois la vérification terminée
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_AUTH_LOGIN_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Inclut les cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Identifiants incorrects.");
        }
        throw new Error("Erreur lors de la connexion.");
      }

      const { accessToken, user } = await response.json();
      setToken(accessToken); // Stocke en mémoire
      setUser(user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    console.log("Payload:", { email, password });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_AUTH_REGISTER_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Cet utilisateur existe déjà.");
        }
        throw new Error("Erreur lors de l'inscription.");
      }

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch((error) => console.error("Error during logout:", error));
  };

  return (
    <AuthContext.Provider value={{ user, token, isInitialized: token !== undefined, isAuthenticated: !!token, isLoading, login, register, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;