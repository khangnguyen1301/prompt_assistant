import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: false,

      toggleDarkMode: () =>
        set((state) => {
          const newIsDark = !state.isDarkMode;
          // Apply theme to document
          if (newIsDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { isDarkMode: newIsDark };
        }),

      setDarkMode: (isDark: boolean) =>
        set(() => {
          // Apply theme to document
          if (isDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { isDarkMode: isDark };
        }),
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        // Apply theme when store is rehydrated
        if (state?.isDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    }
  )
);
