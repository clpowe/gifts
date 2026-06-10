<script setup lang="ts">
import { useGiftGeneration } from "~/composables/useGiftGeneration";

const props = defineProps<{
    birthdayId: string;
}>();

const id = computed(() => props.birthdayId);
const { result, loading, error, generate, saveIdea, clear } =
    useGiftGeneration(id);

const birthdaysStore = useBirthdaysStore();
const savedIds = computed(
    () =>
        new Set(
            birthdaysStore
                .byId(props.birthdayId)
                ?.savedGifts.map((g) => g.id) ?? [],
        ),
);

const vibe = ref<string>("all");
const budget = ref<string>("");

async function onGenerate() {
    await generate({
        vibe: vibe.value === "all" ? undefined : vibe.value,
        budget: budget.value.trim() || undefined,
    });
}

async function onSave(idea: any) {
    await saveIdea(idea);
}
</script>

<template>
    <section>
        <h2>Generate gift ideas</h2>

        <div>
            <label>
                Vibe:
                <select v-model="vibe" :disabled="loading">
                    <option value="all">Any</option>
                    <option v-for="v in GIFT_VIBES" :key="v" :value="v">
                        {{ v }}
                    </option>
                </select>
            </label>

            <label>
                Budget:
                <input
                    v-model="budget"
                    type="text"
                    placeholder="$25-50"
                    :disabled="loading"
                />
            </label>

            <button type="button" :disabled="loading" @click="onGenerate">
                {{ loading ? "Generating…" : "Generate" }}
            </button>

            <button
                v-if="result.ideas.length"
                type="button"
                :disabled="loading"
                @click="clear"
            >
                Clear
            </button>
        </div>

        <p v-if="error" role="alert">{{ error }}</p>

        <p v-if="result?.summary">{{ result.summary }}</p>

        <ul v-if="result.ideas.length">
            <li v-for="idea in result.ideas" :key="idea.id">
                <GiftIdeaCard
                    :idea="idea"
                    :saved="savedIds.has(idea.id)"
                    @save="onSave"
                />
            </li>
        </ul>
    </section>
</template>
