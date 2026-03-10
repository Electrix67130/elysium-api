exports.up = function (knex) {
  return knex.schema.createTable('tournament_participation', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('user_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.uuid('tournament_id').notNullable().references('id').inTable('tournament').onDelete('CASCADE');
    table.uuid('team_id').references('id').inTable('team').onDelete('CASCADE');
    table.enu('status', ['confirmed', 'pending', 'cancelled']).notNullable().defaultTo('pending');
    table.timestamp('registered_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.unique(['user_id', 'tournament_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('tournament_participation');
};
