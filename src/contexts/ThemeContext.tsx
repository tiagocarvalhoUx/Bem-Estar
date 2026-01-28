import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";

export interface Theme {
  background: string;
  card: string;
  cardSecondary: string;
  text: string;
  textSecondary: string;
  border: string;
  inputBg: string;
  gradient1: string;
  gradient2: string;
}

interface ThemeContextType {
  theme: Theme;
  darkMode: boolean;
  toggleDarkMode: (value: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(
    user?.preferences?.darkMode ?? false,
  );

  // Atualizar quando as preferências do usuário mudarem
  useEffect(() => {
    if (user?.preferences?.darkMode !== undefined) {
      setDarkMode(user.preferences.darkMode);
    }
  }, [user?.preferences?.darkMode]);

  const theme: Theme = {
    background: darkMode ? "#0f172a" : "#f8fafc",
    card: darkMode ? "#1e293b" : "#ffffff",
    cardSecondary: darkMode ? "#334155" : "#fafafa",
    text: darkMode ? "#f1f5f9" : "#1e293b",
    textSecondary: darkMode ? "#cbd5e1" : "#64748b",
    border: darkMode ? "#475569" : "#e2e8f0",
    inputBg: darkMode ? "#334155" : "#f8fafc",
    gradient1: darkMode ? "#1e293b" : "#eff6ff",
    gradient2: darkMode ? "#0f172a" : "#ffffff",
  };

  const toggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
  };

  return (
    <ThemeContext.Provider value={{ theme, darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return context;
};
