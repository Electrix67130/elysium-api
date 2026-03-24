import fp from 'fastify-plugin';
import { z } from 'zod';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import UserBlockService from './user-block.service';
import { createUserBlockSchema, updateUserBlockSchema } from './user-block.schema';

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const crud = new CrudRouteBuilder({
  prefix: '/user-blocks',
  service: (fastify) => new UserBlockService(fastify.db),
  schemas: { create: createUserBlockSchema, update: updateUserBlockSchema },
  entityName: 'UserBlock',
});

export default fp((fastify, opts, done) => {
  // GET /user-blocks/me — utilisateurs bloques par l'utilisateur connecte (pagine)
  fastify.get('/user-blocks/me', { preHandler: [fastify.authenticate] }, async (request) => {
    const query = paginationSchema.parse(request.query);
    const service = new UserBlockService(fastify.db);
    return service.findBlockedUsers({ blockerId: request.user.sub, ...query });
  });

  crud.register(fastify, opts, done);
}, { name: 'user-block-module' });
