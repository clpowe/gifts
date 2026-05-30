<script setup lang="ts">
import { signIn, signOut, useSession } from "@/lib/auth-client";

definePageMeta({ layout: false });

const { data: session } = await useSession(useFetch);

watchEffect(() => {
    if (session.value?.user) {
        navigateTo("/");
    }
});

async function loginWithGoogle() {
    await signIn.social({
        provider: "google",
        callbackURL: "/",
    });
}
</script>

<template>
    <div>
        <h1>Sign In</h1>
        <p>Sign in with Google to continue.</p>
        <button @click="loginWithGoogle">Sign In with Google</button>
    </div>
</template>
