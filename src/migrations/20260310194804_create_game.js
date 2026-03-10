exports.up = function (knex) {
  return knex.schema.createTable('game', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name', 100).notNullable();
    table.string('slug', 50).notNullable().unique();
    table.string('image_url', 500);
    table.string('icon_url', 500);
    table.string('brand_color', 7);
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('deleted_at');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('game');
};
