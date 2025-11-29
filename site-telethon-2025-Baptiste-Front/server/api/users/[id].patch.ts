export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = config.public.apiUrl;
  // 1. Protéger la route
  await requireUserSession(event)

  // 2. Récupérer le token de l'admin
  const session = await getUserSession(event)
  const token = session.token
  
  // On construit le nom complet de l'admin
  const adminName = `${session.user.prenom} ${session.user.nom}`

  // 3. Récupérer l'ID de l'utilisateur et les points à ajouter
  const userId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { points, pointsAdded, itemName } = body

  if (!userId || points === undefined) {
    throw createError({ 
      statusCode: 400, 
      message: 'ID utilisateur ou points manquants' 
    })
  }

  try {
    // 4. Appeler l'API externe (Backend Express sur le port 3001)
    const updatedUser = await $fetch(`${apiUrl}/api/utilisateurs/${userId}/points`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { points, pointsAdded, itemName, adminName },
    })

    // C'est le backend (port 3001) qui envoie la notification automatiquement.

    return updatedUser
  }
  catch (error: any) {
    // 5. Gérer les erreurs proprement
    throw createError({
      statusCode: error.statusCode || 500,
      // CORRECTION H3 : Utiliser 'message' au lieu de 'statusMessage'
      message: error.data?.message || error.message || 'Une erreur est survenue lors de la mise à jour.',
    })
  }
})
