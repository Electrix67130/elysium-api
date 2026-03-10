import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import UserService from './user.service';
import { createUserSchema, updateUserSchema } from './user.schema';

const crud = new CrudRouteBuilder({
  prefix: '/users',
  service: (fastify) => new UserService(fastify.db),
  schemas: { create: createUserSchema, update: updateUserSchema },
  entityName: 'User',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'user-module' });
