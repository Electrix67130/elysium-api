import knex from 'knex';

/**
 * Jest global teardown: nettoie toutes les tables de la BDD de test.
 */
export default async function globalTeardown() {
  const testDb = knex({
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: 'elysium_test',
    },
  });

  // Truncate toutes les tables (sauf knex_migrations) pour repartir propre
  const tables = await testDb.raw(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'knex_%'
  `);

  if (tables.rows.length > 0) {
    const tableNames = tables.rows.map((r: { tablename: string }) => `"${r.tablename}"`).join(', ');
    await testDb.raw(`TRUNCATE TABLE ${tableNames} CASCADE`);
  }

  await testDb.destroy();
}
