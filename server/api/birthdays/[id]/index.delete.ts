import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { requireOrgMember } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
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

  const { session, membership } = await requireOrgMember(event, existing.orgId);

  if (membership.role !== "owner" && existing.createdBy !== session.user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only owners or the creator can delete this birthday",
    });
  }

  await db.delete(schema.birthday).where(eq(schema.birthday.id, id));

  return { ok: true };
});
