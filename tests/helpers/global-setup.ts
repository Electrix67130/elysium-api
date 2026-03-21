import knex from 'knex';

/**
 * Jest global setup: cree la BDD de test si elle n'existe pas, puis lance les migrations.
 */
export default async function globalSetup() {
  const dbName = 'elysium_test';

  // Connexion a postgres (sans specifier de BDD) pour creer la BDD de test
  const adminDb = knex({
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: 'postgres',
    },
  });

  // Creer la BDD si elle n'existe pas
  const result = await adminDb.raw(
    `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`,
  );
  if (result.rows.length === 0) {
    await adminDb.raw(`CREATE DATABASE ${dbName}`);
  }
  await adminDb.destroy();

  // Lancer les migrations sur la BDD de test
  const testDb = knex({
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: dbName,
    },
    migrations: {
      directory: './src/migrations',
    },
  });

  await testDb.migrate.latest();
  await testDb.destroy();

  // Mettre la variable d'env pour que l'app utilise la BDD de test
  process.env.DB_NAME = dbName;
}
