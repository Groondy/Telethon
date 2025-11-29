const express = require("express");
const cors = require("cors");

const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
const { errorHandler } = require("./errorMiddleware");

const app = express();

// Middlewares globaux
app.use(
  cors({
    origin: (origin, callback) => {
      // En production, n'autoriser que le domaine du front-end.
      // En développement, on peut garder les origines locales.
      const allowedOrigins = ["https://telethon.imt-ne.fr"];
      if (process.env.NODE_ENV !== "production") {
        allowedOrigins.push("http://localhost:3000", "http://127.0.0.1:3000");
      }
      callback(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);
app.use(express.json());

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API de gestion des utilisateurs !" });
});

// Montage des routeurs
app.use("/api/utilisateurs", userRoutes);
app.use("/api/admins", adminRoutes);

// Middleware de gestion des erreurs (doit être le dernier)
app.use(errorHandler);

module.exports = app;
