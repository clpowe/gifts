<script setup lang="ts">
import { authClient, signIn } from "~/lib/auth-client";

definePageMeta({ layout: false });

const route = useRoute();
const { data: session } = await authClient.useSession(useFetch);

watchEffect(() => {
    if (session.value?.user) {
        const redirect = (route.query.redirect as string) || "/";
        navigateTo(redirect);
    }
});

async function loginWithGoogle() {
    await signIn.social({
        provider: "google",
        callbackURL: (route.query.redirect as string) || "/",
    });
}
</script>

<template>
    <section>
        <h1>Sign in</h1>
        <p>Continue with your Google account.</p>
        <button type="button" @click="loginWithGoogle">
            Continue with Google
        </button>
    </section>
</template>
