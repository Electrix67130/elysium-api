import fp from 'fastify-plugin';
import { z } from 'zod';
import FriendshipService from './friendship.service';
import { updateFriendshipSchema } from './friendship.schema';

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

const sendRequestSchema = z.object({
  receiver_id: z.string().uuid(),
});

export default fp((fastify, opts, done) => {
  const service = new FriendshipService(fastify.db);

  // GET /friends — profils des amis acceptes de l'utilisateur connecte (pagine)
  fastify.get('/friends', { preHandler: [fastify.authenticate] }, async (request) => {
    const query = paginationSchema.parse(request.query);
    return service.findFriendsOfUser({ userId: request.user.sub, ...query });
  });

  // GET /friendships/pending — demandes recues en attente (pagine)
  fastify.get('/friendships/pending', { preHandler: [fastify.authenticate] }, async (request) => {
    const query = paginationSchema.parse(request.query);
    return service.findPendingRequests({ userId: request.user.sub, ...query });
  });

  // GET /friendships/sent — demandes envoyees en attente (pagine)
  fastify.get('/friendships/sent', { preHandler: [fastify.authenticate] }, async (request) => {
    const query = paginationSchema.parse(request.query);
    return service.findSentRequests({ userId: request.user.sub, ...query });
  });

  // GET /friendships — liste paginee des rows friendship brutes
  fastify.get('/friendships', { preHandler: [fastify.authenticate] }, async (request) => {
    const query = paginationSchema.parse(request.query);
    return service.findAll(query);
  });

  // GET /friendships/:id
  fastify.get('/friendships/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = uuidParamSchema.parse(request.params);
    const item = await service.findById(id);
    if (!item) return reply.notFound('Friendship not found');
    return item;
  });

  // POST /friendships — envoyer une demande d'ami (sender = utilisateur connecte)
  fastify.post('/friendships', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { receiver_id } = sendRequestSchema.parse(request.body);
    const senderId = request.user.sub;
    const item = await service.createFriendship(senderId, receiver_id);

    // Infos du sender pour la notification WS
    const sender = await fastify.db('user')
      .where({ id: senderId })
      .select('id', 'username', 'display_name', 'avatar_url')
      .first();

    fastify.ws.broadcastToUsers([receiver_id], {
      type: 'friendship:request',
      friendship: item,
      sender,
    });

    return reply.code(201).send(item);
  });

  // PATCH /friendships/:id — accepter/modifier une demande
  fastify.patch('/friendships/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = uuidParamSchema.parse(request.params);
    const data = updateFriendshipSchema.parse(request.body);

    // Recuperer la friendship avant update pour connaitre l'autre personne
    const existing = await service.findById(id);
    if (!existing) return reply.notFound('Friendship not found');

    const item = await service.update(id, data as Record<string, unknown>);

    // Si la demande est acceptee, notifier le sender
    if (data.status === 'accepted') {
      const row = existing as Record<string, unknown>;
      const acceptedBy = request.user.sub;
      const otherUserId = row.sender_id === acceptedBy
        ? row.receiver_id as string
        : row.sender_id as string;

      const user = await fastify.db('user')
        .where({ id: acceptedBy })
        .select('id', 'username', 'display_name', 'avatar_url')
        .first();

      fastify.ws.broadcastToUsers([otherUserId], {
        type: 'friendship:accepted',
        friendship: item,
        user,
      });
    }

    return item;
  });

  // DELETE /friendships/:id — supprimer/refuser une demande ou retirer un ami
  fastify.delete('/friendships/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = uuidParamSchema.parse(request.params);

    // Recuperer la friendship avant suppression pour notifier l'autre personne
    const existing = await service.findById(id);
    if (!existing) return reply.notFound('Friendship not found');

    const deleted = await service.delete(id);
    if (!deleted) return reply.notFound('Friendship not found');

    const row = existing as Record<string, unknown>;
    const deletedBy = request.user.sub;
    const otherUserId = row.sender_id === deletedBy
      ? row.receiver_id as string
      : row.sender_id as string;

    fastify.ws.broadcastToUsers([otherUserId], {
      type: 'friendship:removed',
      friendshipId: id,
      userId: deletedBy,
    });

    return reply.code(204).send();
  });

  done();
}, { name: 'friendship-module' });
