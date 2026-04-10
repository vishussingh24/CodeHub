const requestBuckets = new Map();

function cleanupExpiredBuckets(currentTime) {
  for (const [key, bucket] of requestBuckets.entries()) {
    if (bucket.expiresAt <= currentTime) {
      requestBuckets.delete(key);
    }
  }
}

function createRateLimiter({ keyPrefix, max, message, windowMs }) {
  return function rateLimitMiddleware(req, res, next) {
    const currentTime = Date.now();
    cleanupExpiredBuckets(currentTime);

    const emailSegment = req.body?.email
      ? String(req.body.email).trim().toLowerCase()
      : 'anonymous';
    const key = `${keyPrefix}:${req.ip}:${emailSegment}`;

    const existingBucket = requestBuckets.get(key);

    if (!existingBucket || existingBucket.expiresAt <= currentTime) {
      requestBuckets.set(key, {
        count: 1,
        expiresAt: currentTime + windowMs,
      });

      return next();
    }

    if (existingBucket.count >= max) {
      const retryAfterSeconds = Math.ceil(
        (existingBucket.expiresAt - currentTime) / 1000
      );

      res.setHeader('Retry-After', retryAfterSeconds);

      return res.status(429).json({
        success: false,
        message,
      });
    }

    existingBucket.count += 1;
    requestBuckets.set(key, existingBucket);

    return next();
  };
}

const authRateLimiter = createRateLimiter({
  keyPrefix: 'auth',
  max: 12,
  message: 'Too many sign-in attempts. Please wait a few minutes and try again.',
  windowMs: 10 * 60 * 1000,
});

const oauthRateLimiter = createRateLimiter({
  keyPrefix: 'oauth',
  max: 25,
  message: 'Too many social sign-in attempts. Please slow down and try again.',
  windowMs: 10 * 60 * 1000,
});

module.exports = {
  authRateLimiter,
  oauthRateLimiter,
};
