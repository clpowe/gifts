import { requireOrgMember } from "@@/server/utils/auth";

export default defineEventHandler(async (event) => {
  const auth = useAuth(event);
  const orgId = getRouterParam(event, "orgId")!;
  const { membership } = await requireOrgMember(event, orgId);

  if (membership.role !== "owner" && membership.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Only owners and admins can invite",
    });
  }

  const body = await readBody<{
    email?: string;
    role?: "member" | "admin";
  }>(event);

  const email = body?.email?.trim().toLowerCase();
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: "email is required" });
  }

  return auth.api.createInvitation({
    body: {
      email,
      role: body?.role ?? "member",
      organizationId: orgId,
    },
    headers: event.headers,
  });
});
