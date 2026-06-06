<script setup lang="ts">
definePageMeta({
    middleware: "auth",
});

const orgsStore = useOrganizationStore();
onMounted(async () => {
    orgsStore.hydrateFromStorage();
    if (!orgsStore.initialized) await orgsStore.fetchAll();
});
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
        <p v-else>
            <NuxtLink to="/birthdays">View birthdays</NuxtLink>
        </p>
    </section>
</template>
