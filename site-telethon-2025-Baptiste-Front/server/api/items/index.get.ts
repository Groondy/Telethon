// server/api/items/index.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = config.public.apiUrl;
  try {
    // 1. Appeler l'API externe pour récupérer les items
    const itemsResponse = await $fetch(`${apiUrl}/api/utilisateurs/items`, {
      method: 'GET',
    })

    return itemsResponse
  }
  catch (error: any) {
    // Gérer les erreurs de l'API externe
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Une erreur est survenue lors de la récupération des items.',
    })
  }
})
