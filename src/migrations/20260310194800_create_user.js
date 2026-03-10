exports.up = function (knex) {
  return knex.schema.createTable('user', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('username', 50).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('display_name', 100);
    table.string('avatar_url', 500);
    table.string('country', 2);
    table.text('bio');
    table.boolean('is_official').defaultTo(false).notNullable();
    table.string('status_text', 255);
    table.boolean('is_online').defaultTo(false).notNullable();
    table.timestamp('last_seen_at');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user');
};
