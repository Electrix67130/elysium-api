exports.up = function (knex) {
  return knex.schema.createTable('tournament_recurrence', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('source_tournament_id').notNullable().references('id').inTable('tournament').onDelete('CASCADE');
    table.enu('recurrence_type', ['weekly', 'monthly']).notNullable();
    table.timestamp('recurrence_end_at');
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('tournament_recurrence');
};
