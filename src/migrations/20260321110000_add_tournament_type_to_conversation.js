exports.up = async function (knex) {
  // Knex enu() utilise une check constraint — il faut la remplacer
  await knex.raw(`
    ALTER TABLE "conversation"
    DROP CONSTRAINT IF EXISTS "conversation_type_check"
  `);
  await knex.raw(`
    ALTER TABLE "conversation"
    ADD CONSTRAINT "conversation_type_check"
    CHECK ("type" IN ('dm', 'group', 'team', 'tournament'))
  `);

  await knex.schema.alterTable('conversation', (table) => {
    table.uuid('tournament_id').references('id').inTable('tournament').onDelete('CASCADE');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('conversation', (table) => {
    table.dropColumn('tournament_id');
  });

  await knex.raw(`
    ALTER TABLE "conversation"
    DROP CONSTRAINT IF EXISTS "conversation_type_check"
  `);
  await knex.raw(`
    ALTER TABLE "conversation"
    ADD CONSTRAINT "conversation_type_check"
    CHECK ("type" IN ('dm', 'group', 'team'))
  `);
};
