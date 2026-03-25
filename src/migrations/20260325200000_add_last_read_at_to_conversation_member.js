exports.up = function (knex) {
  return knex.schema.alterTable('conversation_member', (table) => {
    table.timestamp('last_read_at').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('conversation_member', (table) => {
    table.dropColumn('last_read_at');
  });
};
