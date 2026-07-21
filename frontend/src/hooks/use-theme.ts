import { useState } from "react";

import { applyTheme, getInitialTheme, type Theme } from "@/lib/theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  function setTheme(next: Theme) {
    setThemeState(next);
    applyTheme(next);
  }

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
