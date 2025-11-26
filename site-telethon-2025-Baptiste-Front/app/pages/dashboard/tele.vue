<template>
  <div class="tv-container">
    <div class="grid-item zone-qr">
      <div class="qr-wrapper">
        <img src="/qr-code.png" alt="QR Code" class="qr-img" />
        <p>Scannez pour participer !</p>
      </div>
    </div>

    <div class="grid-item zone-logo">
      <img src="/logo_telethon.png" alt="Téléthon 2025" class="main-logo" />
    </div>

    <div class="grid-item zone-top10">
      <div class="card">
        <h2 :style="{ color: currentTeamColor }">Top 10 - {{ currentTeamName }}</h2>
        <div class="timer-bar">
          <div class="progress" :style="{ width: timerProgress + '%' }"></div>
        </div>
        
        <ul class="ranking-list">
          <li v-for="(user, index) in currentTop10" :key="user.id" class="rank-item">
            <span class="rank">#{{ index + 1 }}</span>
            <span class="name">{{ user.prenom }} {{ user.nom }}</span>
            <span class="score">{{ user.points }} pts</span>
          </li>
          <li v-if="currentTop10.length === 0" class="empty-msg">Aucun joueur</li>
        </ul>
      </div>
    </div>

    <div class="grid-item zone-scores-list">
      <div class="card">
        <h3>Classement Général</h3>
        <div v-for="team in sortedTeams" :key="team.couleur_equipe" class="team-row">
          <span class="team-label" :class="`text-${team.couleur_equipe}`">
            {{ teamNames[team.couleur_equipe] }}
          </span>
          <span class="team-points">{{ team.total_points }} pts</span>
        </div>
      </div>
    </div>

    <div class="grid-item zone-chart">
      <div class="chart-container">
        <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
      </div>
      <div class="team-logos-row">
        <img src="/logo_Bleu.png" class="team-logo" alt="Bleu" />
        <img src="/logo_Rouge.png" class="team-logo" alt="Rouge" />
        <img src="/logo_Vert.png" class="team-logo" alt="Vert" />
        <img src="/logo_Jaune.png" class="team-logo" alt="Jaune" />
      </div>
    </div>

    <div class="grid-item zone-logs">
      <div class="card">
        <h3>Derniers dons</h3>
        <div class="logs-list">
          <transition-group name="list">
            <div v-for="log in recentLogs?.data" :key="log.id" class="log-item">
              <span :class="`text-${log.couleur_equipe}`" class="log-name">
                {{ log.prenom_cible }} {{ log.nom_cible }}
              </span>
              a gagné
              <span class="log-amount">+{{ log.montant }}</span>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Bar } from 'vue-chartjs'
import { onMounted, onUnmounted, ref, computed } from 'vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
definePageMeta({ middleware: 'auth' })

const teamNames: Record<string, string> = {
  'Bleu': 'Les Légionnaires', 'Rouge': 'Les Charleston',
  'Vert': 'Les Grrrrrrr', 'Jaune': 'Les Templiers'
};
const teamColorsHex: Record<string, string> = {
  'Bleu': '#3b82f6', 'Rouge': '#ef4444', 'Vert': '#10b981', 'Jaune': '#eab308'
};

const { data: scores, refresh: refreshScores } = useFetch('/api/score');
const { data: logs, refresh: refreshLogs } = useFetch('/api/logs/recent');
const { data: allUsers, refresh: refreshUsers } = useFetch('/api/users');

const sortedTeams = computed(() => {
  return scores.value?.data ? [...scores.value.data].sort((a,b) => b.total_points - a.total_points) : [];
});

const recentLogs = computed(() => logs.value);

const chartData = computed(() => {
  if (!scores.value?.data) return null;
  const order = ['Bleu', 'Rouge', 'Vert', 'Jaune'];
  const orderedData = order.map(color => {
    const found = scores.value.data.find((s: any) => s.couleur_equipe === color);
    return found ? found.total_points : 0;
  });

  return {
    labels: order.map(c => teamNames[c]),
    datasets: [{
      data: orderedData,
      backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#eab308'],
      borderRadius: 4, 
      barPercentage: 0.9, 
      categoryPercentage: 0.9
    }]
  }
});

// --- MODIFICATION ICI (Options du Graphique) ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { 
      beginAtZero: true, 
      grid: { display: false }, 
      border: { display: false }, 
      // ON CACHE LES CHIFFRES (0, 500, ...)
      ticks: { display: false } 
    },
    x: { 
      grid: { display: false }, 
      border: { display: false },
      ticks: { display: false } 
    }
  }
};

const teamsOrder = ['Bleu', 'Rouge', 'Vert', 'Jaune'];
const currentTeamIndex = ref(0);
const timerProgress = ref(0);
let rotationInterval: any = null;
let progressInterval: any = null;

const currentTeamName = computed(() => teamNames[teamsOrder[currentTeamIndex.value]]);
const currentTeamColor = computed(() => teamColorsHex[teamsOrder[currentTeamIndex.value]]);

const currentTop10 = computed(() => {
  if (!allUsers.value?.data) return [];
  const color = teamsOrder[currentTeamIndex.value];
  return allUsers.value.data
    .filter((u: any) => u.couleur_equipe === color)
    .sort((a: any, b: any) => b.points - a.points)
    .slice(0, 10);
});

function startRotation() {
  rotationInterval = setInterval(() => {
    currentTeamIndex.value = (currentTeamIndex.value + 1) % 4;
    timerProgress.value = 0;
  }, 30000);

  progressInterval = setInterval(() => {
    timerProgress.value += (100 / 300);
  }, 100);
}

let ws: WebSocket | null = null;
onMounted(() => {
  startRotation();
  ws = new WebSocket('ws://localhost:3001');
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'scores-updated') {
      refreshScores();
      refreshLogs();
      refreshUsers();
    }
  };
});

onUnmounted(() => {
  clearInterval(rotationInterval);
  clearInterval(progressInterval);
  if (ws) ws.close();
});
</script>

<style scoped lang="scss">
@use "~/assets/scss/variables" as *;

.tv-container {
  display: grid;
  height: 100vh;
  // --- MODIFICATION ICI (Largeur et Box Sizing) ---
  width: 100%; // Au lieu de 100vw qui peut dépasser avec le padding
  box-sizing: border-box; // Assure que le padding est inclus dans la largeur
  
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 2rem; // La marge sera maintenant respectée à droite
  gap: 2rem;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 40fr 60fr; 
  grid-template-areas: 
    "qr logo top10"
    "scores chart logs";
  overflow: hidden;
  color: white;
}

/* --- Zones --- */
.zone-qr { grid-area: qr; display: flex; align-items: center; justify-content: center; }
.zone-logo { grid-area: logo; display: flex; justify-content: center; align-items: center; }
.zone-top10 { grid-area: top10; display: flex; align-items: center; justify-content: center; }
.zone-scores-list { grid-area: scores; display: flex; align-items: center; justify-content: center; }
.zone-chart { grid-area: chart; display: flex; flex-direction: column; justify-content: center; } 
.zone-logs { grid-area: logs; display: flex; align-items: center; justify-content: center; }

/* --- Styles des Cartes --- */
.card {
  background: #172554; 
  color: white;
  border-radius: 1.5rem; 
  padding: 1.5rem;
  height: fit-content; 
  width: 100%; 
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); 
  display: flex;
  flex-direction: column;
}

h2, h3 {
  text-align: center;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  color: white; 
  letter-spacing: 0.05em;
}

/* --- Images --- */
.qr-img { max-width: 100%; max-height: 250px; object-fit: contain; border-radius: 16px; border: 6px solid white; }
.qr-wrapper { text-align: center; font-weight: bold; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.main-logo { max-height: 200px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2)); }

/* Top 10 */
.ranking-list { list-style: none; padding: 0; flex: 1; overflow: hidden; }
.rank-item { 
  display: flex; justify-content: space-between; padding: 0.75rem 0.5rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  font-size: 1.1rem; font-weight: 600;
}
.rank { color: #9ca3af; width: 30px; font-weight: bold; } 
.timer-bar { height: 6px; background: rgba(255,255,255,0.1); margin-bottom: 15px; border-radius: 3px; overflow: hidden; }
.progress { height: 100%; background: #60a5fa; transition: width 0.1s linear; } 

/* Chart & Logos */
.chart-container { flex: 1; position: relative; min-height: 0; padding-bottom: 1rem; }
.team-logos-row {
  display: flex; justify-content: space-around; 
  align-items: center;
  margin-top: auto; 
  padding: 0 2rem;
}
.team-logo { 
  height: 120px; width: 120px; 
  object-fit: contain; 
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
  background: white;
  border-radius: 50%;
  padding: 10px;
}

/* Logs */
.log-item { 
  padding: 1rem; margin-bottom: 0.75rem; 
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px; font-size: 1rem; border-left: 4px solid transparent;
  animation: flash 1s;
}
.log-name { font-weight: 700; }
.log-amount { font-weight: 800; color: #fbbf24; float: right; } 

/* Couleurs Texte */
.text-Bleu { color: #60a5fa; } 
.text-Rouge { color: #f87171; } 
.text-Vert { color: #4ade80; } 
.text-Jaune { color: #facc15; } 

/* Scores List */
.team-row {
  display: flex; justify-content: space-between; padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  font-weight: 700; font-size: 1.25rem;
}

@keyframes flash {
  0% { background-color: rgba(254, 243, 199, 0.8); transform: scale(1.02); color: #1f2937; }
  100% { background-color: rgba(255, 255, 255, 0.1); transform: scale(1); color: white; }
}

.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from { opacity: 0; transform: translateX(30px); }
.list-leave-to { opacity: 0; transform: translateX(-30px); }
</style>
