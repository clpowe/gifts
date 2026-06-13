<script setup lang="ts">
definePageMeta({
    middleware: "auth",
});

const orgsStore = useOrganizationStore();
const birthdaysStore = useBirthdaysStore();

const upcoming = computed(() => birthdaysStore.upcoming.slice(0, 3));

onMounted(async () => {
    orgsStore.hydrateFromStorage();
    if (!orgsStore.initialized) await orgsStore.fetchAll();
    if (orgsStore.activeOrgId) {
        await birthdaysStore.fetchForOrg(orgsStore.activeOrgId);
    }
});

watch(
    () => orgsStore.activeOrgId,
    async (newId, oldId) => {
        if (!newId || newId === oldId) return;
        birthdaysStore.reset();
        await birthdaysStore.fetchForOrg(newId);
    },
);
</script>

<template>
    <section>
        <h1>Gifts</h1>
        <p v-if="!orgsStore.hasOrgs">
            <NuxtLink to="/organizations/new"
                >Create your first organization</NuxtLink
            >
            to get started.
        </p>
        <template v-else>
            <h2>Upcoming birthdays</h2>

            <AppSkeleton
                v-if="birthdaysStore.loadingOrgId && !upcoming.length"
                :lines="3"
            />

            <p v-else-if="!upcoming.length">
                No birthdays yet.
                <NuxtLink to="/birthdays/new">Add the first one</NuxtLink>.
            </p>

            <ul v-else>
                <BirthdayListItem
                    v-for="b in upcoming"
                    :key="b.id"
                    :birthday="b"
                />
            </ul>

            <p><NuxtLink to="/birthdays">View all birthdays</NuxtLink></p>
        </template>
    </section>
</template>
