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

          <div v-if="pending" class="loading-message">Chargement...</div>
          <div v-else-if="error" class="error-message">Erreur chargement items.</div>
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
            <button type="button" @click="closeModal" class="btn btn-secondary">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const { data: items, pending, error, refresh } = useFetch<{ data: Item[] }>('/api/items', {
  lazy: true,
  server: false,
  immediate: false, 
});

function openModal() {
  isModalOpen.value = true;
  addError.value = null;
  if (!items.value) refresh(); 
}

function closeModal() {
  isModalOpen.value = false;
}

async function handleAddPoints(item: Item) {
  if (loadingItem.value !== null) return; 

  loadingItem.value = item.id;
  addError.value = null;

  try {
    // Sécurité : on force la conversion en nombre
    const pointsToAdd = Number(item.prix);
    
    if (isNaN(pointsToAdd)) throw new Error("Le prix de l'item n'est pas un nombre valide");

    const newTotalPoints = props.userPoints + pointsToAdd;

    await $fetch(`/api/users/${props.userId}`, {
      method: "PATCH",
      body: { 
        points: newTotalPoints, // Le nouveau total (pour la mise à jour)
        pointsAdded: pointsToAdd, // Le montant ajouté (pour le log)
        itemName: item.nom // Le nom de l'item (pour le log)
      },
    });
    
    emit("pointsAdded");
    
  } catch (e: any) {
    // On récupère le message d'erreur proprement
    const errorMessage = e.data?.message || e.message || "Erreur lors de l'ajout des points.";
    addError.value = errorMessage;
    emit("error", errorMessage);
  } finally {
    loadingItem.value = null; 
  }
}
</script>

<style scoped lang="scss">
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/buttons";
@use "~/assets/scss/forms";

/* Vos styles existants... */
.btn-primary { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
.modal-overlay { z-index: 1000; position: fixed; inset: 0; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; padding: 1rem; }
.modal-card { background: white; padding: 1.5rem; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.modal-content { text-align: left; }
.modal-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; }
.current-points { font-size: 0.875rem; color: #666; margin-bottom: 1.5rem; }
.items-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.5rem; }
.btn-item { width: 100%; padding: 12px; background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.btn-item:hover:not(:disabled) { background-color: #e5e7eb; }
.btn-item:disabled { opacity: 0.7; cursor: wait; }
.modal-actions { display: flex; justify-content: flex-end; }
.error-message { color: #dc2626; margin-top: 10px; font-size: 0.875rem; text-align: center; }
.loading-message { text-align: center; color: #666; padding: 1rem; }
</style>
