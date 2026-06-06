import type { GiftVibe } from "~~/shared/utils/constants";
import { GIFT_VIBES } from "~~/shared/utils/constants";
import type { GiftIdea } from "~~/server/utils/birthday";

export function buildGiftPrompt(params: {
  name: string;
  relation: string;
  age: number | null;
  interests: string[];
  notes: string | null;
  vibes: GiftVibe[];
  count: number;
}): string {
  const { name, relation, age, interests, notes, vibes, count } = params;

  const ageStr = age ? `They are turning ${age}.` : "Age unknown.";
  const interestsStr =
    interests.length > 0
      ? `Their interests include: ${interests.join(", ")}.`
      : "No specific interests provided.";
  const notesStr = notes ? `Additional context: ${notes}` : "";
  const vibesStr =
    vibes.length > 0
      ? `Focus on these gift vibes: ${vibes.join(", ")}.`
      : "Mix a variety of gift vibes.";

  return `You are a thoughtful gift advisor. Generate ${count} unique gift ideas for the following person.

Person: ${name}
Relation to gift-giver: ${relation}
${ageStr}
${interestsStr}
${notesStr}
${vibesStr}

Return ONLY a valid JSON object — no markdown fences, no preamble:
{
  "ideas": [
    {
      "id": "a short unique kebab-case slug, e.g. leather-journal",
      "title": "Gift name",
      "description": "1-2 sentence description of the gift",
      "estimatedPrice": "$XX–$XX",
      "vibe": one of: "Practical" | "Sentimental" | "Experience" | "Creative" | "Humorous" | "Premium",
      "whereToBuy": "Where to find it, e.g. Amazon, Etsy, local bookstore"
    }
  ]
}

Rules:
- Each idea must be concrete and specific (not "a book" but a specific genre or title)
- Price ranges should be realistic
- vibe must be exactly one of the allowed string values
- Ideas should be meaningfully different from each other
- whereToBuy should be a realistic, specific source
- If vibes are specified, all ideas must match one of the requested vibes`;
}

export interface GiftGenerationResult {
  ideas: GiftIdea[];
}
