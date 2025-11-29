export default defineEventHandler(async (event) => {
  // 1. Récupérer l'URL de base de l'API depuis la configuration
  const body = await readBody(event)
  const { nom, prenom, password} = body
  const config = useRuntimeConfig(event);
  const apiUrl = config.public.apiUrl;

  if (!nom || !prenom || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'nom, prenom et password sont requis',
    })
  }
  try {
    // 2. Appeler l'API externe avec les identifiants
    // On suppose que l'API externe retourne les données de l'utilisateur en cas de succès
    const backendResponse = await $fetch(`${apiUrl}/api/admins/login`, {
      method: 'POST',
      body: {
        nom,
        prenom,
        password,
      },
    })

    const user = backendResponse.admin
    const token = backendResponse.accessToken
    // 3. Créer la session utilisateur avec nuxt-auth-utils
    // Assurez-vous que l'objet `user` contient les informations que vous voulez dans la session
    await setUserSession(event, { user, token })
    return {user}
  }
  catch (error: any) {
    // 4. Gérer les erreurs de l'API externe et les renvoyer au frontend
    // `error.data` contient généralement le corps de la réponse d'erreur de l'API
    const message = error.data?.message || error.data?.statusMessage || 'Une erreur est survenue lors de la connexion.';

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: message,
      data: error.data,
    })
  }
})
