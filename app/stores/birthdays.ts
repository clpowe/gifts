import { defineStore } from "pinia";

export type BirthdayDto = {
  id: string;
  orgId: string;
  createdBy: string;
  name: string;
  relation: string;
  birthDate: string;
  includeYear: boolean;
  interests: string[];
  notes: string | null;
  savedGifts: any[];
  createdAt: string;
  updatedAt: string;
  nextBirthday: string;
  daysUntil: number;
  age: number | null;
  nextAge: number | null;
  milestone: { age: number; label: string } | null;
};

export type BirthdayPayload = {
  name: string;
  relation: string;
  birthDate: string;
  includeYear: boolean;
  interests: string[];
  notes: string | null;
  savedGifts: any[];
};

export const useBirthdaysStore = defineStore("birthdays", {
  state: () => ({
    list: [] as BirthdayDto[],
    loadingOrgId: null as string | null,
    loadedOrgId: null as string | null,
    error: null as string | null,
  }),

  getters: {
    upcoming(state): BirthdayDto[] {
      return state.list;
    },
    byId(state) {
      return (id: string) => state.list.find((b) => b.id === id);
    },
  },

  actions: {
    async fetchForOrg(orgId: string, force = false) {
      if (!force && this.loadedOrgId === orgId) return;
      if (this.loadingOrgId === orgId) return;
      this.loadingOrgId = orgId;
      this.error = null;
      try {
        const data = await $fetch<BirthdayDto[]>("/api/birthdays", {
          query: { orgId },
        });
        this.list = data;
        this.loadedOrgId = orgId;
      } catch (err) {
        this.error = (err as Error).message || "Failed to load birthdays";
        throw err;
      } finally {
        this.loadingOrgId = null;
      }
    },

    async create(payload: BirthdayPayload & { orgId: string }) {
      const created = await $fetch<BirthdayDto>("/api/birthdays", {
        method: "POST",
        body: payload,
      });
      this.list = [...this.list, created].sort(
        (a, b) => a.daysUntil - b.daysUntil,
      );
      return created;
    },

    async update(id: string, payload: BirthdayPayload) {
      const updated = await $fetch<BirthdayDto>(`/api/birthdays/${id}`, {
        method: "PUT",
        body: payload,
      });
      this.list = this.list
        .map((b) => (b.id === id ? updated : b))
        .sort((a, b) => a.daysUntil - b.daysUntil);
      return updated;
    },

    async remove(id: string) {
      await $fetch(`/api/birthdays/${id}`, { method: "DELETE" });
      this.list = this.list.filter((b) => b.id !== id);
    },

    reset() {
      this.list = [];
      this.loadingOrgId = null;
      this.loadedOrgId = null;
      this.error = null;
    },
  },
});
