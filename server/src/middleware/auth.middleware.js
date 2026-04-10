const { config } = require('../config/env');
const User = require('../models/User');
const { verifySessionToken } = require('../services/token.service');
const ApiError = require('../utils/ApiError');
const { clearAuthCookie, getCookie } = require('../utils/cookies');

function getTokenFromRequest(req) {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    return authorizationHeader.slice(7).trim();
  }

  return getCookie(req, config.sessionCookieName);
}

async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new ApiError(401, 'Authentication required.');
    }

    const payload = verifySessionToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      clearAuthCookie(res);
      throw new ApiError(401, 'Your session is no longer valid.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      clearAuthCookie(res);
      return next(
        new ApiError(401, 'Your session expired. Please sign in again.')
      );
    }

    return next(error);
  }
}

module.exports = {
  requireAuth,
};
