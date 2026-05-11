class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const badRequest = (message, details) => new HttpError(400, message, details);
const unauthorized = (message, details) => new HttpError(401, message, details);
const conflict = (message, details) => new HttpError(409, message, details);
const notFound = (message, details) => new HttpError(404, message, details);

module.exports = { HttpError, badRequest, unauthorized, conflict, notFound };
