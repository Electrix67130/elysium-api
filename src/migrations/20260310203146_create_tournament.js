exports.up = function (knex) {
  return knex.schema.createTable('tournament', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name', 200).notNullable();
    table.uuid('game_id').notNullable().references('id').inTable('game').onDelete('CASCADE');
    table.uuid('organizer_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.enu('status', ['upcoming', 'ongoing', 'completed']).notNullable().defaultTo('upcoming');
    table.timestamp('date');
    table.integer('max_players');
    table.integer('team_size');
    table.boolean('is_official').defaultTo(false).notNullable();
    table.text('description');
    table.boolean('requires_approval').defaultTo(false).notNullable();
    table.string('prize_pool', 100);
    table.timestamp('registration_closes_at');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('tournament');
};
