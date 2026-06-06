<script setup lang="ts">
definePageMeta({ middleware: "auth" });
const orgsStore = useOrganizationStore();
const birthdaysStore = useBirthdaysStore();
const router = useRouter();

await orgsStore.fetchAll();

const submitting = ref(false);
const error = ref<string | null>(null);

async function handleSubmit(payload: any) {
    if (!orgsStore.activeOrgId) {
        error.value = "Select an orginization first";
        return;
    }
    submitting.value = true;
    error.value = null;
    try {
        const created = await birthdaysStore.create({
            ...payload,
            orgId: orgsStore.activeOrgId,
            savedGifts: [],
        });
        await router.push(`/birthdays/${created.id}`);
    } catch (e: any) {
        error.value = e?.statusMessage || "Failed to create";
    } finally {
        submitting.value = false;
    }
}

function handleCancel() {
    router.push("/birthdays");
}
</script>

<template>
    <section>
        <p><NuxtLink to="/birthdays">← All birthdays</NuxtLink></p>
        <h1>Add birthday</h1>

        <p v-if="error" role="alert">{{ error }}</p>

        <BirthdayForm
            submit-label="Create"
            :submitting="submitting"
            @submit="handleSubmit"
            @cancel="handleCancel"
        />
    </section>
</template>
