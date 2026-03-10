exports.up = function (knex) {
  return knex.schema.createTable('conversation', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name', 100);
    table.enu('type', ['dm', 'group', 'team']).notNullable();
    table.uuid('team_id').references('id').inTable('team').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('conversation');
};
