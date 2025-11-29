export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiUrl = config.public.apiUrl;
  try {
    return await $fetch(`${apiUrl}/api/utilisateurs/logs/recent`);
  } catch (error: any) {
    return { data: [] }; // Retourne un tableau vide en cas d'erreur
  }
});
