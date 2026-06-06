<script setup lang="ts">
import type { BirthdayPayload } from "~/stores/birthdays";

const props = defineProps<{
    initialValue?: {
        name: string;
        relation: string;
        birthDate: string;
        includeYear: boolean;
        interests: string[];
        notes: string | null;
    };
    submitLabel?: string;
    submitting?: boolean;
}>();

const emit = defineEmits<{
    submit: [value: Omit<BirthdayPayload, "savedGifts">];
    cancel: [];
}>();

const name = ref(props.initialValue?.name ?? "");
const relation = ref(props.initialValue?.relation ?? FAMILIAR_RELATIONS[0]);
const birthDate = ref(props.initialValue?.birthDate ?? "");
const includeYear = ref(props.initialValue?.includeYear ?? true);
const interests = ref<string[]>([...(props.initialValue?.interests ?? [])]);
const notes = ref(props.initialValue?.notes ?? "");
const interestInput = ref("");

function addInterest() {
    const value = interestInput.value.trim();
    if (!value) return;
    const parts = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    for (const p of parts) {
        if (!interests.value.includes(p) && interests.value.length < 20) {
            interests.value.push(p);
        }
    }

    interestInput.value = "";
}

function handleInterestKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        addInterest();
    } else if (
        event.key === "Backspace" &&
        !interestInput.value &&
        interests.value.length > 0
    ) {
        interests.value.pop();
    }
}

function removeInterest(index: number) {
    interests.value.splice(index, 1);
}

function handleSubmit() {
    addInterest();
    emit("submit", {
        name: name.value,
        relation: relation.value,
        birthDate: birthDate.value,
        includeYear: includeYear.value,
        interests: interests.value,
        notes: notes.value.trim() || null,
    });
}
</script>
<template>
    <form @submit.prevent="handleSubmit">
        <p>
            <label>
                Name
                <input v-model="name" type="text" required maxlength="100" />
            </label>
        </p>

        <p>
            <label>
                Relation
                <select v-model="relation" required>
                    <option v-for="r in FAMILIAR_RELATIONS" :key="r" :value="r">
                        {{ r }}
                    </option>
                </select>
            </label>
        </p>

        <p>
            <label>
                Birth date
                <input v-model="birthDate" type="date" required />
            </label>
        </p>

        <p>
            <label>
                <input v-model="includeYear" type="checkbox" />
                Show their age
            </label>
        </p>

        <fieldset>
            <legend>Interests</legend>
            <ul>
                <li v-for="(interest, i) in interests" :key="i">
                    {{ interest }}
                    <button
                        type="button"
                        aria-label="Remove interest"
                        @click="removeInterest(i)"
                    >
                        ×
                    </button>
                </li>
            </ul>
            <label>
                Add interest
                <input
                    v-model="interestInput"
                    type="text"
                    placeholder="Type and press Enter"
                    @keydown="handleInterestKeydown"
                    @blur="addInterest"
                />
            </label>
        </fieldset>

        <p>
            <label>
                Notes
                <textarea v-model="notes" rows="4" maxlength="1000"></textarea>
            </label>
        </p>

        <p>
            <button type="submit" :disabled="submitting">
                {{ submitLabel || "Save" }}
            </button>
            <button type="button" @click="emit('cancel')">Cancel</button>
        </p>
    </form>
</template>
