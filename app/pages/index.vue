<script setup lang="ts">
definePageMeta({
    middleware: "auth",
});

const orgs = useOrganizationStore();
onMounted(async () => {
    orgs.hydrateFromStorage();
    if (!orgs.initialized) await orgs.fetchAll();
});
</script>

<template>
    <section>
        <p v-if="!orgs.initialized">Loading...</p>

        <template v-else-if="!orgs.hasOrgs">
            <h1>Welcome</h1>
            <p>Create a family to start tracking birthdays.</p>
            <p>
                <NuxtLink to="/organizations/new"
                    >Create your first family</NuxtLink
                >
            </p>
        </template>

        <p v-else-if="!orgs.activeOrg">
            Select a family from the menu above to get started.
        </p>

        <template v-else>
            <h1>{{ orgs.activeOrg.name }}</h1>
            <p>Dashboard coming in Step 8.</p>
        </template>
    </section>
</template>
