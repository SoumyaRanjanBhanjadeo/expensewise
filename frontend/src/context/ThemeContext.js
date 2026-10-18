import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_STORAGE_KEY = "@expensewise_theme_pref";

export const themeColors = {
  light: {
    isDark: false,
    background: "#EEF4F1",
    card: "#FFFFFF",
    cardBorder: "#E3EDE7",
    cardShadow: "rgba(15, 70, 52, 0.05)",
    textPrimary: "#0F4634",
    textSecondary: "#1F382C",
    textMuted: "#52796F",
    subtleBg: "#F4F9F6",
    inputBg: "#F8FAF9",
    inputBorder: "#DCE7E1",
    activeBorder: "#10B981",
    accent: "#10B981",
    accentDark: "#0F4634",
    divider: "#E3EDE7",
    toggleBg: "#FFFFFF",
    toggleBorder: "#DCE7E1",
    toggleIcon: "#0F4634",
    statusBarStyle: "dark-content",
  },
  dark: {
    isDark: true,
    background: "#021812",
    card: "#04281E",
    cardBorder: "rgba(16, 185, 129, 0.2)",
    cardShadow: "rgba(0, 0, 0, 0.35)",
    textPrimary: "#FFFFFF",
    textSecondary: "#E2F2EB",
    textMuted: "#8EB7A4",
    subtleBg: "#031E16",
    inputBg: "#021A13",
    inputBorder: "rgba(16, 185, 129, 0.25)",
    activeBorder: "#34D399",
    accent: "#10B981",
    accentDark: "#059669",
    divider: "rgba(16, 185, 129, 0.15)",
    toggleBg: "#04281E",
    toggleBorder: "rgba(16, 185, 129, 0.3)",
    toggleIcon: "#F59E0B",
    statusBarStyle: "light-content",
  },
};

const ThemeContext = createContext({
  themePreference: "light", // "light" | "dark" | "system"
  isDarkMode: false,
  setThemePreference: async () => {},
  toggleTheme: async () => {},
  colors: themeColors.light,
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themePreference, setPreferenceState] = useState("light");
  const [isReady, setIsReady] = useState(false);

  // Load saved preference on mount; default is "light"
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "dark" || saved === "system" || saved === "light") {
          setPreferenceState(saved);
        } else {
          setPreferenceState("light"); // Default is light
        }
      } catch (e) {
        console.warn("Could not load theme preference:", e);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setThemePreference = async (pref) => {
    if (pref !== "light" && pref !== "dark" && pref !== "system") return;
    setPreferenceState(pref);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch (e) {
      console.warn("Could not save theme preference:", e);
    }
  };

  // Determine active dark mode:
  // - "system": use device scheme
  // - "dark": always dark
  // - "light": always light (default)
  const isDarkMode =
    themePreference === "system"
      ? systemScheme === "dark"
      : themePreference === "dark";

  // Quick toggle between light and dark
  const toggleTheme = async () => {
    const next = isDarkMode ? "light" : "dark";
    await setThemePreference(next);
  };

  const colors = isDarkMode ? themeColors.dark : themeColors.light;

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        isDarkMode,
        setThemePreference,
        toggleTheme,
        colors,
        isReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
