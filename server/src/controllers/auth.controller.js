const { timingSafeEqual } = require('node:crypto');

const { getEnabledProviders, resolveClientRedirectUrl } = require('../config/env');
const User = require('../models/User');
const {
  createOauthState,
  exchangeCodeForProfile,
  getAuthorizationUrl,
} = require('../services/oauth.service');
const { hashPassword, verifyPassword } = require('../services/password.service');
const { createSessionToken } = require('../services/token.service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  clearAuthCookie,
  clearOauthStateCookie,
  getCookie,
  getOauthStateCookieName,
  setAuthCookie,
  setOauthStateCookie,
} = require('../utils/cookies');
const {
  validateLoginPayload,
  validateSignupPayload,
} = require('../utils/validators/auth.validators');

const SUPPORTED_PROVIDERS = new Set(['google', 'github']);

function ensureSupportedProvider(providerName) {
  if (!SUPPORTED_PROVIDERS.has(providerName)) {
    throw new ApiError(404, 'Unsupported authentication provider.');
  }

  return providerName;
}

function formatProviderName(providerName) {
  return providerName.charAt(0).toUpperCase() + providerName.slice(1);
}

function createFriendlyNameFromEmail(email) {
  const [handle = 'Student'] = String(email || '').split('@');

  return (
    handle
      .split(/[._-]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ') || 'Student Builder'
  );
}

function createSuccessRedirect(providerName) {
  return resolveClientRedirectUrl('/auth/callback', {
    status: 'success',
    provider: providerName,
  });
}

function createFailureRedirect(providerName, message) {
  return resolveClientRedirectUrl('/auth/callback', {
    status: 'error',
    provider: providerName,
    message,
  });
}

function isMatchingOauthState(receivedState, storedState) {
  if (!receivedState || !storedState) {
    return false;
  }

  const receivedBuffer = Buffer.from(receivedState);
  const storedBuffer = Buffer.from(storedState);

  if (receivedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(receivedBuffer, storedBuffer);
}

async function findOrCreateOauthUser(providerName, profile) {
  const providerPath = `providers.${providerName}.providerId`;
  let user = await User.findOne({ [providerPath]: profile.providerId });

  if (!user) {
    user = await User.findOne({ email: profile.email });
  }

  if (!user) {
    user = new User({
      name: profile.name || createFriendlyNameFromEmail(profile.email),
      email: profile.email,
      avatarUrl: profile.avatarUrl || '',
    });
  }

  if (
    user.providers?.[providerName]?.providerId &&
    user.providers[providerName].providerId !== profile.providerId
  ) {
    throw new ApiError(
      409,
      `This email is already linked to another ${formatProviderName(providerName)} account.`
    );
  }

  if (!user.name && profile.name) {
    user.name = profile.name;
  }

  if (!user.avatarUrl && profile.avatarUrl) {
    user.avatarUrl = profile.avatarUrl;
  }

  if (providerName === 'google') {
    user.providers.google = {
      providerId: profile.providerId,
      emailVerified: Boolean(profile.emailVerified),
      linkedAt: new Date(),
    };
  }

  if (providerName === 'github') {
    user.providers.github = {
      providerId: profile.providerId,
      username: profile.username || '',
      linkedAt: new Date(),
    };
  }

  user.lastLoginAt = new Date();
  await user.save();

  return user;
}

const getProviders = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      providers: getEnabledProviders(),
    },
  });
});

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = validateSignupPayload(req.body);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(
      409,
      'An account already exists with this email. Try signing in instead.'
    );
  }

  const { hash, salt } = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: {
      hash,
      salt,
      updatedAt: new Date(),
    },
    providers: {
      password: {
        enabled: true,
        linkedAt: new Date(),
      },
    },
    lastLoginAt: new Date(),
  });

  const sessionToken = createSessionToken(user.id);
  setAuthCookie(res, sessionToken);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: {
      user: user.toPublicAuthUser(),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = validateLoginPayload(req.body);

  const user = await User.findOne({ email }).select(
    '+password.hash +password.salt'
  );

  if (
    !user ||
    !user.providers?.password?.enabled ||
    !user.password?.hash ||
    !user.password?.salt
  ) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await verifyPassword(
    password,
    user.password.salt,
    user.password.hash
  );

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const sessionToken = createSessionToken(user.id);
  setAuthCookie(res, sessionToken);

  res.json({
    success: true,
    message: 'Signed in successfully.',
    data: {
      user: user.toPublicAuthUser(),
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  res.json({
    success: true,
    message: 'Signed out successfully.',
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toPublicAuthUser(),
    },
  });
});

const startOauth = asyncHandler(async (req, res) => {
  const providerName = ensureSupportedProvider(req.params.provider);
  const oauthState = createOauthState();
  const authorizationUrl = getAuthorizationUrl(providerName, oauthState);

  setOauthStateCookie(res, providerName, oauthState);
  res.redirect(authorizationUrl);
});

async function handleOauthCallback(req, res, next) {
  let providerName = 'oauth';

  try {
    providerName = ensureSupportedProvider(req.params.provider);

    const oauthError = req.query.error;
    if (typeof oauthError === 'string' && oauthError) {
      throw new ApiError(
        400,
        `${formatProviderName(providerName)} sign-in was cancelled or denied.`
      );
    }

    const stateFromCookie = getCookie(
      req,
      getOauthStateCookieName(providerName)
    );
    const stateFromQuery =
      typeof req.query.state === 'string' ? req.query.state : '';

    clearOauthStateCookie(res, providerName);

    if (!isMatchingOauthState(stateFromQuery, stateFromCookie)) {
      throw new ApiError(400, 'Your sign-in session expired. Please try again.');
    }

    const code = typeof req.query.code === 'string' ? req.query.code : '';
    if (!code) {
      throw new ApiError(400, 'Missing authorization code from provider.');
    }

    const profile = await exchangeCodeForProfile(providerName, code);
    const user = await findOrCreateOauthUser(providerName, profile);
    const sessionToken = createSessionToken(user.id);

    setAuthCookie(res, sessionToken);
    res.redirect(createSuccessRedirect(providerName));
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return next(error);
    }

    clearAuthCookie(res);
    res.redirect(
      createFailureRedirect(
        providerName,
        error instanceof ApiError
          ? error.message
          : 'Unable to complete social sign-in right now.'
      )
    );
  }
}

module.exports = {
  getCurrentUser,
  getProviders,
  handleOauthCallback,
  login,
  logout,
  signup,
  startOauth,
};
