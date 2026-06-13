import { db, schema } from "@nuxthub/db";
import { and, eq } from "drizzle-orm";
import { requireAuth, requireOrgMember } from "~~/server/utils/auth";
import { nextBirthdayDate } from "~~/server/utils/birthday";
import {
  createBirthdayEvent,
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

  const [existing] = await db
    .select()
    .from(schema.calendarSync)
    .where(
      and(
        eq(schema.calendarSync.birthdayId, id),
        eq(schema.calendarSync.userId, session.user.id),
      ),
    )
    .limit(1);

  if (existing) {
    return { synced: true };
  }

  const accessToken = await getGoogleAccessToken(session.user.id);
  const startDate = nextBirthdayDate(row.birthDate).toISOString().slice(0, 10);
  const eventId = await createBirthdayEvent(accessToken, {
    name: row.name,
    startDate,
  });

  await db.insert(schema.calendarSync).values({
    id: crypto.randomUUID(),
    birthdayId: id,
    userId: session.user.id,
    calendarEventId: eventId,
  });

  return { synced: true };
});
