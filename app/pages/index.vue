<script setup lang="ts">
import { format } from "@formkit/tempo";

definePageMeta({
    middleware: "auth",
});

const orgsStore = useOrganizationStore();
const birthdaysStore = useBirthdaysStore();

const featured = computed(() => birthdaysStore.upcoming[0] ?? null);
const rest = computed(() => birthdaysStore.upcoming.slice(1, 4));

const featuredDate = computed(() =>
    featured.value ? format(featured.value.nextBirthday, { date: "long" }) : "",
);

const featuredCountdown = computed(() => {
    if (!featured.value) return "";
    const d = featured.value.daysUntil;
    if (d === 0) return "Today! 🎉";
    if (d === 1) return "Tomorrow";
    return `In ${d} days`;
});

const featuredTurning = computed(() => {
    const b = featured.value;
    if (!b || b.age === null) return null;
    return b.daysUntil === 0 ? b.age : b.age + 1;
});

const milestones = computed(() =>
    birthdaysStore.upcoming.filter((b) => b.milestone),
);

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
            <AppSkeleton
                v-if="birthdaysStore.loadingOrgId && !featured"
                :lines="4"
            />

            <p v-else-if="!featured">
                No birthdays yet.
                <NuxtLink to="/birthdays/new">Add the first one</NuxtLink>.
            </p>

            <template v-else>
                <NuxtLink
                    :to="`/birthdays/${featured.id}`"
                    class="featured"
                    :class="{
                        'is-today': featured.daysUntil === 0,
                        'is-this-week':
                            featured.daysUntil > 0 && featured.daysUntil <= 7,
                    }"
                >
                    <span class="featured__eyebrow">Next up</span>
                    <span class="featured__name">{{ featured.name }}</span>
                    <span class="featured__relation">{{
                        featured.relation
                    }}</span>
                    <span class="featured__countdown">{{
                        featuredCountdown
                    }}</span>
                    <span class="featured__date">
                        {{ featuredDate }}
                        <template
                            v-if="
                                featured.includeYear && featuredTurning !== null
                            "
                        >
                            · turns {{ featuredTurning }}
                        </template>
                    </span>
                </NuxtLink>

                <section v-if="milestones.length" class="milestones">
                    <h2>🎯 Milestones this year</h2>
                    <ul>
                        <li v-for="b in milestones" :key="b.id">
                            <NuxtLink :to="`/birthdays/${b.id}`">
                                <span class="milestones__label">{{
                                    b.milestone!.label
                                }}</span>
                                <span class="milestones__who">
                                    {{ b.name }} ·
                                    {{
                                        b.daysUntil === 0
                                            ? "today!"
                                            : `in ${b.daysUntil} days`
                                    }}
                                </span>
                            </NuxtLink>
                        </li>
                    </ul>
                </section>

                <template v-if="rest.length">
                    <h2>After that</h2>
                    <ul>
                        <BirthdayListItem
                            v-for="b in rest"
                            :key="b.id"
                            :birthday="b"
                        />
                    </ul>
                </template>

                <p><NuxtLink to="/birthdays">View all birthdays</NuxtLink></p>
            </template>
        </template>
    </section>
</template>
