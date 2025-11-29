// Charge les variables d'environnement depuis un fichier .env en développement
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET,
  BCRYPT_SALT_ROUNDS: 10,
};
