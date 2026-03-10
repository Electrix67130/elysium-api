import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import MessageReactionService from './message-reaction.service';
import { createMessageReactionSchema, updateMessageReactionSchema } from './message-reaction.schema';

const crud = new CrudRouteBuilder({
  prefix: '/message-reactions',
  service: (fastify) => new MessageReactionService(fastify.db),
  schemas: { create: createMessageReactionSchema, update: updateMessageReactionSchema },
  entityName: 'MessageReaction',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'message-reaction-module' });
