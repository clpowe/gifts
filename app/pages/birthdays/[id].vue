<script lang="ts" setup>
import { format } from "@formkit/tempo";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const router = useRouter();
const orgsStore = useOrganizationStore();
const birthdaysStore = useBirthdaysStore();

await orgsStore.fetchAll();
if (orgsStore.activeOrgId) {
    await birthdaysStore.fetchForOrg(orgsStore.activeOrgId);
}

watch(
    () => orgsStore.activeOrgId,
    async (newId, oldId) => {
        if (newId && newId !== oldId) {
            birthdaysStore.reset();
            await birthdaysStore.fetchForOrg(newId);
        }
    },
);

const id = computed(() => route.params.id as string);
const birthday = computed(() => birthdaysStore.byId(id.value));

const editing = ref(false);
const submitting = ref(false);
const error = ref<string | null>(null);

const dateLabel = computed(() =>
    birthday.value ? format(birthday.value.nextBirthday, { date: "long" }) : "",
);

const turning = computed(() => {
    if (!birthday.value || birthday.value.age === null) return null;
    return birthday.value.daysUntil === 0
        ? birthday.value.age
        : birthday.value.age + 1;
});

async function handleUpdate(payload: any) {
    if (!birthday.value) return;
    submitting.value = true;
    error.value = null;
    try {
        await birthdaysStore.update(birthday.value.id, {
            ...payload,
            savedGifts: birthday.value.savedGifts,
        });
        editing.value = false;
    } catch (e: any) {
        error.value = e?.statusMessage || "Failed to update";
    } finally {
        submitting.value = false;
    }
}

async function handleDelete() {
    if (!birthday.value) return;
    if (!confirm(`Delete ${birthday.value.name}'s birthday?`)) return;
    try {
        await birthdaysStore.remove(birthday.value.id);
        await router.push("/birthdays");
    } catch (e: any) {
        error.value = e?.statusMessage || "Failed to delete";
    }
}

onBeforeUnmount(() => {
    if (birthday.value) {
        useGiftsStore().clear(birthday.value.id);
    }
});
</script>

<template>
    <section v-if="birthday">
        <p><NuxtLink to="/birthdays">← All birthdays</NuxtLink></p>

        <template v-if="!editing">
            <h1>{{ birthday.name }}</h1>
            <p>{{ birthday.relation }}</p>

            <p>
                Next birthday: <strong>{{ dateLabel }}</strong> ({{
                    birthday.daysUntil === 0
                        ? "today!"
                        : `in ${birthday.daysUntil} days`
                }})
            </p>

            <p v-if="birthday.includeYear && turning !== null">
                Turning {{ turning }}
            </p>

            <section v-if="birthday.interests.length">
                <h2>Interests</h2>
                <ul>
                    <li v-for="i in birthday.interests" :key="i">{{ i }}</li>
                </ul>
            </section>

            <section v-if="birthday.notes">
                <h2>Notes</h2>
                <pre>{{ birthday.notes }}</pre>
            </section>

            <GiftSavedGiftsList
                :birthday-id="birthday.id"
                :gifts="birthday.savedGifts"
            />

            <GiftGenerator :birthday-id="birthday.id" />
            <p>
                <button type="button" @click="editing = true">Edit</button>
                <button type="button" @click="handleDelete">Delete</button>
            </p>
        </template>

        <template v-else>
            <h1>Editing {{ birthday.name }}</h1>
            <p v-if="error" role="alert">{{ error }}</p>
            <BirthdayForm
                :initial-value="{
                    name: birthday.name,
                    relation: birthday.relation,
                    birthDate: birthday.birthDate,
                    includeYear: birthday.includeYear,
                    interests: birthday.interests,
                    notes: birthday.notes,
                }"
                submit-label="Save changes"
                :submitting="submitting"
                @submit="handleUpdate"
                @cancel="editing = false"
            />
        </template>
    </section>

    <section v-else>
        <p v-if="birthdaysStore.loadingOrgId">Loading…</p>
        <template v-else>
            <p>Birthday not found.</p>
            <p><NuxtLink to="/birthdays">Back to list</NuxtLink></p>
        </template>
    </section>
</template>
