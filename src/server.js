const buildApp = require('./app');
const env = require('./config/env');

async function start() {
  const app = buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
