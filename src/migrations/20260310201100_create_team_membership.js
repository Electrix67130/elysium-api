exports.up = function (knex) {
  return knex.schema.createTable('team_membership', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('user_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.uuid('team_id').notNullable().references('id').inTable('team').onDelete('CASCADE');
    table.enu('role', ['capitaine', 'manager', 'membre']).notNullable().defaultTo('membre');
    table.timestamp('joined_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.unique(['user_id', 'team_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('team_membership');
};
