<script setup lang="ts">
import type { GiftIdea } from "~/stores/gifts";

const props = defineProps<{
    birthdayId: string;
    gifts: GiftIdea[];
}>();

const id = computed(() => props.birthdayId);
const { removeSaved } = useGiftGeneration(id);

async function onRemove(giftId: string) {
    if (!confirm("Remove this saved gift?")) return;
    await removeSaved(giftId);
}
</script>

<template>
    <section v-if="gifts.length">
        <h2>Saved gifts</h2>
        <ul>
            <li v-for="g in gifts" :key="g.id">
                <article>
                    <header>
                        <h3>{{ g.title }}</h3>
                        <span class="vibe-badge">{{ g.vibe }}</span>
                    </header>
                    <p>{{ g.description }}</p>
                    <p><strong>Price:</strong> {{ g.estimatedPrice }}</p>
                    <p><strong>Where:</strong> {{ g.whereToBuy }}</p>
                    <button type="button" @click="onRemove(g.id)">
                        Remove
                    </button>
                </article>
            </li>
        </ul>
    </section>
</template>

<style scoped>
.vibe-badge {
    display: inline-block;
    margin-left: 0.5rem;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    background: #efe;
    font-size: 0.75rem;
}
</style>
