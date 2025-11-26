<template>
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
        <h3 class="team-name">{{ teamNames[score.couleur_equipe] || score.couleur_equipe }}</h3>
        <p class="points">{{ score.total_points }}</p>
        <p class="points-label">points</p>
      </div>
    </div>
  </div>

  <div class="top-players-container">
    <h2>Top 10 des meilleurs contributeurs</h2>
    <div v-if="topPlayersPending" class="loading-message">
      Chargement du classement...
    </div>
    <div v-else-if="topPlayersError" class="error-message">
      <p class="text-red-500">Impossible de charger le classement.</p>
    </div>
    <div v-else-if="topPlayers && topPlayers.data.length > 0" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Rang</th>
            <th>Nom</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(player, index) in topPlayers.data" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ player.prenom }} {{ player.nom }}</td>
            <td>{{ player.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="info-message">
      Aucun joueur n'a encore marqué de points.
    </div>
  </div>
  </template>

<script setup lang="ts">
const { user, loggedIn, clear } = useUserSession();
const teamNames: Record<string, string> = {
  'Bleu': 'Les Légionnaires',
  'Rouge': 'Les Charleston',
  'Vert': 'Les Grrrrrrr',
  'Jaune': 'Les Templiers'
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
interface TopPlayer {
  prenom: string;
  nom: string;
  points: number;
}

// NOUVEAU FETCH : Top 10 Joueurs
const {
  data: topPlayers,
  pending: topPlayersPending,
  error: topPlayersError,
  refresh: refreshTopPlayers,
} = useFetch<{ data: TopPlayer[] }>("/api/score/top10", {
  lazy: true,
});
</script>

<style scoped lang="scss">
/* 1. IMPORT OBLIGATOIRE DU MODULE COLOR */
@use "sass:color"; 
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/buttons";
@use "sass:map";

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
    color: $gray-900;

    .main-title {
      display: block;
    }

    .subtitle {
      display: block;
      color: $indigo-600;
    }
  }

  .user-section,
  .guest-section {
    margin-top: 1.5rem;
  }

  .welcome-message {
    font-size: 1.125rem;
    color: $gray-600;
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
  }

  .guest-section p {
    font-size: 1.25rem;
    color: $gray-500;
  }
}

.scores-container {
  margin-top: 2rem;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    text-align: center;
    color: $gray-800;
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
    color: $gray-800;
  }

  .table-wrapper {
    overflow-x: auto;
    background-color: $white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  th, td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid $gray-200;
    vertical-align: middle;
  }

  thead th {
    font-size: 0.875rem;
    font-weight: 600;
    color: $gray-600;
    background-color: $gray-50;
    text-transform: uppercase;
  }
  
  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background-color: $gray-50;
  }

  /* Style pour la colonne "Rang" */
  td:first-child, th:first-child {
    width: 80px;
    text-align: center;
    font-weight: 600;
  }
  
  // 1ère position : Doré
  tbody tr:nth-child(1) {
    background-color: #FFD700; // Couleur or
    font-weight: bold;
    color: $gray-900;

    td {
      // 2. SYNTAXE CORRIGÉE ICI ($blackness est requis)
      border-color: color.adjust(#FFD700, $blackness: 10%); 
    }
  }

  // 2ème position : Argent
  tbody tr:nth-child(2) {
    background-color: #C0C0C0; // Couleur argent
    font-weight: bold;
    color: $gray-800;

    td {
      // 2. SYNTAXE CORRIGÉE ICI
      border-color: color.adjust(#C0C0C0, $blackness: 10%);
    }
  }

  // 3ème position : Bronze
  tbody tr:nth-child(3) {
    background-color: #CD7F32; // Couleur bronze
    font-weight: bold;
    color: $white; 

    td {
      // 2. SYNTAXE CORRIGÉE ICI
      border-color: color.adjust(#CD7F32, $blackness: 10%);
    }
  }

  tbody tr:nth-child(1) td:first-child::before { content: '🥇'; margin-right: 5px; }
  tbody tr:nth-child(2) td:first-child::before { content: '🥈'; margin-right: 5px; }
  tbody tr:nth-child(3) td:first-child::before { content: '🥉'; margin-right: 5px; }

  .loading-message, .error-message, .info-message {
    text-align: center;
    padding: 2rem;
    color: $gray-500;
    background-color: $white;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .error-message {
    color: $red-500;
  }
}
</style>
