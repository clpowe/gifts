import { z } from "zod";
import type { BirthdayDto } from "~~/server/utils/birthday";
import { GIFT_VIBES } from "#imports";

export type GiftPromptOptions = {
  vibe?: string;
  budget?: string;
};

export const giftIdeaSchema = z.object({
  id: z.string().describe("kebab-case slug from title"),
  title: z.string(),
  description: z.string(),
  estimatedPrice: z.string().describe('e.g. "$15 - $30", "Under $50"'),
  vibe: z.enum(GIFT_VIBES),
  whereToBuy: z.string(),
});

export const giftResponseSchema = z.object({
  summary: z.string().describe("warm, concise greeting summary"),
  giftIdeas: z.array(giftIdeaSchema).length(5),
});

export type GiftResponse = z.infer<typeof giftResponseSchema>;

export const giftSystemInstruction = `
You are a warm, helpful, and creative family gift concierge. Your suggestions should be highly inventive, realistic, and tailored. Avoid boring cliché suggestions (like standard plastic gift cards) unless they have a creative twist. Return only valid JSON matching the schema.
`.trim();

export function buildGiftPrompt(
  birthday: BirthdayDto,
  options: GiftPromptOptions = {},
): string {
  const { vibe, budget } = options;

  const interestsStr =
    birthday.interests.length > 0
      ? birthday.interests.join(", ")
      : "general fun, surprises";

  const ageContext =
    birthday.includeYear && birthday.age !== null
      ? `${birthday.name} will be turning ${birthday.age + 1} years old on their next birthday.`
      : "Their age is not specified.";

  const vibeHint =
    vibe && vibe !== "all"
      ? `${birthday.name}'s preferred style of gift is "${vibe}".`
      : "Provide a diverse, high-quality mix of Practical, Sentimental, Experience, Creative, Humorous, and Premium choices.";

  const budgetHint = budget
    ? `Target budget: ${budget}. Keep ideas within that range.`
    : "";

  const notesContext = birthday.notes
    ? `Extra context/details: "${birthday.notes}".`
    : "";

  const savedTitles = birthday.savedGifts.map((g) => g.title).filter(Boolean);
  const avoidLine =
    savedTitles.length > 0
      ? `Avoid repeating any of these previously saved ideas: ${savedTitles.join("; ")}.`
      : "";

  return `
You are a highly creative professional gift planner. I need curated, personalized gift ideas for my family member.

Family Member Details:
- Name: ${birthday.name}
- Relationship to me: ${birthday.relation}
- Age context: ${ageContext}
- Hobbies & Interests: ${interestsStr}
- ${vibeHint}
${budgetHint ? `- ${budgetHint}` : ""}
${notesContext ? `- ${notesContext}` : ""}
${avoidLine ? `- ${avoidLine}` : ""}

Suggest 5 distinct and outstanding gift ideas. For each idea, provide:
1. A short stable id (kebab-case slug derived from the title).
2. A unique, engaging title.
3. A vivid description of why they'll love it and how it matches their profile, including tips on wrapping or presenting it.
4. Estimated price range (e.g. "$15 - $30", "Under $50", "Approx. $120", "Free / DIY").
5. The best gift category/vibe (strictly one of: "Practical", "Sentimental", "Experience", "Creative", "Humorous", "Premium").
6. Practical advice on where to find/buy or how to make it.

Keep the accompanying summary warm, supportive, and conversational.
`.trim();
}
