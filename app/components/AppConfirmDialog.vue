<script setup lang="ts">
const { current, settle } = useConfirm();
const dialog = ref<HTMLDialogElement | null>(null);

watch(current, (val) => {
    const el = dialog.value;
    if (!el) return;
    if (val && !el.open) el.showModal();
    else if (!val && el.open) el.close();
});

function onClose() {
    settle(false);
}
</script>

<template>
    <dialog ref="dialog" class="confirm" @close="onClose">
        <form v-if="current" method="dialog" class="confirm__body">
            <h2 v-if="current.title">{{ current.title }}</h2>
            <p>{{ current.message }}</p>
            <menu>
                <button type="button" @click="settle(false)">
                    {{ current.cancelLabel ?? "Cancel" }}
                </button>
                <button
                    type="button"
                    :class="{ danger: current.danger }"
                    @click="settle(true)"
                >
                    {{ current.confirmLabel ?? "Confirm" }}
                </button>
            </menu>
        </form>
    </dialog>
</template>
