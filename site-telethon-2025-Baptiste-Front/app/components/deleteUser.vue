<template>
  <div class="delete-wrapper">
    <template v-if="!confirming">
      <button @click="confirmDelete" class="btn-delete">Supprimer</button>
    </template>
    <template v-else>
      <span class="confirm-text">Confirmer la suppression ?</span>
      <button @click="performDelete" class="btn-delete btn-confirm">Oui</button>
      <button @click="cancel" class="btn-secondary">Annuler</button>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  userId: {
    type: [String, Number],
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["userDeleted", "error"]);

const confirming = ref(false);

function confirmDelete() {
  confirming.value = true;
}

function cancel() {
  confirming.value = false;
}

async function performDelete() {
  try {
    await $fetch(`/api/users/${props.userId}`, {
      method: "DELETE",
    });
    emit("userDeleted");
  } catch (e: any) {
    const errorMessage =
      e.data?.statusMessage ||
      "Une erreur est survenue lors de la suppression.";
    emit("error", errorMessage);
    // Optionally show an alert if desired
  } finally {
    confirming.value = false;
  }
}
</script>
<style scoped lang="scss">
$red-600: #dc2626;
$red-800: #991b1b;

.btn-delete {
  color: $red-600;
  font-weight: 500;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: $red-800;
  }
}
</style>
