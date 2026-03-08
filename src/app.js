const fastify = require('fastify');
const cors = require('@fastify/cors');
const sensible = require('@fastify/sensible');
const autoload = require('@fastify/autoload');
const path = require('path');
const database = require('./plugins/database');
const errorHandler = require('./plugins/error-handler');

function buildApp(opts = {}) {
  const app = fastify({
    logger: {
      level: opts.logLevel || 'info',
    },
    ...opts,
  });

  // Plugins
  app.register(cors, { origin: true });
  app.register(sensible);
  app.register(database);
  app.register(errorHandler);

  // Auto-load all modules (each module registers its own routes)
  app.register(autoload, {
    dir: path.join(__dirname, 'modules'),
    encapsulate: false,
    maxDepth: 1,
  });

  // Health check
  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

module.exports = buildApp;
