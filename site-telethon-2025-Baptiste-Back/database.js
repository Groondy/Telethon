// database.js
const sqlite3 = require("sqlite3").verbose();

// Ouvre la base de données (crée le fichier 'api.db' s'il n'existe pas)
const db = new sqlite3.Database("./api.db", (err) => {
  if (err) {
    console.error("Erreur à l'ouverture de la base de données", err.message);
  } else {
    console.log("Connecté à la base de données SQLite.");
    // Création des tables si elles n'existent pas
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS utilisateurs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL UNIQUE,
                prenom TEXT NOT NULL,
                couleur_equipe TEXT,
                points INTEGER DEFAULT 0 NOT NULL
            )`,
        (err) => {
          if (err) {
            console.error(
              "Erreur lors de la création de la table 'utilisateurs'",
              err.message
            );
          } else {
            console.log("Table 'utilisateurs' prête.");
          }
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS administrateurs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                prenom TEXT NOT NULL,
                password_hash TEXT NOT NULL
            )`,
        (err) => {
          if (err) {
            console.error(
              "Erreur lors de la création de la table 'administrateurs'",
              err.message
            );
          } else {
            console.log("Table 'administrateurs' prête.");
          }
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS item (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            pointsMin INTEGER,
            prix INTEGER NOT NULL,
            pointsMax INTEGER
        )`,
        (err) => {
          if (err) {
            return console.error(
              "Erreur lors de la création de la table 'item'",
              err.message
            );
          }
          console.log("Table 'item' prête.");
          // On insère les items de base uniquement si la table est vide
          db.get("SELECT COUNT(id) as count FROM item", (err, row) => {
            if (err) return;
            if (row.count === 0) {
              console.log("Insertion des items de base...");
              const stmt = db.prepare(
                "INSERT INTO item (nom, prix, pointsMin, pointsMax) VALUES (?, ?, ?, ?)"
              );
              const items = [
                { nom: "Gaufre", prix: 5, pointsMin: 20, pointsMax: 100 },
                { nom: "Crêpe", prix: 3, pointsMin: 10, pointsMax: 50 },
                { nom: "Tombola", prix: 10, pointsMin: 100, pointsMax: 1000 },
              ];
              items.forEach((item) =>
                stmt.run(item.nom, item.prix, item.pointsMin, item.pointsMax)
              );
              stmt.finalize();
              console.log("Items de base insérés.");
            }
          });
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prenom_cible TEXT,
            nom_cible TEXT,
            admin TEXT,
            item TEXT,
            montant REAL,
            received_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) {
            console.error(
              "Erreur lors de la création de la table 'logs'",
              err.message
            );
          } else {
            console.log("Table 'logs' prête.");
          }
        }
      );
    });
  }
});

module.exports = db;
