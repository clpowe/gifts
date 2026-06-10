import type { GiftIdea } from "~/stores/gifts";

export function useGiftGeneration(birthdayId: Ref<string> | string) {
  const id = computed(() =>
    typeof birthdayId === "string" ? birthdayId : birthdayId.value,
  );
  const giftsStore = useGiftsStore();
  const birthdayStore = useBirthdaysStore();

  const result = computed(() => giftsStore.for(id.value));
  const loading = computed(() => giftsStore.isLoading(id.value));
  const error = computed(() => giftsStore.error);

  async function generate(opts: { vibe?: string; budget?: string }) {
    return giftsStore.generate(id.value, opts);
  }

  async function saveIdea(idea: GiftIdea) {
    const birthday = birthdayStore.byId(id.value);
    if (!birthday) throw new Error("Birthday not loaded");

    const already = birthday.savedGifts.some((g: GiftIdea) => g.id === idea.id);
    if (already) return;

    await birthdayStore.update(id.value, {
      name: birthday.name,
      relation: birthday.relation,
      birthDate: birthday.birthDate,
      includeYear: birthday.includeYear,
      interests: birthday.interests,
      notes: birthday.notes,
      savedGifts: [...birthday.savedGifts, idea],
    });
  }

  async function removeSaved(ideaId: string) {
    const birthday = birthdayStore.byId(id.value);
    if (!birthday) return;
    await birthdayStore.update(id.value, {
      name: birthday.name,
      relation: birthday.relation,
      birthDate: birthday.birthDate,
      includeYear: birthday.includeYear,
      interests: birthday.interests,
      notes: birthday.notes,
      savedGifts: birthday.savedGifts.filter((g: GiftIdea) => g.id !== ideaId),
    });
  }

  function clear() {
    giftsStore.clear(id.value);
  }
  return {
    result,
    loading,
    error,
    generate,
    saveIdea,
    removeSaved,
    clear,
  };
}
