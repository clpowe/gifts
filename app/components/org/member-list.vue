<script setup lang="ts">
type Member = {
    id: string;
    userId: string;
    role: string;
    user: { id: string; name: string; email: string };
    createdAt: string;
};

defineProps<{
    members: Member[];
    currentUserId: string;
}>();
</script>

<template>
    <ul>
        <li v-for="member in members" :key="member.id">
            <strong>{{ member.user.name }}</strong>
            <span v-if="member.userId === currentUserId">(you)</span>
            — {{ member.user.email }} — <em>{{ member.role }}</em>
        </li>
    </ul>
</template>
