const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(
    new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`)
  );
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error.';
  let details = error.details;

  if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with that value already exists.';
  }

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed.';
    details = Object.values(error.errors).map((entry) => entry.message);
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
