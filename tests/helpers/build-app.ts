import buildApp from '@/app';
import { FastifyInstance, InjectOptions } from 'fastify';

const TEST_API_KEY = process.env.API_KEY || 'change-me-in-production';

/**
 * Builds a Fastify app instance for integration tests.
 * Adds an `injectWithAuth` helper that includes the x-api-key header.
 */
async function buildTestApp() {
  const app = buildApp({ logLevel: 'silent' });
  await app.ready();

  // Wrap inject to always include x-api-key
  const originalInject = app.inject.bind(app);
  app.inject = ((opts: InjectOptions | string) => {
    if (typeof opts === 'string') {
      return originalInject({ url: opts, headers: { 'x-api-key': TEST_API_KEY } });
    }
    return originalInject({
      ...opts,
      headers: { 'x-api-key': TEST_API_KEY, ...opts.headers },
    });
  }) as FastifyInstance['inject'];

  return app;
}

export default buildTestApp;
