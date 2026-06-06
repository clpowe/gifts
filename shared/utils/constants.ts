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
