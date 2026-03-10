import fastify, { FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import autoload from '@fastify/autoload';
import path from 'path';
import database from './plugins/database';
import errorHandler from './plugins/error-handler';

interface AppOptions extends FastifyServerOptions {
  logLevel?: string;
}

function buildApp(opts: AppOptions = {}) {
  const { logLevel, ...fastifyOpts } = opts;
  const app = fastify({
    logger: {
      level: logLevel || 'info',
    },
    ...fastifyOpts,
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

export default buildApp;
