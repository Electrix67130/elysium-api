exports.up = function (knex) {
  return knex.schema.createTable('player_stats', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('user_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.uuid('game_id').notNullable().references('id').inTable('game').onDelete('CASCADE');
    table.integer('wins').defaultTo(0).notNullable();
    table.integer('losses').defaultTo(0).notNullable();
    table.decimal('win_rate', 5, 2).defaultTo(0).notNullable();
    table.integer('total_matches').defaultTo(0).notNullable();
    table.integer('tournaments_played').defaultTo(0).notNullable();
    table.integer('tournaments_won').defaultTo(0).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.unique(['user_id', 'game_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('player_stats');
};
