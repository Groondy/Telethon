<template>
  <div class="home-wrapper">
    <div class="page-container">
      <div class="header-section">
        <h1>
          <span class="main-title">Téléthon 2025</span>
          <span class="subtitle">Suivi des Scores</span>
        </h1>
        <div v-if="user" class="user-section">
          <p class="welcome-message">
            Bienvenue, <strong>{{ user.prenom }} {{ user.nom }}</strong> !
          </p>
          <div class="user-actions">
            <NuxtLink to="/dashboard" class="btn btn-primary"
              >Accéder au tableau de bord</NuxtLink
            >
            <button @click="clear" class="btn btn-secondary">
              Se déconnecter
            </button>
          </div>
        </div>
        <div v-else class="guest-section">
          <p>Bienvenue sur la plateforme de suivi des points !</p>
        </div>
      </div>
    </div>

    <div class="scores-container">
      <h2>Scores des équipes</h2>
      <div v-if="pending" class="loading-message">Chargement des scores...</div>
      <div v-else-if="error">
        <p class="text-red-500">Impossible de charger les scores.</p>
      </div>
      <div v-else-if="scores" class="scores-grid">
        <div
          v-for="score in scores.data"
          :key="score.couleur_equipe"
          class="score-card"
          :class="`team-${score.couleur_equipe.toLowerCase()}`"
        >
          <h3 class="team-name">
            {{ teamNames[score.couleur_equipe] || score.couleur_equipe }}
          </h3>
          <p class="points">{{ score.total_points }}</p>
          <p class="points-label">points</p>
        </div>
      </div>
    </div>

    <div class="top-players-container">
      <h2>Classement Général</h2>
      <div class="ranking-content-wrapper">
        <transition name="fade" mode="out-in">
          <div v-if="topPlayersPending" key="loading" class="loading-message">
            Chargement du classement...
          </div>
          <div v-else-if="topPlayersError" key="error" class="error-message">
            <p class="text-red-500">Impossible de charger le classement.</p>
          </div>
          <div
            v-else-if="paginatedPlayers.length > 0"
            key="table"
            class="table-wrapper"
          >
            <table :class="{ 'first-page-podium': currentPage === 1 }">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Nom</th>
                  <th>Équipe</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(player, index) in paginatedPlayers"
                  :key="player.id"
                >
                  <td data-label="Rang">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  <td data-label="Nom">{{ player.prenom }} {{ player.nom }}</td>
                  <td data-label="Équipe">
                    {{
                      teamNames[player.couleur_equipe] || player.couleur_equipe
                    }}
                  </td>
                  <td data-label="Points">{{ player.points }}</td>
                </tr>
              </tbody>
            </table>
            <!-- Pagination Controls -->
            <div v-if="totalPages > 1" class="pagination-controls">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="btn btn-secondary"
              >
                Précédent
              </button>
              <span class="number-page"
                >Page {{ currentPage }} sur {{ totalPages }}</span
              >
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="btn btn-secondary"
              >
                Suivant
              </button>
            </div>
          </div>
          <div v-else key="no-players" class="info-message">
            Aucun joueur n'a encore marqué de points.
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession();
const teamNames: Record<string, string> = {
  Bleu: "Les Légionnaires",
  Rouge: "Les Charleston",
  Vert: "Les Grrrrrrr",
  Jaune: "Les Templiers",
};
// Interface pour les scores d'équipe (Existante)
interface TeamScore {
  couleur_equipe: string;
  total_points: number;
}

// Fetch des scores d'équipe (Existant)
const {
  data: scores,
  pending,
  error,
  refresh: refreshScores,
} = useFetch<{ data: TeamScore[] }>("/api/score", {
  lazy: true,
});

// NOUVELLE INTERFACE : Top Player
interface Player {
  id: number;
  prenom: string;
  nom: string;
  points: number;
  couleur_equipe: string;
}

// Fetch de tous les joueurs
const {
  data: allPlayers,
  pending: topPlayersPending,
  error: topPlayersError,
  refresh: refreshTopPlayers,
} = useFetch("/api/users", {
  lazy: true,
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const sortedPlayers = computed(() => {
  if (!allPlayers.value?.data) return [];

  // Noms complets à exclure, insensibles à la casse
  const excludedFullNames = new Set([
    "EQUIPE LEGIONNAIRES",
    "EQUIPE GRRRRRRR",
    "EQUIPE TEMPLIERS",
    "EQUIPE CHARLESTON",
  ]);

  return allPlayers.value.data
    .filter((p) => {
      const fullName = `${p.prenom} ${p.nom}`.toUpperCase();
      return !excludedFullNames.has(fullName);
    })
    .sort((a, b) => b.points - a.points);
});

const totalPages = computed(() => {
  return Math.ceil(sortedPlayers.value.length / itemsPerPage.value);
});

const paginatedPlayers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedPlayers.value.slice(start, end);
});

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

const config = useRuntimeConfig();
const wsUrl = config.public.wsUrl;

let ws: WebSocket | null = null;
onMounted(() => {
  ws = new WebSocket(wsUrl);
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "scores-updated") {
      refreshScores();
      refreshTopPlayers();
    }
  };
});

onUnmounted(() => {
  if (ws) ws.close();
});
</script>

<style scoped lang="scss">
/* 1. IMPORT OBLIGATOIRE DU MODULE COLOR */
@use "sass:color";
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/buttons";
@use "sass:map";

.home-wrapper {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 1rem 0;
}

/* ... (tous vos styles existants pour .page-container, .header-section, .scores-container...) ... */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 3rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: $white;

    .main-title {
      display: block;
    }

    .subtitle {
      display: block;
      color: $jaune;
    }
  }

  .user-section,
  .guest-section {
    margin-top: 1.5rem;
  }

  .welcome-message {
    font-size: 1.125rem;
    color: $gray-200;
    strong {
      font-weight: 600;
    }
  }

  .user-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    .btn-primary {
      background: $orange;
    }
  }

  .guest-section p {
    font-size: 1.25rem;
    color: $gray-300;
  }
}

.scores-container {
  margin-bottom: 2rem;

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    text-align: center;
    color: $white;
  }

  .loading-message {
    text-align: center;
    color: $gray-500;
  }

  .text-red-500 {
    color: $red-500;
  }

  .scores-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (min-width: 768px) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .score-card {
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;

    .team-name {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .points {
      font-size: 2.25rem;
      font-weight: 800;
      margin-top: 0.75rem;
    }

    .points-label {
      font-size: 1.125rem;
      font-weight: 500;
    }
  }

  // Génération des classes pour chaque équipe
  @each $name, $props in $team-colors {
    .team-#{$name} {
      background-color: map.get($props, bg);
      border: 1px solid map.get($props, border);
      color: map.get($props, text);
    }
  }
}

@media (min-width: 640px) {
  .header-section h1 {
    font-size: 4rem;
  }
}

@media (min-width: 768px) {
  .page-container {
    padding: 4rem;
  }
  .header-section h1 {
    font-size: 5rem;
  }
}

/* NOUVEAUX STYLES POUR LE CLASSEMENT DES JOUEURS */
.top-players-container {
  max-width: 800px;
  margin: 3rem auto;
  padding: 0 1rem;

  @media (min-width: 768px) {
    padding: 0 2rem;
  }

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    text-align: center;
    color: $white;
  }

  .ranking-content-wrapper {
    min-height: 600px; /* Hauteur minimale pour éviter le "saut" de la mise en page */
  }

  .table-wrapper {
    overflow-x: auto;
    background-color: #172554;
    opacity: 0.9;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  th,
  td {
    color: $white;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    vertical-align: middle;
  }

  thead th {
    font-size: 0.875rem;
    font-weight: 600;
    color: $gray-300;
    background-color: rgba(255, 255, 255, 0.05);
    text-transform: uppercase;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  /* Style pour la colonne "Rang" */
  td:first-child,
  th:first-child {
    width: 80px;
    text-align: right;
    font-weight: 600;
  }

  // 1ère position : Doré
  table.first-page-podium tbody tr:nth-child(1) {
    background-color: #b8860b; // DarkGoldenRod
    font-weight: bold;
    color: $white;

    td {
      // 2. SYNTAXE CORRIGÉE ICI ($blackness est requis)
      border-color: color.adjust(#b8860b, $lightness: -10%);
    }
  }

  // 2ème position : Argent
  table.first-page-podium tbody tr:nth-child(2) {
    background-color: #708090; // SlateGray
    font-weight: bold;
    color: $white;

    td {
      // 2. SYNTAXE CORRIGÉE ICI
      border-color: color.adjust(#708090, $lightness: -10%);
    }
  }

  // 3ème position : Bronze
  table.first-page-podium tbody tr:nth-child(3) {
    background-color: #8c5a2b; // SaddleBrown plus clair
    font-weight: bold;
    color: $white;

    td {
      // 2. SYNTAXE CORRIGÉE ICI
      border-color: color.adjust(#cd7f32, $blackness: 10%);
    }
  }

  table.first-page-podium tbody tr:nth-child(1) td:first-child::before {
    content: "🥇";
    margin-right: 5px;
  }
  table.first-page-podium tbody tr:nth-child(2) td:first-child::before {
    content: "🥈";
    margin-right: 5px;
  }
  table.first-page-podium tbody tr:nth-child(3) td:first-child::before {
    content: "🥉";
    margin-right: 5px;
  }

  .loading-message,
  .error-message,
  .info-message {
    text-align: center;
    padding: 2rem;
    color: $gray-300;
    background-color: rgba(23, 37, 84, 0.5);
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .error-message {
    color: $red-500;
  }

  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
    padding: 1rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1); /* Garde la séparation visuelle */

    .number-page {
      color: $white;
    }
  }

  /* --- Responsive pour le tableau (style dashboard) --- */
  @media (max-width: 767px) {
    .table-wrapper {
      background-color: transparent;
      box-shadow: none;
      border: none;
    }

    table,
    thead,
    tbody,
    th,
    td,
    tr {
      display: block;
    }

    thead tr {
      position: absolute;
      top: -9999px;
      left: -9999px;
    }

    tr {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      background-color: rgba(23, 37, 84, 0.5);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    td {
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      padding-left: 50%;
      text-align: right;
      white-space: normal;
      color: $white;
    }

    td:before {
      content: attr(data-label);
      position: absolute;
      top: 1rem;
      left: 1.5rem;
      width: 45%;
      padding-right: 0.5rem;
      white-space: nowrap;
      text-align: left;
      font-weight: 600;
      color: $gray-300;
    }

    /* Spécifiquement pour la cellule du rang, pour s'assurer de l'alignement */
    td[data-label="Rang"] {
      text-align: right;
      width: 40%;
    }

    tbody tr:last-child td:last-child {
      border-bottom: none;
    }
  }
}

/* Styles pour la transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
