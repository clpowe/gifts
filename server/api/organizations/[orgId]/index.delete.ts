import { requireOrgMember } from "~~/server/utils/auth";
import { eq } from "drizzle-orm";
import {
  invitation,
  member,
  organization,
  session,
} from "~~/server/db/schema";
import { useDB } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  const orgId = getRouterParam(event, "orgId")!;
  const { membership } = await requireOrgMember(event, orgId);

  if (membership.role !== "owner") {
    throw createError({
      statusCode: 403,
      statusMessage: "Only owners can delete the organization",
    });
  }

  const db = useDB();

  await db
    .update(session)
    .set({ activeOrganizationId: null })
    .where(eq(session.activeOrganizationId, orgId));
  await db.delete(invitation).where(eq(invitation.organizationId, orgId));
  await db.delete(member).where(eq(member.organizationId, orgId));
  await db.delete(organization).where(eq(organization.id, orgId));

  return { ok: true };
});
