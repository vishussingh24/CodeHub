const cors = require('cors');
const express = require('express');

const { config, getEnabledProviders } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { securityHeaders } = require('./middleware/security.middleware');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = new Set(config.allowedOrigins);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(securityHeaders);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      providers: getEnabledProviders(),
    },
  });
});

app.use('/api/auth', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
