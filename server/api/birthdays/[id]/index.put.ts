import { db, schema } from "@nuxthub/db";
import { eq, sql } from "drizzle-orm/sql";
import { requireAuth, requireOrgMember } from "~~/server/utils/auth";
import {
  serializeBirthday,
  validateBirthdayInput,
} from "~~/server/utils/birthday";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Birthday id is required",
    });
  }

  const [existing] = await db
    .select()
    .from(schema.birthday)
    .where(eq(schema.birthday.id, id));

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Birthday not found" });
  }

  await requireOrgMember(event, existing.orgId);

  const input = validateBirthdayInput(await readBody(event));
  const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

  const [updated] = await db
    .update(schema.birthday)
    .set({
      name: input.name,
      relation: input.relation,
      birthDate: input.birthDate,
      includeYear: input.includeYear,
      interests: JSON.stringify(input.interests),
      notes: input.notes,
      savedGifts: JSON.stringify(input.savedGifts),
      updatedAt: now,
    })
    .where(eq(schema.birthday.id, id))
    .returning();

  if (!updated) {
    throw createError({
      statusCode: 500,
      statusMessage: "Birthday could not be updated",
    });
  }

  return serializeBirthday(updated);
});
