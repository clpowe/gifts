<script setup lang="ts">
import { authClient } from "~/lib/auth-client";

definePageMeta({
    middleware: ["auth"],
});

const route = useRoute();
const orgs = useOrganizationStore();
const orgId = route.params.orgId as string;

const { data: session } = await authClient.useSession(useFetch);

const {
    data: org,
    refresh,
    pending,
    error: loadError,
} = await useFetch<FullOrg>(`/api/organizations/${orgId}`);

const name = ref(org.value?.name ?? "");
watch(
    () => org.value?.name,
    (newName) => newName && (name.value = newName),
);

const myRole = computed(
    () =>
        org.value?.members.find((m) => m.userId === session.value?.user?.id)
            ?.role,
);

const isOwner = computed(() => myRole.value === "owner");

const renaming = ref(false);
const renameError = ref<string | null>(null);

async function rename() {
    renameError.value = null;
    if (!name.value.trim() || name.value === org.value?.name) return;
    renaming.value = true;
    try {
        await orgs.rename(orgId, name.value.trim());
        await refresh();
    } catch (e: any) {
        renameError.value = e?.data?.statusMessage ?? "Rename failed";
    } finally {
        renaming.value = false;
    }
}

const deleting = ref(false);
async function remove() {
    if (
        !confirm(
            `Delete "${org.value?.name}"? This permanently removes all birthdays, members, and invitations.`,
        )
    ) {
        return;
    }

    deleting.value = true;
    try {
        await orgs.remove(orgId);
        await navigateTo("/");
    } finally {
        deleting.value = false;
    }
}
</script>

<template>
    <section>
        <p v-if="pending">Loading...</p>
        <p v-else-if="loadError">
            <strong>Failed to load:</strong>
            {{ loadError.statusMessage ?? loadError.message }}
        </p>

        <template v-else-if="org">
            <h1>{{ org.name }}</h1>
            <p>Family settings</p>
            <hr />
            <!-- Rename -->
            <h2>Name</h2>
            <div>
                <input v-model="name" :disabled="!isOwner" />
                <button
                    @click="rename"
                    :disabled="
                        !isOwner ||
                        renaming ||
                        name === org.name ||
                        !name.trim()
                    "
                >
                    Save
                </button>
            </div>
            <p v-if="!isOwner"><small>Only the owner can rename</small></p>
            <p v-if="renameError">
                <strong>
                    {{ renameError }}
                </strong>
            </p>

            <hr />

            <!-- Members -->
            <h2>Members</h2>
            <OrgInviteModal
                v-if="isOwner || myRole === 'admin'"
                :org-id="orgId"
                @invited="refresh()"
            />
            <OrgMemberList
                :members="org.members"
                :current-user-id="session?.user?.id ?? ''"
            />

            <!-- Pending invitations -->
            <template v-if="org.invitations.length">
                <hr />
                <h2>Pending invitations</h2>
                <ul>
                    <li v-for="inv in org.invitations" :key="inv.id">
                        {{ inv.email }} — <em>{{ inv.role }}</em> —
                        {{ inv.status }} — expires
                        {{ new Date(inv.expiresAt).toLocaleDateString() }}
                    </li>
                </ul>
            </template>

            <!-- Danger zone -->
            <template v-if="isOwner">
                <hr />
                <h2>Danger zone</h2>
                <p>
                    Deleting this family permanently removes all birthdays,
                    members, and invitations. This cannot be undone.
                </p>
                <button :disabled="deleting" @click="remove">
                    {{ deleting ? "Deleting..." : "Delete family" }}
                </button>
            </template>
        </template>
    </section>
</template>
