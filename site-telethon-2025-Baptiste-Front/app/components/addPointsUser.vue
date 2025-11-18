<template>
  <div>
    <button @click="openModal" class="btn btn-primary">Ajouter</button>

    <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-content">
          <h3 class="modal-title">
            Ajouter des points à {{ prenom }} {{ nom }}
          </h3>
          <p class="current-points">
            Points actuels : {{ userPoints }}
          </p>

          <div v-if="pending" class="loading-message">
            Chargement des items...
          </div>
          <div v-else-if="error" class="error-message">
            Erreur lors du chargement des items.
          </div>
          <div v-else-if="items" class="items-grid">
            <button
              v-for="item in items.data"
              :key="item.id"
              @click="() => handleAddPoints(item)"
              class="btn btn-item"
              :disabled="loadingItem === item.id"
            >
              {{ loadingItem === item.id ? "..." : `${item.nom} (+${item.prix})` }}
            </button>
          </div>

          <p v-if="addError" class="error-message">{{ addError }}</p>

          <div class="modal-actions">
            <button
              type="button"
              @click="closeModal"
              class="btn btn-secondary"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// MODIFIÉ ICI: Mettre à jour l'interface Item
interface Item {
  id: number;
  nom: string;
  prix: number;
  pointsMin: number;
  pointsMax: number;
}

const props = defineProps({
  userId: { type: [String, Number], required: true },
  userPoints: { type: Number, required: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
});

const emit = defineEmits(["pointsAdded", "error"]);

const isModalOpen = ref(false);
const loadingItem = ref<number | null>(null);
const addError = ref<string | null>(null);

// Récupérer les items (données pour les boutons)
const { data: items, pending, error, refresh } = useFetch<{ data: Item[] }>('/api/items', {
  lazy: true,
  server: false,
  immediate: false, 
});

function openModal() {
  isModalOpen.value = true;
  addError.value = null;
  if (!items.value) {
    refresh(); 
  }
}

function closeModal() {
  isModalOpen.value = false;
}

// Logique d'ajout de points
async function handleAddPoints(item: Item) {
  if (loadingItem.value !== null) return; 

  loadingItem.value = item.id;
  addError.value = null;

  try {
    // MODIFIÉ ICI: item.points -> item.prix
    const newTotalPoints = props.userPoints + item.prix;

    await $fetch(`/api/users/${props.userId}`, {
      method: "PATCH",
      body: { points: newTotalPoints },
    });
    
    emit("pointsAdded");
    
  } catch (e: any) {
    const errorMessage = e.data?.statusMessage || "Erreur lors de l'ajout des points.";
    addError.value = errorMessage;
    emit("error", errorMessage);
  } finally {
    loadingItem.value = null; 
  }
}
</script>

<style scoped lang="scss">
/* Les styles sont inchangés par rapport à ma réponse précédente */
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/buttons";
@use "~/assets/scss/forms";

.btn-primary {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.modal-overlay {
  z-index: 1000;
  position: fixed;
  inset: 0;
  background-color: rgba($gray-600, 0.5);
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  position: relative;
  margin: auto;
  padding: 1.5rem;
  width: 100%;
  max-width: 32rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.375rem;
  background-color: $white;
}

.modal-content {
  text-align: left;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $gray-900;
  margin-bottom: 0.5rem;
}

.current-points {
  font-size: 0.875rem;
  color: $gray-600;
  margin-bottom: 1.5rem;
}

.loading-message, .error-message {
  text-align: center;
  padding: 1rem;
  color: $gray-600;
}

.error-message {
  color: $red-500;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn-item {
  @extend .btn;
  @extend .btn-secondary;
  width: 100%;
  padding: 0.75rem;
  font-size: 0.875rem;
  
  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
}

.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}
</style>
