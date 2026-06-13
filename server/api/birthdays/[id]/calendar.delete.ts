import { db, schema } from "@nuxthub/db";
import { and, eq } from "drizzle-orm";
import { requireAuth, requireOrgMember } from "~~/server/utils/auth";
import {
  deleteCalendarEvent,
  getGoogleAccessToken,
} from "~~/server/utils/calendar";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
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

  const [sync] = await db
    .select()
    .from(schema.calendarSync)
    .where(
      and(
        eq(schema.calendarSync.birthdayId, id),
        eq(schema.calendarSync.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!sync) {
    return { synced: false };
  }

  const accessToken = await getGoogleAccessToken(session.user.id);
  await deleteCalendarEvent(accessToken, sync.calendarEventId);

  await db
    .delete(schema.calendarSync)
    .where(eq(schema.calendarSync.id, sync.id));

  return { synced: false };
});
