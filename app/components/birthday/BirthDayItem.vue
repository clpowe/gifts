<script setup lang="ts">
import { format } from "@formkit/tempo";
import type { BirthdayDto } from "~/stores/birthdays";

const props = defineProps<{
    birthday: BirthdayDto;
}>();

const dateLabel = computed(() => {
    return format(props.birthday.nextBirthday, {
        date: "long",
    });
});

const daysLabel = computed(() => {
    const day = props.birthday.daysUntil;
    if (day === 0) return "Today!";
    if (day === 1) return "Tomorrow";
    return `In ${day} days`;
});

const turning = computed(() => {
    if (props.birthday.age === null) return null;
    return props.birthday.daysUntil === 0
        ? props.birthday.age
        : props.birthday.age + 1;
});
</script>

<template>
    <li>
        <NuxtLink :to="`/birthdays/${birthday.id}`">
            <strong>{{ birthday.name }}</strong> — {{ birthday.relation }}
        </NuxtLink>
        <br />
        {{ dateLabel }} — {{ daysLabel }}
        <template v-if="birthday.includeYear && turning !== null">
            — turns {{ turning }}
        </template>
    </li>
</template>
