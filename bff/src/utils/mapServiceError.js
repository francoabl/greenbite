const { HttpError } = require("../middleware/errorHandler");

function mapServiceError(err) {
  if (err.response) {
    const status = err.response.status || 502;
    const message = err.response.data?.message || "Error en servicio";
    return new HttpError(status, message, err.response.data);
  }
  if (err.request) {
    return new HttpError(504, "Servicio no disponible");
  }
  return err;
}

module.exports = { mapServiceError };
