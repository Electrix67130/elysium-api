const fp = require('fastify-plugin');
const knex = require('knex');
const knexConfig = require('../config/knexfile');

async function database(fastify) {
  const db = knex(knexConfig);

  // Test connection
  await db.raw('SELECT 1');
  fastify.log.info('Database connected');

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await db.destroy();
  });
}

module.exports = fp(database, { name: 'database' });
