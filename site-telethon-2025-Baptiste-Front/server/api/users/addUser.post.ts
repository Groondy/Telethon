export default defineEventHandler(async (event) => {
  // 1. Protéger la route et s'assurer que l'admin est connecté
  await requireUserSession(event)

  // 2. Récupérer le token de la session de l'admin
  const session = await getUserSession(event)
  const token = session.token

  // 3. Lire les données du nouvel utilisateur depuis le corps de la requête
  const body = await readBody(event)
  const { nom, prenom, couleur_equipe, points } = body


  if (!nom || !prenom || !couleur_equipe ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tous les champs sont requis',
    })
  }

  try {
    // 4. Appeler l'API externe pour créer le nouvel utilisateur
    const newUser = await $fetch('http://localhost:3001/api/utilisateurs', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { nom, prenom, couleur_equipe, points },
    })

    // 5. Renvoyer le nouvel utilisateur créé
    return newUser
  }
  catch (error: any) {
    // 6. Gérer les erreurs de l'API externe
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Une erreur est survenue lors de la création de l\'utilisateur.',
      data: error.data,
    })
  }
})
