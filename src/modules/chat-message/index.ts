import fp from 'fastify-plugin';
import { z } from 'zod';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import ChatMessageService from './chat-message.service';
import { createChatMessageSchema, updateChatMessageSchema } from './chat-message.schema';

const crud = new CrudRouteBuilder({
  prefix: '/chat-messages',
  service: (fastify) => new ChatMessageService(fastify.db),
  schemas: { create: createChatMessageSchema, update: updateChatMessageSchema },
  entityName: 'ChatMessage',
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  orderBy: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, () => {
    // GET /conversations/:conversationId/messages — messages paginés d'une conversation
    fastify.get(
      '/conversations/:conversationId/messages',
      { preHandler: [fastify.authenticate] },
      async (request, reply) => {
        const { conversationId } = z.object({ conversationId: z.string().uuid() }).parse(request.params);
        const query = paginationSchema.parse(request.query);
        const service = new ChatMessageService(fastify.db);

        const conversation = await fastify.db('conversation').where({ id: conversationId }).first();
        if (!conversation) return reply.notFound('Conversation not found');

        return service.findByConversationIdPaginated(conversationId, query);
      },
    );

    done();
  });
}, { name: 'chat-message-module' });
