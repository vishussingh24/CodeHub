const { config } = require('../config/env');

function securityHeaders(req, res, next) {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  const forwardedProto = req.headers['x-forwarded-proto'];
  if (config.isProduction && (req.secure || forwardedProto === 'https')) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=15552000; includeSubDomains'
    );
  }

  next();
}

module.exports = {
  securityHeaders,
};
