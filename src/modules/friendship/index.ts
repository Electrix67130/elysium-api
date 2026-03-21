import fp from 'fastify-plugin';
import { z } from 'zod';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import FriendshipService from './friendship.service';
import { createFriendshipSchema, updateFriendshipSchema } from './friendship.schema';

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export default fp((fastify, opts, done) => {
  const service = new FriendshipService(fastify.db);

  // GET /friendships — protege par JWT, retourne les amis de l'utilisateur connecte
  fastify.get('/friendships', { preHandler: [fastify.authenticate] }, async (request) => {
    const query = paginationSchema.parse(request.query);
    return service.findFriendsOfUser({ userId: request.user.sub, ...query });
  });

  // GET /friendships/pending — demandes d'amis en attente
  fastify.get('/friendships/pending', { preHandler: [fastify.authenticate] }, async (request) => {
    return service.findPendingRequests(request.user.sub);
  });

  // GET /friendships/:id
  fastify.get('/friendships/:id', async (request, reply) => {
    const { id } = uuidParamSchema.parse(request.params);
    const item = await service.findById(id);
    if (!item) return reply.notFound('Friendship not found');
    return item;
  });

  // POST /friendships
  fastify.post('/friendships', async (request, reply) => {
    const data = createFriendshipSchema.parse(request.body);
    const item = await service.create(data as Record<string, unknown>);
    return reply.code(201).send(item);
  });

  // PATCH /friendships/:id
  fastify.patch('/friendships/:id', async (request, reply) => {
    const { id } = uuidParamSchema.parse(request.params);
    const data = updateFriendshipSchema.parse(request.body);
    const item = await service.update(id, data as Record<string, unknown>);
    if (!item) return reply.notFound('Friendship not found');
    return item;
  });

  // DELETE /friendships/:id
  fastify.delete('/friendships/:id', async (request, reply) => {
    const { id } = uuidParamSchema.parse(request.params);
    const deleted = await service.delete(id);
    if (!deleted) return reply.notFound('Friendship not found');
    return reply.code(204).send();
  });

  done();
}, { name: 'friendship-module' });
