exports.up = function (knex) {
  return knex.schema.createTable('conversation_member', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('user_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.uuid('conversation_id').notNullable().references('id').inTable('conversation').onDelete('CASCADE');
    table.boolean('is_pinned').defaultTo(false).notNullable();
    table.boolean('is_muted').defaultTo(false).notNullable();
    table.integer('unread_count').defaultTo(0).notNullable();
    table.timestamp('joined_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.unique(['user_id', 'conversation_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('conversation_member');
};
