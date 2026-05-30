import { requireOrgMember } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const auth = useAuth(event);
  const orgId = getRouterParam(event, "orgId");
  if (!orgId) {
    throw createError({ statusCode: 400, message: "orgId is required" });
  }
  const { membership } = await requireOrgMember(event, orgId);

  if (membership.role !== "owner") {
    throw createError({
      statusCode: 403,
      statusMessage: "Only owners can rename the organization",
    });
  }

  const body = await readBody<{ name?: string }>(event);
  const name = body?.name?.trim();
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "name is required" });
  }

  return auth.api.updateOrganization({
    body: { organizationId: orgId, data: { name } },
    headers: event.headers,
  });
});
