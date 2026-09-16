// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@vueuse/nuxt", "@sentry/nuxt/module"],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "",
    },
  },

  routeRules: {
    "/api/**": {
      // CORS handled by server/middleware/cors.ts
    },
  },

  compatibilityDate: "2024-07-11",

  vite: {
    server: {
      watch: {
        ignored: ["**/generated/**", "**/prisma/migrations/**"],
      },
    },
  },

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
