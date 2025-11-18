
export default defineEventHandler(async (event) => {
  // 1. Protéger la route
  await requireUserSession(event)

  // 2. Récupérer le token de l'admin
  const session = await getUserSession(event)
  const token = session.token

  // 3. Récupérer l'ID de l'utilisateur et les points à ajouter
  const userId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { points } = body

  if (!userId || points === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'ID utilisateur ou points manquants' })
  }

  try {
    // 4. Appeler l'API externe pour mettre à jour les points
    // On suppose que le backend attend un objet avec les points à ajouter
    const updatedUser = await $fetch(`http://localhost:3001/api/utilisateurs/${userId}/points`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { points },
    })

    // Diffuser un message à tous les clients WebSocket connectés
    event.node.res.websocket?.send(JSON.stringify({ type: 'scores-updated' }))


    // 5. Renvoyer l'utilisateur mis à jour
    return updatedUser
  }
  catch (error: any) {
    // 6. Gérer les erreurs
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Une erreur est survenue lors de la mise à jour des points.',
    })
  }
})
