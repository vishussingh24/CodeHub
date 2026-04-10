const { randomBytes } = require('node:crypto');

const { config, isProviderEnabled } = require('../config/env');
const ApiError = require('../utils/ApiError');

const PROVIDER_DEFINITIONS = {
  google: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    buildAuthorizationParams(providerConfig, state) {
      return {
        client_id: providerConfig.clientId,
        redirect_uri: providerConfig.callbackUrl,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'select_account',
        state,
      };
    },
    async exchangeCodeForToken(providerConfig, code) {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: providerConfig.clientId,
          client_secret: providerConfig.clientSecret,
          redirect_uri: providerConfig.callbackUrl,
          grant_type: 'authorization_code',
        }),
      });

      const payload = await parseJsonResponse(
        response,
        'Unable to exchange Google authorization code.'
      );

      return payload.access_token;
    },
    async fetchProfile(accessToken) {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await parseJsonResponse(
        response,
        'Unable to load your Google profile.'
      );

      if (!payload.email || !payload.sub) {
        throw new ApiError(400, 'Google did not return a usable account profile.');
      }

      return {
        providerId: payload.sub,
        email: String(payload.email).trim().toLowerCase(),
        name: payload.name || '',
        avatarUrl: payload.picture || '',
        emailVerified: Boolean(payload.email_verified),
      };
    },
  },
  github: {
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    buildAuthorizationParams(providerConfig, state) {
      return {
        client_id: providerConfig.clientId,
        redirect_uri: providerConfig.callbackUrl,
        scope: 'read:user user:email',
        state,
        allow_signup: 'true',
      };
    },
    async exchangeCodeForToken(providerConfig, code) {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'CodeHub Auth',
        },
        body: new URLSearchParams({
          code,
          client_id: providerConfig.clientId,
          client_secret: providerConfig.clientSecret,
          redirect_uri: providerConfig.callbackUrl,
        }),
      });

      const payload = await parseJsonResponse(
        response,
        'Unable to exchange GitHub authorization code.'
      );

      return payload.access_token;
    },
    async fetchProfile(accessToken) {
      const headers = {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'CodeHub Auth',
      };

      const profileResponse = await fetch('https://api.github.com/user', {
        headers,
      });
      const profile = await parseJsonResponse(
        profileResponse,
        'Unable to load your GitHub profile.'
      );

      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers,
      });
      const emails = await parseJsonResponse(
        emailsResponse,
        'Unable to load your GitHub email address.'
      );

      const primaryVerifiedEmail =
        emails.find((entry) => entry.primary && entry.verified) ||
        emails.find((entry) => entry.verified) ||
        emails[0];

      if (!primaryVerifiedEmail?.email || !profile.id) {
        throw new ApiError(
          400,
          'GitHub did not return a verified email address for this account.'
        );
      }

      return {
        providerId: String(profile.id),
        email: String(primaryVerifiedEmail.email).trim().toLowerCase(),
        name: profile.name || profile.login || '',
        avatarUrl: profile.avatar_url || '',
        username: profile.login || '',
        emailVerified: Boolean(primaryVerifiedEmail.verified),
      };
    },
  },
};

async function parseJsonResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorMessage =
      typeof payload === 'string'
        ? payload
        : payload.error_description || payload.error || payload.message;

    throw new ApiError(502, errorMessage || fallbackMessage);
  }

  return payload;
}

function getProviderDefinition(providerName) {
  const definition = PROVIDER_DEFINITIONS[providerName];

  if (!definition) {
    throw new ApiError(404, 'Unsupported authentication provider.');
  }

  if (!isProviderEnabled(providerName)) {
    throw new ApiError(
      503,
      `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} sign-in is not configured yet.`
    );
  }

  return definition;
}

function getAuthorizationUrl(providerName, state) {
  const definition = getProviderDefinition(providerName);
  const providerConfig = config.oauth[providerName];
  const authorizationUrl = new URL(definition.authorizationUrl);
  const authorizationParams = definition.buildAuthorizationParams(
    providerConfig,
    state
  );

  Object.entries(authorizationParams).forEach(([key, value]) => {
    authorizationUrl.searchParams.set(key, String(value));
  });

  return authorizationUrl.toString();
}

async function exchangeCodeForProfile(providerName, code) {
  const definition = getProviderDefinition(providerName);
  const providerConfig = config.oauth[providerName];
  const accessToken = await definition.exchangeCodeForToken(providerConfig, code);

  if (!accessToken) {
    throw new ApiError(502, 'Authentication provider did not return an access token.');
  }

  return definition.fetchProfile(accessToken);
}

function createOauthState() {
  return randomBytes(24).toString('hex');
}

module.exports = {
  createOauthState,
  exchangeCodeForProfile,
  getAuthorizationUrl,
};
