exports.up = function (knex) {
  return knex.schema.createTable('twitch_link', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('user_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.string('twitch_id', 100).notNullable().unique();
    table.string('twitch_username', 100);
    table.string('display_name', 100);
    table.boolean('is_live').defaultTo(false).notNullable();
    table.integer('viewer_count').defaultTo(0).notNullable();
    table.string('stream_title', 500);
    table.string('thumbnail_url', 500);
    table.timestamp('linked_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('twitch_link');
};
