import { db, schema } from "@nuxthub/db";
import { and, eq } from "drizzle-orm";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

// Refresh 60s before actual expiry to avoid clock-skew failures
const EXPIRY_BUFFER_MS = 60_000;

export async function getGoogleAccessToken(userId: string): Promise<string> {
  const [googleAccount] = await db
    .select()
    .from(schema.account)
    .where(
      and(
        eq(schema.account.userId, userId),
        eq(schema.account.providerId, "google"),
      ),
    )
    .limit(1);

  if (!googleAccount?.accessToken) {
    throw createError({
      statusCode: 400,
      statusMessage: "Google account not connected",
    });
  }

  const expiresAt = googleAccount.accessTokenExpiresAt?.getTime() ?? 0;
  if (expiresAt - EXPIRY_BUFFER_MS > Date.now()) {
    return googleAccount.accessToken;
  }

  if (!googleAccount.refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Google session expired. Please sign in again.",
    });
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: googleAccount.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Google token refresh failed:", res.status, detail);
    throw createError({
      statusCode: 401,
      statusMessage: "Google session expired. Please sign in again.",
    });
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  await db.update(schema.account).set({
    accessToken: data.access_token,
    accessTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
  });

  return data.access_token;
}
