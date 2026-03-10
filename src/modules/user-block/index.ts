import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import UserBlockService from './user-block.service';
import { createUserBlockSchema, updateUserBlockSchema } from './user-block.schema';

const crud = new CrudRouteBuilder({
  prefix: '/user-blocks',
  service: (fastify) => new UserBlockService(fastify.db),
  schemas: { create: createUserBlockSchema, update: updateUserBlockSchema },
  entityName: 'UserBlock',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'user-block-module' });
