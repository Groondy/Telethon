const db = require("./database.js");

const getAllUsers = (req, res, next) => {
  const sql = "SELECT * FROM utilisateurs";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return next(err);
    }
    res.json({
      message: "Liste des utilisateurs récupérée avec succès",
      data: rows,
    });
  });
};

const createUser = (req, res, next) => {
  const { nom, prenom, couleur_equipe, points } = req.body;
  if (!nom || !prenom) {
    return res.status(400).json({ error: "Le nom et le prénom sont requis." });
  }
  const sql =
    "INSERT INTO utilisateurs (nom, prenom, couleur_equipe, points) VALUES (?, ?, ?, ?)";
  db.run(sql, [nom, prenom, couleur_equipe, points || 0], function (err) {
    if (err) {
      return next(err);
    }
    res.status(201).json({
      message: "Utilisateur ajouté avec succès",
      data: {
        id: this.lastID,
        nom,
        prenom,
        couleur_equipe,
        points: points || 0,
      },
    });
  });
};

const updateUser = (req, res, next) => {
  const { nom, prenom, couleur_equipe, points } = req.body;
  const { id } = req.params;

  if (!nom || !prenom) {
    return res.status(400).json({ error: "Le nom et le prénom sont requis." });
  }

  const sql = `UPDATE utilisateurs SET 
                    nom = COALESCE(?, nom), 
                    prenom = COALESCE(?, prenom), 
                    couleur_equipe = COALESCE(?, couleur_equipe),
                    points = COALESCE(?, points)
                 WHERE id = ?`;

  db.run(sql, [nom, prenom, couleur_equipe, points, id], function (err) {
    if (err) {
      return next(err);
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.json({
      message: `Utilisateur avec l'ID ${id} modifié avec succès`,
      changes: this.changes,
    });
  });
};

const deleteUser = (req, res, next) => {
  const { id } = req.params;
  const sql = "DELETE FROM utilisateurs WHERE id = ?";
  db.run(sql, id, function (err) {
    if (err) {
      return next(err);
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.json({
      message: `Utilisateur avec l'ID ${id} supprimé avec succès`,
      changes: this.changes,
    });
  });
};

const updateUserPoints = (req, res, next) => {
  const { id } = req.params;
  const { points } = req.body;

  // Validation: s'assurer que les points sont un nombre
  if (typeof points !== "number") {
    return res
      .status(400)
      .json({ error: "Le champ 'points' doit être un nombre." });
  }

  const sql = `UPDATE utilisateurs SET points = ? WHERE id = ?`;

  db.run(sql, [points, id], function (err) {
    if (err) {
      return next(err);
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.json({
      message: `Points de l'utilisateur ${id} mis à jour avec succès.`,
      changes: this.changes,
    });

    // --- Notification WebSocket ---
    // Récupérer l'instance du serveur WebSocket
    const wss = req.app.get("wss");
    // Préparer le message de notification
    const notification = {
      type: "scores-updated",
      payload: { userId: id, points },
    };
    // Envoyer la notification à TOUS les clients connectés
    wss.clients.forEach((client) => {
      // On vérifie que le client est prêt à recevoir des messages
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  });
};

const getTeamPoints = (req, res, next) => {
  const sql = `
    SELECT 
      couleur_equipe, 
      SUM(points) as total_points 
    FROM utilisateurs 
    WHERE couleur_equipe IS NOT NULL AND couleur_equipe != ''
    GROUP BY couleur_equipe
    ORDER BY total_points DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return next(err);
    }
    res.json({
      message: "Total des points par équipe récupéré avec succès",
      data: rows,
    });
  });
};

const getAllItems = (req, res, next) => {
  const sql = "SELECT * FROM item ORDER BY pointsMin ASC"; // Ordonner par points
  db.all(sql, [], (err, rows) => {
    if (err) {
      return next(err);
    }
    res.json({
      message: "Liste des items récupérée avec succès",
      data: rows,
    });
  });
};

const getTopPlayers = (req, res, next) => {
  // Sélectionne les colonnes, ordonne par points (décroissant) et prend les 10 premiers
  const sql = "SELECT prenom, nom, points FROM utilisateurs ORDER BY points DESC LIMIT 10";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return next(err);
    }
    res.json({
      message: "Top 10 des joueurs récupéré avec succès",
      data: rows,
    });
  });
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserPoints,
  getTeamPoints,
  getAllItems,
  getTopPlayers,
};
