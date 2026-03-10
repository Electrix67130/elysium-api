exports.up = function (knex) {
  return knex.schema.createTable('user_sanction', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('user_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.uuid('issued_by').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.enu('type', ['warning', 'ban']).notNullable();
    table.enu('scope', ['platform', 'tournament', 'chat']).notNullable();
    table.text('reason');
    table.timestamp('expires_at');
    table.boolean('is_active').defaultTo(true).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_sanction');
};
