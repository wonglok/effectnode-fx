import { create } from "zustand";

export const usePopStore = create(() => {
  return {
    projects: [],
  };
});
