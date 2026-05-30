import { requireOrgMember } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const auth = useAuth(event);
  const orgId = getRouterParam(event, "orgId")!;
  await requireOrgMember(event, orgId);

  return auth.api.listInvitations({
    headers: event.headers,
    query: { organizationId: orgId },
  });
});
