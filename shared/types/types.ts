export interface Birthday {
  id: string;
  name: string;
  relation: string;
  birthDate: string; // YYYY-MM-DD string
  includeYear: boolean; // whether to show age / milestone
  interests: string[];
  notes?: string;
  savedGifts?: string[];
  calendarEventId?: string;
  calendarSyncedAt?: string;
}

export interface GiftIdea {
  id: string;
  title: string;
  description: string;
  estimatedPrice: string;
  vibe:
    | "Practical"
    | "Sentimental"
    | "Experience"
    | "Creative"
    | "Humorous"
    | "Premium";
  whereToBuy: string;
}

export interface GiftGenerationResponse {
  giftIdeas: GiftIdea[];
  summary: string;
}

export const FAMILIAR_RELATIONS = [
  "Spouse/Partner",
  "Mother",
  "Father",
  "Daughter",
  "Son",
  "Sister",
  "Brother",
  "Grandmother",
  "Grandfather",
  "Aunt",
  "Uncle",
  "Cousin",
  "Niece",
  "Nephew",
  "Friend",
  "Other",
];

export const GIFT_VIBES = [
  { value: "all", label: "Any Type" },
  { value: "Practical", label: "🔧 Practical" },
  { value: "Sentimental", label: "❤️ Sentimental" },
  { value: "Experience", label: "🎟️ Experience" },
  { value: "Creative", label: "🎨 Creative" },
  { value: "Humorous", label: "😂 Fun/Humor" },
  { value: "Premium", label: "✨ Premium/Lux" },
];
