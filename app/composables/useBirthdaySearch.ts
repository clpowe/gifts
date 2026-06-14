const query = ref("");

export function useBirthdaySearch() {
  const birthdayStore = useBirthdaysStore();
  const orgsStore = useOrganizationStore();

  async function ensureLoaded() {
    if (orgsStore.activeOrgId) {
      await birthdayStore.fetchForOrg(orgsStore.activeOrgId);
    }
  }

  const results = computed(() => {
    const q = query.value.trim().toLocaleLowerCase();
    if (!q) return [];
    return birthdayStore.upcoming
      .filter((b) =>
        [b.name, b.relation, ...b.interests]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  });

  function clear() {
    query.value = "";
  }

  return { query, results, ensureLoaded, clear };
}
