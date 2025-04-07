import React, { createContext, useState } from "react";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const lightColors = {
    background: "#fff",
    text: "#000",
    subtleText: "#555",
    link: "#007BFF",
    card: "#f5f5f5",
    button: "#007BFF",
    buttonText: "#fff",
  };

  const darkColors = {
    background: "#121212",
    text: "#fff",
    subtleText: "#aaa",
    link: "#64b5f6",
    card: "#1e1e1e",
    button: "#555",
    buttonText: "#fff",
  };

  const theme = isDarkMode ? DarkTheme : DefaultTheme;
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
