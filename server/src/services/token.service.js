const jwt = require('jsonwebtoken');

const { config } = require('../config/env');

function createSessionToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtSecret, {
    expiresIn: Math.floor(config.sessionTtlMs / 1000),
    issuer: 'codehub-api',
    audience: 'codehub-client',
  });
}

function verifySessionToken(token) {
  return jwt.verify(token, config.jwtSecret, {
    issuer: 'codehub-api',
    audience: 'codehub-client',
  });
}

module.exports = {
  createSessionToken,
  verifySessionToken,
};
