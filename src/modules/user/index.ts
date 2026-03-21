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
  q: z.string().min(3).max(50),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export default fp((fastify, opts, done) => {
  // GET /users/search?q=xxx — recherche par username/display_name (min 3 chars)
  fastify.get('/users/search', async (request, reply) => {
    const { q, limit } = searchSchema.parse(request.query);
    const service = new UserService(fastify.db);
    return service.search(q, limit);
  });

  crud.register(fastify, opts, done);
}, { name: 'user-module' });
