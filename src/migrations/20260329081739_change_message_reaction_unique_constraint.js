exports.up = function (knex) {
  return knex.schema.alterTable('message_reaction', (table) => {
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
