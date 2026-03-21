exports.up = function (knex) {
  return knex.schema.createTable('news', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('title', 200).notNullable();
    table.string('summary', 500).notNullable();
    table.text('content').notNullable();
    table.string('image_url', 500);
    table.enu('category', ['update', 'tournament', 'community', 'esport']).notNullable();
    table.uuid('author_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.timestamp('published_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('news');
};
