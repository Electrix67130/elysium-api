exports.up = function (knex) {
  return knex.schema.alterTable('message_reaction', (table) => {
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('message_reaction', (table) => {
    table.dropColumn('updated_at');
  });
};
