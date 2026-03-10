exports.up = function (knex) {
  return knex.schema.createTable('chat_message', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('conversation_id').notNullable().references('id').inTable('conversation').onDelete('CASCADE');
    table.uuid('sender_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.text('content').notNullable();
    table.string('sender_tag', 50);
    table.string('sender_tag_color', 7);
    table.timestamp('timestamp').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('chat_message');
};
