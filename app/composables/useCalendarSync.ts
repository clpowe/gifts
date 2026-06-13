export function useCalendarSync(birthdayId: Ref<string> | string) {
  const id = computed(() =>
    typeof birthdayId === "string" ? birthdayId : birthdayId.value,
  );

  const synced = ref<boolean | null>(null);
  const busy = ref(false);
  const error = ref<string | null>(null);

  async function refresh() {
    try {
      const res = await $fetch<{ synced: boolean }>(
        `/api/birthdays/${id.value}/calendar`,
      );
      synced.value = res.synced;
    } catch {
      synced.value = null;
    }
  }

  async function sync() {
    busy.value = true;
    error.value = null;
    try {
      await $fetch(`/api/birthdays/${id.value}/calendar`, { method: "POST" });
      synced.value = true;
    } catch (err: any) {
      error.value = err?.statusMessage || "Failed to sync";
    } finally {
      busy.value = false;
    }
  }

  async function unsync() {
    busy.value = true;
    error.value = null;
    try {
      await $fetch(`/api/birthdays/${id.value}/calendar`, {
        method: "DELETE",
      });
      synced.value = false;
    } catch (err: any) {
      error.value = err?.statusMessage || "Failed to unsync";
    } finally {
      busy.value = false;
    }
  }

  watch(id, refresh, { immediate: true });

  return { synced, busy, error, sync, unsync, refresh };
}
