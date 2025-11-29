const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./database.js");
const { JWT_SECRET, BCRYPT_SALT_ROUNDS } = require("./config");

const getAllAdmins = (req, res, next) => {
  const sql = "SELECT id, nom, prenom FROM administrateurs";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return next(err);
    }
    res.json({
      message: "Liste des administrateurs récupérée avec succès",
      data: rows,
    });
  });
};

const loginAdmin = (req, res, next) => {
  const { nom, prenom, password } = req.body;
  if (!nom || !prenom || !password) {
    return res
      .status(400)
      .json({ error: "Le nom, le prénom et le mot de passe sont requis." });
  }

  const sql = "SELECT * FROM administrateurs WHERE nom = ? AND prenom = ?";
  db.get(sql, [nom, prenom], async (err, admin) => {
    if (err) {
      return next(err);
    }
    if (!admin) {
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    try {
      const match = await bcrypt.compare(password, admin.password_hash);
      if (match) {
        const adminPayload = {
          id: admin.id,
          nom: admin.nom,
          prenom: admin.prenom,
        };
        const accessToken = jwt.sign(adminPayload, JWT_SECRET, {
          expiresIn: "12h",
        });
        res.json({
          message: "Authentification réussie",
          accessToken,
          admin: adminPayload,
        });
      } else {
        res.status(401).json({ error: "Identifiants incorrects." });
      }
    } catch (compareError) {
      next(compareError);
    }
  });
};

module.exports = {
  getAllAdmins,
  loginAdmin,
};
