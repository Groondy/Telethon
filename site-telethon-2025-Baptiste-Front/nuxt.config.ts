// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-16',
  modules: ['nuxt-auth-utils'],
  css: ['~/assets/scss/main.scss'],
  future:{
    compatibilityVersion:4
  },
  nitro: {
    experimental: {
      websocket: true
    }
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/Logo-sablier.ico' },
      ],
    }
  },
  runtimeConfig: {
    // Les clés ici ne sont accessibles que côté serveur.
    // Exemple: apiSecret: '123',

    // Les clés dans `public` sont aussi accessibles côté client.
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:3001'
    }
  },

})