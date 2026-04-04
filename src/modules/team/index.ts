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
  crud.register(fastify, opts, () => {
    // GET /teams/search?q=...&page=1&limit=20
    fastify.get('/teams/search', async (request) => {
      const query = searchSchema.parse(request.query);
      const service = new TeamService(fastify.db);
      return service.search(query);
    });

    done();
  });
}, { name: 'team-module' });
