import buildApp from '@/app';

/**
 * Builds a Fastify app instance for integration tests.
 * Uses the real app config but with silent logging.
 */
async function buildTestApp() {
  const app = buildApp({ logLevel: 'silent' });
  await app.ready();
  return app;
}

export default buildTestApp;
