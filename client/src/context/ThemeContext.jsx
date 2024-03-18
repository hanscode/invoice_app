import { useState, useEffect, createContext } from "react";

import PropTypes from "prop-types";

// Create a ThemeContext
const ThemeContext = createContext();

// Define a ThemeProvider component
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.theme;
    if (storedTheme === "dark" || storedTheme === "light") {
      return storedTheme;
    } else {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "system"
        : "light";
    }
  });

  useEffect(() => {
    if (theme === "system") {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    localStorage.theme = theme;
  }, [theme]);

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  return (
    // Provide the theme state and theme change function
    <ThemeContext.Provider value={{ theme, handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };

// run props validation
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};