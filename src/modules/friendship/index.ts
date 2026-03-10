import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import FriendshipService from './friendship.service';
import { createFriendshipSchema, updateFriendshipSchema } from './friendship.schema';

const crud = new CrudRouteBuilder({
  prefix: '/friendships',
  service: (fastify) => new FriendshipService(fastify.db),
  schemas: { create: createFriendshipSchema, update: updateFriendshipSchema },
  entityName: 'Friendship',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'friendship-module' });
