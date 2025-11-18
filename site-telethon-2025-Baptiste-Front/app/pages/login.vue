<template>
  <div class="login-container">
    <div class="form-card">
      <h1 class="title">Connexion Administrateur</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="prenom">Prénom</label>
          <input
            id="prenom"
            v-model="prenom"
            type="text"
            autocomplete="given-name"
            required
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="nom">Nom</label>
          <input
            id="nom"
            v-model="nom"
            type="text"
            autocomplete="family-name"
            required
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="form-control"
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? "Connexion en cours..." : "Se connecter" }}
        </button>
        <p v-if="error" class="error-message">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const nom = ref("");
const prenom = ref("");
const password = ref("");
const error = ref<string | null>(null);
const isLoading = ref(false);

const { fetch: fetchSession } = useUserSession();

function handleLogin() {
  if (isLoading.value) return; // Empêche les soumissions multiples
  isLoading.value = true;
  error.value = null;

  $fetch("/api/auth/login", {
    method: "POST",
    body: { nom: nom.value, prenom: prenom.value, password: password.value },
  })
    .then(() => {
      console.log("Login successful");
      fetchSession(); // On lance le rafraîchissement sans attendre
      navigateTo("/dashboard", { external: true }); // On lance la navigation sans attendre
    })
    .catch((e: any) => {
      // Affiche un message d'erreur plus détaillé.
      const errorMessage =
        e.data?.statusMessage ||
        e.data?.message ||
        (typeof e.data === "string" ? e.data : null);
      error.value = errorMessage ?? "Une erreur est survenue.";
    })
    .finally(() => {
      isLoading.value = false;
    });
}
</script>
<style scoped lang="scss">
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/buttons";
@use "~/assets/scss/forms";

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: $gray-100;
  padding: 1rem;
}

.form-card {
  width: 100%;
  max-width: 400px;
  background-color: $white;
  padding: 2.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
  text-align: center;
  color: $gray-900;
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.btn {
  font-weight: 600;
  margin-top: 0.5rem;
}
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: $red-500;
  text-align: center;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>
