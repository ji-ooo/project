import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SideBarState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
}

export const useSideBarStore = create(
  persist<SideBarState>(
    (set) => ({
      isOpen: false,
      setIsOpen: (value) => set({ isOpen: value }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    { name: "sidebar-storage" },
  ),
);
