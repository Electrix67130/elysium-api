import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import TournamentParticipationService from './tournament-participation.service';
import { createTournamentParticipationSchema, updateTournamentParticipationSchema } from './tournament-participation.schema';

const crud = new CrudRouteBuilder({
  prefix: '/tournament-participations',
  service: (fastify) => new TournamentParticipationService(fastify.db),
  schemas: { create: createTournamentParticipationSchema, update: updateTournamentParticipationSchema },
  entityName: 'TournamentParticipation',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'tournament-participation-module' });
