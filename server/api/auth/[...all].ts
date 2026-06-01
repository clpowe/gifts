export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  if (url.pathname.includes("/callback/") && !url.searchParams.has("state")) {
    return sendRedirect(event, "/login?error=oauth_state_missing");
  }

  const auth = event.context.auth;
  return auth.handler(toWebRequest(event));
});
