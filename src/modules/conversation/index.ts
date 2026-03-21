import fp from 'fastify-plugin';
import { z } from 'zod';
import ConversationService from './conversation.service';
import {
  createConversationSchema,
  updateConversationSchema,
  createDmSchema,
  createTeamConversationSchema,
  createTournamentConversationSchema,
} from './conversation.schema';

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  orderBy: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export default fp((fastify, opts, done) => {
  const service = new ConversationService(fastify.db);

  // GET /conversations — protege par JWT, retourne uniquement les conversations de l'utilisateur
  fastify.get('/conversations', { preHandler: [fastify.authenticate] }, async (request) => {
    const query = paginationSchema.parse(request.query);
    return service.findByUserId({ userId: request.user.sub, ...query });
  });

  // GET /conversations/:id
  fastify.get('/conversations/:id', async (request, reply) => {
    const { id } = uuidParamSchema.parse(request.params);
    const item = await service.findById(id);
    if (!item) return reply.notFound('Conversation not found');
    return item;
  });

  // POST /conversations — creation generique
  fastify.post('/conversations', async (request, reply) => {
    const data = createConversationSchema.parse(request.body);
    const item = await service.create(data as Record<string, unknown>);
    return reply.code(201).send(item);
  });

  // PATCH /conversations/:id
  fastify.patch('/conversations/:id', async (request, reply) => {
    const { id } = uuidParamSchema.parse(request.params);
    const data = updateConversationSchema.parse(request.body);
    const item = await service.update(id, data as Record<string, unknown>);
    if (!item) return reply.notFound('Conversation not found');
    return item;
  });

  // DELETE /conversations/:id
  fastify.delete('/conversations/:id', async (request, reply) => {
    const { id } = uuidParamSchema.parse(request.params);
    const deleted = await service.delete(id);
    if (!deleted) return reply.notFound('Conversation not found');
    return reply.code(204).send();
  });

  // POST /conversations/dm — creer un DM entre 2 utilisateurs
  fastify.post('/conversations/dm', async (request, reply) => {
    const { user_id_1, user_id_2 } = createDmSchema.parse(request.body);
    const conversation = await service.createDm(user_id_1, user_id_2);
    return reply.code(201).send(conversation);
  });

  // POST /conversations/team — creer une conversation d'equipe
  fastify.post('/conversations/team', async (request, reply) => {
    const { team_id, name } = createTeamConversationSchema.parse(request.body);
    const conversation = await service.createForTeam(team_id, name);
    return reply.code(201).send(conversation);
  });

  // POST /conversations/tournament — creer une conversation de tournoi
  fastify.post('/conversations/tournament', async (request, reply) => {
    const { tournament_id, name } = createTournamentConversationSchema.parse(request.body);
    const conversation = await service.createForTournament(tournament_id, name);
    return reply.code(201).send(conversation);
  });

  // POST /conversations/team/:teamId/sync — synchroniser les membres
  fastify.post('/conversations/team/:teamId/sync', async (request, reply) => {
    const { teamId } = z.object({ teamId: z.string().uuid() }).parse(request.params);
    await service.syncTeamMembers(teamId);
    return reply.code(204).send();
  });

  // POST /conversations/tournament/:tournamentId/sync — synchroniser les participants
  fastify.post('/conversations/tournament/:tournamentId/sync', async (request, reply) => {
    const { tournamentId } = z.object({ tournamentId: z.string().uuid() }).parse(request.params);
    await service.syncTournamentMembers(tournamentId);
    return reply.code(204).send();
  });

  done();
}, { name: 'conversation-module' });
