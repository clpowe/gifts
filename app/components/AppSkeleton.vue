<script setup lang="ts">
withDefaults(
    defineProps<{
        lines?: number;
    }>(),
    { lines: 3 },
);
</script>

<template>
    <div class="skeleton" aria-hidden="true">
        <div v-for="n in lines" :key="n" class="skeleton__line" />
    </div>
</template>

<style scoped>
.skeleton__line {
    height: 1rem;
    margin-bottom: 0.75rem;
    border-radius: 0.25rem;
    background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
}
.skeleton__line:nth-child(odd) {
    width: 85%;
}
@keyframes shimmer {
    from {
        background-position: 200% 0;
    }
    to {
        background-position: -200% 0;
    }
}
</style>
