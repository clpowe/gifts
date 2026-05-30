<script setup lang="ts">
import { useSession, signOut } from "@/lib/auth-client";

const { data: session } = await useSession(useFetch);

async function handleSignOut() {
    await signOut();
    await navigateTo("/login");
}
</script>

<template>
    <div>
        <h1>Hello, {{ session?.user?.name }}</h1>
        <p>{{ session?.user?.email }}</p>
        <button @click="handleSignOut">Sign out</button>
    </div>
</template>
