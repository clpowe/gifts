<script setup lang="ts">
import { authClient, signOut } from "~/lib/auth-client";

const { data: session } = await authClient.useSession(useFetch);

async function handleSignOut() {
    await signOut();
    await navigateTo("/login");
}
</script>

<template>
    <div>
        <header>
            <nav>
                <NuxtLink to="/"><strong>Gifts</strong></NuxtLink>
                <OrgSwitcher v-if="session?.user" />
                <span v-if="session?.user">
                    {{ session.user.email }}
                    <button type="button" @click="handleSignOut">
                        Sign out
                    </button>
                </span>
            </nav>
            <hr />
        </header>
        <main>
            <slot />
        </main>
    </div>
</template>
