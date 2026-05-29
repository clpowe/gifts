<script setup lang="ts">
import { signIn, signOut, useSession } from "~~/lib/auth-client";
const data = ref();
const session = useSession();

const INITIAL_BIRTHDAYS: Birthday[] = [
    {
        id: "sample-1",
        name: "Bill",
        relation: "Sister",
        birthDate: "1997-06-12",
        includeYear: true,
        interests: [
            "Gardening",
            "Specialty Coffee",
            "Watercolors",
            "Mystery Novels",
        ],
        notes: "Adores indoor plants and sour candies. Currently trying to paint botanical cards.",
        savedGifts: [
            "Ceramic self-watering planter",
            "Japanese drip coffee kettle",
        ],
    },
    {
        id: "sample-2",
        name: "David Chen",
        relation: "Brother-in-law",
        birthDate: "1994-01-18",
        includeYear: true,
        interests: [
            "Board Games",
            "Gourmet Cooking",
            "Baking Sour Dough",
            "Podcasts",
        ],
        notes: "Loves complex economic board games. Has a cute corgi named Potato.",
        savedGifts: ["Cast iron bread oven guide book"],
    },
    {
        id: "sample-3",
        name: "Eleanor Vance",
        relation: "Grandmother",
        birthDate: "1946-10-04",
        includeYear: true,
        interests: ["Knitting", "Classical Music", "Teas", "Botanical Gardens"],
        notes: "Prefers loose leaf herbal teas (especially chamomile and lavender). Walks every morning.",
        savedGifts: ["Hand-turned wooden yarn bowl"],
    },
    {
        id: "sample-4",
        name: "Leo Miller",
        relation: "Nephew",
        birthDate: "2018-08-30",
        includeYear: true,
        interests: [
            "Dinosaur Toys",
            "Space Rockets",
            "Drawing",
            "Building Blocks",
        ],
        notes: "Turning 8 soon! Super excited about outer space planets.",
        savedGifts: ["Model glow-in-the-dark rocket ship"],
    },
];

async function generateGiftIdeas() {
    const res = await $fetch("/api/gift-ideas", {
        method: "post",
        body: {
            name: "Ashley Powe",
            relation: "Wife",
            age: "40",
            interests: ["Fitness"],
            notes: "",
            vibePreference: "Practical",
        },
    });

    data.value = res;
}

async function signInWithGoogle() {
    await signIn.social({ provider: "google" });
}

const birthday = ref<Birthday[]>([]);
const selectedMemberId = ref<string | null>(null);
const editingMember = ref<Birthday | null>(null);
</script>
<template>
    <div>Hello World</div>
    <div v-if="session.data">
        Signed in as {{ session.data.user.email }}
        <button @click="signOut()">Sign out</button>
    </div>
    <button v-else @click="signInWithGoogle">Continue with Google</button>
    <button @click="generateGiftIdeas">Generate Gift Ideas</button>
    <div>
        <pre>{{ data }}</pre>
    </div>
</template>
