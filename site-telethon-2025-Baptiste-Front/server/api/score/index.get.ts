export default defineEventHandler(async (event) => {
  try {
    // 1. Appeler l'API externe pour récupérer la liste de tous les utilisateurs.
    // Je suppose que ce point d'API est public. S'il nécessite une authentification,
    // il faudra ajouter la logique de token comme dans les autres appels.
    const usersResponse = await $fetch('http://localhost:3001/api/utilisateurs/points/equipes', {
      method: 'GET',
    })

    return usersResponse
  }
  catch (error: any) {
    // Gérer les erreurs de l'API externe
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Une erreur est survenue lors de la récupération des scores.',
    })
  }
})
