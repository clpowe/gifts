<script setup lang="ts">
definePageMeta({
    middleware: "auth",
});

const orgsStore = useOrganizationStore();
const birthdaysStore = useBirthdaysStore();

await orgsStore.fetchAll();

watch(
    () => orgsStore.activeOrgId,
    async (newId, oldId) => {
        if (!newId) return;
        if (newId && newId !== oldId) {
            birthdaysStore.reset();
            await birthdaysStore.fetchForOrg(newId);
        }
    },
    { immediate: true },
);
</script>

<template>
    <section>
        <header>
            <h1>Birthdays</h1>
            <div><NuxtLink to="/birthdays/new">Add birthday</NuxtLink></div>
        </header>

        <div v-if="!orgsStore.activeOrgId">
            <NuxtLink to="/organizations/new"
                >Create or select an organization</NuxtLink
            >
            first.
        </div>

        <AppSkeleton v-else-if="birthdaysStore.loadingOrgId" :lines="5" />

        <p v-else-if="birthdaysStore.error" role="alert">
            {{ birthdaysStore.error }}
        </p>

        <p v-else-if="birthdaysStore.list.length === 0">
            No birthdays yet.
            <NuxtLink to="/birthdays/new">Add the first one</NuxtLink>.
        </p>

        <ul v-else>
            <BirthdayListItem
                v-for="b in birthdaysStore.upcoming"
                :key="b.id"
                :birthday="b"
            />
        </ul>
    </section>
</template>
