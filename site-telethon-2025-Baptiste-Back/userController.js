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
  // On récupère les infos pour le log
  const { points, pointsAdded, itemName, adminName } = req.body;

  if (typeof points !== "number") {
    return res.status(400).json({ error: "Le champ 'points' doit être un nombre." });
  }

  // 1. Mise à jour des points
  const sqlUpdate = `UPDATE utilisateurs SET points = ? WHERE id = ?`;

  db.run(sqlUpdate, [points, id], function (err) {
    if (err) return next(err);
    if (this.changes === 0) return res.status(404).json({ message: "Utilisateur non trouvé." });

    // 2. Récupérer les infos de l'utilisateur cible pour le log
    db.get("SELECT nom, prenom FROM utilisateurs WHERE id = ?", [id], (err, targetUser) => {
      if (err) {
        console.error("Erreur récupération user pour log:", err);
      } else if (targetUser && pointsAdded && itemName && adminName) {
        
        // 3. Création du log
        const sqlLog = `INSERT INTO logs (prenom_cible, nom_cible, admin, item, montant) VALUES (?, ?, ?, ?, ?)`;
        db.run(sqlLog, [
          targetUser.prenom,
          targetUser.nom,
          adminName,
          itemName,
          pointsAdded
        ], (logErr) => {
          if (logErr) console.error("Erreur insertion log:", logErr);
        });
      }
    });

    res.json({
      message: `Points mis à jour et action loggée.`,
      changes: this.changes,
    });

    // Notification WebSocket
    const wss = req.app.get("wss");
    const notification = {
      type: "scores-updated",
      payload: { userId: id, points },
    };
    wss.clients.forEach((client) => {
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

const getRecentLogs = (req, res, next) => {
  // On joint les tables pour récupérer la couleur de l'équipe du joueur cible
  const sql = `
    SELECT l.id, l.prenom_cible, l.nom_cible, l.montant, u.couleur_equipe
    FROM logs l
    LEFT JOIN utilisateurs u ON l.nom_cible = u.nom AND l.prenom_cible = u.prenom
    ORDER BY l.id DESC
    LIMIT 5
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return next(err);
    res.json({ message: "Logs récupérés", data: rows });
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
  getRecentLogs,
};
