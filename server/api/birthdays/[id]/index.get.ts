import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm/sql";
import { requireAuth, requireOrgMember } from "~~/server/utils/auth";
import { serializeBirthday } from "~~/server/utils/birthday";

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
    throw createError({ statusCode: 404, statusMessage: "Birthday not found" });
  }

  await requireOrgMember(event, row.orgId);
  return serializeBirthday(row);
});
