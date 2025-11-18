export default defineEventHandler(async (event) => {
  // 1. Protéger la route et s'assurer que l'utilisateur est connecté
  await requireUserSession(event)

  // 2. Récupérer le token de la session
  const session = await getUserSession(event)
  try {
    // 3. Appeler l'API externe pour récupérer la liste des utilisateurs
    // On suppose que l'API externe attend un token Bearer pour l'authentification
    const users = await $fetch('http://localhost:3001/api/utilisateurs', {
      method: 'GET',
    })

    // 4. Renvoyer la liste des utilisateurs
    return users
  }
  catch (error: any) {
    // 5. Gérer les erreurs de l'API externe
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.data?.message || 'Une erreur est survenue lors de la récupération des utilisateurs.',
      data: error.data,
    })
  }
})

