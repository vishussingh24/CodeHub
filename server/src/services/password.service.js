const { randomBytes, scrypt: scryptCallback, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(scryptCallback);
const PASSWORD_KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, PASSWORD_KEY_LENGTH);

  return {
    salt,
    hash: Buffer.from(derivedKey).toString('hex'),
  };
}

async function verifyPassword(password, salt, storedHash) {
  const storedHashBuffer = Buffer.from(storedHash, 'hex');
  const derivedKeyBuffer = Buffer.from(
    await scrypt(password, salt, PASSWORD_KEY_LENGTH)
  );

  if (storedHashBuffer.length !== derivedKeyBuffer.length) {
    return false;
  }

  return timingSafeEqual(storedHashBuffer, derivedKeyBuffer);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
