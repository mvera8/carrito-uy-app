import { createContext, useContext, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DARKMODE_KEY = "@dark_ode";

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
  statusBarStyle: "dark",
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
  statusBarStyle: "light",
};

const appNumbers = {
	appPadding: 20,
	cardRadius: 8,
	marginBottom: 10,
};

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
	const insets = useSafeAreaInsets();

  useEffect(() => {
    AsyncStorage.getItem(DARKMODE_KEY).then((value) => {
      if (value) setIsDarkMode(JSON.parse(value));
    });
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem(DARKMODE_KEY, JSON.stringify(newMode));
  };

  const colors = { ...appNumbers, ...(isDarkMode ? darkColors : lightColors) };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors, insets }}>
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
