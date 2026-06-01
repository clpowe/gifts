import { db, schema } from "@nuxthub/db";
import { sql } from "drizzle-orm";
import { requireAuth, requireOrgMember } from "~~/server/utils/auth";
import { serializeBirthday, validateBirthdayInput } from "~~/server/utils/birthday";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const body = await readBody(event);

  const orgId = typeof body?.orgId === "string" ? body.orgId : "";
  if (!orgId) {
    throw createError({ statusCode: 400, statusMessage: "orgId is required" });
  }

  await requireOrgMember(event, orgId);

  const input = validateBirthdayInput(body);
  const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

  const [created] = await db
    .insert(schema.birthday)
    .values({
      id: crypto.randomUUID(),
      orgId,
      createdBy: session.user.id,
      name: input.name,
      relation: input.relation,
      birthDate: input.birthDate,
      includeYear: input.includeYear,
      interests: JSON.stringify(input.interests),
      notes: input.notes,
      savedGifts: JSON.stringify(input.savedGifts),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!created) {
    throw createError({
      statusCode: 500,
      statusMessage: "Birthday could not be created",
    });
  }

  return serializeBirthday(created);
});
