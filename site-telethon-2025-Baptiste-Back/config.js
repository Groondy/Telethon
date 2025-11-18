// Dans une application de production, vous devriez utiliser la bibliothèque `dotenv`
// pour charger ces valeurs depuis un fichier .env
// require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || "votre_super_secret_a_ne_pas_partager",
  BCRYPT_SALT_ROUNDS: 10,
};
