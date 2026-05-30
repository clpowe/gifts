export default defineEventHandler((event) => {
  const auth = event.context.auth;
  return auth.handler(toWebRequest(event));
});
