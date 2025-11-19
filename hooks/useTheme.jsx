import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const lightColors = {
  bg: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  primary: "#9fcfb5",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  shadow: "#000000",
  backgrounds: {
    input: "#ffffff",
    editInput: "#ffffff",
  },
  statusBarStyle: "dark-content",
};

const darkColors = {
  bg: "#0f172a",
  surface: "#1e293b",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  border: "#334155",
  primary: "#9fcfb5",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  shadow: "#000000",
  backgrounds: {
    input: "#1e293b",
    editInput: "#0f172a",
  },
  statusBarStyle: "light-content",
};

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("darkMode").then((value) => {
      if (value) setIsDarkMode(JSON.parse(value));
    });
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem("darkMode", JSON.stringify(newMode));
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default useTheme;
