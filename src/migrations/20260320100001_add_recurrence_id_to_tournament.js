exports.up = function (knex) {
  return knex.schema.alterTable('tournament', (table) => {
    table.uuid('recurrence_id').references('id').inTable('tournament_recurrence').onDelete('SET NULL');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('tournament', (table) => {
    table.dropColumn('recurrence_id');
  });
};
