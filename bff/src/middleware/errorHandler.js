class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function notFoundHandler(req, res, next) {
  next(new HttpError(404, "Ruta no encontrada"));
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || "Error",
    message: err.message || "Error inesperado",
    details: err.details || null
  });
}

module.exports = { HttpError, errorHandler, notFoundHandler };
