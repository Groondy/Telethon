// server/api/score/top10.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = config.public.apiUrl;
  try {
    // 1. Appeler l'API externe pour récupérer le top 10
    const topPlayersResponse = await $fetch(`${apiUrl}/api/utilisateurs/points/top10`, {
      method: 'GET',
    })

    return topPlayersResponse
  }
  catch (error: any) {
    // 2. Gérer les erreurs
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Une erreur est survenue lors de la récupération du top 10.',
    })
  }
})
