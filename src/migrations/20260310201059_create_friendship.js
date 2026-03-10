exports.up = function (knex) {
  return knex.schema.createTable('friendship', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('sender_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.uuid('receiver_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.enu('status', ['pending', 'accepted']).notNullable().defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.unique(['sender_id', 'receiver_id']);
    table.check('?? != ??', ['sender_id', 'receiver_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('friendship');
};
