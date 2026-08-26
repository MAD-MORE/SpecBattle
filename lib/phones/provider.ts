import { phoneCatalog } from "@/lib/phones/catalog";
import type { Phone } from "@/types/battle";

export interface PhoneProvider { search(query: string): Promise<Phone[]>; get(id: string): Promise<Phone | undefined>; }

export const catalogProvider: PhoneProvider = {
  async search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return phoneCatalog;
    return phoneCatalog.filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(q));
  },
  async get(id) { return phoneCatalog.find((p) => p.id === id); },
};

// Future live providers can implement PhoneProvider (for example a licensed device API)
// without changing the battle engine or UI.
