exports.up = function (knex) {
  return knex.schema.createTable('team', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name', 100).notNullable();
    table.string('image_url', 500);
    table.text('description');
    table.uuid('game_id').references('id').inTable('game').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('team');
};
