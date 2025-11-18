const http = require("http");
const { WebSocketServer } = require("ws");
const app = require("./app");
const { PORT } = require("./config");
require("./database.js"); // On s'assure que la connexion à la DB est initialisée

// 1. Créer un serveur HTTP à partir de l'application Express
const server = http.createServer(app);

// 2. Créer une instance de WebSocketServer et l'attacher au serveur HTTP
const wss = new WebSocketServer({ server });

// 3. Rendre le serveur WebSocket accessible globalement dans l'application
app.set("wss", wss);

// 4. Gérer les nouvelles connexions WebSocket
wss.on("connection", (ws) => {
  console.log("✅ Un client vient de se connecter au WebSocket.");

  // Envoyer un message de bienvenue au client qui vient de se connecter
  ws.send(JSON.stringify({ message: "Bienvenue sur le serveur WebSocket !" }));

  ws.on("close", () => {
    console.log("❌ Un client vient de se déconnecter.");
  });
});

// 5. Démarrer le serveur HTTP (qui gère aussi les WebSockets)
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
