export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = config.public.apiUrl;
  // 1. Protéger la route et s'assurer que l'admin est connecté
  await requireUserSession(event)

  // 2. Récupérer le token de la session de l'admin
  const session = await getUserSession(event)
  const token = session.token

  // 3. Récupérer l'ID de l'utilisateur depuis les paramètres de la route
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'ID utilisateur manquant' })
  }

  try {
    // 4. Appeler l'API externe pour supprimer l'utilisateur
    await $fetch(`${apiUrl}/api/utilisateurs/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // 5. Renvoyer une réponse de succès
    return { status: 204, message: 'Utilisateur supprimé avec succès' }
  }
  catch (error: any) {
    // 6. Gérer les erreurs de l'API externe
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Une erreur est survenue lors de la suppression de l\'utilisateur.',
    })
  }
})
