"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeProvider() {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    // Apply theme on initial load
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return null; // This component doesn't render anything
}
