import { defineStore } from "pinia";

type State = {
  byBirthdayId: Record<
    string,
    { summary: string; ideas: GiftIdea[] } | undefined
  >;
  loadingId: string | null;
  error: string | null;
};

export const useGiftsStore = defineStore("gifts", {
  state: (): State => ({
    byBirthdayId: {},
    loadingId: null,
    error: null,
  }),

  getters: {
    for: (state) => (birthdayId: string) =>
      state.byBirthdayId[birthdayId] ?? { summary: "", ideas: [] },
    isLoading: (state) => (birthdayId: string) =>
      state.loadingId === birthdayId,
  },

  actions: {
    async generate(birthdayId: string, body: GiftGenerationRequest = {}) {
      this.loadingId = birthdayId;
      this.error = null;
      try {
        const res = await $fetch<GiftGenerationResponse>(
          `/api/birthdays/${birthdayId}/gifts`,
          { method: "POST", body },
        );
        this.byBirthdayId[birthdayId] = {
          summary: res.summary,
          ideas: res.giftIdeas,
        };
        return res;
      } catch (err: any) {
        this.error = err?.statusMessage || err?.message || "Failed to generate";
        throw err;
      } finally {
        this.loadingId = null;
      }
    },

    clear(birthdayId: string) {
      delete this.byBirthdayId[birthdayId];
    },

    reset() {
      this.byBirthdayId = {};
      this.loadingId = null;
      this.error = null;
    },
  },
});
