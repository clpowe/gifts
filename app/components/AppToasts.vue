<script setup lang="ts">
const { toasts, dismiss } = useToasts();
const el = ref<HTMLElement | null>(null);

function syncPopover(count: number) {
    const node = el.value;
    if (!node) return;
    const open = node.matches(":popover-open");
    if (count > 0 && !open) {
        node.showPopover();
    } else if (count === 0 && open) {
        node.hidePopover();
    }
}

watch(() => toasts.value.length, syncPopover, { flush: "post" });
onMounted(() => syncPopover(toasts.value.length));
</script>

<template>
    <div ref="el" popover="manual" class="toasts" aria-live="polite">
        <div
            v-for="t in toasts"
            :key="t.id"
            class="toast"
            :class="`toast--${t.type}`"
            role="status"
            @click="dismiss(t.id)"
        >
            {{ t.message }}
        </div>
    </div>
</template>

<style scoped></style>
