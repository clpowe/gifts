import { requireAuth } from "@@/server/utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const auth = useAuth(event);
  return auth.api.listOrganizations({ headers: event.headers });
});
