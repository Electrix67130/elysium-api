import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import GameService from './game.service';
import { createGameSchema, updateGameSchema } from './game.schema';

const crud = new CrudRouteBuilder({
  prefix: '/games',
  service: (fastify) => new GameService(fastify.db),
  schemas: { create: createGameSchema, update: updateGameSchema },
  entityName: 'Game',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'game-module' });
