export default defineEventHandler(async (event) => {
  const { AI } = event.context.cloudflare.env as unknown as Cloudflare.Env;
  try {
    const body = await readBody(event);
    const {
      name,
      relation,
      age,
      interests = [],
      notes = "",
      vibePreference = "all",
    } = body;

    if (!name || !relation) {
      throw createError({
        status: 400,
        statusText: "Name and relation are required fields.",
      });
    }

    // Construct a rich, descriptive Prompt
    const interestsStr =
      interests.length > 0 ? interests.join(", ") : "general fun, surprises";
    const ageContext = age
      ? `${name} will be turning ${age} years old.`
      : "Their age is not specified.";
    const vibeHint =
      vibePreference && vibePreference !== "all"
        ? `${name} preferred style of gift is "${vibePreference}".`
        : "Provide a diverse, high-quality mix of practical, sentimental, experience, creative, humorous, and premium choices.";
    const notesContext = notes ? `Extra context/details: "${notes}".` : "";

    const userPrompt = `
          You are highly creative professional gift planner. I need curated, personalized gift ideas for my family member.

          Family Member Details:
          - Name: ${name}
          - Relationship to me: ${relation}
          - Age context: ${ageContext}
          - Hobbies & Interests: ${interestsStr}
          - ${vibeHint}
          - ${notesContext}

          Suggest 5 distinct and outstanding gift ideas. For each idea, provide:
          1. A unique, engaging title.
          2. A vivid description of why they'll love it and how it matches their profile, including tips on wrapping or presenting it.
          3. Estimated price range (e.g. "$15 - $30", "Under $50", "Approx. $120", "Free / DIY").
          4. The best gift category/vibe (select strictly from: "Practical", "Sentimental", "Experience", "Creative", "Humorous", "Premium").
          5. Practical advice on "where to find/buy or how to make it" (such as local crafts market, online specialty shops, DIY instructions).

          Keep the accompanying summary warm, supportive, and conversational.
        `;

    const systemInstruction = `
          You are a warm, helpful, and creative family gift concierge. Your suggestions should be highly inventive, realistic, and tailored. Avoid boring cliché suggestions (like standard plastic gift cards) unless they have a creative twist. Ensure the returned JSON adheres exactly to the specified schema.
        `;

    const messages = [
      { role: "system", content: systemInstruction },
      { role: "user", content: userPrompt },
    ];

    const response = await AI.run("@cf/google/gemma-4-26b-a4b-it", {
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "gift_response",
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description:
                  "A heartwarming, concise, scannable greeting summary for the user about these selections.",
              },
              giftIdeas: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    estimatedPrice: { type: "string" },
                    vibe: { type: "string" },
                    whereToBuy: { type: "string" },
                  },
                  required: [
                    "id",
                    "title",
                    "description",
                    "estimatedPrice",
                    "vibe",
                    "whereToBuy",
                  ],
                },
              },
            },
            required: ["giftIdeas", "summary"],
          },
        },
      },
    });

    const content = (response as any).choices[0].message.content;
    const parsed = JSON.parse(content);
    console.log(parsed);
    return parsed;
  } catch (error) {
    console.error("Gemini Gift Generation Error:", error);
    throw createError({
      status: 500,
      message: "Failed to generate gift ideas from Gemini.",
    });
  }
});
