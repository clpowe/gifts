import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireOrgMember } from "~~/server/utils/auth";
import { sortByUpcoming } from "~~/server/utils/birthday";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const { orgId } = getQuery(event);
  if (typeof orgId !== "string" || !orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: "orgId query param is required",
    });
  }

  await requireOrgMember(event, orgId);

  const rows = await db
    .select()
    .from(schema.birthday)
    .where(eq(schema.birthday.orgId, orgId));

  return sortByUpcoming(rows);
});
