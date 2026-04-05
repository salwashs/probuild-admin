// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@vueuse/nuxt", "@sentry/nuxt/module"],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/api/**": {
      cors: true,
    },
  },

  compatibilityDate: "2024-07-11",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  sentry: {
    autoInjectServerSentry: "top-level-import",
    // Hapus sourceMapsUploadOptions sama sekali
  },

  sourcemap: false, // ← set false langsung, bukan object
});
