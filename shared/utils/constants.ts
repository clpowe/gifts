export const FAMILIAR_RELATIONS = [
  "Spouse/Partner",
  "Parent",
  "Child",
  "Sibling",
  "Grandparent",
  "Grandchild",
  "Aunt/Uncle",
  "Niece/Nephew",
  "Cousin",
  "In-law",
  "Friend",
  "Self",
  "Other",
] as const;

export type FamiliarRelation = (typeof FAMILIAR_RELATIONS)[number];

export const GIFT_VIBES = [
  "Practical",
  "Sentimental",
  "Experience",
  "Creative",
  "Humorous",
  "Premium",
] as const;

export type GiftVibe = (typeof GIFT_VIBES)[number];

export const SPECIAL_LABELS: Record<number, string> = {
  1: "🎂 First Birthday!",
  13: "🎉 Big Milestone: Turning 13 — Teenhood!",
  16: "🚗 Big Milestone: Turning 16 — Driving age!",
  18: "🎉 Big Milestone: Turning 18 — Adulthood!",
  21: "🥳 Big Milestone: Turning 21!",
};

export const MILESTONE_AGES = new Set([
  1, 5, 10, 13, 16, 18, 20, 21, 30, 40, 50, 60, 70, 75, 80, 90, 100,
]);
