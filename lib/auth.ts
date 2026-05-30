import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { organization } from "better-auth/plugins/organization";
import type { Database } from "../server/utils/db";

function getAuthBaseURL() {
  const baseURL = process.env.BETTER_AUTH_URL;

  if (process.env.NODE_ENV !== "production" && baseURL?.includes("localhost")) {
    return {
      allowedHosts: ["localhost:*", "127.0.0.1:*"],
      fallback: baseURL,
      protocol: "http" as const,
    };
  }

  return baseURL;
}

export function createAuth(database: Database) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "sqlite",
    }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        scope: [
          "https://www.googleapis.com/auth/calendar.events",
        ],
        accessType: "offline",
        prompt: "consent",
      },
    },
    plugins: [
      organization({
        allowUserToCreateOrganization: true,
        async sendInvitationEmail(data) {
          // TODO: wire up email provider (Resend, etc.)
          console.log("[invite]", data.email, data.invitation.email);
        },
      }),
    ],
    baseURL: getAuthBaseURL(),
    secret: process.env.BETTER_AUTH_SECRET!,

    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // refresh if older than 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 min client-side cache
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
