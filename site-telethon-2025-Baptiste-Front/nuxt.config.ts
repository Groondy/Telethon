// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-16',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils'],
  css: ['~/assets/scss/main.scss'],
  nitro: {
    experimental: {
      websocket: true
    }
  }
})