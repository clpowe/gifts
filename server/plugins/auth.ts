import { useDB } from "@@/server/utils/db";
import { createAuth } from "@@/lib/auth";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    const db = useDB();
    const auth = createAuth(db);

    event.context.db = db;
    event.context.auth = auth;
  });
});
