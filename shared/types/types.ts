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
export type Milestone = {
  age: number;
  label: string;
};
export type GiftIdea = {
  id: string;
  title: string;
  description: string;
  estimatedPrice: string;
  vibe: GiftVibe;
  whereToBuy: string;
  searchQuery: string;
  productUrl: string | null;
  // Phase 2 (PA-API)
  asin?: string;
  productTitle?: string;
  productPrice?: string;
  productImage?: string;
};

export type GiftGenerationRequest = {
  vibe?: GiftVibe | "all";
  budget?: string;
};

export interface GiftGenerationResponse {
  giftIdeas: GiftIdea[];
  summary: string;
}

// Organization Types
export type FullOrg = {
  id: string;
  name: string;
  slug: string;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    user: { id: string; name: string; email: string };
    createdAt: string;
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
  }>;
};
