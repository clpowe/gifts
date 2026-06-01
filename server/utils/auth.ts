import type { Auth } from "@@/lib/auth";
import type { H3Event } from "h3";
import { and, eq } from "drizzle-orm";
import { member } from "@@/server/db/schema";
import { useDB } from "@@/server/utils/db";

export function useAuth(event: any): Auth {
  if (!event.context.auth) {
    throw createError({
      statusCode: 500,
      message: "Auth not initialized. Is the Nitro plugin running?",
    });
  }
  return event.context.auth as Auth;
}

export async function useAuthSession(event: H3Event) {
  const auth = useAuth(event);
  return auth.api.getSession({ headers: event.headers });
}

export async function requireAuth(event: H3Event) {
  const session = await useAuthSession(event);
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
  return session;
}

export async function requireOrgMember(event: H3Event, orgId: string) {
  if (!orgId) {
    throw createError({
      statusCode: 400,
      message: "orgId is required",
    });
  }

  const session = await requireAuth(event);
  const [membership] = await useDB()
    .select()
    .from(member)
    .where(
      and(eq(member.userId, session.user.id), eq(member.organizationId, orgId)),
    )
    .limit(1);

  if (!membership) {
    throw createError({
      statusCode: 403,
      statusMessage: "Not a member of this organization",
    });
  }

  return { session, membership };
}
