const { config } = require('../config/env');

function getBaseCookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
  };
}

function setAuthCookie(res, token) {
  res.cookie(config.sessionCookieName, token, {
    ...getBaseCookieOptions(),
    maxAge: config.sessionTtlMs,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(config.sessionCookieName, getBaseCookieOptions());
}

function getOauthStateCookieName(providerName) {
  return `codehub_oauth_${providerName}_state`;
}

function setOauthStateCookie(res, providerName, state) {
  res.cookie(getOauthStateCookieName(providerName), state, {
    ...getBaseCookieOptions(),
    maxAge: 10 * 60 * 1000,
  });
}

function clearOauthStateCookie(res, providerName) {
  res.clearCookie(getOauthStateCookieName(providerName), getBaseCookieOptions());
}

function getCookie(req, cookieName) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');

  for (const cookieEntry of cookies) {
    const [rawName, ...rawValueParts] = cookieEntry.trim().split('=');
    if (rawName === cookieName) {
      return decodeURIComponent(rawValueParts.join('='));
    }
  }

  return null;
}

module.exports = {
  clearAuthCookie,
  clearOauthStateCookie,
  getCookie,
  getOauthStateCookieName,
  setAuthCookie,
  setOauthStateCookie,
};
