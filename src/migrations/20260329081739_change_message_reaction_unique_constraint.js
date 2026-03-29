exports.up = async function (knex) {
  // Delete duplicates, keep only the most recent reaction per (message_id, user_id)
  await knex.raw(`
    DELETE FROM message_reaction
    WHERE id NOT IN (
      SELECT DISTINCT ON (message_id, user_id) id
      FROM message_reaction
      ORDER BY message_id, user_id, created_at DESC
    )
  `);

  await knex.schema.alterTable('message_reaction', (table) => {
    table.dropUnique(['message_id', 'user_id', 'emoji']);
    table.unique(['message_id', 'user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('message_reaction', (table) => {
    table.dropUnique(['message_id', 'user_id']);
    table.unique(['message_id', 'user_id', 'emoji']);
  });
};
