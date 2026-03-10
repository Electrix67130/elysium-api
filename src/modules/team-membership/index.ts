import fp from 'fastify-plugin';
import CrudRouteBuilder from '@/lib/crud-route-builder';
import TeamMembershipService from './team-membership.service';
import { createTeamMembershipSchema, updateTeamMembershipSchema } from './team-membership.schema';

const crud = new CrudRouteBuilder({
  prefix: '/team-memberships',
  service: (fastify) => new TeamMembershipService(fastify.db),
  schemas: { create: createTeamMembershipSchema, update: updateTeamMembershipSchema },
  entityName: 'TeamMembership',
});

export default fp((fastify, opts, done) => {
  crud.register(fastify, opts, done);
}, { name: 'team-membership-module' });
