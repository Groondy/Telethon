export default defineEventHandler(async (event) => {
  // 1. Protéger la route
  await requireUserSession(event)

  // 2. Récupérer le token de l'admin
  const session = await getUserSession(event)
  const token = session.token

  // 3. Récupérer l'ID de l'utilisateur et les nouvelles données
  const userId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { nom, prenom, couleur_equipe } = body

  if (!userId || !nom || !prenom || !couleur_equipe) {
    throw createError({ statusCode: 400, statusMessage: 'Données utilisateur incomplètes' })
  }

  try {
    // 4. Appeler l'API externe pour mettre à jour l'utilisateur
    const updatedUser = await $fetch(`http://localhost:3001/api/utilisateurs/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { nom, prenom, couleur_equipe },
    })

    // 5. Renvoyer l'utilisateur mis à jour
    return updatedUser
  }
  catch (error: any) {
    // 6. Gérer les erreurs
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.',
    })
  }
})
