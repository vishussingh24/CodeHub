const app = require('./src/app');
const { connectToDatabase } = require('./src/config/database');
const { config, validateServerConfig } = require('./src/config/env');

async function startServer() {
  try {
    validateServerConfig();
    await connectToDatabase();

    app.listen(config.port, () => {
      console.log(`CodeHub API is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error.message);
    process.exit(1);
  }
}

startServer();
