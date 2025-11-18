// create-admin-hash.js
const bcrypt = require("bcrypt");
const { BCRYPT_SALT_ROUNDS } = require("./config");

// Récupère le mot de passe depuis les arguments de la ligne de commande
const password = process.argv[2];

if (!password) {
  console.error("Veuillez fournir un mot de passe en argument.");
  console.log("Usage: node create-admin-hash.js <votre_mot_de_passe>");
  process.exit(1);
}

bcrypt.hash(password, BCRYPT_SALT_ROUNDS, (err, hash) => {
  if (err) {
    console.error("Erreur lors du hachage du mot de passe:", err);
    return;
  }
  console.log("\nMot de passe haché avec succès !");
  console.log("Copiez cette valeur pour l'étape suivante :");
  console.log("------------------------------------------------------------");
  console.log(hash);
  console.log("------------------------------------------------------------\n");
});
