import fp from 'fastify-plugin';
import { z } from 'zod';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import UserService from './user.service';
import { createUserSchema, updateUserSchema } from './user.schema';

const crud = new CrudRouteBuilder({
  prefix: '/users',
  service: (fastify) => new UserService(fastify.db),
  schemas: { create: createUserSchema, update: updateUserSchema },
  entityName: 'User',
});

const searchSchema = z.object({
  q: z.string().min(1).max(50),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export default fp((fastify, opts, done) => {
  // GET /users/search?q=xxx — recherche par username/display_name (exclut amis et bloques)
  fastify.get('/users/search', { preHandler: [fastify.authenticate] }, async (request) => {
    const { q, ...pagination } = searchSchema.parse(request.query);
    const service = new UserService(fastify.db);
    return service.search({ query: q, userId: request.user.sub, ...pagination });
  });

  crud.register(fastify, opts, done);
}, { name: 'user-module' });
