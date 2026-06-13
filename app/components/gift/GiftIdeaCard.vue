<script setup lang="ts">
import type {} from "~/stores/gifts";

const props = defineProps<{
    idea: GiftIdea;
    saved?: boolean;
}>();

const emit = defineEmits<{
    save: [idea: GiftIdea];
}>();

function onSave() {
    emit("save", props.idea);
}
</script>

<template>
    <article>
        <header>
            <h3>{{ idea.title }}</h3>
            <span class="vibe-badge">{{ idea.vibe }}</span>
        </header>

        <p>{{ idea.description }}</p>

        <p><strong>Price:</strong> {{ idea.estimatedPrice }}</p>
        <p><strong>Where:</strong> {{ idea.whereToBuy }}</p>

        <p v-if="idea.productUrl">
            <a
                :href="idea.productUrl"
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
            >
                🛒 Find on Amazon
            </a>
        </p>
        <button type="button" :disabled="saved" @click="onSave">
            {{ saved ? "Saved" : "Save" }}
        </button>
    </article>
</template>

<style scoped>
.vibe-badge {
    display: inline-block;
    margin-left: 0.5rem;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    background: #eef;
    font-size: 0.75rem;
}
</style>
