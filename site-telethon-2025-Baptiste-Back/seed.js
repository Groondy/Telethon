const db = require("./database.js");

const users = [
  { nom: "Dupont", prenom: "Jean", couleur_equipe: "Bleu", points: 50 },
  { nom: "Martin", prenom: "Marie", couleur_equipe: "Rouge", points: 120 },
  { nom: "Bernard", prenom: "Luc", couleur_equipe: "Vert", points: 80 },
  { nom: "Dubois", prenom: "Sophie", couleur_equipe: "Bleu", points: 95 },
  { nom: "Thomas", prenom: "Pierre", couleur_equipe: "Rouge", points: 30 },
  { nom: "Robert", prenom: "Alice", couleur_equipe: "Vert", points: 150 },
  { nom: "Richard", prenom: "Chloé", couleur_equipe: "Bleu", points: 75 },
  { nom: "Petit", prenom: "Julien", couleur_equipe: "Rouge", points: 110 },
  { nom: "Durand", prenom: "Camille", couleur_equipe: "Vert", points: 65 },
  { nom: "Leroy", prenom: "Léa", couleur_equipe: "Bleu", points: 130 },
];

db.serialize(() => {
  // On s'assure que la table est vide avant d'insérer pour éviter les doublons
  console.log("Suppression des anciens utilisateurs...");
  db.run("DELETE FROM utilisateurs", (err) => {
    if (err) {
      return console.error(
        "Erreur lors de la suppression des utilisateurs:",
        err.message
      );
    }

    console.log("Ajout de 10 nouveaux utilisateurs...");
    const stmt = db.prepare(
      "INSERT INTO utilisateurs (nom, prenom, couleur_equipe, points) VALUES (?, ?, ?, ?)"
    );

    users.forEach((user) => {
      stmt.run(user.nom, user.prenom, user.couleur_equipe, user.points);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error(
          "Erreur lors de la finalisation de l'insertion:",
          err.message
        );
      } else {
        console.log("10 utilisateurs ont été ajoutés avec succès.");
      }
    });
  });
});
