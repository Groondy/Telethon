/**
 * Middleware de gestion d'erreurs pour Express.
 * Il doit être le dernier middleware ajouté à l'application.
 */
const errorHandler = (err, req, res, next) => {
  // Log l'erreur pour le débogage. Dans une vraie application,
  // vous utiliseriez un logger plus robuste (comme Winston).
  console.error(err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || "Une erreur interne est survenue.",
    // En développement, on peut ajouter la stack trace pour aider au débogage
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { errorHandler };
