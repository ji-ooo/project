import { create } from "zustand";

export const Theme = {
  Light: "light",
  Dark: "dark",
} as const;

interface ThemeState {
  theme: (typeof Theme)[keyof typeof Theme];
  setTheme: (theme: (typeof Theme)[keyof typeof Theme]) => void;
}

const getStoredTheme = (): (typeof Theme)[keyof typeof Theme] => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === Theme.Light || storedTheme === Theme.Dark) {
    return storedTheme;
  }
  return Theme.Light; // Default theme
};

const useThemeStore = create<ThemeState>((set) => ({
  theme: getStoredTheme(),
  setTheme: (theme: (typeof Theme)[keyof typeof Theme]) => {
    set({ theme });
    localStorage.setItem("theme", theme);
  },
}));

export default useThemeStore;
