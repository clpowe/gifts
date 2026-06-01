import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { requireAuth, requireOrgMember } from "~~/server/utils/auth";
import {
  serializeBirthday,
  validateBirthdayInput,
  type BirthdayRow,
} from "~~/server/utils/birthday";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const id = getRouterParam(event, "id");

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

  return serializeBirthday(updated);
});
