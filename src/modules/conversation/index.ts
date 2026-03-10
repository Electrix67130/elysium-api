import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import ConversationService from './conversation.service';
import { createConversationSchema, updateConversationSchema } from './conversation.schema';

const crud = new CrudRouteBuilder({
  prefix: '/conversations',
  service: (fastify) => new ConversationService(fastify.db),
  schemas: { create: createConversationSchema, update: updateConversationSchema },
  entityName: 'Conversation',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'conversation-module' });
