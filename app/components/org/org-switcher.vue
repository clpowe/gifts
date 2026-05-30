<script setup lang="ts">
import { useOrganizationStore } from "@/stores/organizations";

const orgs = useOrganizationStore();

onMounted(async () => {
    orgs.hydrateFromStorage();
    if (!orgs.initialized) await orgs.fetchAll();
});

async function onChange(e: Event) {
    const orgId = (e.target as HTMLSelectElement).value;
    if (!orgId) return;
    await orgs.setActive(orgId);
    await reloadNuxtApp({ persistState: false });
}
</script>

<template>
    <div v-if="orgs.hasOrgs">
        <label>
            Active family:
            <select :value="orgs.activeOrgId ?? ''" @change="onChange">
                <option value="" disabled>Select a family</option>
                <option
                    v-for="org in orgs.organizations"
                    :key="org.id"
                    :value="org.id"
                >
                    {{ org.name }}
                </option>
            </select>
        </label>
        <NuxtLink to="/organizations/new">New family</NuxtLink>
        <NuxtLink
            v-if="orgs.activeOrg"
            :to="`/organizations/${orgs.activeOrg.id}/settings`"
        >
            Settings
        </NuxtLink>
    </div>
    <div v-else>
        <p>You are not part of any families yet.</p>
        <NuxtLink to="/organizations/new">Create a family</NuxtLink>
    </div>
</template>
