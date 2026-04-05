import fp from 'fastify-plugin';
import { z } from 'zod';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import TeamService from './team.service';
import { createTeamSchema, updateTeamSchema } from './team.schema';

const crud = new CrudRouteBuilder({
  prefix: '/teams',
  service: (fastify) => new TeamService(fastify.db),
  schemas: { create: createTeamSchema, update: updateTeamSchema },
  entityName: 'Team',
});

const searchSchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export default fp((fastify, opts, done) => {
  // GET /teams/search — enregistre AVANT le CRUD pour eviter le conflit avec /teams/:id
  fastify.get('/teams/search', { preHandler: [fastify.authenticate] }, async (request) => {
    const query = searchSchema.parse(request.query);
    const service = new TeamService(fastify.db);
    return service.search({ ...query, excludeUserId: request.user.sub });
  });

  crud.register(fastify, opts, done);
}, { name: 'team-module' });
