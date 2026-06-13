<script setup lang="ts">
const props = defineProps<{
    birthdayId: string;
}>();

const id = computed(() => props.birthdayId);
const { synced, busy, error, sync, unsync } = useCalendarSync(id);

const { success, error: toastError } = useToasts();

async function onClick() {
    if (synced.value) {
        if (!confirm("Remove this birthday from your Google Calendar?")) return;
        await unsync();
    } else {
        await sync();
    }
}
</script>

<template>
    <div>
        <button
            type="button"
            :disabled="busy || synced === null"
            @click="onClick"
        >
            <template v-if="synced === null">Checking calendar…</template>
            <template v-else-if="busy">{{
                synced ? "Removing…" : "Syncing…"
            }}</template>
            <template v-else-if="synced"
                >✓ Synced — remove from calendar</template
            >
            <template v-else>Add to Google Calendar</template>
        </button>
        <p v-if="error" role="alert">{{ error }}</p>
    </div>
</template>
