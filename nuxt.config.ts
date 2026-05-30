// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: false,

  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  modules: [
    "@nuxthub/core",
    "@vueuse/nuxt",
    "nitro-cloudflare-dev",
    "@pinia/nuxt",
  ],
  hub: {
    db: "sqlite",
  },
  runtimeConfig: {
    geminiApiKey: "",
  },
});