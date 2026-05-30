export default defineEventHandler(async (event) => {
  const { AI } = event.context.cloudflare.env as unknown as Cloudflare.Env;
  const response = await AI.run("@cf/google/gemma-4-26b-a4b-it", {
    prompt: "What are the three laws of thermodynamics?",
  });
  console.log(response);
});
