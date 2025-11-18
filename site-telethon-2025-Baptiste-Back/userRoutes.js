const express = require("express");
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserPoints,
  getTeamPoints,
  getAllItems,
  getTopPlayers,
} = require("./userController");
const { authenticateToken } = require("./authMiddleware");

const router = express.Router();

// --- Routes Publiques ---
// Il n'est pas nécessaire d'être authentifié pour voir les utilisateurs ou les scores.
router.get("/", getAllUsers);
router.get("/points/equipes", getTeamPoints);
router.get("/items", getAllItems);
router.get("/points/top10", getTopPlayers);

// --- Routes Protégées ---
// Seuls les administrateurs authentifiés peuvent modifier les données.
router.post("/", authenticateToken, createUser);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);
router.patch("/:id/points", authenticateToken, updateUserPoints);

module.exports = router;
