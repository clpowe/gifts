<script setup lang="ts">
import { authClient } from "~/lib/auth-client";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const orgsStore = useOrganizationStore();

const invitationId = route.params.id as string;
const status = ref<"loading" | "accepted" | "error">("loading");
const errorMessage = ref("");

onMounted(async () => {
    const { data, error } = await authClient.organization.acceptInvitation({
        invitationId,
    });

    if (error) {
        status.value = "error";
        errorMessage.value =
            error.message ?? "Invitation is invalid or expired.";
        return;
    }

    status.value = "accepted";
    setTimeout(() => navigateTo("/birthdays"), 1500);
});
</script>

<template>
    <section>
        <h1>Family invitation</h1>

        <p v-if="status === 'loading'">Joining family group…</p>

        <p v-else-if="status === 'accepted'">
            You're in! Redirecting to birthdays…
        </p>

        <template v-else>
            <p role="alert">{{ errorMessage }}</p>
            <p><NuxtLink to="/">Go home</NuxtLink></p>
        </template>
    </section>
</template>
