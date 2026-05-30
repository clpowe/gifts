import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations/sqlite",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.NUXT_CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.NUXT_CLOUDFLARE_DATABASE_ID!,
    token: process.env.NUXT_CLOUDFLARE_D1_TOKEN!,
  },
} satisfies Config;
