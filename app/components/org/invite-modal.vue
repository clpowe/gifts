<script setup lang="ts">
import { useOrganizationStore } from "~/stores/organizations";

const props = defineProps<{
    orgId: string;
}>();
const emit = defineEmits<{
    invited: [];
}>();

const orgs = useOrganizationStore();
const dialog = ref<HTMLDialogElement | null>(null);

const email = ref("");
const role = ref<"member" | "admin">("member");
const submitting = ref(false);
const error = ref<string | null>(null);

function open() {
    error.value = null;
    email.value = "";
    role.value = "member";
    dialog.value?.showModal();
}

function close() {
    dialog.value?.close();
}
async function submit() {
    error.value = null;
    if (!email.value) {
        error.value = "Email is required";
        return;
    }
    submitting.value = true;
    try {
        await orgs.invite(props.orgId, email.value.trim(), role.value);
        close();
        emit("invited");
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <button type="button" @click="open">Invite member</button>
    <dialog ref="dialog">
        <form @submit.prevent="submit">
            <h2>Invite a family member</h2>
            <p>They'll get an email with a link to join.</p>

            <div>
                <label for="invite-email">Email</label>
                <br />
                <input
                    id="invite-email"
                    v-model="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                />
            </div>

            <div>
                <label for="invite-role">Role</label>
                <br />
                <select id="invite-role" v-model="role">
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <p v-if="error">
                <strong>{{ error }}</strong>
            </p>

            <div>
                <button type="button" @click="close">Cancel</button>
                <button type="submit" :disabled="submitting">
                    {{ submitting ? "Sending..." : "Send invite" }}
                </button>
            </div>
        </form>
    </dialog>
</template>
