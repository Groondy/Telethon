export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    return navigateTo('/login')
  }
})

