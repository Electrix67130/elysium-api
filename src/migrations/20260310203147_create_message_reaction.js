exports.up = function (knex) {
  return knex.schema.createTable('message_reaction', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('message_id').notNullable().references('id').inTable('chat_message').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.string('emoji', 10).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.unique(['message_id', 'user_id', 'emoji']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('message_reaction');
};
