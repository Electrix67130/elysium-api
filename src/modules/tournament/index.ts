import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import TournamentService from './tournament.service';
import { createTournamentSchema, updateTournamentSchema } from './tournament.schema';

const crud = new CrudRouteBuilder({
  prefix: '/tournaments',
  service: (fastify) => new TournamentService(fastify.db),
  schemas: { create: createTournamentSchema, update: updateTournamentSchema },
  entityName: 'Tournament',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'tournament-module' });
