import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import TeamService from './team.service';
import { createTeamSchema, updateTeamSchema } from './team.schema';

const crud = new CrudRouteBuilder({
  prefix: '/teams',
  service: (fastify) => new TeamService(fastify.db),
  schemas: { create: createTeamSchema, update: updateTeamSchema },
  entityName: 'Team',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'team-module' });
