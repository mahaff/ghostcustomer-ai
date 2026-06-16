import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Persona } from "@/lib/ghost.functions";

export type ChatTurn =
  | { role: "user"; content: string }
  | { role: "panel"; replies: { name: string; response: string }[] };

interface GhostState {
  product: string;
  customer: string;
  personas: Persona[];
  chat: ChatTurn[];
  setBrief: (product: string, customer: string) => void;
  setPersonas: (personas: Persona[]) => void;
  addUserTurn: (content: string) => void;
  addPanelTurn: (replies: { name: string; response: string }[]) => void;
  reset: () => void;
}

export const useGhostStore = create<GhostState>()(
  persist(
    (set) => ({
      product: "",
      customer: "",
      personas: [],
      chat: [],
      setBrief: (product, customer) => set({ product, customer }),
      setPersonas: (personas) => set({ personas, chat: [] }),
      addUserTurn: (content) =>
        set((s) => ({ chat: [...s.chat, { role: "user", content }] })),
      addPanelTurn: (replies) =>
        set((s) => ({ chat: [...s.chat, { role: "panel", replies }] })),
      reset: () => set({ product: "", customer: "", personas: [], chat: [] }),
    }),
    {
      name: "ghost-customer",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : (undefined as never),
      ),
    },
  ),
);
