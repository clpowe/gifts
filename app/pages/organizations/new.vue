<script setup lang="ts">
import { useOrganizationStore } from "~/stores/organizations";

definePageMeta({
    middleware: "auth",
});

const orgs = useOrganizationStore();
const router = useRouter();

const name = ref("");
const submitting = ref(false);
const error = ref<string | null>(null);

async function submit() {
    error.value = null;
    if (!name.value.trim()) {
        error.value = "Name is required";
        return;
    }
    submitting.value = true;
    try {
        const org = await orgs.create(name.value.trim());
        await navigateTo(`/organizations/${org.id}/settings`);
    } catch (e: any) {
        error.value = e?.data?.statusMessage ?? "Failed to create family";
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <section>
        <h1>New family</h1>
        <p>Create a group to share birthdays and gift ideas with.</p>

        <form @submit.prevent="submit">
            <p>
                <label>
                    Family name
                    <br />
                    <input
                        v-model="name"
                        placeholder="The Powes"
                        autofocus
                        required
                    />
                </label>
            </p>

            <p v-if="error">
                <strong>{{ error }}</strong>
            </p>

            <p>
                <button type="submit" :disabled="submitting">
                    {{ submitting ? "Creating..." : "Create family" }}
                </button>
                <button
                    v-if="orgs.hasOrgs"
                    type="button"
                    @click="router.back()"
                >
                    Cancel
                </button>
            </p>
        </form>
    </section>
</template>
