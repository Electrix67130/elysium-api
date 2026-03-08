const fp = require('fastify-plugin');
const CrudRouteBuilder = require('../../lib/crud-route-builder');
const UserService = require('./user.service');
const { createUserSchema, updateUserSchema } = require('./user.schema');

const crud = new CrudRouteBuilder({
  prefix: '/users',
  service: (fastify) => new UserService(fastify.db),
  schemas: { create: createUserSchema, update: updateUserSchema },
  entityName: 'User',
});

module.exports = fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'user-module' });
