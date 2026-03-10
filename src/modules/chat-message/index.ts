import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import ChatMessageService from './chat-message.service';
import { createChatMessageSchema, updateChatMessageSchema } from './chat-message.schema';

const crud = new CrudRouteBuilder({
  prefix: '/chat-messages',
  service: (fastify) => new ChatMessageService(fastify.db),
  schemas: { create: createChatMessageSchema, update: updateChatMessageSchema },
  entityName: 'ChatMessage',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'chat-message-module' });
