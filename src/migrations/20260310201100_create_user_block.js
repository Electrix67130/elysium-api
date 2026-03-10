exports.up = function (knex) {
  return knex.schema.createTable('user_block', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('blocker_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.uuid('blocked_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.unique(['blocker_id', 'blocked_id']);
    table.check('?? != ??', ['blocker_id', 'blocked_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_block');
};
