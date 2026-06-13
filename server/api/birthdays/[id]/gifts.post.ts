import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm/sql";
import { generateObject, generateText, Output } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { requireAuth, requireOrgMember } from "~~/server/utils/auth";
import { serializeBirthday } from "~~/server/utils/birthday";
import {
  buildGiftPrompt,
  giftResponseSchema,
  giftSystemInstruction,
} from "~~/server/utils/gifts";
import { attachProductLinks } from "~~/server/utils/amazon";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Birthday id is required",
    });
  }

  const [row] = await db
    .select()
    .from(schema.birthday)
    .where(eq(schema.birthday.id, id));

  if (!row) {
    throw createError({
      status: 404,
      statusMessage: "Birthday not found",
    });
  }

  await requireOrgMember(event, row.orgId);

  const body = await readBody(event).catch(() => ({}));
  const vibe = typeof body?.vibe === "string" ? body.vibe.trim() : undefined;
  const budget =
    typeof body?.budget === "string" ? body.budget.trim() : undefined;

  const birthday = serializeBirthday(row);
  const prompt = buildGiftPrompt(birthday, { vibe, budget });

  const config = useRuntimeConfig(event);
  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "OPENAI_API_KEY not configured",
    });
  }

  const openai = createOpenAI({ apiKey: config.openaiApiKey });

  try {
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      output: Output.object({ schema: giftResponseSchema }),
      system: giftSystemInstruction,
      prompt,
    });

    const giftIdeas = await attachProductLinks(result.output.giftIdeas, {
      tag: config.amazonAssociateTag || undefined,
    });

    return {
      summary: result.output.summary,
      giftIdeas,
    };
  } catch (error) {
    console.error("Gift generation error:", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error
          ? error.message
          : "Failed to generate gift ideas",
    });
  }
});
