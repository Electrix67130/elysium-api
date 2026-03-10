import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import PlayerStatsService from './player-stats.service';
import { createPlayerStatsSchema, updatePlayerStatsSchema } from './player-stats.schema';

const crud = new CrudRouteBuilder({
  prefix: '/player-stats',
  service: (fastify) => new PlayerStatsService(fastify.db),
  schemas: { create: createPlayerStatsSchema, update: updatePlayerStatsSchema },
  entityName: 'PlayerStats',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'player-stats-module' });
