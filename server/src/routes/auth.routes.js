const express = require('express');

const {
  getCurrentUser,
  getProviders,
  handleOauthCallback,
  login,
  logout,
  signup,
  startOauth,
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const {
  authRateLimiter,
  oauthRateLimiter,
} = require('../middleware/rate-limit.middleware');

const router = express.Router();

router.get('/providers', getProviders);
router.post('/signup', authRateLimiter, signup);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);
router.get('/oauth/:provider/start', oauthRateLimiter, startOauth);
router.get('/oauth/:provider/callback', oauthRateLimiter, handleOauthCallback);

module.exports = router;
