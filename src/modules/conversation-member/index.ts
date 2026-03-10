import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import ConversationMemberService from './conversation-member.service';
import { createConversationMemberSchema, updateConversationMemberSchema } from './conversation-member.schema';

const crud = new CrudRouteBuilder({
  prefix: '/conversation-members',
  service: (fastify) => new ConversationMemberService(fastify.db),
  schemas: { create: createConversationMemberSchema, update: updateConversationMemberSchema },
  entityName: 'ConversationMember',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'conversation-member-module' });
