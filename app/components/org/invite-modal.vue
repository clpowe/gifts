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
const role = ref<"member" | "owner">("member");
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
