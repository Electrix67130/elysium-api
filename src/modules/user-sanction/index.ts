import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import UserSanctionService from './user-sanction.service';
import { createUserSanctionSchema, updateUserSanctionSchema } from './user-sanction.schema';

const crud = new CrudRouteBuilder({
  prefix: '/user-sanctions',
  service: (fastify) => new UserSanctionService(fastify.db),
  schemas: { create: createUserSanctionSchema, update: updateUserSanctionSchema },
  entityName: 'UserSanction',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'user-sanction-module' });
