import { requireOrgMember } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const auth = useAuth(event);
  const orgId = getRouterParam(event, "orgId")!;
  const { membership } = await requireOrgMember(event, orgId);

  if (membership.role !== "owner") {
    throw createError({
      statusCode: 403,
      statusMessage: "Only owners can delete the organization",
    });
  }

  await auth.api.deleteOrganization({
    body: { organizationId: orgId },
    headers: event.headers,
  });

  return { ok: true };
});
