import { useSession } from "~/lib/auth-client";

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/login" || to.path.startsWith("/api/auth")) return;

  const { data: session } = await useSession(useFetch);
  if (!session.value?.user) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
});
