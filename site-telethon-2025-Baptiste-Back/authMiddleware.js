const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (token == null) {
    return res.sendStatus(401); // Unauthorized: pas de token
  }

  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err) {
      return res.sendStatus(403); // Forbidden: token invalide ou expiré
    }
    req.admin = admin;
    next();
  });
}

module.exports = { authenticateToken };
