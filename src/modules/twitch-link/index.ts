import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import TwitchLinkService from './twitch-link.service';
import { createTwitchLinkSchema, updateTwitchLinkSchema } from './twitch-link.schema';

const crud = new CrudRouteBuilder({
  prefix: '/twitch-links',
  service: (fastify) => new TwitchLinkService(fastify.db),
  schemas: { create: createTwitchLinkSchema, update: updateTwitchLinkSchema },
  entityName: 'TwitchLink',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'twitch-link-module' });
