import type { Database } from "~/server/utils/db";
import type { Auth } from "~/lib/auth";

declare module "h3" {
  interface H3EventContext {
    db: Database;
    auth: Auth;
  }
}
