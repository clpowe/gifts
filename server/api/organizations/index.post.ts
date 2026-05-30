import { requireAuth } from "@@/server/utils/auth";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export default defineEventHandler(async (event) => {
  const auth = useAuth(event);
  await requireAuth(event);
  const body = await readBody<{ name?: string; slug?: string }>(event);

  const name = body?.name?.trim();
  if (!name) {
    throw createError({ statusCode: 400, message: "name is required" });
  }

  const slug =
    body?.slug?.trim() || `${slugify(name)}-${crypto.randomUUID().slice(0, 6)}`;

  return auth.api.createOrganization({
    body: { name, slug },
    headers: event.headers,
  });
});
