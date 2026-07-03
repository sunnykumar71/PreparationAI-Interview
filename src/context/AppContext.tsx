import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

interface AppContextType {
  token: string | null;
  user: User | null;
  theme: "light" | "dark";
  login: (token: string, user: User) => void;
  logout: () => void;
  toggleTheme: () => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark"); // Defaulting to professional elegant dark mode
  const [loading, setLoading] = useState(true);

  // Sync theme to root class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Load user profile if token exists on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await fetch("/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.error("Failed to load user profile:", err);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <AppContext.Provider value={{ token, user, theme, login, logout, toggleTheme, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
