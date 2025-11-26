<template>
  <div>
    <button @click="openModal" class="btn-edit">Modifier</button>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-content">
          <h3 class="modal-title">Modifier l'utilisateur</h3>
          <form @submit.prevent="handleUpdate" class="modal-form">
            <div class="form-container">
              <div class="form-group">
                <label for="prenom">Prénom:</label>
                <input
                  id="prenom"
                  v-model="editableUser.prenom"
                  type="text"
                  required
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="nom">Nom:</label>
                <input
                  id="nom"
                  v-model="editableUser.nom"
                  type="text"
                  required
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="couleur_equipe">Équipe :</label>
                <select
                  id="couleur_equipe"
                  v-model="editableUser.couleur_equipe"
                  required
                  class="form-control"
                >
                  <option value="Bleu">Les Légionnaires</option>
                  <option value="Rouge">Les Charleston</option>
                  <option value="Vert">Les Grrrrrrr</option>
                  <option value="Jaune">Les Templiers</option>
                </select>
              </div>
            </div>
            <p v-if="error" class="error-message">{{ error }}</p>
            <div class="modal-actions">
              <button type="submit" class="btn btn-primary">Enregistrer</button>
              <button
                type="button"
                @click="closeModal"
                class="btn btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["userUpdated", "error"]);

const isModalOpen = ref(false);
const editableUser = ref({ ...props.user });
const error = ref<string | null>(null);

function openModal() {
  // Réinitialiser le formulaire avec les données actuelles de l'utilisateur à chaque ouverture
  editableUser.value = { ...props.user };
  error.value = null;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

async function handleUpdate() {
  error.value = null;
  try {
    await $fetch(`/api/users/${props.user.id}`, {
      method: "PUT",
      body: {
        nom: editableUser.value.nom,
        prenom: editableUser.value.prenom,
        couleur_equipe: editableUser.value.couleur_equipe,
      },
    });
    emit("userUpdated");
    closeModal();
  } catch (e: any) {
    error.value =
      e.data?.statusMessage ||
      "Une erreur est survenue lors de la mise à jour.";
    emit("error", error.value);
  }
}
</script>
<style scoped lang="scss">
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/buttons";
@use "~/assets/scss/forms";

.btn-edit {
  color: $indigo-600;
  font-weight: 500;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: $indigo-800;
  }
}

.modal-overlay {
  z-index: 1000;
  position: fixed;
  inset: 0;
  background-color: rgba($gray-600, 0.5);
  overflow-y: auto;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  position: relative;
  margin: auto;
  padding: 1.5rem;
  border: 1px solid $gray-300;
  width: 90%;
  max-width: 28rem; // 448px
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.375rem;
  background-color: $white;
}

.modal-content {
  margin-top: 0.75rem;
  text-align: center;
}

.modal-title {
  font-size: 1.25rem;
  line-height: 1.5rem;
  font-weight: 500;
  color: $gray-900;
}

.modal-form {
  margin-top: 1rem;
  text-align: left;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 640px) {
    flex-direction: row;
    gap: 1.5rem;
  }
  .form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .form-control {
      width: 90%;
    }
  }
}

.error-message {
  margin-top: 1rem;
  color: $red-500;
  font-size: 0.875rem;
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: flex-end;
  }
}

.btn {
  width: 100%;

  &-primary {
    background-color: $indigo-500;
  }

  &-secondary {
    background-color: $gray-200;
    &:hover {
      background-color: $gray-300;
    }
  }
}
</style>
