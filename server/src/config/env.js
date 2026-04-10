const path = require('node:path');

const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const DEFAULT_CLIENT_URL = 'http://localhost:3000';

function toNumber(value, fallback) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function normalizeOriginList(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const clientUrl = process.env.CLIENT_URL || DEFAULT_CLIENT_URL;
const sessionTtlDays = Math.max(toNumber(process.env.SESSION_TTL_DAYS, 7), 1);

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  port: toNumber(process.env.PORT, 4000),
  clientUrl,
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'codehub_session',
  sessionTtlMs: sessionTtlDays * 24 * 60 * 60 * 1000,
  allowedOrigins: Array.from(
    new Set([clientUrl, ...normalizeOriginList(process.env.CORS_ORIGINS)])
  ),
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:4000/api/auth/oauth/google/callback',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackUrl:
        process.env.GITHUB_CALLBACK_URL ||
        'http://localhost:4000/api/auth/oauth/github/callback',
    },
  },
};

function isProviderEnabled(providerName) {
  const provider = config.oauth[providerName];

  return Boolean(
    provider &&
      provider.clientId &&
      provider.clientSecret &&
      provider.callbackUrl
  );
}

function getEnabledProviders() {
  return {
    google: isProviderEnabled('google'),
    github: isProviderEnabled('github'),
  };
}

function validateServerConfig() {
  const missingKeys = [];

  if (!config.mongoUri) {
    missingKeys.push('MONGODB_URI');
  }

  if (!config.jwtSecret) {
    missingKeys.push('JWT_SECRET');
  }

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingKeys.join(', ')}`
    );
  }
}

function resolveClientRedirectUrl(pathname, query = {}) {
  const redirectUrl = pathname.startsWith('http')
    ? new URL(pathname)
    : new URL(pathname, config.clientUrl);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      redirectUrl.searchParams.set(key, String(value));
    }
  });

  return redirectUrl.toString();
}

module.exports = {
  config,
  getEnabledProviders,
  isProviderEnabled,
  resolveClientRedirectUrl,
  validateServerConfig,
};
