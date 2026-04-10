const ApiError = require('../ApiError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validateEmail(value) {
  const email = normalizeEmail(value);

  if (!EMAIL_PATTERN.test(email)) {
    throw new ApiError(400, 'Please enter a valid email address.');
  }

  return email;
}

function validatePasswordStrength(password) {
  const normalizedPassword = String(password || '');
  const hasUppercase = /[A-Z]/.test(normalizedPassword);
  const hasLowercase = /[a-z]/.test(normalizedPassword);
  const hasNumber = /\d/.test(normalizedPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(normalizedPassword);

  if (
    normalizedPassword.length < 8 ||
    !hasUppercase ||
    !hasLowercase ||
    !hasNumber ||
    !hasSymbol
  ) {
    throw new ApiError(
      400,
      'Use at least 8 characters including uppercase, lowercase, a number, and a symbol.'
    );
  }

  return normalizedPassword;
}

function validateSignupPayload(payload) {
  const name = normalizeName(payload.name);
  const email = validateEmail(payload.email);
  const password = validatePasswordStrength(payload.password);
  const confirmPassword = String(payload.confirmPassword || '');

  if (name.length < 2) {
    throw new ApiError(400, 'Please enter your full name.');
  }

  if (name.length > 80) {
    throw new ApiError(400, 'Your name is too long.');
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match.');
  }

  return {
    name,
    email,
    password,
  };
}

function validateLoginPayload(payload) {
  const email = validateEmail(payload.email);
  const password = String(payload.password || '');

  if (!password) {
    throw new ApiError(400, 'Please enter your password.');
  }

  return {
    email,
    password,
  };
}

module.exports = {
  validateLoginPayload,
  validateSignupPayload,
};
